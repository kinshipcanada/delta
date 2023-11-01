import { ArrowLeftOnRectangleIcon, ArrowPathIcon, ChatBubbleOvalLeftIcon, Cog6ToothIcon, HomeIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/router"
import { useState } from "react"
import { supabase } from "../../../lib/utils/helpers"
import Button from "../../primitives/Button"
import { ButtonStyle } from "../../primitives/types"
import { LargeIconSizing } from "../../primitives/types"

export const AppNavigation: React.FC<{ adminEnabled: boolean }> = ({ adminEnabled }) => {
    const router = useRouter()
    const path = router.asPath 

    const navigation = [
        { name: 'Dashboard Home', link: '/app', icon: HomeIcon, current: (path == "/app") },
        { name: 'Recurring Donations', link: '/app/recurring', icon: ArrowPathIcon, current: (path == "/app/recurring") },
        { name: 'Account & Billing', link: '/app/account', icon: UserCircleIcon, current: (path == "/app/account") },
        { name: 'Feedback', link: '/app/feedback', icon: ChatBubbleOvalLeftIcon, current: (path == "/app/feedback") },
    ]

    const [signOutLoading, setSignOutLoading] = useState(false)
    
    return (
        <nav className="space-y-2 col-span-1" aria-label="Sidebar">
            {navigation.map((item) => (
                <Button
                    key={item.name}
                    text={item.name}
                    style={item.current ? ButtonStyle.OutlineSelected : ButtonStyle.OutlineUnselected}
                    icon={<item.icon className={`${LargeIconSizing} text-gray-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 -mt-0.5`} />}
                    href={item.link}
                />
            ))}
            { adminEnabled && (
                <Button
                    text={"Admin Panel"}
                    style={["/app/admin", "/app/admin#", "/app/admin/create", "/app/admin/proof", "/app/admin/reports", "/app/admin/resend"].includes(path) ? ButtonStyle.OutlineSelected : ButtonStyle.OutlineUnselected}
                    icon={<Cog6ToothIcon className={`${LargeIconSizing} text-gray-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 -mt-0.5`} />}
                    href={'/app/admin'}
                />
            )}
            <Button
                text="Logout"
                style={ButtonStyle.OutlineUnselected}
                icon={<ArrowLeftOnRectangleIcon className={`${LargeIconSizing} text-gray-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 -mt-0.5`} />}
                onClick={async () => {
                    await supabase.auth.signOut()
                    router.replace("/").then(() => router.reload());
                }}
                setter={setSignOutLoading}
                isLoading={signOutLoading}
            />
      </nav>
    )
}