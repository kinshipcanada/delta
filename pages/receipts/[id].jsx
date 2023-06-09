import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { callKinshipAPI } from "../../system/utils/helpers";
import Head from "next/head";
import Link from "next/link";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { Loading } from "../../components/primitives/Loading";

export default function Receipt() {
    const [loading, setLoading] = useState(true)
    const [receipt, setReceipt] = useState(null)
    const [error, setError] = useState(null)

    const router = useRouter();
    const { id } = router.query;

    async function fetchDonation(donation_id) {
        const response = await callKinshipAPI('/api/donation/fetch', {
            donation_id: donation_id,
        });
        
        if (response.status === 500) {
            setError('Something went wrong. Please try again later')
            setLoading(false)
            return;
        }
    
        if (199 < response.status && response.status < 300) {
            console.log(response.donation)
            setReceipt(response.donation)
            setLoading(false)
            return;
        }
    }

    useEffect(async ()=>{
        if (!id) { return }
        fetchDonation(id)
    }, [id])

    if (loading) {
        return (
            <div className = 'w-screen h-screen flex items-center justify-center'>
                <Loading color={"BLUE"} />
            </div>
        )
    } else {
        if (error) {
            return (
                
                <div className="flex content-center justify-center m-16">
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                            </div>
                            <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error fetching your receipt.</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Something went wrong in fetching the receipt. Please try again in 5 minutes. If the issue persists, contact us at info@kinshipcanada.com</p>
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className = 'w-screen h-screen sm:p-12 p-8'>
                    <Head>
                        <title>{receipt.donor.first_name}&apos;s tax receipt</title>
                    </Head>
                    <div className="md:flex md:items-center md:justify-between flex">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{receipt.donor.first_name}&apos;{receipt.donor.first_name[receipt.donor.first_name.length-1] == "s" ? null : "s"} receipt from {(new Date(Date.parse(receipt.created_at))).toLocaleDateString()}</h2>
                        </div>
                        <div className="sm:mt-4 flex md:mt-0 md:ml-4">
                            {/* <SecondaryButton iconLeft={DocumentIcon} text = "Download PDF" link = "/" /> */}
                        </div>
                    </div>

                    <main className="mt-8 bg-white overflow-hidden border border-gray-400 rounded-lg divide-y divide-gray-300">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h1 className = 'text-xl font-bold leading-7 text-gray-900 sm:text-2xl sm:truncate mb-2'>Official Receipt For Income Tax Purposes</h1>
                            <p className="font-medium text-gray-700 mb-1">Kinship Canada is a registered charity</p>
                            <p className="font-medium text-gray-700">Registration Number 855070728 RR 0001</p>
                            <p className="font-medium text-gray-700">Date Of Donation: {(new Date(Date.parse(receipt.created_at))).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 mb-1">Signed By Vice President</p>
                            <img src = '/signature.png' className = 'w-12' />
                        </div>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                        <p className="font-medium text-gray-800 mb-2">Thank you for donating with Kinship Canada. This is your CRA-Eligible Tax Receipt. You donated a total amount of ${(receipt.amount_in_cents/100).toFixed(2)} CAD.</p>
                        <span className = 'flex mb-1'>
                            <p  className="font-bold text-gray-800  mr-1">{id.substring(0, 3) == "pi_" ? "Payment ID" : id.substring(0,3) == "ch_" ? "Payment ID" : "Kinship Receipt ID"}:</p> 
                            <p className="font-medium text-gray-800">{id}</p>
                        </span>
                        <span className = 'flex mb-1'>
                            <p  className="font-bold text-gray-800 mr-1">Location Issued: </p>
                            <p className="font-medium text-gray-800 mb-1">43 Matson Drive, Bolton, Ontario, L7E0B1, Canada</p>
                        </span>

                        <h2 className="mb-2 mt-3 text-md font-bold leading-7 text-gray-900 sm:text-lg sm:truncate">Donor Details</h2>
                        <span className = 'flex mb-1'>
                            <p  className="font-bold text-gray-800 mr-1">Donor Name:</p>
                            <p className="font-medium text-gray-800 mb-1">{receipt.donor.first_name}{' '}{receipt.donor.last_name}</p>
                        </span>
                        <span className = 'flex mb-1'>
                            <p  className="font-bold text-gray-800 mr-1">Donor Address: </p>
                            <p className="font-medium text-gray-800 mb-1">{receipt.donor.address.line_address}{', '}{receipt.donor.address.city}{', '}{receipt.donor.address.state}{', '}{receipt.donor.address.postal_code}{', '}{receipt.donor.address.country == "ca" ? "Canada": receipt.donor.address.country}</p>
                        </span>

                        <h2 className="mb-2 mt-3 text-md font-bold leading-7 text-gray-900 sm:text-lg sm:truncate">Donation Details</h2>
                        <span className = 'flex mb-1'>
                            <p  className="font-bold text-gray-800 mr-1">Total Amount Donated:</p>
                            <p className="font-medium text-gray-800 mb-1">${(receipt.amount_in_cents/100).toFixed(2)}</p>
                        </span>
                        <span className = 'flex mb-1'>
                            <p  className="font-bold text-gray-800 mr-1">Total Amount Eligible: </p>
                            <p className="font-medium text-gray-800 mb-1">${receipt.donor.address.country.toLowerCase() == "ca" ? (receipt.amount_in_cents/100).toFixed(2) : receipt.donor.address.country.toLowerCase() == "canada" ? (receipt.amount_in_cents/100).toFixed(2) : '0.00'}</p>
                        </span>
                    </div>
                    </main>
                    <div className = 'mt-4 flex w-full text-center justify-center text text-base'>Valid with the Canada Revenue Agency ·{' '} <Link href = 'https://www.canada.ca/en/revenue-agency.html'><a className = 'ml-2 text-blue-600'>https://www.canada.ca/en/revenue-agency.html</a></Link></div>
                </div>
            )
        }
    }
}