import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';
import { AppNavigation } from './app/Navigation';
import { useState, useEffect, ReactNode, FC } from 'react';
import { callKinshipAPI, centsToDollars, supabase } from '../../lib/utils/helpers';
import { useRouter } from 'next/router';
import { Loading } from '../primitives/Loading';
import { LoadingColors } from '../primitives/types';
import { CenterOfPageBox } from '../primitives/Boxes';
import { Donor } from '../../lib/classes/donor';
import { Donation } from '../../lib/classes/donation';
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
            callKinshipAPI<Donor>('/api/donor/profile/fetch', {
              donor_id: loggedInUser.data.user.id,
            }),
            callKinshipAPI<Donation[]>('/api/donor/donations/fetch', {
              donor_email: loggedInUser.data.user.email,
            }),
          ]);
          
          if (donorResponse.data) {
            if (donorResponse.data!.set_up == false && router.pathname != '/app/setup') {
              setShouldRedirect(true); // Set the redirect state
              router.push('/app/setup');
              return
            } else {
              setDonor(donorResponse.data)
            }
          }

          if (donationsResponse.data) {
            setDonations(donationsResponse.data)
          }
          
        } else {
          const donorResponse: DonorApiResponse = await callKinshipAPI<Donor>('/api/donor/profile/fetch', {
            donor_id: loggedInUser.data.user.id,
          })

          if (donorResponse.error) {
            console.error("Something went wrong loading this donor")
          } else {
            setDonor(donorResponse.data);
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

  const isApp = router.pathname.split("/").length > 1 && router.pathname.split("/")[1] == "app"

  return (
    <AuthProvider donor={donor} authReloadStatus={authReloadStatus} triggerAuthReload={triggerAuthReload} donorDonations={donations} authContextLoading={authContextLoading}>
      <Head>
        <title>Kinship Canada</title>
      </Head>
      <main className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex-grow">
          <main>
            { isApp ?

            <div className=''>
              {authContextLoading || shouldRedirect || !donor ? (
                  <div className='py-64 content-center items-center justify-center w-screen'>
                    <CenterOfPageBox>
                      <Loading color={LoadingColors.Blue} />
                    </CenterOfPageBox>
                  </div>
                )

                :

                <div className='flex-grow'>
                  <div className="p-10 grid grid-cols-4 gap-12">
                    <AppNavigation adminEnabled={donor.admin} />
                    <div className="col-span-3">
                      {children}
                    </div>
                  </div>
                </div>
              }
            </div>

            :

            <div className='flex-grow'>
              { children }
            </div>
            }
          </main>
        </div>
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
              <dd className="mt-1 mb-4 text-3xl font-bold tracking-tight text-slate-600">${globalDonation ? centsToDollars(globalDonation.amount_in_cents) : 0.00}</dd>
            </dl>

            <dl className="space-y-6 border-t border-slate-800 border-opacity-10 pt-6 text-sm font-medium">
              <div className="flex items-center justify-between">
                <dt>Tax Receipt Eligibility</dt>
                <dd>
                  {globalDonation && globalDonation.donor ? (
                    <span className='flex items-center'>
                      {globalDonation.donor.address.country.toLowerCase() === "ca" ? (
                        <>
                          <CheckCircleIcon className='w-5 h-5 text-green-500 mr-1' />
                          Eligible (issued immediately)
                        </>
                      ) : (
                        <>
                          <XCircleIcon className='w-5 h-5 text-red-500 mr-1' />
                          Ineligible
                        </>
                      )}
                    </span>
                  ) : (
                    <span className='flex items-center'>
                      <ClockIcon className='w-5 h-5 text-slate-500 mr-1' />
                      Pending (eligibility is based on region)
                    </span>
                  )}
                </dd>
              </div>                  
               
              <div className="flex items-center justify-between">
                <dt>Receipt Will Be Issued To</dt>
                <dd className='flex items-center'>
                  <UserIcon className='w-5 h-5 text-blue-600 mr-1' />
                  {globalDonation && globalDonation.donor ? `${globalDonation.donor.first_name} ${globalDonation.donor.last_name}` : ""}
                </dd>
              </div>

              {globalDonation && (globalDonation.causes.length > 1) && (
                <div className="flex items-center justify-between">
                  <dt>Special Requests</dt>
                  <dd>
                    <span className='flex items-center'>
                      <InformationCircleIcon className='w-5 h-5 text-slate-600 mr-1' />
                      {generateDonationCausesString(globalDonation.causes)}
                    </span>
                  </dd>
                </div>
              )}

              
              <div className="flex items-center justify-between">
                <dt>Credit Card Processing Fees</dt>
                <dd>${globalDonation ? centsToDollars(globalDonation.amount_in_cents * 0.029) : 0.00}</dd>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 border-opacity-10 pt-6 text-slate-600">
                <dt className="text-base">Total</dt>
                <dd className="text-base">${globalDonation ? centsToDollars(globalDonation.amount_in_cents * 0.029 + globalDonation.amount_in_cents) : 0.00}</dd>
              </div>
            </dl>
          </div>
      </section>
    )
}