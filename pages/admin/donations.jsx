import { Fragment } from 'react'
import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import AdminLayout from "../../components/core/AdminLayout";
import TextInput from '../../components/core/TextInput';

const locations = [
  {
    name: 'Credit Card',
    people: [
        { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
        { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
    ],
  },
  {
    name: 'e-Transfer',
    people: [
      { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
      { name: 'Courtney Henry', title: 'Designer', email: 'courtney.henry@example.com', role: 'Admin' },
    ],
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function DonationList() {

  const [loading, setLoading] = useState(false)

  return (
    <div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full">
                <thead className="bg-white">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {locations.map((location) => (
                    <Fragment key={location.name}>
                      <tr className="border-t border-gray-200">
                        <th
                          colSpan={5}
                          scope="colgroup"
                          className="bg-gray-50 px-4 py-2 text-left text-sm font-semibold text-gray-900 sm:px-6"
                        >
                          {location.name}
                        </th>
                      </tr>
                      {location.people.map((person, personIdx) => (
                        <tr
                          key={person.email}
                          className={classNames(personIdx === 0 ? 'border-gray-300' : 'border-gray-200', 'border-t')}
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {person.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.title}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{person.role}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <a href="#" className="text-blue-600 hover:text-blue-900">
                              Edit<span className="sr-only">, {person.name}</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



export default function Donations() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    const [donationId, setDonationId] = useState('')
    const [dateStart, setDateStart] = useState('')
    const [dateEnd, setDateEnd] = useState('')
    const [donorId, setDonorId] = useState('')
    const [donorEmail, setDonorEmail] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [amountMinInCents, setAmountMinInCents] = useState('')
    const [amountMaxInCents, setAmountMaxInCents] = useState('')
    const [feesCovered, setFeesCovered] = useState(0)
    const [stripePaymentIntentId, setStripePaymentIntentId] = useState('')
    const [stripeChargeId, setStripeChargeId] = useState('')
    const [stripeBalanceTransactionId, setStripeBalanceTransactionId] = useState('')
    const [addressCountry, setAddressCountry] = useState('')
    const [addressLineAddress, setAddressLineAddress] = useState('')
    const [addressState, setAddressState] = useState('')
    const [addressCity, setAddressCity] = useState('')
    const [addressPostalCode, setAddressPostalCode] = useState('')

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

    async function lookupDonation(e) {
      e.preventDefault()

      return []
    }

    return (
        <AdminLayout>
            {(user && profile) ? 
            
                <div>
                  <PageHeader text={`Donation Lookup`} description={"View and manage donations, resend receipts, and more."}  />
                  <div className='mt-3' />
                  <form className=''>
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Filter With Donor Details</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <TextInput
                        label={"Donation ID (Stripe or Kinship)"}
                        type={'text'}
                        setter={setDonationId}
                        placeholder={"pi_2786pdha62ns7"}
                      />
                      {/** Date pickers for start/end */}
                      <TextInput
                        label={"Donor ID (Stripe or Kinship)"}
                        type={'text'}
                        setter={setDonorId}
                        placeholder={"cus_8ahsdjc"}
                      />
                      <TextInput
                        label={"Donor Email"}
                        type={'email'}
                        setter={setDonorEmail}
                        placeholder={"hobbleabbas@gmail.com"}
                      />
                      <TextInput
                        label={"Donor First Name"}
                        type={'text'}
                        setter={setFirstName}
                        placeholder={"Shakeel-Abbas"}
                      />
                      <TextInput
                        label={"Donor Last Name"}
                        type={'text'}
                        setter={setLastName}
                        placeholder={"Hussein"}
                      />
                      <TextInput
                        label={"Donor Address"}
                        type={'text'}
                        setter={setAddressLineAddress}
                        placeholder={"2145 N Sheridan Way"}
                      />
                      <TextInput
                        label={"Billing State"}
                        type={'text'}
                        setter={setAddressState}
                        placeholder={"ON"}
                      />
                      <TextInput
                        label={"Billing Postal Code"}
                        type={'text'}
                        setter={setAddressPostalCode}
                        placeholder={"L5W1C8"}
                      />
                      <TextInput
                        label={"Billing City"}
                        type={'text'}
                        setter={setAddressCity}
                        placeholder={"Mississauga"}
                      />
                      <TextInput
                        label={"Billing Country"}
                        type={'text'}
                        setter={setAddressCountry}
                        placeholder={"Canada"}
                      />
                    </div>
                    
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Filter With Donation Details</h3>
                    <TextInput
                      label={"Minimum Amount in CAD"}
                      type={'number'}
                      setter={setAmountMinInCents}
                      defaultValue={0}
                    />
                    <TextInput
                      label={"Maximum Amount in CAD"}
                      type={'number'}
                      setter={setAmountMaxInCents}
                      defaultValue={100.00}
                    />
                    {/** Fee covered select menu */}

                  </form>
                </div>

                : loading ?

                <div>Loading...</div>

                : null

            }
        </AdminLayout>
    )
}
