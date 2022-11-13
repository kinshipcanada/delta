import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import { ArrowDownCircleIcon } from "@heroicons/react/24/solid";
import { PrimaryButton, SecondaryButton } from "../../components/core/Buttons";

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

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
                    <ul role="list" className="space-y-3">
                        <Receipt />
                    </ul>
                </div>

                : loading ?

                <div>Loading...</div>

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

function Receipt({ }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
            
                Receipt Content
            
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="w-full flex justify-end">
                    <SecondaryButton link = "/" text = "Download"  />
                    <div className="m-1" />
                    <PrimaryButton link = "/" text = {<>View Receipt &rarr;</>} />
                </div>
            </div>
        </div>
    )
}