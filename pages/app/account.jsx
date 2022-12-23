import AppLayout from "../../components/core/AppLayout";
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import TextInput from "../../components/core/TextInput";
import { SecondaryButton } from "../../components/core/Buttons";
import { callKinshipAPI } from "../../systems/functions/helpers";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Variables to account for changes
    const [newFirstName, setNewFirstName] = useState(null)
    const [newLastName, setNewLastName] = useState(null)
    const [newEmail, setNewEmail] = useState(null)

    const [donorProfile, setDonorProfile] = useState(null)
    
    async function fetchDonorProfile(user_id) {

        const response = await callKinshipAPI('/api/donor/profile/fetch', {
            user_id: user_id,
        });
        
        if (response.status === 500) {
            setDonorProfile(null)
            return;
        }
    
        if (response.status == 200) {
            setDonorProfile(response.donor)
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
            await fetchDonorProfile(loggedInUser.data.user.id)
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
                            <p className="mt-1 text-sm text-gray-500">This are your personal details, including the email we send donations to.</p>
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
                                        <span className=" inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
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

                        <div className="space-y-6">
                            <div className="bg-white border border-gray-200 px-4 py-5 sm:rounded-lg sm:p-6">
                            <div className="md:grid md:grid-cols-3 md:gap-6">
                                <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Billing Address</h3>
                                <p className="mt-1 text-sm text-gray-500">Use a permanent address where you can receive mail.</p>
                                </div>
                                <div className="mt-5 md:mt-0 md:col-span-2">
                                <form action="#" method="POST">
                                    <div className="grid grid-cols-6 gap-6">

                                        <div className="col-span-full">
                                            <div className = 'w-full flex justify-between'>
                                                <label htmlFor="email-address" className="block text-sm font-medium text-gray-700">
                                                    <p>Line Address</p>
                                                </label>
                                            </div>
                                            <TextInput type="text" defaultValue={profile ? profile.address_line_address : null} required={false} setter={setNewEmail}  />
                                        </div>
                                        
                                        <div className="col-span-6 sm:col-span-3">
                                            <TextInput type="text" label="City" defaultValue={profile ? profile.address_city : null} required={false} setter={setNewFirstName}  />
                                        </div>
                        
                                        <div className="col-span-6 sm:col-span-3">
                                            <TextInput type="text" label="Postal Code" defaultValue={profile ? profile.address_postal_code : null} required={false} setter={setNewLastName}  />
                                        </div>

                                        <div className="col-span-6 sm:col-span-3">
                                            <TextInput type="text" label="Province/State" defaultValue={profile ? profile.address_state : null} required={false} setter={setNewFirstName}  />
                                        </div>
                        
                                        <div className="col-span-6 sm:col-span-3">
                                            <TextInput type="text" label="Country" defaultValue={profile ? profile.address_country.name : null} required={false} setter={setNewLastName}  />
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

                    {donorProfile ? <PaymentMethods donorProfile={donorProfile} /> : null}
                    
					</div>
                </div>

                : loading ?

                <div>Loading...</div>

                : null

            }
        </AppLayout>
    )
}


export function PaymentMethods({ donorProfile }) {
    return (
      <div className="bg-white border sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="w-full flex justify-between items-center">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Payment methods</h3>
            <SecondaryButton text="Add payment method" link="#" iconRight={PlusCircleIcon} />
          </div>
          <div className="mt-5 space-y-3">
            {donorProfile.payment_methods.length > 0 ?
            
            donorProfile.payment_methods.map((paymentMethod) => (
                <div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
                    <h4 className="sr-only">Visa</h4>
                    <div className="sm:flex sm:items-start">
                        <svg className="h-8 w-auto sm:h-6 sm:flex-shrink-0" viewBox="0 0 36 24" aria-hidden="true">
                        <rect width={36} height={24} fill="#224DBA" rx={4} />
                        <path
                            fill="#fff"
                            d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                        />
                        </svg>
                        <div className="mt-3 sm:mt-0 sm:ml-4">
                        <div className="text-sm font-medium text-gray-900">Ending with {paymentMethod.card_last_four}</div>
                        <div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
                            <div>Expires {paymentMethod.card_exp_month}/{paymentMethod.card_exp_year}</div>
                            <span className="hidden sm:mx-2 sm:inline" aria-hidden="true">
                            &middot;
                            </span>
                            <div className="mt-1 sm:mt-0">Added {new Date(paymentMethod.created_at).toDateString()}</div>
                        </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                        <SecondaryButton link = "#" text = "Remove" iconRight={TrashIcon} />
                    </div>
                </div>
            )) :

            <div>no payment methods</div>
            }
          </div>
        </div>
      </div>
    )
  }
  