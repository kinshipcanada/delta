import { FC, useEffect, useState } from "react"
import { Donation } from "@prisma/client"
import { ConfirmationType } from "../helpers/types"
import { InlineLink, SpacerSize, VerticalSpacer } from "../../../primitives"
import { calculateStripeFee, callKinshipAPI, centsToDollars } from "../../../../lib/utils/helpers"
import Link from "next/link"
import Stripe from "stripe"
import { ClockIcon } from "@heroicons/react/24/solid"
import { EnvelopeIcon } from "@heroicons/react/20/solid"

const ConfirmedAndReceived: FC<{ globalDonation: Donation }> = ({ globalDonation }) => {

  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<Stripe.PaymentMethod | undefined>(undefined)
  const [showLink, setShowLink] = useState(false);

  const fetchPaymentMethod = async () => {
    const paymentMethodResponse = await callKinshipAPI<any>('/api/stripe/fetchPaymentMethod', {
      paymentMethodId: globalDonation.stripePaymentMethodId,
    })

    setPaymentMethod(paymentMethodResponse.data);
    setLoading(false)
  }

  useEffect(()=>{
    fetchPaymentMethod() 

    const timeoutId = setTimeout(() => {
      setShowLink(true);
    }, 5000);

    // Cleanup function to clear the timeout in case the component unmounts before the timeout
    return () => clearTimeout(timeoutId);
  }, [globalDonation])


  return (
    <div>
      <div className="mx-auto">
        <div className="lg:col-start-2">
          <h1 className="text-sm font-medium text-blue-600">Payment successful</h1>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-4xl">Thanks for donating!</p>
          <p className="mt-2 text-base text-gray-500">
            We appreciate your donation, and will let you know once it is processed. In the meantime, you should receive a {globalDonation.donorAddressCountry == "CA" ? "CRA-eligible tax " : ""} receipt in your email shortly.
            Once your donation has been distributed, you will also receive a letter containing proof of where your donation went.
          </p>

          <VerticalSpacer size={SpacerSize.Large} />
          
          <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
            <div className="flex justify-between">
              <dt>Total Donated</dt>
              <dd className="text-gray-900">${centsToDollars(globalDonation.amountDonatedInCents)}</dd>
            </div>

            <div className="flex justify-between">
              <dt>Credit Card Fees</dt>
              <dd className="text-gray-900">${centsToDollars(globalDonation.amountChargedInCents - globalDonation.amountDonatedInCents)}</dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">Total Eligible On Tax Receipt</dt>
              <dd className="text-base">${centsToDollars(globalDonation.amountChargedInCents)}</dd>
            </div>
          </dl>

          <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
            <div>
              <dt className="font-medium text-gray-900">Donor Address</dt>
              <dd className="mt-2">
                <address className="not-italic">
                  <span className="block font-semibold">{globalDonation.donorFirstName} {globalDonation.donorLastName}</span>
                  <span className="block">{globalDonation.donorAddressLineAddress}</span>
                  <span className="block">{globalDonation.donorAddressCity}, {globalDonation.donorAddressState.toUpperCase()} {globalDonation.donorAddressPostalCode.toUpperCase()}</span>
                </address>
              </dd>
            </div>
            <div>
              { 
              
                (!loading && paymentMethod && paymentMethod.card) ?

                <div>
                  <dt className="font-medium text-gray-900">Payment Information</dt>
                  <dd className="mt-2 space-y-2 sm:flex sm:space-x-4 sm:space-y-0">
                    <div className="flex-none">
                      <div className="bg-blue-600 mt-1 py-1 px-1.5 rounded">
                        <p className="text-white text-xs font-semibold">{paymentMethod.card.brand}</p>
                      </div>
                    </div>
                    <div className="flex-auto">
                      <p className="text-gray-900">Ending with {paymentMethod.card.last4}</p>
                      <p>Expires {paymentMethod.card.exp_month} / {paymentMethod.card.exp_year}</p>
                    </div>
                  </dd>
                </div>

                : null
              }
            </div>
          </dl>

          { showLink && 
          
            <div className="mt-16 border-t border-gray-200 py-6 text-right">
              <Link href={`/receipts/${globalDonation.stripePaymentIntentId}`}>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View Tax Receipt
                  <span aria-hidden="true"> &rarr;</span>
                  </a>
              </Link>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

const ConfirmedProcessing: FC<{ globalDonation: Donation }> = ({ globalDonation }) => {

  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<Stripe.PaymentMethod | undefined>(undefined)
  const [showLink, setShowLink] = useState(false);

  const fetchPaymentMethod = async () => {
    const paymentMethodResponse = await callKinshipAPI<any>('/api/stripe/fetchPaymentMethod', {
      paymentMethodId: globalDonation.stripePaymentMethodId,
    })

    setPaymentMethod(paymentMethodResponse.data!);
    setLoading(false)
  }

  useEffect(()=>{
    fetchPaymentMethod() 

    const timeoutId = setTimeout(() => {
      setShowLink(true);
    }, 5000);

    // Cleanup function to clear the timeout in case the component unmounts before the timeout
    return () => clearTimeout(timeoutId);
  }, [globalDonation])


  return (
    <div>
      <div className="mx-auto">
        <div className="lg:col-start-2">
          <h1 className="text-sm font-medium text-blue-600">Thanks for donating!</h1>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-4xl">Your Donation Is Processing</p>
          <p className="mt-2 text-base text-gray-500">
            We appreciate your donation. In the next 2-5 business days, you should see a withdrawal from your account. As soon as we funds are received, you will be issued and emailed a {globalDonation.donorAddressCountry == "CA" ? "CRA-eligible tax " : "donation"} receipt.
            Once your donation has been distributed, you will also receive a letter containing proof of where your donation went.
          </p>

          <VerticalSpacer size={SpacerSize.Large} />
          
          <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
            <div className="flex justify-between">
              <dt>Total Donated</dt>
              <dd className="text-gray-900">${centsToDollars(globalDonation.amountDonatedInCents)}</dd>
            </div>

            <div className="flex justify-between">
              <dt>Status</dt>
              <dd className="text-gray-900 flex items-center content-center">
                <ClockIcon className="w-5 h-5 text-blue-600 mr-2" />
                Processing
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">Total Eligible On Tax Receipt</dt>
              <dd className="text-base">${centsToDollars(globalDonation.amountChargedInCents)}</dd>
            </div>
          </dl>

          <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
            <div>
              <dt className="font-medium text-gray-900">Donor Address</dt>
              <dd className="mt-2">
                <address className="not-italic">
                  <span className="block font-semibold">{globalDonation.donorFirstName} {globalDonation.donorLastName}</span>
                  <span className="block">{globalDonation.donorAddressLineAddress}</span>
                  <span className="block">{globalDonation.donorAddressCity}, {globalDonation.donorAddressState.toUpperCase()} {globalDonation.donorAddressPostalCode.toUpperCase()}</span>
                </address>
              </dd>
            </div>
            <div>
              { 
              
                (!loading && paymentMethod && paymentMethod.acss_debit) ?

                <div>
                  <dt className="font-medium text-gray-900">Payment Information</dt>
                  <dd className="mt-2 space-y-2 sm:space-y-0">
                    <div className="flex mb-2">
                      <div className="bg-blue-600 mt-1 py-1 px-1.5 rounded">
                        <p className="text-white text-xs font-semibold">{paymentMethod.acss_debit.bank_name}</p>
                      </div>
                    </div>
                    <div className="flex-auto">
                      <p className="text-gray-900">Account Number {paymentMethod.acss_debit.transit_number}</p>
                      <p>{paymentMethod.acss_debit.last4} / {paymentMethod.acss_debit.institution_number}</p>
                    </div>
                  </dd>
                </div>

                : null
              }
            </div>
          </dl>

          { showLink && 
          
            <div className="mt-16 border-t border-gray-200 py-6 text-right">
              <Link href={`/receipts/${globalDonation.stripePaymentIntentId}`}>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View Tax Receipt
                  <span aria-hidden="true"> &rarr;</span>
                  </a>
              </Link>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

const FurtherStepsRequired: FC<{ globalDonation: Donation }> = ({ globalDonation }) => {

  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<Stripe.PaymentMethod | undefined>(undefined)

  const fetchPaymentMethod = async () => {
    const paymentMethodResponse = await callKinshipAPI<any>('/api/stripe/fetchPaymentMethod', {
      paymentMethodId: globalDonation.stripePaymentMethodId,
    })

    setPaymentMethod(paymentMethodResponse.data);
    setLoading(false)
  }

  useEffect(()=>{
    fetchPaymentMethod() 
  }, [globalDonation])


  return (
    <div>
      <div className="mx-auto">
        <div className="lg:col-start-2">
          <h1 className="text-sm font-medium text-blue-600">Thanks for donating!</h1>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800 sm:text-4xl">Your Donation Requires Further Steps</p>
          <p className="mt-2 text-base text-gray-500">
            We appreciate your donation. Unfortunately, Stripe couldn&apos;t immediately verify your account. You will receive instructions in your email shortly on how to verify your bank account in order to complete this donation. For support, please reach out to <InlineLink href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} text={`${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}/>
          </p>

          <VerticalSpacer size={SpacerSize.Large} />
          
          <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
            <div className="flex justify-between">
              <dt>Total Donating</dt>
              <dd className="text-gray-900">${centsToDollars(globalDonation.amountDonatedInCents)}</dd>
            </div>

            <div className="flex justify-between">
              <dt>Further Steps Required</dt>
              <dd className="text-gray-900 flex items-center content-center">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 mr-2" />
                Instructions Emailed
              </dd>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
              <dt className="text-base">Total Eligible On Tax Receipt</dt>
              <dd className="text-base">${centsToDollars(globalDonation.amountChargedInCents)}</dd>
            </div>
          </dl>

          <dl className="mt-16 grid grid-cols-2 gap-x-4 text-sm text-gray-600">
            <div>
              <dt className="font-medium text-gray-900">Donor Address</dt>
              <dd className="mt-2">
                <address className="not-italic">
                  <span className="block font-semibold">{globalDonation.donorFirstName} {globalDonation.donorLastName}</span>
                  <span className="block">{globalDonation.donorAddressLineAddress}</span>
                  <span className="block">{globalDonation.donorAddressCity}, {globalDonation.donorAddressState.toUpperCase()} {globalDonation.donorAddressPostalCode.toUpperCase()}</span>
                </address>
              </dd>
            </div>
            <div>
              { 
              
                (!loading && paymentMethod && paymentMethod.acss_debit) ?

                <div>
                  <dt className="font-medium text-gray-900">Payment Information</dt>
                  <dd className="mt-2 space-y-2 sm:space-y-0">
                    <div className="flex mb-2">
                      <div className="bg-blue-600 mt-1 py-1 px-1.5 rounded">
                        <p className="text-white text-xs font-semibold">{paymentMethod.acss_debit.bank_name}</p>
                      </div>
                    </div>
                    <div className="flex-auto">
                      <p className="text-gray-900">Account Number {paymentMethod.acss_debit.transit_number}</p>
                      <p>{paymentMethod.acss_debit.last4} / {paymentMethod.acss_debit.institution_number}</p>
                    </div>
                  </dd>
                </div>

                : null
              }
            </div>
          </dl>

        </div>
      </div>
    </div>
  )
}


const Confirmation: FC<{ globalDonation: Donation, confirmationType: ConfirmationType }> = ({ globalDonation, confirmationType }) => {
    return (
        <div>
            {
                confirmationType == ConfirmationType.Unconfirmed ? "unconfirmed" :
                confirmationType == ConfirmationType.FurtherStepsRequired ? <FurtherStepsRequired globalDonation={globalDonation} /> :
                confirmationType == ConfirmationType.ConfirmedProcessing ? <ConfirmedProcessing globalDonation={globalDonation} /> :
                confirmationType == ConfirmationType.ConfirmedAndReceived ? <ConfirmedAndReceived globalDonation={globalDonation} /> : null
            }
        </div>
    )
}

export default Confirmation