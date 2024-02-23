import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { classNames, supabase } from '../../lib/utils/helpers'
import { FC, Fragment, useEffect, useState} from 'react';
import { EnvelopeIcon, LifebuoyIcon, PlayIcon, TicketIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import { Button, ButtonSize, ButtonStyle } from '../primitives';
import { useAuth } from './Authentication';

interface PageLink {
  name: string
  link: string
  current: boolean
}

export default function Navigation() {
    const router = useRouter()

    const { donor, authContextLoading } = useAuth()

    const pages: PageLink[] = [
      { name: "Home", link: "/", current: router.asPath == "/" },
      { name: "Make A Donation", link: "/donate", current: router.asPath == "/donate" },
      { name: "Ramadhan Campaign", link: "/campaigns/ramadhan", current: router.asPath == "/campaigns/ramadhan" },
      { name: "About", link: "/about", current: router.asPath == "/about" }
    ]

    return (
        <Popover className="bg-white sticky z-50 top-0">
            <div className="flex justify-between items-center px-4 py-6 sm:px-6 md:justify-start md:space-x-10 border border-gray-300">
                <div>
                  <a href="#" className="flex items-center">
                      <span className="sr-only">Kinship Canada</span>
                      <img
                      className="h-8 w-auto sm:h-10"
                      loading='eager'
                      src="/logo.png"
                      alt=""
                      />
                      <Link href = '/developers'>
                          <span className="hidden sm:block flex-shrink-0 ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 border hover:bg-blue-200 border-blue-600 transition-200">
                              Open Source
                          </span>
                      </Link>
                  </a>
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
                    authContextLoading ? null :
                    donor ? (
                      <Button 
                        text = "My Receipts"
                        href = "/dashboard"
                        style={ButtonStyle.Secondary}
                        size={ButtonSize.Standard}
                      />
                    ) :
                    <Button 
                      text = "My Receipts"
                      href = "/auth/login"
                      style={ButtonStyle.Secondary}
                      size={ButtonSize.Standard}
                    />
                  }

                  <div className='m-1' />

                  <Button 
                    text = "Donate"
                    href = "/donate"
                    style={ButtonStyle.Primary}
                    size={ButtonSize.Standard}
                  />
                </div>
            </div>
        </Popover>
    )
}

export const MenuLink: FC<{ text: string, link: string, current: boolean }> = ({ text, link, current }) => {
    return (
        <Link href={link}>
          <a className={classNames(current ? 'text-slate-900' : 'text-slate-500', "text-base font-medium hover:text-slate-900")}>
              { text }
          </a>
        </Link>
    )
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