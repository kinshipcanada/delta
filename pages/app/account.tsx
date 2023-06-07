
import React, { useState } from "react";
import Button from "../../components_/Button";
import { AppLayout } from "../../components_/Layouts";
import { VerticalSpacer } from "../../components_/Spacer";
import { AppPageProps, ButtonSize, ButtonStyle, LargeIconSizing, SpacerSize, StandardIconSizing } from "../../components_/types";
import { PageHeader, Text, BaseHeader } from "../../components_/Typography";
import { JustifyBetween, JustifyEnd } from "../../components_/Utils";
import { PanelWithLeftText } from "../../components_/Panels";
import { TextInput } from "../../components_/Inputs";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Donor } from "../../system/classes/donor";

export default function Index() {
    return (
        <AppLayout AppPage={AppHomePage} />
    )
}

const AppHomePage: React.FC<AppPageProps> = ({ donor }) => {

    return (
        <div>
            <JustifyBetween>
                <PageHeader>Your Kinship Account</PageHeader>
            </JustifyBetween>
            <VerticalSpacer size={SpacerSize.Medium} />
            <AccountInformationPanel donor = {donor} />
            <VerticalSpacer size={SpacerSize.Medium} />
            <AddressInformationPanel donor = {donor} />
        </div>
    )
}

const AccountInformationPanel: React.FC<{ donor: Donor }> = ({ donor }) => {
    const [firstName, setFirstName] = useState<string>(donor.first_name)
    const [lastName, setLastName] = useState<string>(donor.last_name)
    const [email, setEmail] = useState<string>(donor.email)

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
                    inputCustomization="none"
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
                    inputCustomization="none"
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
                onChange={(e)=>{ setLastName(e.target.value) }} 
                required={false} 
                inputCustomization="none"
            />
            <VerticalSpacer size={SpacerSize.Medium} />
            <JustifyEnd>
                <Button text="Save Changes" icon={<CheckIcon />} style={ButtonStyle.Secondary} size={ButtonSize.Small} href={"/support"} />
            </JustifyEnd>
        </PanelWithLeftText>
    )
}

const AddressInformationPanel: React.FC<{ donor: Donor }> = ({ donor }) => {

    const [lineAddress, setLineAddress] = useState<string>(donor.address.line_address)
    const [city, setCity] = useState<string>(donor.address.city)
    const [state, setState] = useState<string>(donor.address.state)
    const [country, setCountry] = useState<string>(donor.address.country)
    const [postalCode, setPostalCode] = useState<string>(donor.address.postal_code)

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
                inputCustomization="none"
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
                    inputCustomization="none"
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
                    inputCustomization="none"
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
                    inputCustomization="none"
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
                    inputCustomization="none"
                />
            </div>
            <VerticalSpacer size={SpacerSize.Medium} />
            <JustifyEnd>
                <Button text="Save Changes" icon={<CheckIcon />} style={ButtonStyle.Secondary} size={ButtonSize.Small} href={"/support"}></Button>
            </JustifyEnd>
        </PanelWithLeftText>
    )
}