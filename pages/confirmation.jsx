import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import CopyableInput from "../components/core/CopyableInput";
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

    const [cart, setCart] = useState(null)
    const [donation, setDonation] = useState(null)


    const paymentIntentId = router.query.payment_intent;
    const kinshipCartId = router.query.cart_id;

    async function fetchFromCartID(kinshipCartId) {
      const response = await callKinshipAPI('/api/donation/instructions', {
          cart_id: kinshipCartId,
      });

      if (response.statusCode === 500) {
          setError(error.message);
          setLoading(false)
          return;
      } else {
          setCart(response.cart)
          setError(null)
          setLoading(false)
          return;
      }
    }

    async function fetchFromPaymentIntentID(paymentIntentID) {
      const response = await callKinshipAPI('/api/donation/fetch', {
          donation_id: paymentIntentID,
      });
  
      if (response.statusCode === 500) {
          setError(response.message);
          console.log(response)
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
          // Otherwise, fetch the donation from the paymentIntentID
          if (paymentIntentId) {
            fetchFromPaymentIntentID(paymentIntentId)
            return; 
          }

          // If it was a kinship cart id, load the cart info and then give the user instructions
          if (kinshipCartId) {
            fetchFromCartID(kinshipCartId)
            return 
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

            : paymentIntentId && !error && donation != undefined && donation != null ?

            <ConfirmationView donation={donation} paymentIntentId={paymentIntentId} />

            : kinshipCartId && !error ?

            <CartView cart={cart} />

            : <p>Something went wrong fetching your receipt</p>
            
            }
        </div>
        
    )
}

