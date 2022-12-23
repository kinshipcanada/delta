import { HomeIcon, DocumentDuplicateIcon, ArrowLeftOnRectangleIcon, PlusCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../systems/helpers/supabaseClient'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminLayout({ children }) {

  const router = useRouter()
  const path = router.asPath 

  const [user, setUser] = useState(null)
  const [userConfigured, setUserConfigured] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginRequired, setLoginRequired] = useState(false)

  const navigation = [
    { name: 'Admin Panel Home', link: '/admin', icon: HomeIcon, current: (path == "/admin") },
    { name: 'View Donations', link: '/admin/donations', icon: MagnifyingGlassIcon, current: (path == "/admin/donations") },
    { name: 'Generate Report', link: '/app/proof', icon: DocumentDuplicateIcon, current: (path == "/app/proof") },
    { name: 'Create New Donation', link: '/app/donations', icon: PlusCircleIcon, current: (path == "/app/donations") },
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
      toast.error("Something went wrong loading the admin profile.")
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

        <div className='col-span-3'>Loading...</div>

        : loginRequired ?

        <div>Login Required</div>

        : userConfigured ?
  
        
          <div className='col-span-3'>
            { children }
          </div>

        :

        <div className='p-10'>
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