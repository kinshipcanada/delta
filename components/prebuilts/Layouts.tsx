import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';
import { AppNavigation } from './app/Navigation';
import { useState, useEffect } from 'react';
import { callKinshipAPI, supabase } from '../../system/utils/helpers';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { Loading } from '../primitives/Loading';
import { LoadingColors } from '../primitives/types';
import { CenterOfPageBox } from '../primitives/Boxes';

export const Layout = ({ children }) => (
  <>
    <Head>
      <title>Kinship Canada</title>
    </Head>
    <main id="app" className="min-h-screen">
      <Navigation />
        { children }
      <Footer />
    </main>
  </>
);

export function AppLayout({ AppPage }) {
  const router = useRouter();
  const [donor, setDonor] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminEnabled, setAdminEnabled] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false); // New state

  const fetchUser = async () => {
    try {
      const loggedInUser = await supabase.auth.getUser();
      if (loggedInUser) {
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
        } else {
          setShouldRedirect(false);
        }
        setDonor(donorResponse.donor);
        setDonations(donationsResponse.donations);
        setAdminEnabled(donorResponse.donor.admin_enabled);
      } else {
        router.push('/auth/login');
      }
    } catch (error) {
      toast.error(error.message, { position: 'top-right' });
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!donor) {
      fetchUser();
    }
  }, [supabase, donor]);

  if (shouldRedirect) return null; // Don't render anything if we should redirect

  return (
    <div className="p-10 grid grid-cols-4 gap-12">
      <AppNavigation adminEnabled={adminEnabled} />
      <div className="col-span-3">
        {(loading || !donor) ? (
          <CenterOfPageBox>
            <Loading color={LoadingColors.Blue} />
          </CenterOfPageBox>
        ) : (
          <AppPage donor={donor} donations={donations} parentIsLoading={loading} />
        )}
      </div>
    </div>
  );
}
