
import React, { useState } from "react";
import { Button, VerticalSpacer, PanelWithLeftText, TextInput, JustifyBetween, JustifyEnd, PageHeader, Text, BaseHeader,  AppPageProps, ButtonSize, ButtonStyle, SpacerSize  } from "../../components/primitives";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Donor } from "../../lib/classes/donor";
import { toast } from "react-hot-toast";
import { callKinshipAPI } from "../../lib/utils/helpers";
import { SelectionInput } from "../../components/primitives/Inputs";
import { countries } from "../../lib/utils/constants";
import { NoDataApiResponse } from "@lib/classes/api";
import { useAuth } from "@components/prebuilts/Authentication";
import _isEqual from 'lodash/isEqual';
import { CountryCode } from "@lib/classes/utils";

const AppAccountPage: React.FC<AppPageProps> = () => {
    return (
        <div>
            <JustifyBetween>
                <PageHeader>Your Kinship Account</PageHeader>
            </JustifyBetween>
            <VerticalSpacer size={SpacerSize.Medium} />
            <AccountInformationPanel />
            <VerticalSpacer size={SpacerSize.Medium} />
            {/* <AddressInformationPanel /> */}
        </div>
    )
}

export default AppAccountPage

const AccountInformationPanel = () => {
    const { donor, authReloadStatus, triggerAuthReload } = useAuth()
    const [modifiedDonor, setModifiedDonor] = useState<Donor>({ ...donor! })
    const [loading, setLoading] = useState<boolean>(false)


    const handleSaveChanges = async () => {
        setLoading(true)

        if (_isEqual(donor, modifiedDonor)) {
            setLoading(false)
            toast.success("Successfully updated your account information!", { position: "top-right" })
            return
        }

        const response: NoDataApiResponse = await callKinshipAPI('/api/donor/profile/update', {
            existing_donor_object: donor,
            updated_donor_object: modifiedDonor,
        })

        if (response.error) {
            toast.error(response.error, { position: "top-right" })
        } else {
            triggerAuthReload(!authReloadStatus)
            toast.success("Successfully updated your account information!", { position: "top-right" })
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
                    value={modifiedDonor.first_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setModifiedDonor({
                            ...modifiedDonor,
                            first_name: e.target.value
                        })
                    }} 
                    required={false} 
                />
                <TextInput 
                    placeholder="Last Name" 
                    type="text" 
                    label="Last Name"
                    name="userLastName" 
                    id="userLastName" 
                    value={modifiedDonor.last_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setModifiedDonor({
                            ...modifiedDonor,
                            last_name: e.target.value
                        })
                    }} 
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
                value={modifiedDonor.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                    setModifiedDonor({
                        ...modifiedDonor,
                        email: e.target.value
                    })
                }} 
                required={false} 
            />
            <VerticalSpacer size={SpacerSize.Medium} />
            <TextInput 
                placeholder="Line Address" 
                type="text" 
                label="Line Address"
                name="lineAddress" 
                id="lineAddress" 
                value={modifiedDonor.address.line_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                    setModifiedDonor({
                        ...modifiedDonor,
                        address: {
                            ...modifiedDonor.address,
                            line_address: e.target.value
                        }
                    })
                }}
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
                    value={modifiedDonor.address.city}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setModifiedDonor({
                            ...modifiedDonor,
                            address: {
                                ...modifiedDonor.address,
                                city: e.target.value
                            }
                        })
                    }}
                    required={false} 
                />
                <TextInput 
                    placeholder="State" 
                    type="text" 
                    label="State"
                    name="state" 
                    id="state" 
                    value={modifiedDonor.address.state}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setModifiedDonor({
                            ...modifiedDonor,
                            address: {
                                ...modifiedDonor.address,
                                state: e.target.value
                            }
                        })
                    }}
                    required={false} 
                />
                <TextInput 
                    placeholder="Postal Code" 
                    type="text" 
                    label="Postal Code"
                    name="postalCode" 
                    id="postalCode" 
                    value={modifiedDonor.address.postal_code}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setModifiedDonor({
                            ...modifiedDonor,
                            address: {
                                ...modifiedDonor.address,
                                postal_code: e.target.value
                            }
                        })
                    }}
                    required={false} 
                />
                <SelectionInput
                    label="Country"
                    name="country"
                    id="country"
                    value={modifiedDonor.address.country}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setModifiedDonor({
                            ...modifiedDonor,
                            address: {
                                ...modifiedDonor.address,
                                country: e.target.value as CountryCode
                            }
                        })
                    }}
                    required={false}
                    options={countries.map((country) => {
                        return {
                            label: country.label,
                            value: country.value
                        }
                    })}
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