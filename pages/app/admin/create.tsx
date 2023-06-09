import React, { useState } from "react"
import { AppLayout } from "../../../components/prebuilts/Layouts"
import { Tabs, JustifyEnd, Table, TextInput, Button, VerticalSpacer, ButtonSize, ButtonStyle, EventColors, SpacerSize, Tab, PageHeader, SectionHeader, Text, PanelWithLeftText, BaseHeader, AnyText, TextSize, TextWeight, TextLineHeight, Label } from "../../../components/primitives"
import { Donation } from "../../../system/classes/donation"
import { Donor } from "../../../system/classes/donor"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import { PlusCircleIcon } from "@heroicons/react/20/solid"
import { callKinshipAPI, centsToDollars, dollarsToCents, parseFrontendDate } from "../../../system/utils/helpers"
import { MessageResponse } from "../../../system/classes/api"
import { InputCustomizations } from "../../../components/primitives/types"
import { DatePicker } from "../../../components/primitives/Inputs"

export default function Index() {
    return (
        <AppLayout AppPage={AdminCreatePage} />
    )
}

const AdminCreatePage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {

    const tabs: Tab[] = [
        { name: "Create From Kinship Cart", component: <CreateFromKinshipCart /> },
        { name: "Create From Existing Donor", component: <CreateFromExistingDonor /> },
        { name: "Create From Scratch", component: <CreateFromScratch /> },
    ]

    return (
        <div>
            <PageHeader>Create A New Donation</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>This tool allows you to create a new donation. Click on the corresponding tab for the type of donation you want to create.</Text>
            <VerticalSpacer size={SpacerSize.Medium} />
            <Tabs tabs={tabs} />
        </div>
    )
}

const CreateFromKinshipCart: React.FC = () => {

    const [kinshipCartId, setKinshipCartId] = useState<string>("")
    const [kinshipCart, setKinshipCart] = useState<Donation>(null)
    const [loading, setLoading] = React.useState<boolean>(false)


    // Donation details
    const [amountInCents, setAmountInCents] = useState<number>(0)
    const [dateDonated, setDateDonated] = useState<Date>(new Date())
    const [donorAddress, setDonorAddress] = useState<string>("")
    const [donorCity, setDonorCity] = useState<string>("")
    const [donorState, setDonorState] = useState<string>("")
    const [donorCountry, setDonorCountry] = useState<string>("")
    const [donorPostalCode, setDonorPostalCode] = useState<string>("")
    const [donorFirstName, setDonorFirstName] = useState<string>("")
    const [donorLastName, setDonorLastName] = useState<string>("")
    const [donorId, setDonorId] = useState<string>("")
    const [donorEmail, setDonorEmail] = useState<string>("")

    const fetchKinshipCart = async () => {
        setLoading(true)

        if (kinshipCartId.length === 0) {
            toast.error("Please enter a Kinship Cart ID", { position: "top-right" })
            setLoading(false)
            return
        }

        const response = await callKinshipAPI('/api/donation/fetchKinshipCart', {
            cart_id: kinshipCartId,
        })

        if (response.status == 500) { 
            toast.error("Kinship Cart not found", { position: "top-right" })
            console.error(response) 
        } else if (response.status == 200) {
            setKinshipCart(response.cart)
            toast.success(`Found Kinship Cart for ${response.cart.donor.first_name} ${response.cart.donor.last_name}`, { position: "top-right" })
            console.log(response.cart)
        } else {
            toast.error("An unknown error occurred", { position: "top-right" })
        }

        setLoading(false)
        return
    }


    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <TextInput 
                placeholder="Kinship Cart ID" 
                type="text" 
                name="kinshipCartId" 
                id="kinshipCartId" 
                value={kinshipCartId}
                onChange={(e)=>{ setKinshipCartId(e.target.value) }} 
                required={true} 
                button={{
                    text: "Fetch Kinship Cart",
                    icon: <EnvelopeIcon />,
                    style: ButtonStyle.Secondary,
                    size: ButtonSize.Standard,
                    isLoading: loading,
                    onClick: fetchKinshipCart
                }} 
            />
            {kinshipCart && (
                <div>
                    <VerticalSpacer size={SpacerSize.Small} />
                    <SectionHeader>Retrieved Cart For {kinshipCart.donor.first_name}{' '}{kinshipCart.donor.last_name} On {parseFrontendDate(kinshipCart.date_donated)}</SectionHeader>
                    <Text>You can verify the information below, and make adjustments as needed (for example, if we received more or less funds than originally intended). Once you&apos;ve confirmed the validity of the donation, hit send and a receipt will be generated for the donor. The donor will be notified automatically.</Text>
                    <VerticalSpacer size={SpacerSize.Small} />
                    <form>
                        <TextInput
                            placeholder="Amount"
                            type="text"
                            name="amount"
                            id="amount"
                            value={centsToDollars(kinshipCart.amount_in_cents)} // use the centsToDollars function to format the amount_in_cents value
                            onChange={(e) => {
                                const newKinshipCart = { ...kinshipCart, amount_in_cents: parseFloat(e.target.value) * 100 };
                                setKinshipCart(newKinshipCart);
                            }}
                            required={true}
                        />

                    </form>
                </div>
            )}
        </div>
    )
}

