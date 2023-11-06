import React, { useState } from "react"
import { JustifyEnd, TextInput, Button, VerticalSpacer, ButtonSize, ButtonStyle, EventColors, SpacerSize, Tab, PageHeader, SectionHeader, Text, PanelWithLeftText, BaseHeader, AnyText, TextSize, TextWeight, TextLineHeight, Label, SelectionInput, CheckboxInput } from "../../../components/primitives"
import { Donation } from "../../../lib/classes/donation"
import { Donor } from "../../../lib/classes/donor"
import { CalendarDaysIcon } from "@heroicons/react/24/outline"
import { toast } from "react-hot-toast"
import { PlusCircleIcon } from "@heroicons/react/20/solid"
import { callKinshipAPI, dollarsToCents, supabase } from "../../../lib/utils/helpers"
import { InputCustomizations } from "../../../components/primitives/types"
import { SelectOption, causes, countries, states_and_provinces } from "../../../lib/utils/constants"
import { Address } from "@lib/classes/address"
import { v4 as uuidv4 } from 'uuid'
import { Cause } from "@lib/classes/causes"
import { ApiAdminDonationsCreateRequestSchema } from "pages/api/admin/donations/create"
import { NoDataApiResponse } from "@lib/classes/api"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { z } from "zod"
import { ApiAdminProofUploadRequestSchema } from "pages/api/admin/proof/upload"
import { CountryCode } from "@lib/classes/utils"

const AdminProofPage: React.FC<{ donor: Donor, donations: Donation[] }> = ({ donor, donations }) => {

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
            <PageHeader>Upload Proof Of Donation</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>This tool allows you to create a new donation. Click on the corresponding tab for the type of donation you want to create.</Text>
            <VerticalSpacer size={SpacerSize.Medium} />
            <UploadProof />
        </div>
    )
}

export default AdminProofPage

