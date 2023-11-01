import React from "react"
import { Tabs, Alert, EventColors, SpacerSize, Tab, VerticalSpacer, PageHeader, Text  } from "../../../components/primitives"
import { Donation } from "../../../lib/classes/donation"
import { Donor } from "../../../lib/classes/donor"

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

export default AdminCreatePage

const CreateFromKinshipCart: React.FC = () => {

    // const fetchKinshipCarts = async () => {
    //     await 
    // }
    return (
        <div>
            <VerticalSpacer size={SpacerSize.Small} />
            <Alert 
                title="Work in progress"
                type={EventColors.Info}
                message="Component is not yet complete."
            />
        </div>
    )
}

const CreateFromExistingDonor: React.FC = () => {
    return (
        <div>
            <Alert 
                title="Not yet implemented"
                type={EventColors.Warning}
                message="Component is not yet complete."
            />
        </div>
    )
}

const CreateFromScratch: React.FC = () => {
    return (
        <div>
           <Alert 
                title="Not yet implemented"
                type={EventColors.Warning}
                message="Component is not yet complete."
            />
        </div>
    )
}
