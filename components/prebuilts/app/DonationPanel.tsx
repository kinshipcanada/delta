import { CalendarDaysIcon } from "@heroicons/react/20/solid";
import { UserCircleIcon, EnvelopeIcon, CurrencyDollarIcon } from "@heroicons/react/24/solid";
import React from "react";
import { centsToDollars, parseFrontendDate } from "../../../lib/utils/helpers";
import { Badge } from "../../primitives/Badge";
import Button from "../../primitives/Button";
import { PanelWithFooter } from "../../primitives/Panels";
import { HorizontalSpacer } from "../../primitives/Spacer";
import { ButtonStyle, EventColors, SpacerSize, StandardIconSizing, Style } from "../../primitives/types";
import { BoldText, Text } from "../../primitives/Typography";
import { JustifyEnd } from "../../primitives/Utils";
import { donation as PrismaDonation, donor } from "@prisma/client";

export const PrismaDonationPanel: React.FC<{ donation: PrismaDonation; donor?: donor }> = ({ donation, donor }) => {
    return (
        <PanelWithFooter
            footer={
                <JustifyEnd>
                    <Button text="View Receipt &rarr;" style={ButtonStyle.Primary} href={`${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}`}></Button>
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
                        {donor ? `${donor.donor_first_name} ${donor.donor_middle_name ?? ""} ${donor.donor_last_name}` : ""}
                    </Text>
                </div>
                <div className="pt-4 w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <CurrencyDollarIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Amount Donated
                    </BoldText>
                    <Text>
                        ${ centsToDollars(donation.amount_charged_cents) }
                        <HorizontalSpacer size={SpacerSize.Small} />
                        <Badge 
                            text={donor?.donor_address_country === "CA" ? "Tax Receipt" : "Donation Receipt"} 
                            style={Style.Outlined} 
                            color={donor?.donor_address_country === "CA" ? EventColors.Success : EventColors.Neutral} 
                        />

                    </Text>
                </div>
                <div className="pt-4 w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <EnvelopeIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Status
                    </BoldText>
                    <Text>
                        {
                            donation.status == "PROCESSING" ?
                            <Badge text="Donation Processing..." style={Style.Filled} color={EventColors.Neutral} />

                            : donation.status == "DELIVERED_TO_PARTNERS" ?
                            <Badge text="Delivered To Partners" style={Style.Filled} color={EventColors.Info} />

                            : donation.status == "PARTIALLY_DISTRIBUTED" ?
                            <Badge text="Partial Proof Available" style={Style.Filled} color={EventColors.Success} />

                            : donation.status == "FULLY_DISTRIBUTED" ?
                            <Badge text="Full Proof Available" style={Style.Filled} color={EventColors.Success} />

                            : <Badge text="Donation Processing..." style={Style.Filled} color={EventColors.Neutral} />
                        }
                        
                    </Text>
                </div>
                
                <div className="pt-4 w-full sm:grid sm:grid-cols-2 sm:gap-4">
                    <BoldText>
                        <CalendarDaysIcon className={`${StandardIconSizing} text-slate-600 mr-2`} />
                        Date Of Donation
                    </BoldText>
                    <Text>
                        { parseFrontendDate(donation.date) }
                    </Text>
                </div>
            </dl>                
        </PanelWithFooter>
    )
}