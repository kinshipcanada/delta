import { useState, FC, useEffect } from "react"
import { DonationStep } from "./helpers/types"
import { Donation, DonationSchema } from "../../../lib/classes/donation"
import { callKinshipAPI, dollarsToCents, isFloatOrInteger, validateEmail } from "../../../lib/utils/helpers"
import { Alert, BaseHeader, Button, CheckboxInput, SelectionInput, TextInput, VerticalSpacer } from "../../primitives"
import { ButtonSize, ButtonStyle, EventColors, InputCustomizations, SpacerSize } from "../../primitives/types"
import { countries, states_and_provinces } from "../../../lib/utils/constants"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../Authentication"
import { ObjectIdApiResponse } from "@lib/classes/api"
import { ApiStripeCreatePaymentIntentRequestSchema } from "pages/api/stripe/createPaymentIntent"

const DonationInformationStep: FC<{ globalDonation: Donation, setGlobalDonation: (value: Donation) => void, setStep: (value: DonationStep) => void, setStripeClientSecret: (value: string) => void }> = ({ globalDonation, setGlobalDonation, setStep, setStripeClientSecret }) => {
    const { donor } = useAuth()

    useEffect(()=>{
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
    const [error, setError] = useState<{ title: string, message: string } | undefined>(undefined)

    const [isKhums, setIsKhums] = useState<boolean>(false)

    const handleDonationDetailsStep = async () => {
        setLoading(true)

        try {
            setError(undefined)

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

            // Validate donation customizations
            if (isKhums && !globalDonation.causes.is_imam_donation && !globalDonation.causes.is_sadat_donation) {
                setError({
                    title: "Please specify where to direct khums",
                    message: "To make a khums donation, please specify whether it is Imam, Sadat, or both"
                })
                setLoading(false)
                return
            }

            const createPaymentIntentPayload: ApiStripeCreatePaymentIntentRequestSchema = {
                donation: globalDonation
            }

            const response: ObjectIdApiResponse = await callKinshipAPI<string>('/api/stripe/createPaymentIntent', createPaymentIntentPayload)

            if (response.error) {
                setStep(DonationStep.Error)
                setLoading(false)
                return
            }

            // If the response status is 200, we can assume the shape of the response
            setStripeClientSecret(response.data!)

            // Finally, set the next step
            if (globalDonation.amount_in_cents > 10_000_00) {
                setStep(DonationStep.WireTransferInstructions)
            } else {
                setStep(DonationStep.PaymentInfo)
            }
            setLoading(false)
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
                inputCustomization={InputCustomizations.Dollars}
                name="amount"
                id="amount"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ 
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

export default DonationInformationStep