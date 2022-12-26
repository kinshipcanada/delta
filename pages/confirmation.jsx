import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import Loading, { LargeLoading } from "../components/core/Loading";
import { callKinshipAPI } from "../systems/functions/helpers";
let Globe = () => null;
if (typeof window !== "undefined") Globe = require("react-globe.gl").default;

export default function Donate() {

    const router = useRouter()

    const steps = [
        { name: 'Choose Amount', href: '#' },
        { name: 'Billing Information', href: '#' },
        { name: 'Confirmation', href: '#' },
    ]

    const [active_step, set_active_step] = useState(2)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [confirmationMode, setConfirmationMode] = useState(false)

    const [donation, setDonation] = useState(null)


    const paymentIntentId = router.query.payment_intent;
    const kinshipCartId = router.query.kinship_cart_id;

    async function fetchFromPaymentIntentID(paymentIntentID) {
        const response = await callKinshipAPI('/api/donation/fetch', {
            donation_id: paymentIntentID,
        });
    
        if (response.statusCode === 500) {
            setError(error.message);
            setLoading(false)
            return;
        } else {
            console.log("Donation: ", response.donation)
            setDonation(response.donation)
            setError(null)
            setLoading(false)
            return;
        }
    }

    useEffect(()=>{
        if (!paymentIntentId && !kinshipCartId) {
            toast.error("Sorry, an error occurred.")
        } else {
            // If it was a kinship cart id, load the cart info and then give the user instructions
            if (kinshipCartId) {
                return 
            }

            // Otherwise, fetch the donation from the paymentIntentID
            if (paymentIntentId) {
                fetchFromPaymentIntentID(paymentIntentId)
                return; 
            }
        }
    }, [paymentIntentId, kinshipCartId])

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
            
            { loading ? <Loading color={"BLUE"} /> 
            
            : error ?

            <p>Something went wrong fetching your receipt</p>

            : paymentIntentId ?

            <ConfirmationView donation={donation} paymentIntentId={paymentIntentId} />

            : kinshipCartId ?

            "Your donation" 

            : null
            
            }
        </div>
        
    )
}

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/

