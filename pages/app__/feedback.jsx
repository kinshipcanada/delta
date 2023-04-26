import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import { PrimaryButton } from "../../components/core/Buttons";

export default function Feedback() {

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
                    <PageHeader text={`Give Kinship Feedback`} description="In addition to striving to allocate your donation the best we can, we also want to give you the most seamless experience possible. If we can do anything to improve this experience, we would appreciate if you let us know." />
                    <div className="space-y-6 pt-8 sm:space-y-5 sm:pt-10">
                        <div className="space-y-6 sm:space-y-5">
                            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                    Name
                                </label>
                                <div className="mt-1 sm:col-span-2 sm:mt-0">
                                    <input
                                    id="email"
                                    defaultValue={profile.first_name + " " + profile.last_name}
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                    Email address
                                </label>
                                <div className="mt-1 sm:col-span-2 sm:mt-0">
                                    <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue={profile.email}
                                    autoComplete="email"
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>


                            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
                            <label htmlFor="street-address" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                Feedback
                            </label>
                            <div className="mt-1 sm:col-span-2 sm:mt-0">
                                <textarea
                                    type="text"
                                    rows={5}
                                    name="street-address"
                                    id="street-address"
                                    autoComplete="street-address"
                                    className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            </div>

                            <div className="flex flex-col sm:pt-5">
                                <div className="flex items-center">
                                    <input
                                        id="anonymous"
                                        aria-describedby="keep-anonymous"
                                        name="anonymous"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="anonymous" className="ml-3 font-regular text-sm text-slate-600">
                                        Keep this feedback anonymous
                                    </label>
                                </div>
                                <div className="mt-3 text-sm">
                                    <PrimaryButton text="Submit Feedback" action={()=>{console.log('feedback submitted')}} />
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                : loading ?

                <div>Loading...</div>

                : null

            }
        </AppLayout>
    )
}