import React, { useMemo } from "react"
import { Tabs, ButtonSize, ButtonStyle, SpacerSize, Tab, VerticalSpacer, HorizontalSpacer, PageHeader, Text  } from "../../../components/primitives"
import { Donation } from "../../../lib/classes/donation"
import { Donor } from "../../../lib/classes/donor"
import Button from "../../../components/primitives/Button"
import { EnvelopeIcon } from "@heroicons/react/20/solid"
import { toast } from "react-hot-toast"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import App from "../../../components/prebuilts/admin/table"

const AdminResendPage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {

    const tabs: Tab[] = [
        { name: "Search All Donations", component: <SearchAllDonations /> },
        { name: "Resend With Specific Id", component: <ResendWithSpecificId /> },
    ]

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
            <VerticalSpacer size={SpacerSize.Small} />
            <PageHeader>Resend A Donation Receipt</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>This tool allows you to create a new donation. Click on the corresponding tab for the type of donation you want to create.</Text>
            <VerticalSpacer size={SpacerSize.Medium} />
            <Tabs tabs={tabs} />
        </div>
    )
}

export default AdminResendPage


const SearchAllDonations: React.FC = () => {

    const fetchAllDonations = async () => {
        return
    }

    const handleResendEmail = (email: string) => {
    // Implement the logic to resend email
        console.log(`Resending email to ${email}`);
    };

    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>Find your donation below, and click resend to email the donor their receipt again. If you need to send to a different email, click the resend with custom email button. Use the search field below to search by donor or date, to filter donations down.</Text>
            <App />
        </div>
    )
}

const ResendWithSpecificId: React.FC = () => {
    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <input placeholder="Enter the ID" />
            <Button text="Resend Email" icon={<EnvelopeIcon />} style={ButtonStyle.Secondary} size={ButtonSize.Small} onClick={()=>{ toast.success("Successfully resent receipt to hobbleabbas@gmail.com", { position: "top-right"}) }}/>
        </div>
    )
}
