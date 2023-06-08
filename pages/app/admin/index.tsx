import React from "react"
import { AppLayout } from "../../../components/prebuilts/Layouts"
import { Button, JustifyEnd, Badge, Grid, PanelWithHeaderNoPadding, BoldText, PageHeader, Text, VerticalSpacer, ButtonSize, ButtonStyle, EventColors, ExtraLargeIconSizing,SpacerSize, Style, } from "../../../components/primitives"
import { Donation } from "../../../system/classes/donation"
import { Donor } from "../../../system/classes/donor"
import { ArrowUpOnSquareIcon, DocumentDuplicateIcon, EnvelopeIcon, PlusCircleIcon } from "@heroicons/react/24/solid"

export default function Index() {
    return (
        <AppLayout AppPage={AppAdminPage} />
    )
}
  
const AppAdminPage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {

    const tools = [
        {
            name: 'Resend Receipt',
            icon: EnvelopeIcon,
            color: EventColors.Info,
            description: 'Use this tool to find a donation and resend the donor their receipt. Donor will receive an email.',
            href: "/app/admin/resend",
            toolEnabled: true,
        },
        {
            name: 'Manually Create Donation',
            icon: PlusCircleIcon,
            color: EventColors.Success,
            description: 'Use this tool to record a cash or eTransfer donation. The donor will automatically be emailed a receipt.',
            href: "/app/admin/create",
            toolEnabled: true,
        },
        {
            name: 'Upload Proof of Donation',
            icon: ArrowUpOnSquareIcon,
            color: EventColors.Warning,
            description: 'Use this tool to filter donations by causes, and upload proof of donation easily. Donors are notified.',
            href: "/app/admin/proof",
            toolEnabled: false
        },
        {
            name: 'Generate Report',
            icon: DocumentDuplicateIcon,
            color: EventColors.Error,
            description: `Use this tool to send ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL} custom reports for causes or date ranges.`,
            href: "/app/admin/reports",
            toolEnabled: false
        },
    ]

    return (
        <div>
            <PageHeader>Kinship Canada Admin Panel</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text><span>Any donations you have made will be listed below. If a donation, such as an eTransfer or Cash donation is missing, or if you need any help or have questions, you can contact support at</span></Text>
            <VerticalSpacer size={SpacerSize.Medium} />
                <Grid>
                {tools.map((tool, toolIdx) => {
                    const iconStyling = tool.color == EventColors.Success ? 'text-green-600' : tool.color == EventColors.Info ? 'text-blue-600' : tool.color == EventColors.Warning ? 'text-yellow-600' : tool.color == EventColors.Error ? 'text-red-600' : 'text-gray-500'

                    return (
                        <PanelWithHeaderNoPadding key={toolIdx} header={<div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
                                <span 
                                    className={`h-12 w-12 flex items-center justify-center rounded-lg bg-white object-cover ring-1 ring-gray-900/10 ${iconStyling}`}
                                >
                                    <tool.icon className={ExtraLargeIconSizing} />
                                </span>
                                <BoldText>{tool.name}</BoldText>
                                </div>}>
                            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6 space-y-4">
                                <div>
                                    <VerticalSpacer size={SpacerSize.Medium} />
                                    <Text>
                                        { tool.description }
                                    </Text>
                                </div>
                                <div>
                                    <VerticalSpacer size={SpacerSize.Medium} />
                                    <div className="flex justify-between gap-x-4">
                                        <dt className="text-gray-500">Access</dt>
                                        <dd className="flex items-start gap-x-2">
                                            { tool.toolEnabled ? 
                                                <Badge style={Style.Outlined} text="Granted" color={EventColors.Success} />

                                                :

                                                <Badge style={Style.Outlined} text="Unavailable" color={EventColors.Error} />
                                            }
                                        </dd>
                                    </div>
                                </div>
                                <JustifyEnd>
                                    <div>
                                        <VerticalSpacer size={SpacerSize.Medium} />
                                        { tool.toolEnabled ?

                                            <Button text="Use Tool &rarr;" style={ButtonStyle.Secondary} size={ButtonSize.Small} href={tool.href}/>

                                            :

                                            <Button text="Unavailable" style={ButtonStyle.Disabled} size={ButtonSize.Small} href={"#"}/>
                                        }
                                        <VerticalSpacer size={SpacerSize.Small} />
                                    </div>
                                </JustifyEnd>
                            </dl>
                        </PanelWithHeaderNoPadding>
                    )})}
                </Grid>
        </div>
    )
}

