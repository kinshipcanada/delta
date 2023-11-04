import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { UserCircleIcon, EnvelopeIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import React from "react";
import { Donation } from "../../../lib/classes/donation";
import { centsToDollars, parseFrontendDate } from "../../../lib/utils/helpers";
import { toast } from "react-hot-toast";
import { Badge } from "../../primitives/Badge";
import Button from "../../primitives/Button";
import { PanelWithFooter } from "../../primitives/Panels";
import { HorizontalSpacer } from "../../primitives/Spacer";
import { ButtonStyle, EventColors, SpacerSize, StandardIconSizing, Style } from "../../primitives/types";
import { BoldText, Text } from "../../primitives/Typography";
import { JustifyEnd } from "../../primitives/Utils";

export const DonationPanel: React.FC<{ donation: Donation }> = ({ donation }) => {
    return (
        <PanelWithFooter
            footer={
                <JustifyEnd>
                    <Button text="View Receipt &rarr;" style={ButtonStyle.Primary} href={`${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.identifiers.donation_id}`}></Button>
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
                        <Badge text={donation.donor.address.country == "ca" ? "Tax Receipt" : "Donation Receipt"} style={Style.Outlined} color={donation.donor.address.country == "ca" ? EventColors.Success : EventColors.Neutral } />
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