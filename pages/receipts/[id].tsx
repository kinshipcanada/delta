import React from "react";
import type { GetServerSideProps } from "next";
import prisma from '../../lib/prisma'
import { Country, donation } from "@prisma/client";
import { XCircleIcon } from "@heroicons/react/24/outline";
import { parseFrontendDate } from "@lib/utils/helpers";
import Head from "next/head";
import Link from "next/link";
import { Loading, LoadingColors } from "@components/primitives";

export const getServerSideProps: GetServerSideProps = async (context) => {
    const id = context.query.id as string
    const isStripeId = id.startsWith("pi_") || id.startsWith("ch_")

    try {
        // Fetch the donation directly from Prisma
        const donation = await prisma.donation.findUnique({
            where: {
                id: id
            }
        });

        return {
            props: { 
                isGenerating: isStripeId,
                donation: donation ? JSON.parse(JSON.stringify(donation)) : null
            }
        }
    } catch (error) {
        console.error('Error fetching donation:', error);
        return {
            props: { 
                isGenerating: isStripeId,
                donation: null
            }
        }
    }
};

type Props = {
  isGenerating: boolean,
  donation?: donation
}

const Receipt: React.FC<Props> = (props) => {
  console.log(props)
  if (!props.donation && !props.isGenerating) {
    return (
      <div className="flex content-center justify-center m-16">
          <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                  <div className="flex-shrink-0">
                      <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error fetching your receipt.</h3>
                  <div className="mt-2 text-sm text-red-700">
                      <p>Something went wrong in fetching the receipt. Please try again in 5 minutes. If the issue persists, contact us at info@kinshipcanada.com</p>
                  </div>
                  </div>
              </div>
          </div>
      </div>
    )
  } else if (props.isGenerating) {
    return (
      <div className="flex content-center justify-center m-16">
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
    )
  } else {
    const receipt = props.donation!
    return (
      <div className = 'w-screen h-screen sm:p-12 p-8'>
        <Head>
            <title>{receipt.donor_name}&apos;s tax receipt</title>
        </Head>
        <div className="md:flex md:items-center md:justify-between flex">
            <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">{receipt.donor_name}&apos;s receipt from {parseFrontendDate(receipt.date)}</h2>
            </div>
            <div className="sm:mt-4 flex md:mt-0 md:ml-4">
                {/* <SecondaryButton iconLeft={DocumentIcon} text = "Download PDF" link = "/" /> */}
            </div>
        </div>

        <main className="mt-8 bg-white overflow-hidden border border-gray-400 rounded-lg divide-y divide-gray-300">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
                <h1 className = 'text-xl font-bold leading-7 text-gray-900 sm:text-2xl sm:truncate mb-2'>
                    Official Receipt{receipt.country === Country.CA ? " For Income Tax Purposes" : ""}
                </h1>
                <p className="font-medium text-gray-700 mb-1">Kinship Canada is a registered charity</p>
                <p className="font-medium text-gray-700">Registration Number 855070728 RR 0001</p>
                <p className="font-medium text-gray-700">Date Of Donation: {parseFrontendDate(receipt.date)}</p>
            </div>
            <div>
                <p className="font-medium text-gray-700 mb-1">Signed By Vice President</p>
                <img src = '/signature.png' className = 'w-12' />
            </div>
        </div>
        <div className="px-4 py-5 sm:p-6">
            <p className="font-medium text-gray-800 mb-2">Thank you for donating with Kinship Canada. This is your {receipt.country == Country.CA ? "CRA-Eligible Tax" : "Donation"} Receipt. You donated a total amount of ${(receipt.amount_charged_cents/100).toFixed(2)} CAD.</p>
            {/* <span className = 'flex mb-1'>
                <p  className="font-bold text-gray-800  mr-1">{(id as string).substring(0, 3) == "pi_" ? "Payment ID" : (id as string).substring(0,3) == "ch_" ? "Payment ID" : "Kinship Receipt ID"}:</p> 
                <p className="font-medium text-gray-800">{id}</p>
            </span> */}
            <span className = 'flex mb-1'>
                <p  className="font-bold text-gray-800 mr-1">Location Issued: </p>
                <p className="font-medium text-gray-800 mb-1">43 Matson Drive, Bolton, Ontario, L7E0B1, Canada</p>
            </span>

            <h2 className="mb-2 mt-3 text-md font-bold leading-7 text-gray-900 sm:text-lg sm:truncate">Donor Details</h2>
            <span className = 'flex mb-1'>
                <p  className="font-bold text-gray-800 mr-1">Donor Name:</p>
                <p className="font-medium text-gray-800 mb-1">{receipt.donor_name}</p>
            </span>
            <span className = 'flex mb-1'>
                <p  className="font-bold text-gray-800 mr-1">Donor Address: </p>
                <p className="font-medium text-gray-800 mb-1">{receipt.line_address}{', '}{receipt.city}{', '}{receipt.state}{', '}{receipt.postal_code}{', '}{receipt.country == "CA" ? "Canada": receipt.country}</p>
            </span>

            <h2 className="mb-2 mt-3 text-md font-bold leading-7 text-gray-900 sm:text-lg sm:truncate">Donation Details</h2>
            <span className = 'flex mb-1'>
                <p  className="font-bold text-gray-800 mr-1">Total Amount Donated:</p>
                <p className="font-medium text-gray-800 mb-1">${(receipt.amount_charged_cents/100).toFixed(2)}</p>
            </span>
            {receipt.country == Country.CA && (
                <span className = 'flex mb-1'>
                    <p  className="font-bold text-gray-800 mr-1">Total Amount Eligible: </p>
                    <p className="font-medium text-gray-800 mb-1">${receipt.country == Country.CA ? (receipt.amount_charged_cents/100).toFixed(2) : '0.00'}</p>
                </span>
            )}
        </div>
        </main>
        <div className = 'mt-4 flex w-full text-center justify-center text text-base'>Valid with the Canada Revenue Agency ·{' '} <Link href = 'https://www.canada.ca/en/revenue-agency.html'><a className = 'ml-2 text-blue-600'>https://www.canada.ca/en/revenue-agency.html</a></Link></div>
    </div>
    );
  }
};

export default Receipt;