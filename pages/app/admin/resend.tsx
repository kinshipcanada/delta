import React from "react"
import { AppLayout } from "../../../components_/Layouts"
import { HorizontalSpacer, VerticalSpacer } from "../../../components_/Spacer"
import { ButtonSize, ButtonStyle, EventColors, SpacerSize, Tab } from "../../../components_/types"
import { PageHeader, Text } from "../../../components_/Typography"
import { Donation } from "../../../system/classes/donation"
import { Donor } from "../../../system/classes/donor"
import { Tabs } from "../../../components_/Tabs"
import { Alert } from "../../../components_/Alerts"
import { Table } from "../../../components_/Table"
import Button from "../../../components_/Button"
import { EnvelopeIcon } from "@heroicons/react/20/solid"
import { toast } from "react-hot-toast"

export default function Index() {
    return (
        <AppLayout AppPage={AdminCreatePage} />
    )
}

const AdminCreatePage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {

    const tabs: Tab[] = [
        { name: "Search All Donations", component: <SearchAllDonations /> },
        { name: "Resend With Specific Id", component: <ResendWithSpecificId /> },
    ]

    return (
        <div>
            <PageHeader>Resend A Donation</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>This tool allows you to create a new donation. Click on the corresponding tab for the type of donation you want to create.</Text>
            <VerticalSpacer size={SpacerSize.Medium} />
            <Tabs tabs={tabs} />
        </div>
    )
}

const SearchAllDonations: React.FC = () => {

    const fetchAllDonations = async () => {
        return
    }
    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>Find your donation below, and click resend to email the donor their receipt again. If you need to send to a different email, click the resend with custom email button. Use the search field below to search by donor or date, to filter donations down.</Text>
            <Table
                headers={["Donor Name", "Donation Amount", "Email", "Date Donated", ""]}
                rows={[
                    { 
                        "Donor Name": "Shakeel-Abbas Hussein", 
                        "Email": "hobbleabbas@gmail.com", 
                        "Donation Amount": "$500.00", 
                        "Date Donated": "May 1, 2023", 
                        "": <span className="flex justify-end">
                            <Button text="Resend With Custom Email &rarr;" style={ButtonStyle.Secondary} size={ButtonSize.Small} href={"#"}/>
                            <HorizontalSpacer size={SpacerSize.Small} />
                            <Button text="Resend Email" icon={<EnvelopeIcon />} style={ButtonStyle.Secondary} size={ButtonSize.Small} onClick={()=>{ toast.success("Successfully resent receipt to hobbleabbas@gmail.com", { position: "top-right"}) }}/>
                        </span> }
                ]}
            />
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
