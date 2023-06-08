import React, { useState } from "react"
import { AppLayout } from "../../../components/prebuilts/Layouts"
import { Tabs, Alert, Table, TextInput, Button, VerticalSpacer, ButtonSize, ButtonStyle, EventColors, SpacerSize, Tab, PageHeader, SectionHeader, Text } from "../../../components/primitives"
import { Donation } from "../../../system/classes/donation"
import { Donor } from "../../../system/classes/donor"
import { EnvelopeIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import { PlusCircleIcon } from "@heroicons/react/20/solid"
import { callKinshipAPI, centsToDollars, parseFrontendDate } from "../../../system/utils/helpers"

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
                inputCustomization="none"
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
                                console.log(newKinshipCart)
                                setKinshipCart(newKinshipCart);
                            }}
                            inputCustomization="none"
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
    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
           <Alert 
                title="Not yet implemented"
                type={EventColors.Warning}
                message="Component is not yet complete."
            />
        </div>
    )
}