const CreateFromExistingDonor: React.FC = () => {
    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <Table
                headers={["Donor Name", "Email", ""]}
                rows={[
                    { 
                        "Donor Name": "Shakeel-Abbas Hussein", 
                        "Email": "hobbleabbas@gmail.com", 
                        "": <span className="flex justify-end">
                            <Button text="Select Donor" icon={<PlusCircleIcon />} style={ButtonStyle.Secondary} size={ButtonSize.Small} onClick={()=>{ toast.success("Successfully resent receipt to hobbleabbas@gmail.com", { position: "top-right"}) }}/>
                        </span> }
                ]}
            />
        </div>
    )
}


const CreateFromScratch: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false)

    const [unconvertedAmount, setUnconvertedAmount] = useState<string>("0")
    const [dateDonated, setDateDonated] = useState<Date>(new Date())
    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [lineAddress, setLineAddress] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [state, setState] = useState<string>("")
    const [country, setCountry] = useState<string>("")
    const [postalCode, setPostalCode] = useState<string>("")

    const handleSaveChanges = async () => {
        setLoading(true)

        try {
            if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || lineAddress.length === 0 || city.length === 0 || state.length === 0 || country.length === 0 || postalCode.length === 0) {
                setLoading(false)
                toast.error("Please fill out all the fields", { position: "top-right" })
                return
            }
    
            const response: MessageResponse = await callKinshipAPI('/api/donor/profile/update', {
                
            })
    
            if (response.status == 500) { 
                toast.error("Error updating your profile, please try again later", { position: "top-right" })
            } else if (response.status == 200) {
                toast.success(response.message, { position: "top-right" })
            } else {
                toast.error("An unknown error occurred", { position: "top-right" })
            }
    
        } catch (error) {
            toast.error(`Error: ${error.message}`, { position: "top-right" })
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
                        onChange={(e)=>{ 
                            setUnconvertedAmount(e.target.value)
                        }} 
                        required={true} 
                        inputCustomization={InputCustomizations.Dollars}

                    />
                    <div>
                        <Label htmlFor="donationDate" label="Donation Date" required={true} />
                        <VerticalSpacer size={SpacerSize.Small} />
                        <DatePicker />
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
                        onChange={(e)=>{ setFirstName(e.target.value) }} 
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
                    placeholder="Email Address" 
                    type="email" 
                    label="Email Address"
                    name="emailAddress" 
                    id="emailAddress" 
                    value={email}
                    onChange={(e)=>{ setEmail(e.target.value) }} 
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
                    <TextInput 
                        placeholder="State" 
                        type="text" 
                        label="State"
                        name="state" 
                        id="state" 
                        value={state}
                        onChange={(e)=>{ setState(e.target.value) }} 
                        required={true} 
                    />
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
                    <TextInput 
                        placeholder="Country" 
                        type="text" 
                        label="Country"
                        name="country" 
                        id="country" 
                        value={country}
                        onChange={(e)=>{ setCountry(e.target.value) }} 
                        required={true} 
                    />
                </div>
                <VerticalSpacer size={SpacerSize.Medium} />

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
