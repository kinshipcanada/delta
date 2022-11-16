import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import { ArrowDownCircleIcon, PaperClipIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { PrimaryButton, SecondaryButton } from "../../components/core/Buttons";
import { fetchPostJSON } from "../../systems/helpers/apiHelpers";
import { BlueLoading } from "../../components/core/Loaders";
import ReactTooltip from "react-tooltip";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/24/outline'

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState(null)
    const [donations, setDonations] = useState(null)

    const [statTotalDonated, setStatTotalDonated] = useState(0)
    const [statTotalDonations, setStatTotalDonations] = useState(0)
    const [statTotalDeductible, setStatTotalDeductible] = useState(0)

    async function fetchDonationsForUser(user_email) {

        const response = await fetchPostJSON('/api/donor/donations/fetch', {
            user_email: user_email,
        });
    
        if (response.status === 500) {
            setError('Something went wrong. Please try again later')
            return;
        }
    
        if (response.status == 200) {
            console.log(donations)
            setDonations(response.donations)

            let totalDonated = 0
            let totalDeductible = 0

            for (let i = 0; i < response.donations.length; i++) {
                totalDonated += (parseFloat(response.donations[i].amount_in_cents))
            }

            if (totalDonated < 20000) {
                totalDeductible += (parseFloat(totalDonated)*0.2005)
            } else {
                totalDeductible += (parseFloat(20000)*0.2005) + ((totalDonated - 20000)*0.4016)
            }
            
            setStatTotalDonated((totalDonated/100).toFixed(2))
            setStatTotalDonations(response.donations.length)
            setStatTotalDeductible((totalDeductible/100).toFixed(2))


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
        { name: 'Total Donated', stat: `$${statTotalDonated}`, warning: false },
        { name: 'Number Of Donations', stat: statTotalDonations, warning: false },
        { name: 'Total Tax Deduction', stat: `$${statTotalDeductible}`, warning: true },
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

                        : 
                        <div>
                            <div>
                                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    {stats.map((item) => (
                                    <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow-sm border sm:p-6">
                                        <dt className="truncate text-sm font-medium text-gray-500 flex items-center">{item.name}
                                            {item.warning ? <p data-tip="This is an estimate, the final calculation also considers your income."><QuestionMarkCircleIcon className="ml-2 w-4 h-4" /></p> : null}
                                        </dt>
                                        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
                                    </div>
                                    ))}
                                </dl>
                                <div className="my-4 sm:my-6" />
                                <CRAPackage user_email={user.email} />
                                <ReactTooltip />
                            </div>

                            <div className="my-4" />

                            
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

export function CRAPackage(user_email) {

    const [downloadLoading, setDownloadLoading] = useState(false);
    const [craPackage, setCraPackage] = useState(null);
    const [open, setOpen] = useState(false)
    const [error, setError] = useState(null);

    async function downloadPackage() {
        setDownloadLoading(true)

        const response = await fetchPostJSON('/api/donor/donations/report', {
            user_email: user_email,
            send_as_email: true
        });
    
        if (response.status === 500) {
            setError('Something went wrong. Please try again later')
            setDownloadLoading(false)
            return;
        }
    
        if (response.status == 200) {
            setCraPackage(response.summary)
            setDownloadLoading(false)
            setOpen(true)
            return;
        }
    }

    return (
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
                    <SecondaryButton link = "/" text = "View Package" iconRight = {ArrowRightCircleIcon} action = {downloadPackage} loading={downloadLoading} />
                </div>
            </div>
            { craPackage && <CraPackageModal open = {open} setOpen = {setOpen} craPackage = {craPackage} /> }
        </div>
    )
}

export function CraPackageModal({open, setOpen, craPackage}) {
    return (
        <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
            <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-7xl sm:p-6">
                    <div className="text-base text-slate-600 p-3">
                        <p className = "text-xl font-semibold text-gray-900">Your Donations in 2022</p>
                        <div className = "mt-4" />
                        <p>In 2022, you donated a total of ${parseFloat(craPackage.total_donated/100).toFixed(2)} across {craPackage.donations.length} donations. Since you live in Ontario, this qualifies you for (an estimated) ${(parseFloat(craPackage.total_eligible_estimate)/100).toFixed(2)} in tax deductions and savings - this isn&apos;t an exact number, and you should consult with your accountant to confirm.</p>
                        <div className="my-1" />
                        <p>A summary of your donations can be seen below. If you have any questions, don&apos;t hesitate to reach out at <a href="mailto:info@kinshipcanada.com" className="focus:outline-none text-blue-600 hover:text-blue-800">info@kinshipcanada.com</a></p>
                        <div className="my-4" />
                        <p className="text-md font-semibold text-slate-900">Summary</p>
                        <ul>
                            <li className = "mt-2"><span className="text-base font-medium text-slate-900">Total Donated:</span> ${parseFloat(craPackage.total_donated/100).toFixed(2)}</li>
                            <li className = "mt-2"><span className="text-base font-medium text-slate-900">Total Eligible:</span> ${(parseFloat(craPackage.total_eligible_estimate)/100).toFixed(2)}</li>
                            <li className = "mt-2"><span className="text-base font-medium text-slate-900">Donations:</span> {craPackage.donations.length}</li>
                        </ul>
                        <div className="mt-8 flex flex-col">
                            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                                <div className="overflow-hidden border ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Date
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Amount
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Eligible (estimate)
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Email
                                        </th>
                                        
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                    {craPackage.donations.map((donation) => (
                                        <tr key={donation.donation_created}>
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                            {donation.donation_created}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${(parseFloat(donation.amount_in_cents)/100).toFixed(2)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${(parseFloat(donation.amount_in_cents)/100).toFixed(2) < 200.00 ? ((parseFloat(donation.amount_in_cents)/100)*0.2005).toFixed(2) : ((200*0.2005) + ((parseFloat(donation.amount_in_cents) - 20000)*0.4016)/100).toFixed(2)}</td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{donation.email}</td>
                                        
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            </div>
                            </div>
                        </div>
                        <div className="w-full flex justify-end mt-6">
                            <SecondaryButton action={() => setOpen(false)} text="Close Summary" />
                        </div>
                    </div>
                </Dialog.Panel>
                </Transition.Child>
            </div>
            </div>
        </Dialog>
        </Transition.Root>
    )
}