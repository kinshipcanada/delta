import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, EnvelopeIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import React from "react";
import { toast } from "react-hot-toast";
import { Badge } from "../../components_/Badge";
import Button from "../../components_/Button";
import { AppLayout } from "../../components_/Layouts";
import { InlineLink } from "../../components_/Links";
import { PanelWithFooter } from "../../components_/Panels";
import { HorizontalSpacer, VerticalSpacer } from "../../components_/Spacer";
import { AppPageProps, ButtonStyle, EventColors, SpacerSize, StandardIconSizing, Style } from "../../components_/types";
import { BoldText, PageHeader, Text, SectionHeader } from "../../components_/Typography";
import { JustifyBetween, JustifyEnd } from "../../components_/Utils";
import { Donation } from "../../system/classes/donation";
import { CountryList } from "../../system/classes/utils";
import { centsToDollars, parseFrontendDate } from "../../system/utils/helpers";

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


const DonationPanel: React.FC<{ donation: Donation }> = ({ donation }) => {
    return (
        <PanelWithFooter
            footer={
                <JustifyEnd>
                    <Button icon={<ArrowDownCircleIcon />} text="Download Receipt" style={ButtonStyle.Secondary} onClick={()=>{toast.error("Not Implemented. Blame the dev at hobbleabbas@gmail.com until its solved.", { position: "top-right"})}} />
                    <HorizontalSpacer size={SpacerSize.Small} />
                    <Button text="View Donation &rarr;" style={ButtonStyle.Primary} href={`http://${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.identifiers.donation_id}`}></Button>
                </JustifyEnd>
            }
        >
            <dl className="divide-y space-y-4 divide-gray-100">
                <div className="w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <UserCircleIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Donor
                    </BoldText>
                    <Text>
                        { donation.donor.first_name } { donation.donor.last_name }
                    </Text>
                </div>
                <div className="pt-4 w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <CurrencyDollarIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Amount Donated
                    </BoldText>
                    <Text>
                        ${ centsToDollars(donation.amount_in_cents) }
                        <HorizontalSpacer size={SpacerSize.Small} />
                        <Badge text={donation.donor.address.country == CountryList.CANADA ? "Tax Receipt" : "Donation Receipt"} style={Style.Outlined} color={donation.donor.address.country == CountryList.CANADA ? EventColors.Success : EventColors.Neutral } />
                    </Text>
                </div>
                <div className="pt-4 w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <EnvelopeIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Status
                    </BoldText>
                    <Text>
                        <Badge text="Donation Processing..." style={Style.Filled} color={EventColors.Neutral} />
                    </Text>
                </div>
                
                <div className="pt-4 w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <CalendarDaysIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Date Of Donation
                    </BoldText>
                    <Text>
                        { parseFrontendDate(donation.date_donated) }
                    </Text>
                </div>
            </dl>                

        </PanelWithFooter>
    )
}