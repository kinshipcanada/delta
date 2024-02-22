import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';
import { useState, useEffect, ReactNode, FC } from 'react';
import { callKinshipAPI, centsToDollars, supabase } from '../../lib/utils/helpers';
import { useRouter } from 'next/router';
import { Loading } from '../primitives/Loading';
import { LoadingColors } from '../primitives/types';
import { CenterOfPageBox } from '../primitives/Boxes';
import { Donor } from '@prisma/client';
import { Donation } from '@prisma/client';
import { CheckCircleIcon, ClockIcon, InformationCircleIcon, UserIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { AuthProvider } from './Authentication';
import { DonorApiResponse } from '@lib/classes/api';
import { Cause } from '@lib/classes/causes';

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [donor, setDonor] = useState<Donor>()
  const [donations, setDonations] = useState<Donation[]>([])
  const [authContextLoading, setAuthContextLoading] = useState<boolean>(true)
  const [authReloadStatus, triggerAuthReload] = useState<boolean>(false)
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false)
  const router = useRouter()

  const setupAuthContext = async () => {
    try {
      setAuthContextLoading(true)
      const loggedInUser = await supabase.auth.getUser();

      if (loggedInUser.data.user) {
        if (isApp) {
          const [donorResponse, donationsResponse] = await Promise.all([
            callKinshipAPI<Donor>("/api/v2/donor/fetch_profile", {
              id: loggedInUser.data.user.id,
            }),
            callKinshipAPI<Donation[]>('/api/v2/donor/fetch_donations', {
              email: loggedInUser.data.user.email,
            }),
          ]);
          
          if (donorResponse.data) {
            setDonor(donorResponse.data)
          }

          if (donationsResponse.data) {
            setDonations(donationsResponse.data)
          }
          
        } else {
          const donorResponse = await callKinshipAPI<Donor>("/api/v2/donor/fetch_profile", {
            id: loggedInUser.data.user.id,
          })
            
          
          if (donorResponse) {
            setDonor(donorResponse.data)
          }
        }
      } else {
        if (isApp) {
          setShouldRedirect(true)
          router.push("/auth/login")
        }
      }

      setAuthContextLoading(false)
    } catch (error) {
        // Log error
      console.error(error)
    }
  };

  useEffect(() => {
    setupAuthContext();
  }, [supabase, authReloadStatus]);

  const isApp = router.pathname == "/dashboard"

  return (
    <AuthProvider donor={donor} authReloadStatus={authReloadStatus} triggerAuthReload={triggerAuthReload} authContextLoading={authContextLoading}>
      <Head>
        <title>Kinship Canada</title>
      </Head>
      <main className="flex flex-col min-h-screen">
        <Navigation />
        { isApp ?

          <div className=''>
            {authContextLoading || shouldRedirect || !donor ? (
                <div className='p-48 flex-grow content-center items-center justify-center w-screen'>
                  <CenterOfPageBox>
                    <Loading color={LoadingColors.Blue} />
                  </CenterOfPageBox>
                </div>
              )

              :

              <div className='flex-grow'>
                  {children}
              </div>
            }
          </div>

          :

          children
          }
        <Footer />
      </main>
    </AuthProvider>
  )
}

export const DonationSummary = ({ globalDonation }: { globalDonation: Donation }) => {
  const generateDonationCausesString = (causes: Cause[]) => {
    let causesNames = []

    for (const cause of causes) { causesNames.push(cause.label) }

    return causesNames.join(", ")
  }

  return (
      <section
          aria-labelledby="summary-heading"
          className="bg-gray-50 py-12 text-slate-600 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pb-24 lg:pt-0"
        >
          <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
            <dl>
              <dt className="text-sm font-medium">Amount Donating</dt>
              <dd className="mt-1 mb-4 text-3xl font-bold tracking-tight text-slate-600">${globalDonation ? centsToDollars(globalDonation.amountDonatedInCents) : 0.00}</dd>
            </dl>

            <dl className="space-y-6 border-t border-slate-800 border-opacity-10 pt-6 text-sm font-medium">
              <div className="flex items-center justify-between">
                <dt>Tax Receipt Eligibility</dt>
                <dd>
                  {globalDonation.donorAddressCountry == "CA" ? (
                    <span className='flex items-center'>
                      <CheckCircleIcon className='w-5 h-5 text-green-500 mr-1' />
                      Eligible (issued immediately)
                    </span>
                  ) : (
                    <span className='flex items-center'>
                      <XCircleIcon className='w-5 h-5 text-red-500 mr-1' />
                      Ineligible (Tax Receipts only available in Canada)
                    </span>
                  )}
                </dd>
              </div>                  
               
              {globalDonation && (globalDonation.donorFirstName.length > 0 || globalDonation.donorLastName.length > 0) && (
                <div className="flex items-center justify-between">
                  <dt>Receipt Will Be Issued To</dt>
                  <dd className='flex items-center'>
                    <UserIcon className='w-5 h-5 text-blue-600 mr-1' />
                    {globalDonation.donorFirstName} {globalDonation.donorLastName}
                  </dd>
                </div>
              )}

              {/**
               * {globalDonation && (globalDonation.adheringLabels > 1) && (
                <div className="flex items-center justify-between">
                  <dt>Special Requests</dt>
                  {/* <dd>
                  FIX BEFORE DEPLOY
                    <span className='flex items-center'>
                      <InformationCircleIcon className='w-5 h-5 text-slate-600 mr-1' />
                      {generateDonationCausesString(globalDonation.adheringLabels)}
                    </span>
                  </dd> */}

              <div className="flex items-center justify-between">
                <dt>Credit Card Processing Fees</dt>
                <dd>${globalDonation ? centsToDollars(globalDonation.amountDonatedInCents * 0.029) : 0.00}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 border-opacity-10 pt-6 text-slate-600">
                <dt className="text-base">Total</dt>
                <dd className="text-base">${globalDonation ? centsToDollars(globalDonation.amountDonatedInCents * 0.029 + globalDonation.amountDonatedInCents) : 0.00}</dd>
              </div>
            </dl>
          </div>
      </section>
    )
}