import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, EnvelopeIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import React from "react";
import { Donation } from "../../system/classes/donation";
import { CountryList } from "../../system/classes/utils";
import { centsToDollars, parseFrontendDate } from "../../system/utils/helpers";
import { toast } from "react-hot-toast";
import { Badge } from "../Badge";
import Button from "../Button";
import { PanelWithFooter } from "../Panels";
import { HorizontalSpacer } from "../Spacer";
import { ButtonStyle, EventColors, SpacerSize, StandardIconSizing, Style } from "../types";
import { BoldText, Text } from "../Typography";
import { JustifyEnd } from "../Utils";

export const DonationPanel: React.FC<{ donation: Donation }> = ({ donation }) => {
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