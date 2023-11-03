
import React, { useState } from "react";
import { Button, InlineLink, VerticalSpacer, AppPageProps, ButtonStyle, SpacerSize, PageHeader, Text, SectionHeader, JustifyBetween, BaseHeader, TextInput, JustifyEnd, ButtonSize, Label } from  "../../components/primitives";
import { callKinshipAPI, supabase } from "../../lib/utils/helpers";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { SelectionInput } from "../../components/primitives/Inputs";
import { countries, states_and_provinces } from "../../lib/utils/constants";
import { useAuth } from "../../components/prebuilts/Authentication";
import { Donor } from "@lib/classes/donor";
import { NoDataApiResponse } from "@lib/classes/api";

const AppSetupPage: React.FC<AppPageProps> = () => {

    return (
        <div>
            <JustifyBetween>
                <PageHeader>Let&apos;s setup your account</PageHeader>
                <Button text="Support" style={ButtonStyle.Secondary} href={"/support"}></Button>
            </JustifyBetween>
            <VerticalSpacer size={SpacerSize.Medium} />
            <SectionHeader>Your Donations</SectionHeader>
            <Text><span>This will be your Kinship Canada profile. This information will be used to issue you donation confirmations, tax receipts (if eligible), and more. If you need any help or have questions, you can contact support at <InlineLink href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} text={`${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}/></span></Text>
            <VerticalSpacer size={SpacerSize.Small} />
            <SetupForm />
        </div> 
    )
}

export default AppSetupPage

const SetupForm = () => {
    
    const router = useRouter()
    const { authReloadStatus, triggerAuthReload } = useAuth()

    const [loading, setLoading] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [lineAddress, setLineAddress] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [state, setState] = useState<string>("ON")
    const [country, setCountry] = useState<string>("ca")
    const [postalCode, setPostalCode] = useState<string>("")

    const handleSaveChanges = async () => {
        setLoading(true)

        try {
            const loggedInUser = await supabase.auth.getUser();

            if (!loggedInUser) {
                router.push("/auth/login")
            }

            if (firstName.length === 0 || lastName.length === 0 || lineAddress.length === 0 || city.length === 0 || state.length === 0 || country.length === 0 || postalCode.length === 0) {
                setLoading(false)
                toast.error("Please fill out all the fields", { position: "top-right" })
                return
            }

            const constructedDonor: Donor = {
                donor_id: loggedInUser!.data.user!.id,
                first_name: firstName,
                last_name: lastName,
                email: loggedInUser!.data.user!.email!,
                address: {
                    line_address: lineAddress,
                    postal_code: postalCode,
                    city: city,
                    state: state,
                    country: country
                },
                admin: false,
                set_up: false,
                stripe_customer_ids: []
            }

            const response: NoDataApiResponse = await callKinshipAPI<null>('/api/donor/profile/create', {
                donor: constructedDonor
            })

            if (response.error) {
                toast.error(response.error, { position: "top-right" })
                setLoading(false)
                return
            } else {
                toast.success(`Successfully created your profile!`, { position: "top-right" })
                triggerAuthReload(!authReloadStatus)
                router.push("/app")
            }
        } catch (error) {
            toast.error(`Error: ${error instanceof Error && error.message ? error.message : "Sorry, something went wrong setting up your account"}`, { position: "top-right" })
        } finally {
            setLoading(false)
            return
        }
    }

    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <BaseHeader>Personal Information</BaseHeader>
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

            <VerticalSpacer size={SpacerSize.Large} />
            <BaseHeader>Address (used for generating tax receipts)</BaseHeader>
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
                        value={state}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setState(e.target.value);
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setState(e.target.value);
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
                    value="ca"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{ 
                        setCountry(e.target.value)
                     }}
                    required={true}
                />
            </div>
            <VerticalSpacer size={SpacerSize.Medium} />

            <VerticalSpacer size={SpacerSize.Medium} />
            <JustifyEnd>
                <Button 
                    text="Create your profile &rarr;" 
                    isLoading={loading} 
                    style={ButtonStyle.Primary}
                    size={ButtonSize.Standard} 
                    onClick={handleSaveChanges}
                />
            </JustifyEnd>
        </div>
    )
}
