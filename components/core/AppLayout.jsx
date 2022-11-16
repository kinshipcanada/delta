import { HomeIcon, DocumentDuplicateIcon, UserCircleIcon, PaperAirplaneIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon, ArrowRightCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useEffect } from 'react'
import { supabase } from '../../systems/helpers/supabaseClient'
import { fetchPostJSON } from '../../systems/helpers/apiHelpers'
import { BlueLoading } from './Loaders'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AppLayout({ children }) {

  const router = useRouter()
  const path = router.asPath 

  const [user, setUser] = useState(null)
  const [userConfigured, setUserConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginRequired, setLoginRequired] = useState(false)

  const navigation = [
    { name: 'Dashboard Home', link: '/app', icon: HomeIcon, current: (path == "/app") },
    { name: 'Your Donations', link: '/app/donations', icon: DocumentDuplicateIcon, current: (path == "/app/donations") },
    { name: 'Recurring Donations', link: '/app/recurring', icon: ArrowPathIcon, current: (path == "/app/recurring") },
    { name: 'Account & Billing', link: '/app/account', icon: UserCircleIcon, current: (path == "/app/account") },
  ]

  useEffect(async ()=>{
    setLoading(true)

    const loggedInUser = await supabase.auth.getUser() 

    if (loggedInUser) {
      setUser(loggedInUser.data.user)

      // Check if user is in the database
      const userConfigured = await checkIfUserConfigured(loggedInUser.data.user.id)

      if (!userConfigured) {
        setUserConfigured(false)
        setLoading(false)
        return
      } else {
        setUserConfigured(true)
        setLoading(false)
        return;
      }
    } else {
      setLoginRequired(true)
      setLoading(false)
      return;
    }

  }, [])

  const checkIfUserConfigured = async (userId) => {
    const { data, error } = await supabase
      .from('donor_profiles')
      .select()
      .eq('id', userId)
      .single()

    if (error) {
      console.log(error)
      return
    }

    if (data) {
      return true
    } else {
      return false
    }
  }

  return (
    <div className='p-10 grid grid-cols-4 gap-12'>
      <nav className="space-y-1 col-span-1" aria-label="Sidebar">
        {navigation.map((item) => (
          <AppLink
            key={item.name}
            name={item.name}
            link={item.link}
            current={item.current}
            icon={item.icon}
          />
        ))}
        <a
          onClick={() => {
            supabase.auth.signOut()
            router.push('/')
          }}
          className="cursor-pointer text-gray-600 hover:bg-slate-50 hover:text-gray-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
        >
          <ArrowLeftOnRectangleIcon
            className='text-gray-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-6 w-6'
            aria-hidden="true"
          />
          <span className="truncate">Logout</span>
        </a>
      </nav>
      {
        loading ?

        <div className='col-span-3'>
          <div className='w-full h-full flex justify-center items-center'>
            <BlueLoading show = {true} />
          </div>
        </div>

        : loginRequired ?

        <div>Login Required</div>

        : userConfigured ?
  
        
          <div className='col-span-3'>
            { children }
          </div>

        :

        <div className='col-span-3'>
          <UserSetup setUserConfigured={setUserConfigured} />
        </div>
      }
      
    </div>
  )
}

export function AppLink(props) {
  return (
    <Link
      key={props.name}
      href={props.link}
    >
      <a
        href={props.link}
        className={classNames(
          props.current ? 'border border-slate-200 bg-slate-50 text-slate-900' : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900',
          'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
        )}
      >
        <props.icon
          className={classNames(
            props.current ? 'text-slate-800' : 'text-gray-400 group-hover:text-slate-500',
            'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
          )}
          aria-hidden="true"
        />
        <span className="truncate">{ props.name }</span>
      </a>
    </Link>
  )
}

export function UserSetup({ setUserConfigured }) {

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('ca')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const user = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to complete this action.')
      setLoading(false)
      return
    }

    if (!firstName || !lastName || !address || !city || !state || !postalCode) {
      setError('Please fill out all fields.')
      setLoading(false)
      return
    }

    // Create stripe customer
    const name = firstName + ' ' + lastName

    const user_stripe_profile = {
      first_name: firstName,
      last_name: lastName,
      name: name,
      email: user.data.user.email,
      user_id: user.data.user.id,
      address: {
        city: city,
        country: country,
        line1: address,
        postal_code: postalCode,
        state: state,
      }
    }

    const response = await fetchPostJSON('/api/frontend/setup', {
      user: user_stripe_profile,
    });
  
    if (response.statusCode === 500) {
      setError(error.message);
      setLoading(false)
      return;
    } else {

      const { data, error } = await supabase
        .from('donor_profiles')
        .insert(
          {
            id: user.data.user.id,
            first_name: firstName,
            last_name: lastName,
            stripe_customer_ids: [response.message.id],
            email: user.data.user.email,
            address_line_address: address,
            address_city: city,
            address_state: state,
            address_postal_code: postalCode,
            address_country: country,
            admin: false,
            partner: false
          }
        )
      
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      } else {
        setLoading(false)
        setUserConfigured(true)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-200 overflow-hidden border rounded-lg bg-white shadow-sm">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Let&apos;s get your Kinship account set up
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          A couple more details are needed to issue your tax receipts.
        </p>
        
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className='grid grid-cols-2 gap-6'>
          <Input
            label={"First Name"}
            type={"text"}
            placeholder={"First Name"}
            setValue={setFirstName}
            required={true}
          />

          <Input
            label={"Last Name"}
            type={"text"}
            placeholder={"Last Name"}
            setValue={setLastName}
            required={true}
          />
        </div>

        <div className='m-4' />

        <Input
          label={"Address"}
          type={"text"}
          placeholder={"Line Address"}
          setValue={setAddress}
          required={true}
        />

        <div className='m-4' />

        <div className='grid grid-cols-2 gap-6'>
          <Input
            label={"City"}
            type={"text"}
            placeholder={"City"}
            setValue={setCity}
            required={true}
          />

          <Input
            label={"State of Province"}
            type={"text"}
            placeholder={"State of Province"}
            setValue={setState}
            required={true}
          />
        </div>

        <div className='m-4' />

        <div className='grid grid-cols-2 gap-6'>
          <Input
            label={"Postal Code"}
            type={"text"}
            placeholder={"Postal Code"}
            setValue={setPostalCode}
            required={true}
          />

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select
              id="country"
              name="country"
              className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              defaultValue="Canada"
              onChange={(e) => {setCountry(e.target.value)}}
            >
              <option value = "ca">Canada</option>
              <option value = "us">United States</option>
              <option value = "other">Other</option>
            </select>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
          <button
            disabled = { loading }
            type="submit"
            className="flex justify-center transition delay-50 border border-blue-600 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
              Activate Account
              <ArrowRightCircleIcon className = "h-4 w-4 ml-2" />
          </button>
        { error ? <div className='mt-2 font-semibold text-red-600 text-sm'>{error}</div> : null }
      </div>
      
    </form>
  )
}

export function Input({ label, type, name, placeholder, setValue, required }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 flex">
        {label} { required ? <div className='ml-1 text-red-600'>*</div> : null}
      </label>
      <div className="mt-2">
        <input
          type={type}
          name={name}
          id={name}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder={placeholder}
          onChange={(e)=>{setValue(e.target.value)}}
        />
      </div>

    </div>
  )
}