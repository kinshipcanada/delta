import { ArrowLeftOnRectangleIcon, ArrowPathIcon, ChatBubbleOvalLeftIcon, DocumentDuplicateIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"
import { supabase } from "../../system/utils/helpers"
import { AppLink } from "../Links"

export default function AppNavigation() {
    const router = useRouter()
    const path = router.asPath 

    const navigation = [
        { name: 'Dashboard Home', link: '/app', icon: HomeIcon, current: (path == "/app") },
        { name: 'Your Donations', link: '/app/donations', icon: DocumentDuplicateIcon, current: (path == "/app/donations") },
        { name: 'Recurring Donations', link: '/app/recurring', icon: ArrowPathIcon, current: (path == "/app/recurring") },
        { name: 'Account & Billing', link: '/app/account', icon: UserCircleIcon, current: (path == "/app/account") },
        { name: 'Feedback', link: '/app/feedback', icon: ChatBubbleOvalLeftIcon, current: (path == "/app/feedback") },
    ]
    
    return (
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
                    router.push('/');
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
    )
}