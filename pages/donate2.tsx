import { useEffect, useState, FC } from "react";
import { AuthProvider, useAuth } from "../components/prebuilts/Authentication";
import { callKinshipAPI, supabase, isFloatOrInteger, validateEmail, centsToDollars, dollarsToCents } from "../system/utils/helpers";
import { ConfirmationType, DonationStep } from "../components/prebuilts/donations/helpers/types";
import { v4 as uuidv4 } from 'uuid'
import { CurrencyList } from "../system/classes/utils";
import { Donation } from "../system/classes/donation";
import { TextInput, VerticalSpacer, Alert, BaseHeader, Button, CheckboxInput, SelectionInput } from "../components/primitives";
import { Donor } from "../system/classes/donor";
import { Address } from "../system/classes/address";
import { ButtonSize, ButtonStyle, EventColors, SpacerSize } from "../components/primitives";
import { InputCustomizations } from "../components/primitives/types";
import { countries, states_and_provinces } from "../system/utils/constants";
import { LockClosedIcon } from "@heroicons/react/24/solid"

export default function Donate2() {

    const [donor, setDonor] = useState(undefined)

    const fetchUser = async () => {
        try {
            const loggedInUser = await supabase.auth.getUser();

            if (loggedInUser.data.user) {
                console.log("logged in donor exists")
                const donorResponse = await callKinshipAPI('/api/donor/profile/fetch', {
                    donor_id: loggedInUser.data.user.id,
                })

                setDonor(donorResponse.donor);
                console.log("successfully set donor")
            }
        } catch (error) {
            // Log error
            console.error(error)
        }
    };

    useEffect(() => {
        console.log("Loading donor for page")
        if (!donor) {
            fetchUser();
        }
    }, [supabase, donor]);

    const donationId = uuidv4();
    const [step, setStep] = useState<DonationStep>(DonationStep.AmountAndBilling);
    const [globalDonation, setGlobalDonation] = useState<Donation>({
        identifiers: {
            donation_id: donationId,
            donor_id: null,
        },
        donor: {
            first_name: "",
            last_name: "",
            email: "",
            address: {
                line_address: "",
                postal_code: "",
                city: "",
                state: "",
                country: ""
            },
            admin: false,
            set_up: false,
            stripe_customer_ids: []
        },
        causes: {
            total_amount_paid_in_cents: 0,
            currency: CurrencyList.CAD,
            causes: null, // causes is no longer a supported field, and is kept for backwards compatability
            is_imam_donation: false,
            is_sadat_donation: false,
            is_sadaqah: false
        },
        live: process.env.NEXT_PUBLIC_LIVEMODE == "true" ? true : false,
        amount_in_cents: 0,
        fees_covered: 0,
        fees_charged_by_stripe: 0, // This will be filled in based on the type of card they pay with, by the post-payment Stripe webhook
        date_donated: new Date()
    });
    const [confirmationType, setConfirmationType] = useState<ConfirmationType>(ConfirmationType.Unconfirmed)
    const [stripeClientSecret, setStripeClientSecret] = useState<string>(null);
    
    
    return (
        <AuthProvider donor={donor}>
            {globalDonation.identifiers.donation_id} {globalDonation.donor.first_name} {globalDonation.amount_in_cents}
            <Page2 
                globalDonation={globalDonation} 
                setGlobalDonation={setGlobalDonation} 
                setStep={setStep}
                setStripeClientSecret={setStripeClientSecret}
            />
        </AuthProvider>
    )
}

