function Ramadhan2() {
  return (
    <p>
      Ramadhan Poverty Relief Campaign
      Africa/India - we will divide them up equally. Please write names of marhum in the notes section below:

      Quran Recitation - $35.00 - Recited by those in need
      Salaat for 1 year - $205.00 - recited by sheiks
      Qadha Roza for 1 year $180.00 - by those in need including sheikhs
    </p>
  )
}

import { CheckCircleIcon } from "@heroicons/react/20/solid"
import Button from "../../components/primitives/Button"
import Link from "next/link"
import { ButtonSize, ButtonStyle } from "../../components/primitives/types"

const families = [
  {
    name: 'Family 1: Based in India',
    amount_needed: 10000,
    description: 'Will receive housing, a water pump, training and support to set up a small business (including a sewing machine for the wife) and school fees for their children for the year',
    amount_raised: 100,
    tax_receipt_eligible: true,
    receives: [
      'Housing',
      'Water Pump',
      'Sewing Machine',
      'Tuition Fees'
    ],
    imageSrc: "/campaigns/vision/8.jpeg",
    imageAlt: 'A family eating dinner together',
  }
]

function FamilyCard({ family }) {
    return (
      <Link href = '/donate'><a href={'/donate'}>
        <div
          className="grid grid-cols-1 text-sm sm:grid-cols-12 sm:grid-rows-1 sm:gap-x-6 md:gap-x-8 lg:gap-x-8"
        >
          <div className="sm:col-span-4 md:col-span-5 md:row-span-2 md:row-end-2">
            <div className="aspect-h-1 aspect-w-1 overflow-hidden rounded-lg bg-gray-50">
            <img src={family.imageSrc} alt={family.imageAlt} className="object-cover object-center" />
            </div>
            </div>
            <div className="mt-6 sm:col-span-7 sm:mt-0 md:row-end-1">
            <h3 className="text-lg font-medium text-gray-900">
            {family.name}
            </h3>
            <p className="mt-1 font-medium text-gray-900">Goal: ${(family.amount_needed).toFixed(2)} CAD</p>
          <p className="mt-3 text-gray-500">{family.description}</p>
        </div>
        <div className="sm:col-span-12 md:col-span-7">
        <dl className="grid grid-cols-1 gap-y-8 border-b border-gray-200 py-8 sm:grid-cols-2 sm:gap-x-6 sm:py-6 md:py-10">
        <div>
          <dt className="font-medium text-gray-900">Family will recieve</dt>
          <dd className="mt-3 text-gray-500">
            { family.receives.map((item) => (
              <span className="flex items-center">
                <CheckCircleIcon className="flex-shrink-0 w-4 h-4 text-green-500 mr-1" aria-hidden="true" />
                {item}
              </span>
            )) }
          </dd>
        </div>
        </dl>
        <p className="mt-6 font-medium text-gray-900 md:mt-5 flex items-center">
        <CheckCircleIcon className="flex-shrink-0 w-4 h-4 text-green-500 mr-1" aria-hidden="true" />
        Tax receipt eligible
        </p>
        </div>
        </div>
        </a>
      </Link>
    )
}

export default function Ramadhan() {

  return (
    <div className="bg-white">
      <main className="isolate">
        {/* Hero section */}
        <div className="relative isolate -z-10">
          <svg
            className="absolute inset-x-0 top-0 -z-10 h-[64rem] w-full stroke-gray-200 [mask-image:radial-gradient(32rem_32rem_at_center,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
              <path
                d="M-200 0h201v201h-201Z M600 0h201v201h-201Z M-400 600h201v201h-201Z M200 800h201v201h-201Z"
                strokeWidth={0}
              />
            </svg>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#1f932ae7-37de-4c0a-a8b0-a6e3b4d44b84)" />
          </svg>
          <div
            className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
            aria-hidden="true"
          >
            <div
              className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
              style={{
                clipPath:
                  'polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)',
              }}
            />
          </div>
          <div className="overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
              <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
                <div className="w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                  <p className="text-base font-semibold leading-7 text-blue-600">Campaign</p>
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    <span className="text-blue-600">Ramadhan</span>  &middot; Poverty Relief Campaign
                  </h1>
                  <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                    Kinship Canada&apos;s Ramadhan campaign aims to help those in need with your help by providing compensation for the recitation of the Holy Quran, observance of late fasts (Qadha Roza) and prayers on behalf of loved ones.
                  </p>
                  <div className="mt-8 space-y-2">
                    <CheckDetail title="Qur'an Recitation ($35 CAD)" />
                    <CheckDetail title="Salat For One Year Recited By Sheikhs ($205 CAD)" />
                    <CheckDetail title="Qadha Roza For One Year ($180 CAD)" />
                  </div>                      
                  <div className="mt-8">
                    <Button text="Make A Donation &rarr;" style={ButtonStyle.Primary} size={ButtonSize.Standard} href={"/donate"} />
                    <div className="inline-block ml-2" />
                  </div>
                </div>
                <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                  <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                    <div className="relative">
                      <img
                        src="/campaigns/vision/6.jpg"
                        alt=""
                        className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  </div>
                  <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                    <div className="relative">
                      <img
                        src="/campaigns/vision/7.png.webp"
                        alt=""
                        className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                    <div className="relative">
                      <img
                        src="/campaigns/vision/9.jpg"
                        alt=""
                        className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  </div>
                  <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                    <div className="relative">
                      <img
                        src="/campaigns/vision/10.jpg"
                        alt=""
                        className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                    <div className="relative">
                      <img
                        src="/campaigns/vision/11.jpg"
                        alt=""
                        className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <Example /> */}

        {/* Logo cloud */}


      </main>
    </div>
  )
}

export function CheckDetail({ title, description }) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <CheckCircleIcon className="w-5 h-5 text-green-600" aria-hidden="true" />
      </div>
      <div className="ml-3">
        <p className="text-base font-medium text-gray-900">{ title }</p>
        <p className="mt-1 text-base text-gray-500">
          { description }
        </p>
      </div>
    </div>
  )
}



import { CheckIcon } from '@heroicons/react/20/solid'
import { InlineLink } from "@components/primitives"

const includedFeatures = [
  'Private forum access',
  'Member resources',
  'Entry to annual conference',
  'Official member t-shirt',
]

export function Example() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What you can donate to</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            The following are the causes you can donate to this year with Kinship. To make a donation, <InlineLink href="/donate" text="click here" />.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Qadha </h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Lorem ipsum dolor sit amet consect etur adipisicing elit. Itaque amet indis perferendis blanditiis
              repellendus etur quidem assumenda.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">What’s included</h4>
              <div className="h-px flex-auto bg-gray-100" />
            </div>
            <ul
              role="list"
              className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6"
            >
              {includedFeatures.map((feature) => (
                <li key={feature} className="flex gap-x-3">
                  <CheckIcon className="h-6 w-5 flex-none text-indigo-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">Pay once, own it forever</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">$349</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">USD</span>
                </p>
                <a
                  href="#"
                  className="mt-10 block w-full rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get access
                </a>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Invoices and receipts available for easy company reimbursement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