const UploadProof = () => {
    const sadatDonation: Cause = {
        one_way: true,
        label: "Sehme Sadat",
        region: "iq"
    }

    const imamDonation: Cause = {
        one_way: true,
        label: "Sehme Imam",
        region: "iq"
    }

    const sadaqahDonation: Cause = {
        one_way: false,
        label: "Sadaqah",
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { 
        e.preventDefault()
        setLoading(true)
        setError(undefined)

        if (proofToUpload.amount_disbursed < 100) {
            setError("Amount disbursed must be at least $1")
            setLoading(false)
            return
        }

        if (proofToUpload.cause_distributed == "") {
            setError("Select the cause where this donation went")
            setLoading(false)
            return
        }


        const causes: Cause[] = [{
            region: proofToUpload.region_distributed as CountryCode,
            one_way: false,
            label: proofToUpload.cause_distributed
        }]

        if (proofToUpload.matches_imam) { causes.push(imamDonation) }
        if (proofToUpload.matches_sadaqah) { causes.push(sadaqahDonation) }
        if (proofToUpload.matches_sadat) { causes.push(sadatDonation) }

        const proofId = uuidv4()
        
        const formData = new FormData(e.currentTarget);
        const zipFile = formData.get('zipFile') as File;
        
        // upload files to supabase
        const { error: supabaseUploadError } = await supabase.storage
            .from('proof')
            .upload(`proof_content/${proofId}`, zipFile);
        
        if (supabaseUploadError) {
            console.error(supabaseUploadError)
            setError("Sorry, something went wrong uploading the proof documents. Please try again later.")
            setLoading(false)
            return;
        }

        const uploadProofPayload: ApiAdminProofUploadRequestSchema = {
            amount_disbursed: proofToUpload.amount_disbursed,
            message_to_donor: proofToUpload.message_to_donor,
            causes: causes,
            proof_id: proofId,
            // todo replace with countrycode select
            region_distributed: proofToUpload.region_distributed as CountryCode
        }

        const response: NoDataApiResponse = await callKinshipAPI<null>('/api/admin/proof/upload', uploadProofPayload)

        if (response.error) {
            setError(response.error)
            setLoading(false)
            return
        } else {
            toast.success(`Successfully uploaded proof!`, { position: "top-right" })
            setLoading(false)
            return
        }
        
    }

    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState<boolean>(false)
    const [proofToUpload, setProofToUpload] = useState({
        message_to_donor: "",
        amount_disbursed: 0,
        region_distributed: "in",
        cause_distributed: "",
        matches_sadaqah: false,
        matches_sadat: false,
        matches_imam: false
    })

    return (
        <div>
            <form className="flex flex-col space-y-8" onSubmit={handleSubmit}>
                <span className="flex flex-col">
                    <label className="font-semibold mb-1">Amount Disbursed ($CAD) *</label>
                    <input className="p-2 border rounded" placeholder="amount disbursed *" required onChange={(e)=>{
                        setProofToUpload({
                            ...proofToUpload,
                            amount_disbursed: parseInt(dollarsToCents(e.target.value))
                        })
                    }} />
                </span>
                <span className="flex flex-col">
                    <label className="font-semibold mb-1">Message to donors (optional)</label>
                    <input className="p-2 border rounded" onChange={(e)=>{
                        setProofToUpload({
                            ...proofToUpload,
                            message_to_donor: e.target.value
                        })
                    }} placeholder="" />
                </span>
                <span className="flex flex-col">
                    <label className="font-semibold mb-1 rounded">Which cause did this go to *</label>
                    <select value={proofToUpload.cause_distributed} onChange={(e)=>
                            setProofToUpload({
                                ...proofToUpload,
                                cause_distributed: e.target.value
                            })
                        }>
                            <option value={""}>Select a cause</option>
                            {[
                                "Housing",
                                "Orphans"
                            ].map((cause)=>(
                                <option value={cause}>{cause}</option>
                            ))}
                    </select>
                </span>
                <span className="flex flex-col">
                    <label className="font-semibold mb-1 rounded">Region where this donation was distributed</label>
                    <select value={proofToUpload.region_distributed} onChange={(e)=>
                            setProofToUpload({
                                ...proofToUpload,
                                region_distributed: e.target.value
                            })
                        }>
                        <option value={"in"}>India</option>
                        <option value={"iq"}>Iraq</option>
                        <option value={"ca"}>Canada</option>
                        <option value={"tz"}>Tanzania</option>
                    </select>
                </span>
                <span className="flex flex-col">
                    <label className="font-semibold mb-1 rounded">Proof Documents</label>
                    <label className="text-sm text-slate-600 mb-2">This should be a .zip file of images and other documents relating to this proof. Please do not upload a cover letter or any information identifying a donor or recipient personal information</label>
                    <input type="file" id="zipFile" name="zipFile" required accept=".zip" />
                </span>
                <div className="flex flex-col space-y-4">
                    <span className="flex items-center">
                        <input id="sadaqah" type="checkbox" onChange={(e)=>
                            setProofToUpload({
                                ...proofToUpload,
                                matches_sadaqah: e.target.checked
                            })
                        } />
                        <label htmlFor="sadaqah" className="ml-2">Does this distribution apply to Sadaqah donations</label>
                    </span>
                    <span>
                        <input id="sadat" type="checkbox" onChange={(e)=>
                            setProofToUpload({
                                ...proofToUpload,
                                matches_sadat: e.target.checked
                            })
                        } />
                        <label htmlFor="sadat" className="ml-2">Does this distribution qualify as Sehme Sadat</label>
                    </span>
                    <span>
                        <input id="imam" type="checkbox" onChange={(e)=>
                            setProofToUpload({
                                ...proofToUpload,
                                matches_imam: e.target.checked
                            })
                        } />
                        <label htmlFor="imam" className="ml-2">Does this distribution qualify as Sehme Imam</label>
                    </span>
                </div>
                <button disabled={loading} type="submit" className="p-2 bg-blue-600 rounded text-white font-semibold">{ loading ? "Uploading, please don't close this page" : "Upload Proof" }</button>
                { error && <span className="p-2 bg-red-200 text-red-600">{error}</span> }
            </form>
        </div>
    )
}