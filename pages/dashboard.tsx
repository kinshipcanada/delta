import { useAuth } from "@components/prebuilts/Authentication"
import { callKinshipAPI, supabase } from "@lib/utils/helpers"
import { Donation } from "@prisma/client"
import { useEffect, useState } from "react"
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import toast from "react-hot-toast"
import { UserIcon, Files, LogOut } from "lucide-react"
import { PrismaDonationPanel } from "@components/prebuilts/app/DonationPanel"
import { useRouter } from "next/router"

export default function Dashboard() {

    const { donor, authReloadStatus, triggerAuthReload } = useAuth()
    const [donations, setDonations] = useState<Donation[]>([])
    const [loadingDonations, setLoadingDonations] = useState(true)

    const fetchDonations = async () => {
        if (!donor) { return }

        const donations = await callKinshipAPI<Donation[]>("/api/v2/donor/fetch_donations", {
            donorEmail: donor.donorEmail,
        })

        if (!donations.data) {
            toast.error("Something went wrong loading your dashboard", { position: "top-right" })
            setLoadingDonations(false)
            return
        }

        setDonations(donations.data)
        setLoadingDonations(false)
        return
    }

    useEffect(()=>{
        fetchDonations()
    }, [donor])

    const router = useRouter()


    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        triggerAuthReload(!authReloadStatus)
        router.push('/')
    }

    return (
        <div >
            {loadingDonations && <p>Loading...</p>}
            {!loadingDonations && (
                <main className="flex flex-col p-4">
                    <Tab.Group>
                        <Tab.List>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={
                                            selected ? 'outline-none p-1.5 bg-gray-100 text-blue-600 font-semibold text-sm rounded-lg' : 'p-1.5 text-black font-semibold text-sm'
                                        }
                                    >
                                        <span className="flex items-center">
                                            <Files className="w-4 h-4 mr-2" />
                                            My Donations
                                        </span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                            {({ selected }) => (
                                    <button
                                        className={
                                            selected ? 'outline-none p-1.5 bg-gray-100 text-blue-600 font-semibold text-sm rounded-lg' : 'p-1.5 text-slate-600 font-semibold text-sm'
                                        }
                                    >
                                        <span className="flex items-center">
                                            <UserIcon className="w-4 h-4 mr-2" />
                                            Account And Billing
                                        </span>
                                    </button>
                                )}
                            </Tab>
                            <button
                                onClick={()=>{signOut()}}
                                className='p-1.5 text-slate-600 font-semibold text-sm'
                            >
                                <span className="flex items-center">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Log Out
                                </span>
                            </button>
                        </Tab.List>
                        <Tab.Panels className={"my-4"}>
                            <Tab.Panel className={"space-y-4"}>
                                {donations.map((donation)=>(
                                    <PrismaDonationPanel donation={donation} />
                                ))}
                            </Tab.Panel>
                            <Tab.Panel>
                                Coming Soon...
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </main>
            )}
        </div>
    )
}

