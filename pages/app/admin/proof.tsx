import React, { useState } from "react"
import { Tabs, JustifyEnd, Table, TextInput, Button, VerticalSpacer, ButtonSize, ButtonStyle, EventColors, SpacerSize, Tab, PageHeader, SectionHeader, Text, PanelWithLeftText, BaseHeader, AnyText, TextSize, TextWeight, TextLineHeight, Label, SelectionInput, CheckboxInput } from "../../../components/primitives"
import { Donation } from "../../../lib/classes/donation"
import { Donor } from "../../../lib/classes/donor"
import { CalendarDaysIcon, EnvelopeIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import { PlusCircleIcon } from "@heroicons/react/20/solid"
import { callKinshipAPI, centsToDollars, dollarsToCents, parseFrontendDate } from "../../../lib/utils/helpers"
import { InputCustomizations } from "../../../components/primitives/types"
import { SelectOption, causes, countries, states_and_provinces } from "../../../lib/utils/constants"
import { Address } from "@lib/classes/address"
import { v4 as uuidv4 } from 'uuid'
import { Cause } from "@lib/classes/causes"
import { ApiAdminDonationsCreateRequestSchema } from "pages/api/admin/donations/create"
import { NoDataApiResponse } from "@lib/classes/api"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

const AdminProofPage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {



    return (
        <div>
            <div className='flex w-full justify-start'>
                <Button 
                    text="Go Back" 
                    icon={<ArrowLeftIcon />}
                    style={ButtonStyle.OutlineUnselected}
                    size={ButtonSize.Small} 
                    href={"/app/admin"}
                />
            </div>
            <PageHeader>Upload Proof Of Donation</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>This tool allows you to create a new donation. Click on the corresponding tab for the type of donation you want to create.</Text>
            <VerticalSpacer size={SpacerSize.Medium} />
        </div>
    )
}

export default AdminProofPage

const CreateFromScratch: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false)

    const [unconvertedAmount, setUnconvertedAmount] = useState<string>("0")
    const [dateDonated, setDateDonated] = useState<Date>(new Date())
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [lineAddress, setLineAddress] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [stateOrProvince, setStateOrProvince] = useState<string>("on")
    const [country, setCountry] = useState<string>("ca")
    const [postalCode, setPostalCode] = useState<string>("")

    const [paymentMethod, setPaymentMethod] = useState<string>("cash")

    const paymentMethodOptions: SelectOption[] = [
        { "label": "Cash Payment", "value": "cash" },
        { "label": "Wire Transfer", "value": "wire_transfer" }
    ]

    // Fields relating to religous obligations
    // Kinship has to collect this information as it there are certain religious donations that must be declared seperately (religously)
    const [isKhums, setIsKhums] = useState<boolean>(false)
    const [isImam, setIsImam] = useState<boolean>(true)
    const [isSadat, setIsSadat] = useState<boolean>(false)
    const [isSadaqah, setIsSadaqah] = useState<boolean>(false)

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

    const handleSaveChanges = async () => {
        setLoading(true)

        try {
            if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || lineAddress.length === 0 || city.length === 0 || stateOrProvince.length === 0 || country.length === 0 || postalCode.length === 0) {
                setLoading(false)
                toast.error("Please fill out all the fields", { position: "top-right" })
                return
            }

            // Validate donation customizations
            if (isKhums && !isImam && !isSadat) {
                toast.error("To make a khums donation, please specify whether it is Imam, Sadat, or both", {
                    position: "top-right"
                })
                return
            }

            const address: Address = {
                line_address: lineAddress,
                postal_code: postalCode,
                city: city,
                state: stateOrProvince,
                country: country
            }

            const donor: Donor = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                address: address,
                admin: false,
                set_up: false,
                stripe_customer_ids: []
            }

            const donation: Donation = {
                identifiers: {
                    donation_id: uuidv4()
                },
                donor: donor,
                causes: [causes[0]],
                amount_in_cents: parseInt(dollarsToCents(unconvertedAmount)),
                fees_covered: 0,
                fees_charged_by_stripe: 0,
                date_donated: dateDonated,
                proof: []
            }

            if (isImam && isKhums) { donation.causes.push(imamDonation) }
            if (isSadaqah) { donation.causes.push(sadaqahDonation) }
            if (isSadat) { donation.causes.push(sadatDonation) }

            const createDonationPayload: ApiAdminDonationsCreateRequestSchema = {
                donation: donation
            }

            const response: NoDataApiResponse = await callKinshipAPI<null>('/api/admin/donations/create', createDonationPayload)

    
            if (response.error) {
                toast.error("Error creating donation", { position: "top-right"})
            } else {
                toast.success("Successfully created donation!", { position: "top-right"})
            }
    
        } catch (error) {
            console.error(error)
            // todo
            // toast.error(`Error: ${error.message}`, { position: "top-right" })
        } finally {
            setLoading(false)
            return
        }
    }

    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <PanelWithLeftText
                header={
                    <>
                        <BaseHeader>Create a new receipt</BaseHeader>
                        <VerticalSpacer size={SpacerSize.Small} />
                        <Text>Use the following form to issue a new tax receipt. All fields are mandatory.</Text>
                    </>
                }
            >   
                <BaseHeader>Donation Details</BaseHeader>
                <VerticalSpacer size={SpacerSize.Small} />
                <div className="grid sm:grid-cols-2 gap-4">
                    <TextInput 
                        placeholder="500.00" 
                        type="text" 
                        label="Donation Amount"
                        name="amount" 
                        id="amount"
                        value={unconvertedAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ 
                            setUnconvertedAmount(e.target.value)
                        }} 
                        required={true} 
                        inputCustomization={InputCustomizations.Dollars}

                    />
                    <div>
                        <Label htmlFor="donationDate" label="Donation Date" required={true} />
                        <VerticalSpacer size={SpacerSize.Small} />
                        <div className="relative rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <CalendarDaysIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                                className="block align-center w-full rounded-md border-0 py-1 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                type = "date" 
                                name = "donationDate"
                                id = "donationDate"
                                onChange = {(e: React.ChangeEvent<HTMLInputElement>)=>{ setDateDonated(new Date(e.target.value)) }}
                                required = {true}
                            />
                        </div>
                    </div>
                    <div>
                        <SelectionInput
                            label="Payment Method"
                            name="payment_method"
                            id="payment_method"
                            value={paymentMethod}
                            options={paymentMethodOptions}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setPaymentMethod(e.target.value)
                            }}
                            required={true}
                        />
                    </div>
                </div>

                <VerticalSpacer size={SpacerSize.Large} />
                <BaseHeader>Donor Personal Information</BaseHeader>
                <VerticalSpacer size={SpacerSize.Small} />
                <div className="grid sm:grid-cols-2 gap-4">
                    <TextInput 
                        placeholder="First Name" 
                        type="text" 
                        label="First Name"
                        name="userFirstName" 
                        id="userFirstName" 
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ setFirstName(e.target.value) }} 
                        required={true} 
                    />
                    <TextInput 
                        placeholder="Last Name" 
                        type="text" 
                        label="Last Name"
                        name="userLastName" 
                        id="userLastName" 
                        value={lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ setLastName(e.target.value) }} 
                        required={true} 
                    />
                </div>
                <VerticalSpacer size={SpacerSize.Medium} />
                <TextInput 
                    placeholder="Email Address" 
                    type="email" 
                    label="Email Address"
                    name="emailAddress" 
                    id="emailAddress" 
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ setEmail(e.target.value) }} 
                    required={true} 
                />

                <VerticalSpacer size={SpacerSize.Large} />
                <BaseHeader>Donor Address</BaseHeader>
                <VerticalSpacer size={SpacerSize.Small} />
                <TextInput 
                    placeholder="Line Address" 
                    type="text" 
                    label="Line Address"
                    name="lineAddress" 
                    id="lineAddress" 
                    value={lineAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ setLineAddress(e.target.value) }} 
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ setCity(e.target.value) }} 
                        required={true} 
                    />
                    {states_and_provinces[country] === null || states_and_provinces[country] === undefined ? (
                        <TextInput
                            placeholder="State or Province"
                            type="text"
                            label="State or Province"
                            name="state_or_province"
                            id="state_or_province"
                            value={stateOrProvince}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setStateOrProvince(e.target.value);
                            }}
                            required={true}
                        />
                    ) : (
                        <SelectionInput
                            label="State or Province"
                            name="state_or_province"
                            id="state_or_province"
                            value={stateOrProvince}
                            options={states_and_provinces[country]}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ setPostalCode(e.target.value) }} 
                        required={true} 
                    />

                    <SelectionInput
                        label="Country"
                        name="country" 
                        id="country" 
                        options={countries}
                        value={country}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ 
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
                <BaseHeader>Donation Customizations</BaseHeader>
                <VerticalSpacer size={SpacerSize.Small} />
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

                <VerticalSpacer size={SpacerSize.Medium} />
                <JustifyEnd>
                    <Button 
                        text="Generate Receipt" 
                        isLoading={loading} 
                        icon={<PlusCircleIcon />} 
                        style={ButtonStyle.Secondary}
                        size={ButtonSize.Small} 
                        onClick={handleSaveChanges}
                    />
                </JustifyEnd>
            </PanelWithLeftText>
        </div>
    )
}
