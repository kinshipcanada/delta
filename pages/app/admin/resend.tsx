import React, { useEffect, useState } from "react"
import { ButtonSize, ButtonStyle, SpacerSize, Tab, VerticalSpacer, HorizontalSpacer, PageHeader, Text  } from "../../../components/primitives"
import { Donation } from "../../../lib/classes/donation"
import { Donor } from "../../../lib/classes/donor"
import Button from "../../../components/primitives/Button"
import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { DataTable } from "@components/prebuilts/admin/data-table"
import { Button as ShadcnButton } from "@components/ui/button"

const AdminResendPage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {


    return (
        <div>
            <div className='flex w-full justify-start'>
                <Button 
                    text="Go Back" 
                    icon={<ArrowLeftIcon />}
                    style={ButtonStyle.OutlineUnselected}
                    size={ButtonSize.Small} 
                    href={"/app/admin"}
                />
            </div>
            <VerticalSpacer size={SpacerSize.Small} />
            <PageHeader>Resend A Donation Receipt</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>This tool allows you to create a new donation. Click on the corresponding tab for the type of donation you want to create.</Text>
            <VerticalSpacer size={SpacerSize.Medium} />
            <SearchAllDonations />
        </div>
    )
}

export default AdminResendPage

import { ColumnDef } from "@tanstack/react-table"
import { ApiAdminDonationsFetchRequestSchema } from "pages/api/admin/donations/fetch"
import { DonationGroupApiResponse } from "@lib/classes/api"
import { callKinshipAPI, centsToDollars } from "@lib/utils/helpers"
import toast from "react-hot-toast"

const SearchAllDonations: React.FC = () => {

    const fetchAllDonations = async () => {
        return
    }

    const handleResendEmail = (email: string) => {
    // Implement the logic to resend email
        console.log(`Resending email to ${email}`);
    };

    async function getData() {
        const fetchDonationsPayload: ApiAdminDonationsFetchRequestSchema = {
            start_date: undefined,
            end_date: undefined,
            payment_method: undefined,
            page: undefined,
            offset: undefined,
        }
        const response: DonationGroupApiResponse = await callKinshipAPI<Donation[]>('/api/admin/donations/fetch', fetchDonationsPayload)

        if (response.error) {
            toast.error(`Error: ${response.error}`, { position: 'top-right'})
        } else {
            setDonations(response.data!)
        }
    }

    const [donations, setDonations] = useState<Donation[]>([])

    const columns: ColumnDef<Donation>[] = [
        {
          accessorKey: "donor.email",
          header: "Email",
        },
        {
          accessorKey: "amount_in_cents",
          header: "Amount",
          cell: ({ row }) => {
            const amount = parseInt(centsToDollars(row.getValue("amount_in_cents")))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount)
        
            return <div className="font-medium">{formatted}</div>
          },
        },
        {
            "id": "resend",
            cell: ({ row }) => {
                const payment = row.original
           
                return (
                    <div className="content-right">
                        <ShadcnButton variant="outline">
                            Resend
                        </ShadcnButton>
                    </div>
                )
              },
        }
    ]

    useEffect(()=>{
        getData()
    }, [])
    
    return (
        <div>
            <DataTable data={donations} columns={columns} />
        </div>
    )
}