
import React, { useState } from "react";
import { AppLayout } from "../../components/prebuilts/Layouts";
import { Button, VerticalSpacer, PanelWithLeftText, TextInput, JustifyBetween, JustifyEnd, PageHeader, Text, BaseHeader,  AppPageProps, ButtonSize, ButtonStyle, SpacerSize  } from "../../components/primitives";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Donor } from "../../system/classes/donor";
import { toast } from "react-hot-toast";
import { callKinshipAPI } from "../../system/utils/helpers";
import { FetchDonorResponse } from "../../system/classes/api";

export default function Index() {
    return (
        <AppLayout AppPage={AppHomePage} />
    )
}

const AppHomePage: React.FC<AppPageProps> = ({ donor }) => {

    const [globalDonor, setGlobalDonor] = useState<Donor>(donor)

    return (
        <div>
            <JustifyBetween>
                <PageHeader>Your Kinship Account</PageHeader>
            </JustifyBetween>
            <VerticalSpacer size={SpacerSize.Medium} />
            <AccountInformationPanel donor = {globalDonor} setGlobalDonor={setGlobalDonor} />
            <VerticalSpacer size={SpacerSize.Medium} />
            <AddressInformationPanel donor = {globalDonor} setGlobalDonor={setGlobalDonor} />
        </div>
    )
}

const AccountInformationPanel: React.FC<{ donor: Donor, setGlobalDonor: (donor: Donor) => void }> = ({ donor, setGlobalDonor }) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [firstName, setFirstName] = useState<string>(donor.first_name)
    const [lastName, setLastName] = useState<string>(donor.last_name)
    const [email, setEmail] = useState<string>(donor.email)

    const handleSaveChanges = async () => {
        setLoading(true)

        if (firstName === donor.first_name && lastName === donor.last_name && email === donor.email) {
            setLoading(false)
            toast.success("Successfully updated your account information!", { position: "top-right" })
            return
        }

        const response: FetchDonorResponse = await callKinshipAPI('/api/donor/profile/update', {
            donor_id: donor.donor_id,
            existing_donor_object: donor,
            first_name: firstName,
            last_name: lastName,
            email: email,
            address_line_address: donor.address.line_address,
            address_city: donor.address.city,
            address_state: donor.address.state,
            address_country: donor.address.country,
            address_postal_code: donor.address.postal_code
        })

        if (response.status == 500) { 
            toast.error("Error updating your profile, please try again later", { position: "top-right" })
        } else if (response.status == 200) {
            setGlobalDonor(response.donor)
            toast.success("Successfully updated your account information!", { position: "top-right" })
        } else {
            toast.error("An unknown error occurred", { position: "top-right" })
        }

        setLoading(false)
        return
    }

    return (
        <PanelWithLeftText
            header={
                <>
                    <BaseHeader>Personal Information</BaseHeader>
                    <VerticalSpacer size={SpacerSize.Small} />
                    <Text>Update your personal information, including your email address, and the name your receipts are issued to.</Text>
                </>
            }
        >
            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput 
                    placeholder="First Name" 
                    type="text" 
                    label="First Name"
                    name="userFirstName" 
                    id="userFirstName" 
                    value={firstName}
                    onChange={(e)=>{ setFirstName(e.target.value) }} 
                    required={false} 
                />
                <TextInput 
                    placeholder="Last Name" 
                    type="text" 
                    label="Last Name"
                    name="userLastName" 
                    id="userLastName" 
                    value={lastName}
                    onChange={(e)=>{ setLastName(e.target.value) }} 
                    required={false} 
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
                onChange={(e)=>{ setEmail(e.target.value) }} 
                required={false} 
            />
            <VerticalSpacer size={SpacerSize.Medium} />
            <JustifyEnd>
                <Button 
                    text="Save Changes" 
                    isLoading={loading} 
                    icon={<CheckIcon />} 
                    style={ButtonStyle.Secondary}
                    size={ButtonSize.Small} 
                    onClick={handleSaveChanges}
                />
            </JustifyEnd>
        </PanelWithLeftText>
    )
}

const AddressInformationPanel: React.FC<{ donor: Donor, setGlobalDonor: (donor: Donor) => void }> = ({ donor, setGlobalDonor }) => {

    const [loading, setLoading] = useState<boolean>(false)

    const [lineAddress, setLineAddress] = useState<string>(donor.address.line_address)
    const [city, setCity] = useState<string>(donor.address.city)
    const [state, setState] = useState<string>(donor.address.state)
    const [country, setCountry] = useState<string>(donor.address.country)
    const [postalCode, setPostalCode] = useState<string>(donor.address.postal_code)

    const handleSaveChanges = async () => {
        setLoading(true)

        if (lineAddress === donor.address.line_address && city === donor.address.city && state === donor.address.state && country === donor.address.country && postalCode === donor.address.postal_code) {
            setLoading(false)
            toast.success("Successfully updated your account information!", { position: "top-right" })
            return
        }

        const response: FetchDonorResponse = await callKinshipAPI('/api/donor/profile/update', {
            donor_id: donor.donor_id,
            existing_donor_object: donor,
            first_name: donor.first_name,
            last_name: donor.last_name,
            email: donor.email,
            address_line_address: lineAddress,
            address_city: city,
            address_state: state,
            address_country: country,
            address_postal_code: postalCode
        })

        if (response.status == 500) { 
            toast.error("Error updating your profile, please try again later", { position: "top-right" })
        } else if (response.status == 200) {
            setGlobalDonor(response.donor)
            toast.success("Successfully updated your account information!", { position: "top-right" })
        } else {
            toast.error("An unknown error occurred", { position: "top-right" })
        }

        setLoading(false)
        return
    }

    return (
        <PanelWithLeftText
            header={
                <>
                    <BaseHeader>Address Information</BaseHeader>
                    <VerticalSpacer size={SpacerSize.Small} />
                    <Text>This is where you can set your address information, which is used to determine your tax receipt eligibility and appears on your invoice (or tax receipt).</Text>
                </>
            }
        >
            <TextInput 
                placeholder="Line Address" 
                type="text" 
                label="Line Address"
                name="lineAddress" 
                id="lineAddress" 
                value={lineAddress}
                onChange={(e)=>{ setLineAddress(e.target.value) }} 
                required={false} 
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
                    required={false} 
                />
                <TextInput 
                    placeholder="State" 
                    type="text" 
                    label="State"
                    name="state" 
                    id="state" 
                    value={state}
                    onChange={(e)=>{ setState(e.target.value) }} 
                    required={false} 
                />
                <TextInput 
                    placeholder="Postal Code" 
                    type="text" 
                    label="Postal Code"
                    name="postalCode" 
                    id="postalCode" 
                    value={postalCode}
                    onChange={(e)=>{ setPostalCode(e.target.value) }} 
                    required={false} 
                />
                <TextInput 
                    placeholder="Country" 
                    type="text" 
                    label="Country"
                    name="country" 
                    id="country" 
                    value={country}
                    onChange={(e)=>{ setCountry(e.target.value) }} 
                    required={false} 
                />
            </div>
            <VerticalSpacer size={SpacerSize.Medium} />
            <JustifyEnd>
                <Button 
                    text="Save Changes" 
                    isLoading={loading} 
                    icon={<CheckIcon />} 
                    style={ButtonStyle.Secondary}
                    size={ButtonSize.Small} 
                    onClick={handleSaveChanges}
                />
            </JustifyEnd>
        </PanelWithLeftText>
    )
}