
import React from "react";
import Button from "../../components_/Button";
import { AppLayout } from "../../components_/Layouts";
import { InlineLink } from "../../components_/Links";
import {  VerticalSpacer } from "../../components_/Spacer";
import { AppPageProps, ButtonStyle, SpacerSize } from "../../components_/types";
import { PageHeader, Text, SectionHeader } from "../../components_/Typography";
import { JustifyBetween } from "../../components_/Utils";
import { DonationPanel } from "../../components_/app/DonationPanel";

export default function Index() {
    return (
        <AppLayout AppPage={AppHomePage} />
    )
}

const AppHomePage: React.FC<AppPageProps> = ({ donor, donations }) => {
    return (
        <div>
            <JustifyBetween>
                <PageHeader>{ donor.first_name }{ donor.first_name.endsWith('s') ? "'" : "'s" } Kinship Dashboard</PageHeader>
                <Button text="Support" style={ButtonStyle.Secondary} href={"/support"}></Button>
            </JustifyBetween>
            <VerticalSpacer size={SpacerSize.Medium} />
            <SectionHeader>Your Donations</SectionHeader>
            <Text><span>Any donations you have made will be listed below. If a donation, such as an eTransfer or Cash donation is missing, or if you need any help or have questions, you can contact support at <InlineLink href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} text={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}/></span></Text>
            <VerticalSpacer size={SpacerSize.Small} />
            <div className="space-y-4">
                { donations.map((donation) => (
                    <DonationPanel donation={donation} key={donation.identifiers.donation_id} />
                )) }
            </div>
        </div> 
    )
}


