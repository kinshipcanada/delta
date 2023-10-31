import { useState, FC, useEffect } from "react"
import { Donor } from "../../../system/classes/donor"
import { DonationStep } from "./helpers/types"
import { Donation } from "../../../system/classes/donation"
import { callKinshipAPI, isFloatOrInteger, validateEmail } from "../../../system/utils/helpers"
import { Address } from "../../../system/classes/address"
import { CurrencyList } from "../../../system/classes/utils"
import { Alert, BaseHeader, Button, CheckboxInput, SelectionInput, TextInput, VerticalSpacer } from "../../primitives"
import { ButtonSize, ButtonStyle, EventColors, InputCustomizations, SpacerSize } from "../../primitives/types"
import { countries, states_and_provinces } from "../../../system/utils/constants"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../Authentication"

const DonationInformationStep: FC<{ globalDonation: Donation, setStep: (value: DonationStep) => void, setGlobalDonation: (value: Donation) => void, setStripeClientSecret: (value: string) => void }> = ({ globalDonation, setStep, setGlobalDonation, setStripeClientSecret }) => {
    const [amount, setAmount] = useState(null)

    // Fields relating to religous obligations
    // Kinship has to collect this information as it there are certain religious donations that must be declared seperately (religously)
    const [isKhums, setIsKhums] = useState<boolean>(false)
    const [isImam, setIsImam] = useState<boolean>(true)
    const [isSadat, setIsSadat] = useState<boolean>(false)
    const [isSadaqah, setIsSadaqah] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<{ title: string, message: string }>(null)

    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [lineAddress, setLineAddress] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [state, setStateOrProvince] = useState<string>("on")
    const [country, setCountry] = useState<string>("ca")
    const [postalCode, setPostalCode] = useState<string>("")

    const { donor } = useAuth()

    useEffect(()=>{
        console.log("hook called")
        if (donor) {
            setGlobalDonation({
                ...globalDonation,
                donor: {
                    ...globalDonation.donor,
                    first_name: donor.first_name
                }
            })
        }
    }, [donor])

    const handleDonationDetailsStep = async () => {
        setLoading(true)

        try {
            setError(null)

            // Validate that there is a valid amount being donated
            try {
                const amountDonatedInCents = parseFloat(String(amount)) * 100

                if (!isFloatOrInteger(amount)) {
                    throw new Error("Enter a valid amount to donate")
                }

                if (amountDonatedInCents < 500) {
                    // We require a minimum of $5 because there are fixed costs associated with credit card fees
                    // We could waive this minimum for eTransfers, which would add a relatively small amount of complexity
                    // However, since donations this small are extremely uncommon we have ommited the edge case
                    setError({
                        title: "minimum donation required",
                        message: "Please donate a minimum of $5"
                    })
                    setAmount(null)
                    setLoading(false)
                    return
                }
            } catch (e) {
                setError({
                    title: "invalid donation amount",
                    message: "Please enter a valid amount to donate"
                })
                setAmount(null)
                setLoading(false)
                return
            }

            if (!validateEmail(email)) {
                setError({
                    title: "invalid email",
                    message: "Please enter a valid email"
                })
                setLoading(false)
                return
            }

            const amountDonatingInCents = parseFloat(String(amount)) * 100

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
            if (isKhums && !isImam && !isSadat) {
                setError({
                    title: "Please specify where to direct khums",
                    message: "To make a khums donation, please specify whether it is Imam, Sadat, or both"
                })
                setLoading(false)
                return
            }

            // Once the forms fields have been vaidated, construct the donation object for the next step
            const globalDonor: Donor = {
                donor_id: donor ? donor.donor_id : null,
                first_name: firstName,
                last_name: lastName,
                email: email,
                address: {
                    line_address: lineAddress,
                    postal_code: postalCode,
                    city: city,
                    state: state,
                    country: country
                } as Address,
                admin: donor ? donor.admin : false,
                set_up: donor ? donor.set_up : false,
                stripe_customer_ids: donor ? donor.stripe_customer_ids : []
            }
            // We create donation identifiers here, so we can log them in Stripe. 
            const globalDonation: Donation = {
                identifiers: {
                    donation_id: "donationId",
                    donor_id: donor.donor_id,
                },
                donor: globalDonor,
                causes: {
                    total_amount_paid_in_cents: amount,
                    currency: CurrencyList.CAD,
                    causes: null, // causes is no longer a supported field, and is kept for backwards compatability
                    is_imam_donation: isImam,
                    is_sadat_donation: isSadat,
                    is_sadaqah: isSadaqah
                },
                live: process.env.NEXT_PUBLIC_LIVEMODE == "true" ? true : false,
                amount_in_cents: amountDonatingInCents,
                fees_covered: process.env.NEXT_PUBLIC_FEES_COVERED_DEFAULT == "true" ? Math.round(amountDonatingInCents * 0.029) : 0,
                fees_charged_by_stripe: 0, // This will be filled in based on the type of card they pay with, by the post-payment Stripe webhook
                date_donated: new Date()
            }

            setGlobalDonation(globalDonation)

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
                value={amount}
                inputCustomization={InputCustomizations.Dollars}
                name="amount"
                id="amount"
                onChange={(e) => { 
                    setGlobalDonation({
                        ...globalDonation,
                        amount_in_cents: e.target.value
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
                    onChange={(e)=>{ 
                        setFirstName(e.target.value)
                     }} 
                    required={true} 
                />
                <TextInput 
                    placeholder="Last Name" 
                    type="text" 
                    label="Last Name"
                    name="userLastName" 
                    id="userLastName" 
                    value={lastName}
                    onChange={(e)=>{ setLastName(e.target.value) }} 
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
                value={email}
                onChange={(e)=>{ setEmail(e.target.value) }} 
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
                value={lineAddress}
                onChange={(e)=>{ setLineAddress(e.target.value) }} 
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
                    value={city}
                    onChange={(e)=>{ setCity(e.target.value) }} 
                    required={true} 
                />
                {states_and_provinces[country] === null || states_and_provinces[country] === undefined ? (
                    <TextInput
                        placeholder="State or Province"
                        type="text"
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={state}
                        onChange={(e) => {
                            setStateOrProvince(e.target.value);
                        }}
                        required={true}
                    />
                ) : (
                    <SelectionInput
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={state}
                        options={states_and_provinces[country]}
                        onChange={(e) => {
                            setStateOrProvince(e.target.value);
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
                    value={postalCode}
                    onChange={(e)=>{ setPostalCode(e.target.value) }} 
                    required={true} 
                />

                <SelectionInput
                    label="Country"
                    name="country" 
                    id="country" 
                    options={countries}
                    value={country}
                    onChange={(e)=>{ 
                        setCountry(e.target.value);

                        if (states_and_provinces[e.target.value]) {
                            setStateOrProvince(states_and_provinces[e.target.value][0].value)
                        } else {
                            setStateOrProvince("")
                        }
                    }}
                    required={true}
                />
            </div>

            <VerticalSpacer size={SpacerSize.Large} />
            
            
            <BaseHeader>Donation Customizations & Requests</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />

            <CheckboxInput
                label="Is this donation Saqadah"
                checked={isSadaqah}
                required={false}
                onChange={(e) => { setIsSadaqah(e.target.checked) }}
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
                        checked={isImam}
                        required={false}
                        onChange={(e) => { setIsImam(e.target.checked) }}
                    />
                    <VerticalSpacer size={SpacerSize.Small} />
                    <CheckboxInput
                        label="Sehme Sadat"
                        checked={isSadat}
                        required={false}
                        onChange={(e) => { setIsSadat(e.target.checked) }}
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