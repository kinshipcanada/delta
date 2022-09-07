import { CalendarIcon, ChartBarIcon, FolderIcon, HomeIcon, InboxIcon, DocumentDuplicateIcon, UserCircleIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { ArrowPathIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useRouter } from 'next/router'



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function AppLayout({ children }) {

  const router = useRouter()
  const path = router.asPath 

  const navigation = [
    { name: 'Dashboard Home', link: '/app', icon: HomeIcon, current: (path == "/app") },
    { name: 'Tax Receipts', link: '/app/receipts', icon: DocumentDuplicateIcon, current: (path == "/app/receipts") },
    { name: 'Proof Of Donation', link: '/app/proof', icon: PaperAirplaneIcon, current: (path == "/app/proof") },
    { name: 'Donation History', link: '/app/donations', icon: FolderIcon, current: (path == "/app/donations") },
    { name: 'Recurring Donations', link: '/app/recurring', icon: ArrowPathIcon, current: (path == "/app/recurring") },
    { name: 'Account & Billing', link: '/app/account', icon: UserCircleIcon, current: (path == "/app/account") },
  ]

  return (
    <div className='p-10 grid grid-cols-4 gap-12'>
      <nav className="space-y-1 col-span-1" aria-label="Sidebar">
        {navigation.map((item) => (
          <AppLink
            name={item.name}
            link={item.link}
            current={item.current}
            icon={item.icon}
          />
        ))}
      </nav>
      <div className='col-span-3'>
        { children }
      </div>
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