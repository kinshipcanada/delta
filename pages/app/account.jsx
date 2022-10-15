import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import TextInput from "../../components/core/TextInput";
import SectionHeader from "../../components/app/SectionHeader";

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Variables to account for changes
    const [newFirstName, setNewFirstName] = useState(null)
    const [newLastName, setNewLastName] = useState(null)
    const [newEmail, setNewEmail] = useState(null)

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

    const updateProfile = async () => {
        const { data, error } = await supabase
            .from('donor_profiles')
            .update({ first_name: newFirstName, last_name: newLastName, email: newEmail })
            .eq('id', user.id)

        if (data) {
            setProfile(data[0])
        } else {
            console.log(error)
        }
    }

    return (
        <AppLayout>
            {(user && profile) ? 
                <div>
                    <PageHeader text={"Your Kinship Account"} primaryLinkText="Support" primaryLinkHref={"/support"} />
                    <div className="my-8" />
                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 px-4 py-5 sm:rounded-lg sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                            <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can receive mail.</p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                            <form action="#" method="POST">
                                <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-3">
                                    <TextInput type="text" label="First Name" defaultValue={profile ? profile.first_name : null} required={false} setter={setNewFirstName}  />
                                </div>
                
                                <div className="col-span-6 sm:col-span-3">
                                    <TextInput type="text" label="First Name" defaultValue={profile ? profile.last_name : null} required={false} setter={setNewLastName}  />
                                </div>
                
                                <div className="col-span-full">
                                    <div className = 'w-full flex justify-between'>
                                        <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                            <p>Email address</p>
                                            
                                        </label>
                                        <span className="border border-yellow-800 inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                            Warning: this changes your account email
                                        </span>
                                    </div>
                                    <TextInput type="text" defaultValue={profile ? profile.email : null} required={false} setter={setNewEmail}  />
                                </div>
                
                                </div>

                                {((newFirstName != null && newFirstName != profile.first_name) || (newLastName != null && newLastName != profile.last_name) || (newEmail != null && newEmail != profile.email)) ?
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setNewFirstName(null)
                                                setNewLastName(null)
                                                setNewEmail(null)
                                            }}
                                            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Cancel Changes
                                        </button>
                                        <button
                                            type="submit"
                                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Save
                                        </button>
                                    </div>

                                : null
                                
                                }
                            </form>
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

