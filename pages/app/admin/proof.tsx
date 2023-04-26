import React from "react"
import { AppLayout } from "../../../components_/Layouts"
import { VerticalSpacer } from "../../../components_/Spacer"
import { ButtonSize, ButtonStyle, EventColors, ExtraLargeIconSizing, LargeIconSizing, SmallIconSizing, SpacerSize, StandardIconSizing, Style } from "../../../components_/types"
import { BoldText, PageHeader, Text } from "../../../components_/Typography"
import { Donation } from "../../../system/classes/donation"
import { Donor } from "../../../system/classes/donor"
import { PanelWithHeaderNoPadding } from "../../../components_/Panels"
import { ArrowUpOnSquareIcon, DocumentDuplicateIcon, EnvelopeIcon, PlusCircleIcon } from "@heroicons/react/24/solid"
import { JustifyEnd } from "../../../components_/Utils"
import Button from "../../../components_/Button"
import { Badge } from "../../../components_/Badge"

export default function Index() {
    return (
        <AppLayout AppPage={AppProofPage} />
    )
}

const AppProofPage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {
    return (
        <div>
            <PageHeader>Kinship Canada Admin Panel</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text><span>Any donations you have made will be listed below. If a donation, such as an eTransfer or Cash donation is missing, or if you need any help or have questions, you can contact support at</span></Text>
            <VerticalSpacer size={SpacerSize.Medium} />
        </div>
    )
}