export function CartView({ cart }) {
  const [imageUrl, setImageUrl] = useState("/images/texture.png");
  const globeRef = useRef(null);
  const arcsData = [1, 2, 3, 4, 5, 6].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: [["#000000"][0], ["#000000"][0]],
  }));

  console.log(cart)

  return (
    <div className="">
      <div className="mx-auto max-w-2xl sm:py-8 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
          <div className="flex items-center sm:space-x-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Next Steps For eTransfer Donation</h1>
          </div>
          <p className="text-sm text-gray-600">
            Donation Made{' '}
            <time className="font-medium text-gray-900">
              { new Date(cart.donation_logged).toDateString() }
            </time>
          </p>
        </div>

        <p className="mt-3 text-md text-gray-600">Thank you so much for initiating this donation. To complete the donation, please eTransfer ${(Number(cart.amount_in_cents)/100).toFixed(2)} to Kinship using the steps below. {cart.address_country.toLowerCase() == "ca" ? null : "Please note that because you are not in Canada, this is not a tax-eligible donation."} If you have any questions, we can be reached at <a href="mailto:info@kinshipcanada.com" className="text-blue-600 hover:text-blue-500 hover:cursor-pointer">info@kinshipcanada.com</a>.</p>

        {/* Donation Summary */}
        <div className="mt-6">
          <div className="space-y-8">
            <div
              className="border-t border-b border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border"
            >
              <div className="py-6 px-4 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                <div className="sm:flex lg:col-span-7">
                  <div className="mt-6 sm:mt-0 ">
                    <h3 className="text-base font-medium text-gray-900">{ "Donation for $" + (cart.amount_in_cents/100).toFixed(2) + " on " + new Date(cart.donation_logged).toDateString() }</h3>
                    <p className="mt-2 text-sm font-medium text-gray-900">Will be made out to {cart.first_name}{' '}{cart.last_name}</p>
                  </div>
                </div>

                <div className="mt-6 lg:col-span-5 lg:mt-0">
                  <dl className="grid grid-cols-2 gap-x-6 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">Donating To</dt>
                      <dd className="mt-3 text-gray-500">
                        { cart.donation_causes.map((cause)=>(
                          <span className="flex items-center">
                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx={4} cy={4} r={3} />
                            </svg>
                            {cause}</span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-900">Updates sent to</dt>
                      <dd className="mt-3 space-y-3 text-gray-500">
                        <p>{cart.email}</p>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="border-t border-gray-200 py-6 px-4 sm:px-6 lg:p-8">
                <p className="text-md font-medium text-slate-700">Please send the eTransfer to the details below. Once funds are received, we will send a confirmation email and receipt.</p>
                <div className="mt-4" aria-hidden="true">
                  <CopyableInput content={{ label: "eTransfer email", value: "info@kinshipcanada.com" }} />
                  <CopyableInput content={{ label: "Kinship Cart ID (paste this into the notes/message section)", value: cart.id }} />
                  <CopyableInput content={{ label: "Amount to send (CAD)", value: ("$" + (cart.amount_in_cents/100).toFixed(2) ) }} />
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
                    <div className='text-blue-600 text-center'>
                      Tax Receipt Generated
                    </div>
                    <div className='text-center'>
                      Funds Distributed
                    </div>
                    <div className='text-center'>
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
                  <span className="block">{cart.first_name}{' '}{cart.last_name}</span>
                  <span className="block">{cart.address_line_address}</span>
                  <span className="block">{cart.address_city}, {cart.address_state} {cart.address_postal_code}</span>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-900">Payment information</dt>
                <dd className="-ml-4 -mt-1 flex flex-wrap">
                  <div className="ml-4 mt-4 flex-shrink-0">
                   
                  </div>
                  <div className="ml-4 mt-4">
                    {/* <p className="text-gray-900">Ending with {donation.payment_method.card.last4}</p> */}
                    {/* <p className="text-gray-600">Expires {donation.payment_method.card.exp_month} / {donation.payment_method.card.exp_year}</p> */}
                  </div>
                </dd>
              </div>
            </dl>

            <dl className="mt-8 divide-y divide-gray-200 text-sm lg:col-span-5 lg:mt-0">
              {/* <div className="flex items-center justify-between pb-4">
                <dt className="text-gray-600">Subtotal</dt>
                <dd className="font-medium text-gray-900">${(donation.amount_in_cents/100).toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between py-4">
                <dt className="text-gray-600">Fees Covered</dt>
                <dd className="font-medium text-gray-900">${(donation.fees_covered/100).toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between py-4">
                <dt className="text-gray-600">Eligible for tax receipt</dt>
                <dd className="font-medium text-gray-900">${((Number(donation.amount_in_cents) + Number(donation.fees_covered))/100).toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between pt-4">
                <dt className="font-medium text-gray-900">Donation total</dt>
                <dd className="font-medium text-blue-600">${((Number(donation.amount_in_cents) + Number(donation.fees_covered))/100).toFixed(2)}</dd>
              </div> */}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
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
            <time className="font-medium text-gray-900">
              { donation ? new Date(donation.created_at).toDateString() : new Date().toDateString() }
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
                    <h3 className="text-base font-medium text-gray-900">{ "Donation for $" + (donation.amount_in_cents/100).toFixed(2) + " on " + donation ? new Date(donation.created_at).toDateString() : new Date().toDateString() }</h3>
                    <p className="mt-2 text-sm font-medium text-gray-900">Made out to {donation.donor.first_name}{' '}{donation.donor.last_name}</p>
                    <p className="mt-3 text-sm text-gray-500">Thank you so much for your donation. Your {donation.donor.address.country == "ca" ? "tax" : null} receipt is being generated and will be emailed to your shortly. {donation.donor.address.country.toLowerCase() == "ca" ? null : "Please note that because you are not in Canada, this is not a tax-eligible donation."}</p>
                  </div>
                </div>

                <div className="mt-6 lg:col-span-5 lg:mt-0">
                  <dl className="grid grid-cols-2 gap-x-6 text-sm">
                    <div>
                      <dt className="font-medium text-gray-900">Donated To</dt>
                      <dd className="mt-3 text-gray-500">
                        { donation.cart.causes.map((cause)=>(
                          <span className="flex items-center">
                            <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                              <circle cx={4} cy={4} r={3} />
                            </svg>
                            {cause}</span>
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
                    <div className='text-blue-600 text-center'>
                      Tax Receipt Generated
                    </div>
                    <div className='text-center'>
                      Funds Distributed
                    </div>
                    <div className='text-center'>
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
                    {
                      donation.payment_method.card_brand == "visa" ?

                      <img src = "/cards/visa.png" className="h-8 w-auto" />

                      : donation.payment_method.card_brand == "mastercard" ?

                      <img src = "/cards/mastercard.png" className="h-8 w-auto" />

                      : donation.payment_method.card_brand == "amex" ?

                      <img src = "/cards/amex.png" className="h-8 w-auto" />

                      :

                      <img src = "/cards/card.png" className="h-8 w-auto" />
                    }
                  </div>
                  <div className="ml-4 mt-4">
                    {/* <p className="text-gray-900">Ending with {donation.payment_method.card.last4}</p> */}
                    {/* <p className="text-gray-600">Expires {donation.payment_method.card.exp_month} / {donation.payment_method.card.exp_year}</p> */}
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
                <dd className="font-medium text-gray-900">${((Number(donation.amount_in_cents) + Number(donation.fees_covered))/100).toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between pt-4">
                <dt className="font-medium text-gray-900">Donation total</dt>
                <dd className="font-medium text-blue-600">${((Number(donation.amount_in_cents) + Number(donation.fees_covered))/100).toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
  