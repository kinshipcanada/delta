import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { PrimaryButton, SecondaryButton } from './Buttons'
import { supabase } from '../../systems/helpers//supabaseClient';
import { Fragment, useEffect, useState} from 'react';
import { EnvelopeIcon, LifebuoyIcon, PlayIcon, TicketIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function Navigation() {
    const router = useRouter()

    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const pages = [
      { name: "Home", link: "/", current: router.asPath == "/" },
      { name: "Make A Donation", link: "/donate", current: router.asPath == "/donate" },
      { name: "About", link: "/about", current: router.asPath == "/about" }
    ]

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
                        <a target="_blank" href = 'https://documentation-5v9j7ekpv-kinshipcanada.vercel.app'>
                            <span className="flex-shrink-0 ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border hover:bg-blue-200 border-blue-600 transition-200">
                                Beta V1.0.0
                            </span>
                        </a>
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
                        {pages.map((page)=>(
                          <MenuLink key={page.name} text={page.name} link={page.link} current={page.current} />
                        ))}
                        <Support />
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

export function MenuLink({ text, link, current }) {
    return (
        <Link href={link}>
            <a className={classNames(current ? 'text-slate-900' : 'text-slate-500', "text-base font-medium hover:text-slate-900")}>
                { text }
            </a>
        </Link>
    )
}

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }  

function Support() {

    const solutions = [
        {
        name: 'Send A Support Ticket',
        description: 'Get support from the Kinship team. We try to respond within 24 hours',
        href: '/support',
        icon: TicketIcon,
        },
        {
        name: 'Frequently Asked Questions',
        description: 'Questions we frequently get. If you have other questions, please send us a support ticket',
        href: '/support/faq',
        icon: LifebuoyIcon,
        }
    ]
    const callsToAction = [
        { name: 'Demo Coming Soon...', href: '#', icon: PlayIcon },
        { name: 'Email Kinship', href: 'mailto:info@kinshipcanada.com', icon: EnvelopeIcon },
    ]
    
    return (
      <Popover className="relative z-40">
        {({ open }) => (
          <>
            <Popover.Button
              className={classNames(
                open ? 'text-gray-900' : 'text-gray-500',
                'group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none '
              )}
            >
              <span>Get Support</span>
              <ChevronDownIcon
                className={classNames(open ? 'text-gray-600' : 'text-gray-600', 'ml-2 h-5 w-5 group-hover:text-slate-900')}
                aria-hidden="true"
              />
            </Popover.Button>
  
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0">
                <div className="z-20 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                      {solutions.map((item) => (
                        <Link href = {item.href} key={item.name}>
                          <a
                            href={item.href}
                            className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150"
                          >
                            <item.icon className="flex-shrink-0 h-6 w-6 text-blue-600" aria-hidden="true" />
                            <div className="ml-4">
                              <p className="text-base font-medium text-gray-900">{item.name}</p>
                              <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                            </div>
                          </a>
                        </Link>
                      ))}
                    </div>
                    <div className="px-5 py-5 bg-gray-50 space-y-6 sm:flex sm:space-y-0 sm:space-x-10 sm:px-8">
                      {callsToAction.map((item) => (
                        <div key={item.name} className="flow-root">
                          <a
                            href={item.href}
                            className="-m-3 p-3 flex items-center rounded-md text-base font-medium text-gray-900 hover:bg-gray-100 transition ease-in-out duration-150"
                          >
                            <item.icon className="flex-shrink-0 h-6 w-6 text-gray-400" aria-hidden="true" />
                            <span className="ml-3">{item.name}</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    )
}