const products = [
    {
      id: 1,
      name: 'Nomad Tumbler',
      description:
        'This durable and portable insulated tumbler will keep your beverage at the perfect temperature during your next adventure.',
      href: '#',
      price: '35.00',
      status: 'Preparing to ship',
      step: 1,
      date: 'March 24, 2021',
      datetime: '2021-03-24',
      address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
      email: 'f•••@example.com',
      phone: '1•••••••••40',
      imageSrc: 'https://tailwindui.com/img/ecommerce-images/confirmation-page-03-product-01.jpg',
      imageAlt: 'Insulated bottle with white base and black snap lid.',
    },
    {
      id: 2,
      name: 'Minimalist Wristwatch',
      description: 'This contemporary wristwatch has a clean, minimalist look and high quality components.',
      href: '#',
      price: '149.00',
      status: 'Shipped',
      step: 0,
      date: 'March 23, 2021',
      datetime: '2021-03-23',
      address: ['Floyd Miles', '7363 Cynthia Pass', 'Toronto, ON N3Y 4H8'],
      email: 'f•••@example.com',
      phone: '1•••••••••40',
      imageSrc: 'https://tailwindui.com/img/ecommerce-images/confirmation-page-03-product-02.jpg',
      imageAlt:
        'Arm modeling wristwatch with black leather band, white watch face, thin watch hands, and fine time markings.',
    },
    // More products...
  ]
  
  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
  export function ConfirmationView({ donation, paymentIntentId }) {
    const [imageUrl, setImageUrl] = useState("/images/texture.png");
    const globeRef = useRef(null);
    const arcsData = [1, 2, 3, 4, 5, 6].map(() => ({
      startLat: (Math.random() - 0.5) * 180,
      startLng: (Math.random() - 0.5) * 360,
      endLat: (Math.random() - 0.5) * 180,
      endLng: (Math.random() - 0.5) * 360,
      color: [["#000000"][0], ["#000000"][0]],
    }));  

    return (
      <div className="">
        <div className="mx-auto max-w-2xl sm:py-8 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
            <div className="flex items-center sm:space-x-4">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Thank You So Much For Your Donation</h1>
              <Link href={"/receipts/" + paymentIntentId}>
                <a href={"/receipts/" + paymentIntentId} className="hidden text-sm font-medium text-blue-600 hover:text-blue-500 sm:block">
                  View receipt
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </Link>
            </div>
            <p className="text-sm text-gray-600">
              Donation Made{' '}
              <time dateTime="2021-03-22" className="font-medium text-gray-900">
                { new Date(donation.created_at).toDateString() }
              </time>
            </p>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 sm:hidden">
              View invoice
              <span aria-hidden="true"> &rarr;</span>
            </a>
          </div>
  
          {/* Donation Summary */}
          <div className="mt-6">
            <div className="space-y-8">
              <div
                className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
              >
                <div className="py-6 px-4 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                  <div className="sm:flex lg:col-span-7">
                    <div className="aspect-w-1 aspect-h-1 w-full flex-shrink-0 overflow-hidden rounded-lg sm:aspect-none sm:h-40 sm:w-40">
                      <Globe
                        //@ts-ignore
                        ref={globeRef}
                        width={150}
                        height={150}
                        backgroundColor={"rgba(0,0,0,0)"}
                        globeImageUrl={imageUrl}
                        arcColor={"white"}
                        arcsData={arcsData}
                        arcDashGap={0.6}
                        arcDashLength={0.3}
                        arcDashAnimateTime={4000 + 500}
                        rendererConfig={{ preserveDrawingBuffer: true }}
                      />
                    </div>

                    <div className="mt-6 sm:mt-0 sm:ml-6">
                      <h3 className="text-base font-medium text-gray-900">{ "Donation for $" + (donation.amount_in_cents/100).toFixed(2) + " on " + new Date(donation.created_at).toDateString() }</h3>
                      <p className="mt-2 text-sm font-medium text-gray-900">Made out to {donation.donor.first_name}{' '}{donation.donor.last_name}</p>
                      <p className="mt-3 text-sm text-gray-500">Thank you so much for your donation. Your {donation.donor.address.country == "ca" ? "tax" : null} receipt is being generated and will be emailed to your shortly. {donation.donor.address.country == "ca" ? null : "Please note that because you are not in Canada, this is not a tax-eligible donation."}</p>
                    </div>
                  </div>

                  <div className="mt-6 lg:col-span-5 lg:mt-0">
                    <dl className="grid grid-cols-2 gap-x-6 text-sm">
                      <div>
                        <dt className="font-medium text-gray-900">Donated To</dt>
                        <dd className="mt-3 text-gray-500">
                          { donation.cart.causes.map((cause)=>(
                            <span className="block">{cause}</span>
                          ))}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-gray-900">Updates</dt>
                        <dd className="mt-3 space-y-3 text-gray-500">
                          <p>{donation.donor.email}</p>
                          <p>{donation.donor.phone ? donation.donor.phone : null }</p>
                          <Link href = "/app/account">
                            <a href = "/app/account" className="font-medium text-blue-600 hover:text-blue-500">
                              Edit
                            </a>
                          </Link>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="border-t border-gray-200 py-6 px-4 sm:px-6 lg:p-8">
                  <h4 className="sr-only">Status</h4>
                  <div className="mt-4" aria-hidden="true">
                    <div className="overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `calc((${1} * 2 + 1) / 8 * 100%)` }}
                      />
                    </div>
                    <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
                      <div className="text-blue-600">Donation Made</div>
                      <div className={classNames(products[0].step > 0 ? 'text-blue-600' : '', 'text-center')}>
                        Tax Receipt Generated
                      </div>
                      <div className={classNames(products[0].step > 1 ? 'text-blue-600' : '', 'text-center')}>
                        Funds Distributed
                      </div>
                      <div className={classNames(products[0].step > 2 ? 'text-blue-600' : '', 'text-right')}>
                        Proof Available
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Billing */}
          <div className="mt-16">
            <h2 className="sr-only">Billing Summary</h2>
  
            <div className="bg-gray-100 py-6 px-4 sm:rounded-lg sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8 lg:py-8">
              <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-2 md:gap-x-8 lg:col-span-7">
                <div>
                  <dt className="font-medium text-gray-900">Billing address</dt>
                  <dd className="mt-3 text-gray-500">
                    <span className="block">{donation.donor.first_name}{' '}{donation.donor.last_name}</span>
                    <span className="block">{donation.donor.address.line_address}</span>
                    <span className="block">{donation.donor.address.city}, {donation.donor.address.state} {donation.donor.address.postal_code}</span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-900">Payment information</dt>
                  <dd className="-ml-4 -mt-1 flex flex-wrap">
                    <div className="ml-4 mt-4 flex-shrink-0">
                      <svg
                        aria-hidden="true"
                        width={36}
                        height={24}
                        viewBox="0 0 36 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-auto"
                      >
                        <rect width={36} height={24} rx={4} fill="#224DBA" />
                        <path
                          d="M10.925 15.673H8.874l-1.538-6c-.073-.276-.228-.52-.456-.635A6.575 6.575 0 005 8.403v-.231h3.304c.456 0 .798.347.855.75l.798 4.328 2.05-5.078h1.994l-3.076 7.5zm4.216 0h-1.937L14.8 8.172h1.937l-1.595 7.5zm4.101-5.422c.057-.404.399-.635.798-.635a3.54 3.54 0 011.88.346l.342-1.615A4.808 4.808 0 0020.496 8c-1.88 0-3.248 1.039-3.248 2.481 0 1.097.969 1.673 1.653 2.02.74.346 1.025.577.968.923 0 .519-.57.75-1.139.75a4.795 4.795 0 01-1.994-.462l-.342 1.616a5.48 5.48 0 002.108.404c2.108.057 3.418-.981 3.418-2.539 0-1.962-2.678-2.077-2.678-2.942zm9.457 5.422L27.16 8.172h-1.652a.858.858 0 00-.798.577l-2.848 6.924h1.994l.398-1.096h2.45l.228 1.096h1.766zm-2.905-5.482l.57 2.827h-1.596l1.026-2.827z"
                          fill="#fff"
                        />
                      </svg>
                      <p className="sr-only">Visa</p>
                    </div>
                    <div className="ml-4 mt-4">
                      <p className="text-gray-900">Ending with {donation.payment_method.card.last4}</p>
                      <p className="text-gray-600">Expires {donation.payment_method.card.exp_month} / {donation.payment_method.card.exp_year}</p>
                    </div>
                  </dd>
                </div>
              </dl>
  
              <dl className="mt-8 divide-y divide-gray-200 text-sm lg:col-span-5 lg:mt-0">
                <div className="flex items-center justify-between pb-4">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">${(donation.amount_in_cents/100).toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-600">Fees Covered</dt>
                  <dd className="font-medium text-gray-900">${(donation.fees_covered/100).toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between py-4">
                  <dt className="text-gray-600">Eligible for tax receipt</dt>
                  <dd className="font-medium text-gray-900">${((donation.amount_in_cents + donation.fees_covered)/100).toFixed(2)}</dd>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <dt className="font-medium text-gray-900">Donation total</dt>
                  <dd className="font-medium text-blue-600">${((donation.amount_in_cents + donation.fees_covered)/100).toFixed(2)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    )
  }
  