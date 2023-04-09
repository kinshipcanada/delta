import { DocumentIcon } from "@heroicons/react/24/outline"
import { CheckCircleIcon } from "@heroicons/react/20/solid"
import { PrimaryButton, SecondaryButton } from "../../components/core/Buttons"
import Link from "next/link"

const stats = [
  { label: 'Transactions every 24 hours', value: '44 million' },
  { label: 'Assets under holding', value: '$119 trillion' },
  { label: 'New users annually', value: '46,000' },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


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
                  <div className="mt-6">
                    <div className="overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `calc((${family.amount_raised} / ${family.amount_needed}))` }}
                      />
                    </div>
                    <div className="mt-6 font-medium text-gray-600">
                      <div className="text-blue-600">Raised: ${(family.amount_raised).toFixed(2)} CAD / ${(family.amount_needed).toFixed(2)} CAD Goal</div>
                    </div>
                  </div>
                </div>
              </div>
              </a>
              </Link>
          
    )
}

export default function Vision() {

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
                    <span className="text-blue-600">Vision Kinship</span>  &middot; The Path To Self Sufficiency
                  </h1>
                  <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
                    Vision Kinship is a campaign designed to <b>break the cycle of poverty.</b> We provide comprehensive support, care, 
                    and guidance to recipients, with a program designed to help them achieve self-sufficiency. To lift them out of poverty,
                    the donation package includes:
                  </p>
                  <div className="mt-8 space-y-2">
                    <CheckDetail title="Housing, if needed" />
                    <CheckDetail title="Food and medical stipend" />
                    <CheckDetail title="Small business supplies and training" />
                    <CheckDetail title="Tuition and book stipend" />
                  </div>                      
                  <div className="mt-8">
                    <PrimaryButton link = "/donate" text = "Make A Donation &rarr;" />
                    <div className="inline-block ml-2" />
                    <SecondaryButton download={true} link = "/papers/vision.pdf" fileName={"Vision Kinship: The Path To Self Sufficiency"} iconRight={DocumentIcon} text = "Download Full Vision Paper" />
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

        {/* Content section */}
        <div className="mx-auto -mt-12 max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What is Vision Kinship about?</h2>
            <div className="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
              <div className="lg:w-full lg:max-w-2xl lg:flex-auto">
                <p className="text-xl leading-8 text-gray-600">
                  Poverty is a never ending cycle, and it is hard to break out of it. We want to help people break out of
                  this cycle by providing them with the tools they need to succeed. We believe that each and every person has 
                  what it takes to support them and their family, and with your help our goal is to give them the necessary 
                  foundation and support to do so.
                </p>
                <div className="mt-10 max-w-xl text-base leading-7 text-gray-700">
                  {/* <p>
                    Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris semper sed
                    amet vitae sed turpis id. Id dolor praesent donec est. Odio penatibus risus viverra tellus varius
                    sit neque erat velit. Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim.
                    Mattis mauris semper sed amet vitae sed turpis id.
                  </p>
                  <p className="mt-10">
                    Et vitae blandit facilisi magna lacus commodo. Vitae sapien duis odio id et. Id blandit molestie
                    auctor fermentum dignissim. Lacus diam tincidunt ac cursus in vel. Mauris varius vulputate et
                    ultrices hac adipiscing egestas. Iaculis convallis ac tempor et ut. Ac lorem vel integer orci.
                  </p> */}
                </div>
              </div>
              <div className="lg:flex lg:flex-auto lg:justify-center">
                <dl className="w-64 space-y-8 xl:w-80">
                  {/* {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse gap-y-4">
                      <dt className="text-base leading-7 text-gray-600">{stat.label}</dt>
                      <dd className="text-5xl font-semibold tracking-tight text-gray-900">{stat.value}</dd>
                    </div>
                  ))} */}
                  <img src = '/campaigns/vision/infographic.jpeg' className="rounded-lg" />
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <DownloadPaperCTA />


        {/* Families section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-48 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Families We Are Supporting</h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              In order to ensure that we are providing the best possible support to our families, we will focus on a small number of 
              families at a time. Our team and grassroots partners will work closely with each family to ensure that they are receiving
              the support they need to succeed.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 max-w-2xl gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none"
          >
            {families.map((family) => (
              <FamilyCard 
                key = {family.name}
                family = {family} 
              />
            ))}
          </ul>
        </div>

        <div className="space-y-24">
          </div>



        {/* Logo cloud */}
        <div className="relative isolate -z-10 mt-32 sm:mt-48">
          <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden [mask-image:radial-gradient(50%_45%_at_50%_55%,white,transparent)]">
            <svg className="h-[40rem] w-[80rem] flex-none stroke-gray-200" aria-hidden="true">
              <defs>
                <pattern
                  id="e9033f3e-f665-41a6-84ef-756f6778e6fe"
                  width={200}
                  height={200}
                  x="50%"
                  y="50%"
                  patternUnits="userSpaceOnUse"
                  patternTransform="translate(-100 0)"
                >
                  <path d="M.5 200V.5H200" fill="none" />
                </pattern>
              </defs>
              <svg x="50%" y="50%" className="overflow-visible fill-gray-50">
                <path d="M-300 0h201v201h-201Z M300 200h201v201h-201Z" strokeWidth={0} />
              </svg>
              <rect width="100%" height="100%" strokeWidth={0} fill="url(#e9033f3e-f665-41a6-84ef-756f6778e6fe)" />
            </svg>
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">
              Backed By Partners On The Ground
            </h2>
            <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-3 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              <img
                className="col-span-2 max-h-24 w-full object-contain lg:col-span-1"
                src="/partner-logos/desk-and-chair.png"
                alt="Transistor"
                width={158}
                height={48}
              />
              <img
                className="col-span-2 max-h-24 w-full object-contain lg:col-span-1"
                src="/logo-full-size.png"
                alt="Reform"
                width={158}
                height={48}
              />
              <img
                className="col-span-2 max-h-24 w-full object-contain lg:col-span-1"
                src="/partner-logos/al-imam.png"
                alt="Tuple"
                width={158}
                height={48}
              />
            </div>
          </div>
        </div>



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

export function DownloadPaperCTA() {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-white px-6 pt-16 shadow-xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#38BDF9" />
                <stop offset={1} stopColor="#38BDF9" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
              Download our vision paper
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-800">
              If you&apos;d like to learn more about our vision, you can download our vision paper where we 
              lay out in depth how exactly we plan to help each family.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <SecondaryButton download={true} link = "/papers/vision.pdf" fileName={"Vision Kinship: The Path To Self Sufficiency"} iconRight={DocumentIcon} text = "Download Full Vision Paper" />
            </div>
          </div>
          <div className="relative mt-16 h-80 lg:mt-8">
            <img
              className="absolute left-0 top-0 w-[57rem] max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              src="/campaigns/vision/paper.png"
              alt="Infographic"
              width={1824}
              height={'auto'}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
