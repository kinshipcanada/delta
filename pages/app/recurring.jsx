import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

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
                    <PageHeader text={`Your Recurring Donations`} primaryLinkText="Support" primaryLinkHref={"/support"} />
                    <div className="text-center">
                        <ArrowPathIcon className="mx-auto h-8 w-8 text-gray-400" aria-hidden="true" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No recurring donations</h3>
                        <p className="mt-1 text-sm text-gray-500">You currently don&apos;t have any recurring donations available.</p>
                    </div>
                </div>

                : loading ?

                <div>Loading...</div>

                : null

            }
        </AppLayout>
    )
}