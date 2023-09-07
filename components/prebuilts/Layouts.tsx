import Head from 'next/head';
import Navigation from './Navigation';
import Footer from './Footer';
import { AppNavigation } from './app/Navigation';
import { useState, useEffect, ReactNode } from 'react';
import { callKinshipAPI, supabase } from '../../system/utils/helpers';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { Loading } from '../primitives/Loading';
import { LoadingColors } from '../primitives/types';
import { CenterOfPageBox } from '../primitives/Boxes';
import { Donor } from '../../system/classes/donor';
import { Donation } from '../../system/classes/donation';

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
        setAdminEnabled(donorResponse.donor.admin);
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


const products = [
  {
    id: 1,
    name: 'High Wall Tote',
    href: '#',
    price: '$210.00',
    color: 'White and black',
    size: '15L',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/checkout-page-07-product-01.jpg',
    imageAlt: 'Front of zip tote bag with white canvas, white handles, and black drawstring top.',
  },
  // More products...
]

const DonationSummary = ({ globalDonation }: { globalDonation: Donation }) => {
    return (
        <section
            aria-labelledby="summary-heading"
            className="bg-indigo-900 py-12 text-indigo-300 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pb-24 lg:pt-0"
          >
            <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
            <dl>
                <dt className="text-sm font-medium">Amount due</dt>
                <dd className="mt-1 text-3xl font-bold tracking-tight text-white">${globalDonation ? globalDonation.amount_in_cents : 0}.00</dd>
              </dl>
  
              <ul role="list" className="divide-y divide-white divide-opacity-10 text-sm font-medium">
                {products.map((product) => (
                  <li key={product.id} className="flex items-start space-x-4 py-6">
                    <img
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      className="h-20 w-20 flex-none rounded-md object-cover object-center"
                    />
                    <div className="flex-auto space-y-1">
                      <h3 className="text-white">{product.name}</h3>
                      <p>{product.color}</p>
                      <p>{product.size}</p>
                    </div>
                    <p className="flex-none text-base font-medium text-white">{product.price}</p>
                  </li>
                ))}
              </ul>
  
              <dl className="space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium">
                <div className="flex items-center justify-between">
                  <dt>Subtotal</dt>
                  <dd>$570.00</dd>
                </div>
  
                <div className="flex items-center justify-between">
                  <dt>Shipping</dt>
                  <dd>$25.00</dd>
                </div>
  
                <div className="flex items-center justify-between">
                  <dt>Taxes</dt>
                  <dd>$47.60</dd>
                </div>
  
                <div className="flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">$6s242.60</dd>
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
        <div className="fixed right-0 top-0 hidden h-full w-1/2 bg-indigo-900 lg:block" />
  
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
