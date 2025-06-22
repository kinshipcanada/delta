import React from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import prisma from '../../lib/prisma'
import { Country, donation, status_enum } from "@prisma/client";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { parseFrontendDate, supabase } from "@lib/utils/helpers";
import Head from "next/head";
import Link from "next/link";
import { Loading, LoadingColors } from "@components/primitives";
import { useAuth } from "@components/prebuilts/Authentication";
import { createServerClient } from '@supabase/ssr';

type Props = {
    isGenerating: boolean;
    donation: donation | null;
    error?: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
    try {
        // Create authenticated Supabase client
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get: (name) => context.req.cookies[name],
                    set: (name, value) => {
                        context.res.setHeader('Set-Cookie', `${name}=${value}; Path=/`);
                    },
                    remove: (name) => {
                        context.res.setHeader('Set-Cookie', `${name}=; Path=/; Max-Age=0`);
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return {
                redirect: {
                    destination: "/auth/login",
                    permanent: false,
                },
            };
        }

        const id = context.query.id as string;
        if (!id) {
            return { props: { isGenerating: false, donation: null, error: "Invalid receipt ID" } };
        }

        const isStripeId = id.startsWith("pi_") || id.startsWith("ch_");

        // Fetch the donation from the database
        const donation = await prisma.donation.findFirst({
            where: {
                OR: [
                    { id },
                    { stripe_charge_id: id }
                ],
                AND: {
                    email: session.user.email // Only allow access to own receipts
                }
            }
        });

        // Determine if receipt is still generating:
        // - For Stripe donations: if no donation found or status is PROCESSING
        // - For e-transfer donations: if donation exists but status is PROCESSING
        let isGenerating = false;
        if (isStripeId) {
            // Stripe donation - could still be processing if not found or status is PROCESSING
            isGenerating = !donation || donation.status === status_enum.PROCESSING;
        } else if (donation) {
            // E-transfer donation - only generating if status is PROCESSING
            isGenerating = donation.status === status_enum.PROCESSING;
        }

        return {
            props: {
                isGenerating,
                donation: donation ? JSON.parse(JSON.stringify(donation)) : null,
            },
        };
    } catch (error) {
        console.error('Error fetching receipt:', error);
        return {
            props: {
                isGenerating: false,
                donation: null,
                error: "Failed to fetch receipt"
            }
        };
    }
};

const LoadingState = () => (
    <div className="flex content-center justify-center m-16" role="status">
        <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <Loading color={LoadingColors.Blue} />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Loading...</h3>
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
                    <h3 className="text-sm font-medium text-red-800">Error fetching your receipt</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>{message}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const GeneratingState = () => (
    <div className="flex content-center justify-center m-16" role="status">
        <div className="rounded-md bg-blue-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <Loading color={LoadingColors.Blue} />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Your Receipt Is Generating...</h3>
                    <div className="mt-2 text-sm text-blue-700">
                        <p>We&apos;re in the process of generating your tax receipt. You&apos;ll receive an email shortly once it&apos;s ready!</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Receipt: React.FC<Props> = ({ isGenerating, donation, error }) => {
    const { donor, authContextLoading } = useAuth();
    const router = useRouter();

    if (authContextLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    if (isGenerating) {
        return <GeneratingState />;
    }

    if (!donation) {
        const id = router.query.id as string;
        const isStripeId = id?.startsWith("pi_") || id?.startsWith("ch_");
        
        const errorMessage = isStripeId 
            ? "We couldn't find a receipt with this ID. If you just made a donation, please wait a few minutes and try again."
            : "We couldn't find a receipt with this ID. For e-transfer donations, receipts are generated within 1-2 business days after we receive your transfer.";
            
        return <ErrorState message={errorMessage} />;
    }

    return (
        <div className="min-h-screen p-4 sm:p-8 md:p-12">
            <Head>
                <title>{donation.donor_name}&apos;s tax receipt - Kinship Canada</title>
                <meta name="description" content={`Tax receipt for donation made by ${donation.donor_name}`} />
            </Head>

            <div className="max-w-4xl mx-auto">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                            {donation.donor_name}&apos;s receipt from {parseFrontendDate(donation.date)}
                        </h1>
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
                                    <span className="font-bold">Donor Address: </span>
                                    {donation.line_address}, {donation.city}, {donation.state}, {donation.postal_code}, {donation.country === "CA" ? "Canada" : donation.country}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Donation Details</h3>
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

export default Receipt;