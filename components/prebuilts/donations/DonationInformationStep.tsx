import { useState, FC, useEffect } from "react"
import { DonationStep } from "./helpers/types"
import { Country, Donation } from "@prisma/client"
import { callKinshipAPI, dollarsToCents, isFloatOrInteger, validateEmail } from "../../../lib/utils/helpers"
import { Alert, BaseHeader, Button, CheckboxInput, Label, SelectionInput, TextInput, VerticalSpacer } from "../../primitives"
import { ButtonSize, ButtonStyle, EventColors, InputCustomizations, SpacerSize } from "../../primitives/types"
import { countries, states_and_provinces } from "../../../lib/utils/constants"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../Authentication"
import { ObjectIdApiResponse } from "@lib/classes/api"
import { Cause } from "@lib/classes/causes"
import { CountryCode } from "@lib/classes/utils"
import { v4 as uuidv4 } from 'uuid'

const DonationInformationStep: FC<{ globalDonation: Donation, setGlobalDonation: (value: Donation) => void, setStep: (value: DonationStep) => void, setStripeClientSecret: (value: string) => void }> = ({ globalDonation, setGlobalDonation, setStep, setStripeClientSecret }) => {
    const { donor } = useAuth()

    useEffect(()=>{
        if (donor) {
            // setGlobalDonation({
            //     ...globalDonation,
            //     donor: donor
            // })
            console.log('donor is logged in')
        }
    }, [donor])

    const sadatDonation: Cause = {
        one_way: true,
        label: "Sehme Sadat",
        region: "iq"
    }

    const imamDonation: Cause = {
        one_way: true,
        label: "Sehme Imam",
        region: "iq"
    }

    const sadaqahDonation: Cause = {
        one_way: false,
        label: "Sadaqah",
    }

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<{ title: string, message: string } | undefined>(undefined)

    const [isKhums, setIsKhums] = useState<boolean>(false)
    const [isImam, setIsImam] = useState<boolean>(false)
    const [isSadat, setIsSadat] = useState<boolean>(false)
    const [isSadaqah, setIsSadaqah] = useState<boolean>(false)
    const [isRamadhan, setIsRamadhan] = useState<boolean>(false)

    const handleDonationDetailsStep = async () => {
        setLoading(true)

        try {
            setError(undefined)

            // Validate that there is a valid amount being donated
            try {
                if (!isFloatOrInteger(globalDonation.amountDonatedInCents)) {
                    throw new Error("Enter a valid amount to donate")
                }

                const amountDonatedInCents = globalDonation.amountDonatedInCents

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

            if (!validateEmail(globalDonation.donorEmail)) {
                setError({
                    title: "invalid email",
                    message: "Please enter a valid email"
                })
                setLoading(false)
                return
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

            if (isImam) { globalDonation.adheringLabels.push("IMAM_DONATION") }
            if (isSadat) { globalDonation.adheringLabels.push("SADAT_DONATION") }
            if (isSadaqah) { globalDonation.adheringLabels.push("SADAQAH_DONATION") }
            if (isRamadhan) { globalDonation.adheringLabels.push("RAMADHAN_DONATION") }

            const response: ObjectIdApiResponse = await callKinshipAPI<string>('/api/stripe/createPaymentIntent', {
                donation: globalDonation
            })

            if (response.error) {
                setStep(DonationStep.Error)
                setLoading(false)
                return
            }

            // If the response status is 200, we can assume the shape of the response
            setStripeClientSecret(response.data!)

            // Finally, set the next step
            if (globalDonation.amountDonatedInCents > 10_000_00) {
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
                        amountDonatedInCents: parseInt(dollarsToCents(e.target.value)),
                        amountChargedInCents: parseInt(String(parseInt(dollarsToCents(e.target.value)) * 1.029))
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
                    value={globalDonation.donorFirstName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setGlobalDonation({
                            ...globalDonation,
                            donorFirstName: e.target.value
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
                    value={globalDonation.donorLastName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setGlobalDonation({
                            ...globalDonation,
                            donorLastName: e.target.value
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
                value={globalDonation.donorEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                    setGlobalDonation({
                        ...globalDonation,
                        donorEmail: e.target.value
                    })
                }} 
                required={true} 
            />

            <VerticalSpacer size={SpacerSize.Large} />

            <BaseHeader>Address Information</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <TextInput 
                placeholder="Line Address" 
                type="text" 
                label="Line Address"
                name="lineAddress" 
                id="lineAddress" 
                value={globalDonation.donorAddressLineAddress}
                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                    setGlobalDonation({
                        ...globalDonation,
                        donorAddressLineAddress: e.target.value
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
                    value={globalDonation.donorAddressCity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                        setGlobalDonation({
                            ...globalDonation,
                            donorAddressCity: e.target.value
                        })
                    }}
                    required={true} 
                />
                {states_and_provinces[globalDonation.donorAddressCountry] === null || states_and_provinces[globalDonation.donorAddressCountry] === undefined ? (
                    <TextInput
                        placeholder="State or Province"
                        type="text"
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={globalDonation.donorAddressState}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setGlobalDonation({
                                ...globalDonation,
                                donorAddressState: e.target.value
                            })
                        }}
                        required={true}
                    />
                ) : (
                    <SelectionInput
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={globalDonation.donorAddressState}
                        options={states_and_provinces[globalDonation.donorAddressCountry]}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setGlobalDonation({
                                ...globalDonation,
                                donorAddressState: e.target.value
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
                    value={globalDonation.donorAddressPostalCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{
                        setGlobalDonation({
                            ...globalDonation,
                            donorAddressPostalCode: e.target.value
                        })
                    }} 
                    required={true} 
                />

                <div>
                    <Label label={"Country"} htmlFor={"country"} required={true} />
                    <select
                        id={"country"}
                        name={"country"}
                        onChange={(e: any)=>{ 

                            const countrySelected = e.target.value
                            const validCountries = countries
                            setGlobalDonation({
                                ...globalDonation,
                                donorAddressCountry: countrySelected as Country
                            })
                            
                        }}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        defaultValue={"CA"}
                    >
                        {Object.entries(countries).map(([countryCode, countryName]) => (
                            <option key={countryCode} value={countryCode}>
                                {countryName}
                            </option>
                        ))}
                    </select>
                </div>
                
            </div>

            <VerticalSpacer size={SpacerSize.Large} />
            
            
            <BaseHeader>Donation Customizations & Requests</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />

            <CheckboxInput
                label="Is this donation for the Ramadhan Campaign?"
                checked={isRamadhan}
                required={false}
                onChange={(e) => { 
                    setIsRamadhan(e.target.checked)
                }}
            />

            <VerticalSpacer size={SpacerSize.Small} />

            <CheckboxInput
                label="Is this donation Sadaqah"
                checked={isSadaqah}
                required={false}
                onChange={(e) => { 
                    setIsSadaqah(e.target.checked)
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
                        checked={isImam}
                        required={false}
                        onChange={(e) => { 
                            setIsImam(e.target.checked)
                        }}
                    />
                    <VerticalSpacer size={SpacerSize.Small} />
                    <CheckboxInput
                        label="Sehme Sadat"
                        checked={isSadat}
                        required={false}
                        onChange={(e) => { 
                            setIsSadat(e.target.checked)
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