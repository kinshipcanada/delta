import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Country } from "@prisma/client";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { parseFrontendDate } from "@lib/utils/helpers";
import Head from "next/head";
import Link from "next/link";
import { Loading, LoadingColors } from "@components/primitives";

interface DonationData {
  id: string;
  donor_name: string;
  email: string;
  amount_charged_cents: number;
  date: string;
  line_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  stripe_charge_id?: string;
  status: string;
}

const LoadingState = () => (
  <div className="flex content-center justify-center m-16" role="status">
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Loading color={LoadingColors.Blue} />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">Loading receipt...</h3>
        </div>
      </div>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex content-center justify-center m-16" role="alert">
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error loading receipt</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AdminReceipt: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [donation, setDonation] = useState<DonationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchReceipt(id);
    }
  }, [id]);

  const fetchReceipt = async (receiptId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/receipt/${receiptId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch receipt');
      }

      setDonation(data.donation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load receipt');
      console.error('Error fetching receipt:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!donation) {
    return <ErrorState message="Receipt not found" />;
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12">
      <Head>
        <title>Admin: {donation.donor_name}&apos;s tax receipt - Kinship Canada</title>
        <meta name="description" content={`Admin view of tax receipt for donation made by ${donation.donor_name}`} />
      </Head>

      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
              {donation.donor_name}&apos;s receipt from {parseFrontendDate(donation.date)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Admin View</p>
          </div>
        </div>

        <main className="mt-8 bg-white overflow-hidden border border-gray-400 rounded-lg divide-y divide-gray-300">
          <div className="px-4 py-5 sm:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold leading-7 text-gray-900 sm:text-2xl mb-2">
                Official Receipt{donation.country === Country.CA ? " For Income Tax Purposes" : ""}
              </h2>
              <p className="font-medium text-gray-700 mb-1">Kinship Canada is a registered charity</p>
              <p className="font-medium text-gray-700">Registration Number 855070728 RR 0001</p>
              <p className="font-medium text-gray-700">Date Of Donation: {parseFrontendDate(donation.date)}</p>
              <p className="font-medium text-gray-700">Payment Method: {donation.stripe_charge_id ? "Credit Card" : "E-Transfer"}</p>
              <p className="font-medium text-gray-700">Status: <span className="capitalize">{donation.status?.toLowerCase()}</span></p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-700 mb-1">Signed By Vice President</p>
              <img 
                src="/signature.png" 
                className="w-12 ml-auto" 
                alt="Vice President's Signature"
                width={48}
                height={48}
              />
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <p className="font-medium text-gray-800 mb-4">
              Thank you for donating with Kinship Canada. This is your {donation.country === Country.CA ? "CRA-Eligible Tax" : "Donation"} Receipt. 
              You donated a total amount of ${(donation.amount_charged_cents/100).toFixed(2)} CAD.
            </p>

            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-800">
                  <span className="font-bold">Location Issued: </span>
                  43 Matson Drive, Bolton, Ontario, L7E0B1, Canada
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Donor Details</h3>
                <p className="font-medium text-gray-800">
                  <span className="font-bold">Donor Name: </span>
                  {donation.donor_name}
                </p>
                <p className="font-medium text-gray-800">
                  <span className="font-bold">Donor Email: </span>
                  {donation.email}
                </p>
                <p className="font-medium text-gray-800">
                  <span className="font-bold">Donor Address: </span>
                  {donation.line_address}, {donation.city}, {donation.state}, {donation.postal_code}, {donation.country === "CA" ? "Canada" : donation.country}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Donation Details</h3>
                <p className="font-medium text-gray-800">
                  <span className="font-bold">Donation ID: </span>
                  {donation.id}
                </p>
                <p className="font-medium text-gray-800">
                  <span className="font-bold">Total Amount Donated: </span>
                  ${(donation.amount_charged_cents/100).toFixed(2)}
                </p>
                {donation.country === Country.CA && (
                  <p className="font-medium text-gray-800">
                    <span className="font-bold">Total Amount Eligible: </span>
                    ${(donation.amount_charged_cents/100).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="mt-4 text-center text-base">
          <p>
            Valid with the Canada Revenue Agency ·{' '}
            <Link 
              href="https://www.canada.ca/en/revenue-agency.html" 
              className="text-blue-600 hover:text-blue-800 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.canada.ca/en/revenue-agency.html
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AdminReceipt; 