const Page: FC<{ globalDonation: Donation, setGlobalDonation: (value: Donation) => void }> = ({ globalDonation, setGlobalDonation }) => {
    const { donor } = useAuth()

    useEffect(()=>{
        console.log("hook called")
        if (donor) {
            setGlobalDonation({
                ...globalDonation,
                donor: donor
            })
        }
    }, [donor])

    return (
        <div>
            <input 
                value={globalDonation.donor.first_name}
                onChange={(e)=>{
                    setGlobalDonation({
                        ...globalDonation,
                        donor: {
                            ...globalDonation.donor,
                            first_name: e.target.value
                        }
                    })
                }}
            />

            <TextInput
                placeholder="0"
                type="text"
                value={globalDonation.donor.first_name}
                name="amount"
                id="amount"
                onChange={(e) => { 
                    setGlobalDonation({
                        ...globalDonation,
                        donor: {
                            ...globalDonation.donor,
                            first_name: e.target.value
                        }
                    })
                }}
                required={true}
            />

            { donor ?
                <p>{donor.first_name}</p>

                : "No donor"
            }
        </div>
    )
}

const Page2: FC<{ globalDonation: Donation, setGlobalDonation: (value: Donation) => void, setStep: (value: DonationStep) => void, setStripeClientSecret: (value: string) => void }> = ({ globalDonation, setGlobalDonation, setStep, setStripeClientSecret }) => {
    const { donor } = useAuth()

    useEffect(()=>{
        console.log("hook called")
        if (donor) {
            setGlobalDonation({
                ...globalDonation,
                identifiers: {
                    ...globalDonation.identifiers,
                    donor_id: donor.donor_id
                },
                donor: donor
            })
        }
    }, [donor])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<{ title: string, message: string }>(null)

    const [isKhums, setIsKhums] = useState<boolean>(false)

    const handleDonationDetailsStep = async () => {
        setLoading(true)

        try {
            setError(null)

            // Validate that there is a valid amount being donated
            try {
                if (!isFloatOrInteger(globalDonation.amount_in_cents)) {
                    throw new Error("Enter a valid amount to donate")
                }

                const amountDonatedInCents = parseFloat(String(globalDonation.amount_in_cents)) * 100

                if (amountDonatedInCents < 500) {
                    // We require a minimum of $5 because there are fixed costs associated with credit card fees
                    // We could waive this minimum for eTransfers, which would add a relatively small amount of complexity
                    // However, since donations this small are extremely uncommon we have ommited the edge case
                    setError({
                        title: "minimum donation required",
                        message: "Please donate a minimum of $5"
                    })
                    setLoading(false)
                    return
                }
            } catch (e) {
                setError({
                    title: "invalid donation amount",
                    message: "Please enter a valid amount to donate"
                })
                setLoading(false)
                return
            }

            if (!validateEmail(globalDonation.donor.email)) {
                setError({
                    title: "invalid email",
                    message: "Please enter a valid email"
                })
                setLoading(false)
                return
            }

            const amountDonatingInCents = parseFloat(String(globalDonation.amount_in_cents)) * 100

            // Make sure all necessary fields are filled (this should already be completed by the browser, but in case)
            const fields = {
                firstName: "First Name",
                lastName: "Last Name",
                lineAddress: "Address",
                city: "City",
                state: "State",
                country: "Country",
                postalCode: "Postal Code"
            };

            for (const field in fields) {
                if (fields.hasOwnProperty(field) && !eval(field + ".length")) {
                    setLoading(false);
                    setError({
                        title: "missing fields",
                        message: `Please fill out the ${fields[field]} field`
                    });
                    setLoading(false)
                    return;
                }
            }

            // Validate donation customizations
            if (isKhums && !globalDonation.causes.is_imam_donation && !globalDonation.causes.is_sadat_donation) {
                setError({
                    title: "Please specify where to direct khums",
                    message: "To make a khums donation, please specify whether it is Imam, Sadat, or both"
                })
                setLoading(false)
                return
            }

            const response = await callKinshipAPI('/api/stripe/createPaymentIntent', {
                donation: globalDonation,
            })

            if (response.status != 200) {
                setStep(DonationStep.Error)
                setLoading(false)
                return
            }

            // If the response status is 200, we can assume the shape of the response
            setStripeClientSecret(response.clientSecret)

            // Finally, set the next step
            if (amountDonatingInCents > 50_000_00) {
                setStep(DonationStep.WireTransferInstructions)
            } else {
                setStep(DonationStep.PaymentInfo)
            }
            return
        } catch (error) {
            setStep(DonationStep.Error)
            return
        }
    }

    return (
        <div>
            <BaseHeader>Amount Donating Today</BaseHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <TextInput
                placeholder="0"
                type="text"
                value={centsToDollars(globalDonation.amount_in_cents)}
                inputCustomization={InputCustomizations.Dollars}
                name="amount"
                id="amount"
                onChange={(e) => { 
                    // if (!isFloatOrInteger(donation.amount_in_cents)) {
                    //     throw new Error("Enter a valid amount to donate")
                    // }
                    setGlobalDonation({
                        ...globalDonation,
                        amount_in_cents: parseInt(dollarsToCents(e.target.value))
                    })
                }}
                required={true}
            />

            <VerticalSpacer size={SpacerSize.Large} />

            <BaseHeader>Your Information</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput 
                    placeholder="First Name" 
                    type="text" 
                    label="First Name"
                    name="userFirstName" 
                    id="userFirstName" 
                    value={globalDonation.donor.first_name}
                    onChange={(e) => { 
                        setGlobalDonation({
                            ...globalDonation,
                            donor: {
                                ...globalDonation.donor,
                                first_name: e.target.value
                            }
                        })
                    }} 
                    required={true} 
                />
                <TextInput 
                    placeholder="Last Name" 
                    type="text" 
                    label="Last Name"
                    name="userLastName" 
                    id="userLastName" 
                    value={globalDonation.donor.last_name}
                    onChange={(e) => { 
                        setGlobalDonation({
                            ...globalDonation,
                            donor: {
                                ...globalDonation.donor,
                                last_name: e.target.value
                            }
                        })
                    }} 
                    required={true} 
                />
            </div>
            <VerticalSpacer size={SpacerSize.Medium} />
            <TextInput 
                placeholder="you@gmail.com" 
                type="text" 
                label="Email Address"
                name="emailAddress" 
                id="emailAddress" 
                value={globalDonation.donor.email}
                onChange={(e) => { 
                    setGlobalDonation({
                        ...globalDonation,
                        donor: {
                            ...globalDonation.donor,
                            email: e.target.value
                        }
                    })
                }} 
                required={true} 
            />

            <VerticalSpacer size={SpacerSize.Large} />

            <BaseHeader>Address Information (Will Appear On Receipt)</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <TextInput 
                placeholder="Line Address" 
                type="text" 
                label="Line Address"
                name="lineAddress" 
                id="lineAddress" 
                value={globalDonation.donor.address.line_address}
                onChange={(e)=>{
                    setGlobalDonation({
                        ...globalDonation,
                        donor: {
                            ...globalDonation.donor,
                            address: {
                                ...globalDonation.donor.address,
                                line_address: e.target.value
                            }
                        }
                    })
                }}
                required={true} 
            />
            <VerticalSpacer size={SpacerSize.Medium} />
            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput 
                    placeholder="City" 
                    type="text" 
                    label="City"
                    name="city" 
                    id="city" 
                    value={globalDonation.donor.address.city}
                    onChange={(e)=>{
                        setGlobalDonation({
                            ...globalDonation,
                            donor: {
                                ...globalDonation.donor,
                                address: {
                                    ...globalDonation.donor.address,
                                    city: e.target.value
                                }
                            }
                        })
                    }}
                    required={true} 
                />
                {states_and_provinces[globalDonation.donor.address.country] === null || states_and_provinces[globalDonation.donor.address.country] === undefined ? (
                    <TextInput
                        placeholder="State or Province"
                        type="text"
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={globalDonation.donor.address.state}
                        onChange={(e) => {
                            setGlobalDonation({
                                ...globalDonation,
                                donor: {
                                    ...globalDonation.donor,
                                    address: {
                                        ...globalDonation.donor.address,
                                        state: e.target.value
                                    }
                                }
                            })
                        }}
                        required={true}
                    />
                ) : (
                    <SelectionInput
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={globalDonation.donor.address.state}
                        options={states_and_provinces[globalDonation.donor.address.country]}
                        onChange={(e) => {
                            setGlobalDonation({
                                ...globalDonation,
                                donor: {
                                    ...globalDonation.donor,
                                    address: {
                                        ...globalDonation.donor.address,
                                        state: e.target.value
                                    }
                                }
                            })
                        }}
                        required={true}
                    />
                )}
                <TextInput 
                    placeholder="Postal Code" 
                    type="text" 
                    label="Postal Code"
                    name="postalCode" 
                    id="postalCode" 
                    value={globalDonation.donor.address.postal_code}
                    onChange={(e)=>{
                        setGlobalDonation({
                            ...globalDonation,
                            donor: {
                                ...globalDonation.donor,
                                address: {
                                    ...globalDonation.donor.address,
                                    postal_code: e.target.value
                                }
                            }
                        })
                    }} 
                    required={true} 
                />

                <SelectionInput
                    label="Country"
                    name="country" 
                    id="country" 
                    options={countries}
                    value={globalDonation.donor.address.country}
                    onChange={(e)=>{ 
                        setGlobalDonation({
                            ...globalDonation,
                            donor: {
                                ...globalDonation.donor,
                                address: {
                                    ...globalDonation.donor.address,
                                    country: e.target.value,
                                    state: states_and_provinces[e.target.value] ? states_and_provinces[e.target.value][0].value : ""
                                }
                            }
                        })
                    }}
                    required={true}
                />
            </div>

            <VerticalSpacer size={SpacerSize.Large} />
            
            
            <BaseHeader>Donation Customizations & Requests</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />

            <CheckboxInput
                label="Is this donation Saqadah"
                checked={globalDonation.causes.is_sadaqah}
                required={false}
                onChange={(e) => { 
                    setGlobalDonation({
                        ...globalDonation,
                        causes: {
                            ...globalDonation.causes,
                            is_sadaqah: e.target.checked
                        }
                    })
                }}
            />
            
            <VerticalSpacer size={SpacerSize.Small} />
            
            <CheckboxInput
                label="Is this a khums donation?"
                checked={isKhums}
                required={false}
                onChange={(e) => { setIsKhums(e.target.checked) }}
            />

            <VerticalSpacer size={SpacerSize.Small} />

            { isKhums && (
                <div className='px-4'>
                    <CheckboxInput
                        label="Sehme Imam"
                        checked={globalDonation.causes.is_imam_donation}
                        required={false}
                        onChange={(e) => { 
                            setGlobalDonation({
                                ...globalDonation,
                                causes: {
                                    ...globalDonation.causes,
                                    is_imam_donation: e.target.checked
                                }
                            })
                        }}
                    />
                    <VerticalSpacer size={SpacerSize.Small} />
                    <CheckboxInput
                        label="Sehme Sadat"
                        checked={globalDonation.causes.is_sadat_donation}
                        required={false}
                        onChange={(e) => { 
                            setGlobalDonation({
                                ...globalDonation,
                                causes: {
                                    ...globalDonation.causes,
                                    is_sadat_donation: e.target.checked
                                }
                            })
                        }}
                    />
                    <VerticalSpacer size={SpacerSize.Small} />
                </div>
            )}

            {error && (
                <span>
                    <VerticalSpacer size={SpacerSize.Large} />
                    <Alert 
                        type={EventColors.Error} 
                        title={`Error: ${error.title}`} 
                        message={error.message} 
                    />
                </span>
            )}

            <VerticalSpacer size={SpacerSize.Medium} />

            <div className='border-t border-gray-200'>
                <VerticalSpacer size={SpacerSize.Medium} />
                <div className='flex w-full justify-end'>
                    <Button 
                        text="Proceed To Payment &rarr;" 
                        isLoading={loading} 
                        icon={<LockClosedIcon />}
                        style={ButtonStyle.Primary}
                        size={ButtonSize.Large} 
                        onClick={handleDonationDetailsStep}
                    />
                </div>

            </div>
        </div>
    )
}