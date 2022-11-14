import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import Loading, { LargeLoading } from "../components/core/Loading";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Donate() {

    const [active_step, set_active_step] = useState(2)
    const [loading, setLoading] = useState(false)

    const [amount, set_amount] = useState(0.00)

    const steps = [
        { name: 'Choose Amount', href: '#' },
        { name: 'Billing Information', href: '#' },
        { name: 'Confirmation', href: '#' },
    ]

    return (
        <div className="bg-white">
            <header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700 z-10">
                <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-end sm:justify-center">
                    <nav aria-label="Progress" className="hidden sm:block">
                    <ol role="list" className="flex space-x-4">
                        {steps.map((step, stepIdx) => (
                        <li key={step.name} className="flex items-center">
                            {stepIdx == active_step ? (
                            <a href={step.href} aria-current="page" className="text-blue-600">
                                {step.name}
                            </a>
                            ) : (
                            <a href={step.href}>{step.name}</a>
                            )}

                            {stepIdx !== steps.length - 1 ? (
                            <ChevronRightIcon className="ml-4 h-5 w-5 text-gray-300" aria-hidden="true" />
                            ) : null}
                        </li>
                        ))}
                    </ol>
                    </nav>
                    <p className="sm:hidden">Step 2 of 4</p>
                </div>
                </div>
            </header>
            <div className="fixed left-0 hidden h-full w-1/2 bg-white lg:block" aria-hidden="true" />
            <div className="fixed right-0 top-0 z-5 hidden h-full w-1/2 bg-blue-900 lg:block" aria-hidden="true" />
    
            <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 lg:pt-16">
            <h1 className="sr-only">Donate</h1>

            

            <section
                aria-labelledby="summary-heading"
                className="bg-blue-900 py-12 text-blue-300 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pt-0"
            >
                <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                <dl>
                    <dt className="text-sm font-medium">Your Donation</dt>
                    <dd className="mt-1 text-3xl font-bold tracking-tight text-white">{ amount ? <>${amount}</> : <span className="flex items-center"><LargeLoading show = {true} /><p className="ml-4">Loading Your Donation</p></span> }</dd>
                    <dd className="my-4" />
                </dl>
    

                <dl className="space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium">
                    <div className="flex items-center justify-between">
                    <dt>Subtotal</dt>
                    <dd>{ amount ? <>${amount}</> : "$0.00" }</dd>
                    </div>

                    <div className="flex items-center justify-between">
                    <dt>Eligible For Tax Receipt</dt>
                    <dd>{ amount ? <>${amount}</> : "$0.00" }</dd>
                    </div>
    
                    <div className="flex items-center justify-between">
                    <dt>Fees Covered</dt>
                    <dd>$0.00</dd>
                    </div>
    
                    <div className="flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white">
                        <dt className="text-base">Total</dt>
                        <dd className="text-base">{ amount ? <>${amount}</> : "$0.00" }</dd>
                    </div>
                </dl>
                </div>
            </section>
    
            <section
                className="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pt-0 "
            >
                <div>
                    <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                        Thank you for your donation
                    </div>
                </div>
            </section>
            </div>
        </div>
        
    )
}

