
import React, { useContext } from "react";
import { Button, InlineLink, VerticalSpacer, AppPageProps, ButtonStyle, SpacerSize, PageHeader, Text, SectionHeader, JustifyBetween } from  "../../components/primitives";
import { DonationPanel } from "../../components/prebuilts/app/DonationPanel";
import { useAuth } from "../../components/prebuilts/Authentication";

const AppHomePage: React.FC<AppPageProps> = () => {

    const { donor, donorDonations } = useAuth()

    return (
        <div>
            <JustifyBetween>
                <PageHeader>{ donor!.first_name }{ donor!.first_name.endsWith('s') ? "'" : "'s" } Kinship Dashboard</PageHeader>
                <Button text="Support" style={ButtonStyle.Secondary} href={"/support"}></Button>
            </JustifyBetween>
            <VerticalSpacer size={SpacerSize.Medium} />
            <SectionHeader>Your Donations</SectionHeader>
            <Text><span>Any donations you have made will be listed below. If a donation, such as an eTransfer or Cash donation is missing, or if you need any help or have questions, you can contact support at <InlineLink href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} text={`${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}/></span></Text>
            <VerticalSpacer size={SpacerSize.Small} />
            <div className="space-y-4">
                { donorDonations.map((donation) => (
                    <DonationPanel donation={donation} key={donation.identifiers.donation_id} />
                )) }
            </div>
        </div> 
    )
}

export default AppHomePage


