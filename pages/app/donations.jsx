import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import { ArrowDownCircleIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { ArrowDownCircleIcon as ArrowDownCircleIconOutline } from "@heroicons/react/24/outline";
import { PrimaryButton, SecondaryButton } from "../../components/core/Buttons";
import { callKinshipAPI } from "../../systems/functions/helpers";
import { BlueLoading } from "../../components/core/Loaders";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)
    const [donations, setDonations] = useState(null)

    async function fetchDonationsForUser(user_email) {

        const response = await callKinshipAPI('/api/donor/donations/fetch', {
            user_email: user_email,
        });
    
        if (response.status === 500) {
            setError('Something went wrong. Please try again later')
            console.log(response)
            return;
        }
    
        if (199 < response.status && response.status < 300) {
            console.log("donations")
            console.log(response.donations)
            setDonations(response.donations)
            return;
        }
    }

    useEffect(async ()=>{
        setLoading(true)

        const loggedInUser = await supabase.auth.getUser() 

        if (loggedInUser) {

            const { data, error } = await supabase
                .from('donor_profiles')
                .select()
                .eq('id', loggedInUser.data.user.id)
            
            if (data) {
                setProfile(data[0])
            } else {
                console.log(error)
            }

            setUser(loggedInUser.data.user)

            await fetchDonationsForUser(loggedInUser.data.user.email)
            setLoading(false)
            return
        } else {
            setLoading(false)
            return
        }

    }, [])

    return (
        <AppLayout>
            {(user && profile) ? 
            
                <div>
                    <PageHeader text={`Welcome, ${profile.first_name}`} description={"You can download any tax receipts you are eligible for."} customSecondaryButton = {<SecondaryButton link = "/support" text = "Download Donation Summary" />} customPrimaryButton={<DownloadAllReceipts />} />
                    <div className="my-6 sm:my-8" />
                    <ul role="list" className="space-y-4">
                        {(donations == null || donations == undefined) ? 
                            
                            <div className="flex justify-center">
                                <div className="flex flex-row items-center">
                                    <BlueLoading show = {true} /> 
                                    <p className="ml-4 text-lg font-medium leading-6 text-gray-900">Loading your donations</p>
                                </div>
                            </div>

                            : donations.length == 0 ?

                            <div className="text-center mt-16">
                                <ShoppingCartIcon className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No donations made</h3>
                                <p className="mt-1 text-sm text-gray-500">You haven&apos;t made any donations with this email yet. If you just made a donation, and it isn&apos;t appearing, please wait 5 minutes and then check back. </p>
                                <p className="mt-1 text-sm text-gray-500">You can also <Link href = "/support"><a href = "#" className="text-blue-600">get support here</a></Link>.</p>
                            </div>

                            : 
                            <div className="space-y-4">
                                {donations.map((donation) => (
                                    <Receipt key={donation.id} donation={donation} />
                                ))}
                            </div>
                        }
                    </ul>
                </div>

                : loading ?

                <BlueLoading show = {true} />

                : null

            }
        </AppLayout>
    )
}

export function DownloadAllReceipts() {
    return (
        <button
            type="button"
            className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
            Download All Receipts
            <ArrowDownCircleIcon className="ml-2 w-5 h-5" />
        </button>
    )
}

function Receipt({ donation }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm border">
            <div className="overflow-hidden bg-white sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{donation.donation_created}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">You donated {(parseFloat(donation.amount_in_cents)/100).toFixed(2)} on {donation.donation_created}</p>
                    </div>
                    <div className="flex items-center">
                        {donation.livemode == false ?
                        
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-0.5 text-sm font-medium text-yellow-800">
                            <svg className="-ml-1 mr-1.5 h-2 w-2 text-yellow-600" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                            </svg>
                            Test Donation
                        </span>
                        
                        : null
                        }
                        <div className="m-2" />
                        {donation.address_country == "ca" ?
                        
                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                            <svg className="-ml-1 mr-1.5 h-2 w-2 text-green-600" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx={4} cy={4} r={3} />
                            </svg>
                            Tax Receipt Eligible
                        </span>
                        
                        : null
                        }
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Receipt Issued To</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">Shakeel-Abbas Hussein</dd>
                    </div>
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Amount Donated</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">${(parseFloat(donation.amount_in_cents)/100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</dd>
                    </div>
                    {donation.proof_available == true ?
                    
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Proof Available</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul role="list" className="divide-y divide-gray-200 rounded-md border border-gray-200">
                            <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                            <div className="flex w-0 flex-1 items-center">
                                <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <span className="ml-2 w-0 flex-1 truncate">house_built_in_africa.pdf</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Download
                                </a>
                            </div>
                            </li>
                            <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                            <div className="flex w-0 flex-1 items-center">
                                <PaperClipIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                                <span className="ml-2 w-0 flex-1 truncate">diploma_india_husse303.pdf</span>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                                Download
                                </a>
                            </div>
                            </li>
                        </ul>
                        </dd>
                    </div>

                    : null
                    }
                    </dl>
                </div>
                </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="w-full flex justify-end">
                    <SecondaryButton link = "/" text = "Download" iconRight={ArrowDownCircleIconOutline}  />
                    <div className="m-1" />
                    <PrimaryButton link = {"/receipts/" + donation.id} text = {<>View Receipt &rarr;</>} />
                </div>
            </div>
        </div>
    )
}