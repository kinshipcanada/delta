import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import { ArrowDownCircleIcon, PaperClipIcon } from "@heroicons/react/24/solid";
import { PrimaryButton, SecondaryButton } from "../../components/core/Buttons";
import { fetchPostJSON } from "../../systems/helpers/apiHelpers";
import { BlueLoading } from "../../components/core/Loaders";

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)
    const [donations, setDonations] = useState(null)

    async function fetchDonationsForUser(user_email) {

        const response = await fetchPostJSON('/api/backend/donation/fetch/all_donations', {
            user_email: "hobbleabbas@gmail.com",
        });
    
        if (response.status === 500) {
            setError('Something went wrong. Please try again later')
            return;
        }
    
        if (response.status == 200) {
            console.log(donations)
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

    const stats = [
        { name: 'Total Donated', stat: '$71,897' },
        { name: 'Number Of Donations', stat: '5' },
        { name: 'Total Tax Deduction', stat: '$48,556' },
    ]

    return (
        <AppLayout>
            {(user && profile) ? 
            
                <div>
                    <PageHeader text={`Welcome, ${profile.first_name}`} customPrimaryButton={<PrimaryButton text="Support" link="/support" />} />
                    <div className="my-4 sm:my-6" />
                    <ul role="list" className="space-y-4">
                    
                    {(donations == null || donations == undefined) ? 
                            
                        <div className="flex justify-center">
                            <div className="flex flex-row items-center">
                                <BlueLoading show = {true} /> 
                                <p className="ml-4 text-lg font-medium leading-6 text-gray-900">Loading your donations</p>
                            </div>
                        </div>

                        : donations.length == 0 ?

                        <p className="text-center">You have no donations to download.</p>

                        : 
                        <div>
                            <div>
                                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    {stats.map((item) => (
                                    <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border sm:p-6">
                                        <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
                                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
                                    </div>
                                    ))}
                                </dl>
                            </div>

                            <div className="my-4" />

                            <div className="bg-gray-50 sm:rounded-lg border">
                                <div className="px-4 py-5 sm:p-6">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Your 2022 CRA tax package is available.</h3>
                                    <div className="mt-2  text-sm text-gray-500">
                                    <p>For your convenience, a tax package has been prepared for you with a spreadsheet containing your donations, as well as all of your tax receipts. This package is available to download right now, or can be emailed to you if you prefer.</p>
                                    </div>
                                    <div className="mt-5 flex w-full justify-end items-center">
                                        <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-800">
                                            Email It To Me
                                        </a>
                                        <div className="ml-4" />
                                        <SecondaryButton link = "/email" text = "Download Package" iconRight = {ArrowDownCircleIcon} />
                                    </div>
                                </div>
                            </div>
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
            <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                    <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{donation.donation_created}</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">You donated {(parseFloat(donation.amount_in_cents)/100).toFixed(2)} on {donation.donation_created} using Visa ending in 4242</p>
                    </div>
                    <div>
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
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">${(parseFloat(donation.amount_in_cents)/100).toFixed(2)}</dd>
                    </div>
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
                    </dl>
                </div>
                </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="w-full flex justify-end">
                    <SecondaryButton link = "/" text = "Download"  />
                    <div className="m-1" />
                    <PrimaryButton link = {"https://receipts.kinshipcanada.com/" + donation.id} text = {<>View Receipt &rarr;</>} />
                </div>
            </div>
        </div>
    )
}