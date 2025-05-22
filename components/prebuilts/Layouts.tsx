import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';
import { useState, useEffect, ReactNode, FC } from 'react';
import { callKinshipAPI, centsToDollars, supabase } from '../../lib/utils/helpers';
import { useRouter } from 'next/router';
import { Loading } from '../primitives/Loading';
import { LoadingColors } from '../primitives/types';
import { CenterOfPageBox } from '../primitives/Boxes';
import { donor } from '@prisma/client';
import { donation } from '@prisma/client';
import { CheckCircleIcon, ClockIcon, InformationCircleIcon, UserIcon, XCircleIcon } from '@heroicons/react/20/solid';
import { AuthProvider } from './Authentication';
import { Cause } from '@lib/classes/causes';

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const [donor, setDonor] = useState<donor>()
  const [donations, setDonations] = useState<donation[]>([])
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
            callKinshipAPI<donor>("/api/v2/donor/fetch_profile", {
              id: loggedInUser.data.user.id,
            }),
            callKinshipAPI<donation[]>('/api/v2/donor/fetch_donations', {
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
          const donorResponse = await callKinshipAPI<donor>("/api/v2/donor/fetch_profile", {
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