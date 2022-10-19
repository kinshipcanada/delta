import Link from 'next/link'
import { Popover } from '@headlessui/react'
import { useRouter } from 'next/router'
import { PrimaryButton, SecondaryButton } from './Buttons'
import { supabase } from '../../systems/helpers//supabaseClient';
import { useEffect } from 'react';
import { useState } from 'react';

export default function Navigation() {
    const router = useRouter()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(async () => {
        const loggedInUser = await supabase.auth.getUser()

        if (loggedInUser) {
            setUser(loggedInUser.data.user)
            setLoading(false)
            return
        } else {
            setLoading(false)
            return
        }
    }, [supabase])

    return (
        <Popover className="relative bg-white z-10">
            {/* Desktop Navbar */}
            <div className="flex justify-between items-center px-4 py-6 sm:px-6 md:justify-start md:space-x-10 border border-gray-300">
                {/* Logo */}
                <div>
                    <a href="#" className="flex items-center">
                        <span className="sr-only">Kinship Canada</span>
                        <img
                        className="h-8 w-auto sm:h-10"
                        loading='eager'
                        src="/logo.png"
                        alt=""
                        />
                        <Link href = 'https://hobble.notion.site/Kinship-Canada-Alpha-6bb80cea62754c62a8c87e34b13347db'>
                            <span className="flex-shrink-0 ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border hover:bg-blue-200 border-blue-600 transition-200">
                                Beta V1.0.0
                            </span>
                        </Link>
                    </a>
                </div>

                {/* Menu Icon */}
                <div className="-mr-2 -my-2 md:hidden">
                    {/* <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none ">
                        <span className="sr-only">Open menu</span>
                        <MenuIcon className="h-6 w-6" aria-hidden="true" />
                    </Popover.Button> */}
                </div>

                {/* Menu */}
                <div className="hidden md:flex-1 md:flex md:items-center md:justify-between">
                    <Popover.Group as="nav" className="flex space-x-10">
                        <MenuLink text = {"Home"} link= {"/"} />
                        <MenuLink text = {"Make A Donation"} link= {"/donate"} />
                    </Popover.Group>


                </div>

                <div className="flex items-center md:ml-12">

                    {
                        loading ? null :

                        user ?

                        <SecondaryButton 
                            link = "/app"
                            text = "Dashboard"
                        />

                        : !user ?

                        <SecondaryButton 
                            link = "/auth/login"
                            text = "Login"
                        />

                        : 
                        
                        <SecondaryButton 
                            link = "/auth/login"
                            text = "Login"
                        />
                    }

                    <div className='m-1' />
                    <PrimaryButton
                        link = "/donate"
                        text = "Donate"
                    />
                </div>


            </div>
        </Popover>
    )
}

export function MenuLink({ text, link }) {
    return (
        <Link href={link}>
            <a className="text-base font-medium text-slate-500 hover:text-slate-900">
                { text }
            </a>
        </Link>
    )
}