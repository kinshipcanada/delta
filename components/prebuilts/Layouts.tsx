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

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [donor, setDonor] = useState<Donor>(undefined)
  const [donations, setDonations] = useState<Donation[]>([])
  const [authContextLoading, setAuthContextLoading] = useState<boolean>(true)
  const [authReload, triggerAuthReload] = useState<boolean>(false)
  const [shouldRedirect, setShouldRedirect] = useState<boolean>(false)
  const router = useRouter()

  const setupAuthContext = async () => {
    try {
      setAuthContextLoading(true)
      const loggedInUser = await supabase.auth.getUser();

      if (loggedInUser.data.user) {
        if (isApp) {
          const [donorResponse, donationsResponse] = await Promise.all([
            callKinshipAPI('/api/donor/profile/fetch', {
              donor_id: loggedInUser.data.user.id,
            }),
            callKinshipAPI('/api/donor/donations/fetch', {
              donor_email: loggedInUser.data.user.email,
            }),
          ]);
  
          if (donorResponse.donor.set_up == false && router.pathname != '/app/setup') {
            setShouldRedirect(true); // Set the redirect state
            router.push('/app/setup');
            return
          } else {
            setDonor(donorResponse.donor)
            setDonations(donationsResponse.donations)
          }
        } else {
          const donorResponse = await callKinshipAPI('/api/donor/profile/fetch', {
            donor_id: loggedInUser.data.user.id,
          })
  
          setDonor(donorResponse.donor);
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
    if (!donor) {
      setupAuthContext();
    }
  }, [supabase, donor, authReload]);

  const isApp = router.pathname.split("/").length > 1 && router.pathname.split("/")[1] == "app"

  return (
    <AuthProvider donor={donor} triggerAuthReload={triggerAuthReload} donorDonations={donations} authContextLoading={authContextLoading}>
      <Head>
        <title>Kinship Canada</title>
      </Head>
      <main id="app" className="min-h-screen">
        <Navigation />
          { isApp ?

            <div>
              {authContextLoading || shouldRedirect || !donor ? (
                  <div className='flex min-h-screen'>
                    <CenterOfPageBox>
                      <Loading color={LoadingColors.Blue} />
                    </CenterOfPageBox>
                  </div>
                )

                :

                <div className="p-10 grid grid-cols-4 gap-12">
                  <AppNavigation adminEnabled={donor.admin} />
                  <div className="col-span-3">
                    { children }
                  </div>
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
  const generateDonationTypesString = (causes) => {
    const donationTypes = [];
  
    if (causes.is_sadaqah) {
      donationTypes.push("Sadaqah");
    }

    if (causes.is_imam_donation) {
      donationTypes.push("Sehme Imam");
    }
    
    if (causes.is_sadat_donation) {
      donationTypes.push("Sehme Sadat");
    }
    
    return donationTypes.join(", ");
  };

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

              {globalDonation && (globalDonation.causes.is_imam_donation == true || globalDonation.causes.is_sadat_donation == true || globalDonation.causes.is_sadaqah == true) && (
                <div className="flex items-center justify-between">
                  <dt>Special Requests</dt>
                  <dd>
                    <span className='flex items-center'>
                      <InformationCircleIcon className='w-5 h-5 text-slate-600 mr-1' />
                      {generateDonationTypesString(globalDonation.causes)}
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

const DonationFormWrapper = ({ children }) => (
    <section
        aria-labelledby="payment-and-shipping-heading"
        className="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pb-24 lg:pt-0"
        >
        <div>
            <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                { children }
            </div>
        </div>
    </section>
)

export function DonationPageLayout({ DonationForm, globalDonation }) {

  const donationChild = ({ donor, parentIsLoading}: { donor: Donor, parentIsLoading: boolean }) => {
    return (
      <div className="bg-white">
        <div className="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block" />
        <div className="fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 lg:block" />
  
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 lg:pt-16">
          <DonationSummary globalDonation={globalDonation} />
  
          <DonationFormWrapper>
            <DonationForm donor = {donor} parentIsLoading={parentIsLoading} />
          </DonationFormWrapper>
        </div>
      </div>
    )
  }

  return (
    <GenericPageLayout ChildPage={donationChild} />
  );
}
  
// Opinionated dynamic user rendering - comment on this
export function GenericPageLayout({ ChildPage }) {
  const [loading, setLoading] = useState(null);
  const [donor, setDonor] = useState(null);

  const fetchUser = async () => {
    setLoading(true)
    try {
      const loggedInUser = await supabase.auth.getUser();

      if (loggedInUser.data.user) {
        const donorResponse = await callKinshipAPI('/api/donor/profile/fetch', {
        donor_id: loggedInUser.data.user.id,
      })

      setDonor(donorResponse.donor);
    }
    } catch (error) {
      // Log error
      console.error(error)
    }

    setLoading(false)
    return
  };

  useEffect(() => {
    if (!donor) {
      fetchUser();
    }
  }, [supabase, donor]);

  return (
    <ChildPage donor={donor} parentIsLoading={loading} />
  );
}
