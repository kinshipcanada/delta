import { ArrowRightIcon } from "@heroicons/react/20/solid"
import { PrimaryButton, SecondaryButton } from '../components/core/Buttons';
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  HeartIcon,
  HomeModernIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import * as React from "react";

let Globe = () => null;
if (typeof window !== "undefined") Globe = require("react-globe.gl").default;

export default function Index() {
  return (
    <div>
      <Hero />
      <Incentives />
      <Causes />
      <Partners />
      <CTA />
    </div>
  );
}

export function Hero() {

  const [imageUrl, setImageUrl] = React.useState("/images/texture.png");
  const globeRef = React.useRef(null);
  const arcsData = [1, 2, 3, 4, 5, 6].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: [["#000000"][0], ["#000000"][0]],
  }));
  
  return (
      <div className="relative bg-white overflow-hidden">
      <div className="hidden sm:block sm:absolute sm:inset-0" aria-hidden="true">
        <svg
          className="absolute bottom-0 right-0 transform translate-x-1/2 mb-48 text-gray-700 lg:top-0 lg:mb-0 xl:transform-none xl:translate-x-0"
          width={364}
          height={384}
          viewBox="0 0 364 384"
          fill="none"
        >
          <defs>
            <pattern
              id="eab71dd9-9d7a-47bd-8044-256344ee00d0"
              x={0}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect x={0} y={0} width={4} height={4} fill="currentColor" />
            </pattern>
          </defs>
          <rect width={364} height={384} fill="url(#eab71dd9-9d7a-47bd-8044-256344ee00d0)" />
        </svg>
      </div>
      <div className="relative">
        <main className="">
          <div className="mx-auto max-w-7xl">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="px-4 sm:px-6 sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:items-center">
                <div>
                      
                  <h1 className="mt-4 text-4xl tracking-tight font-extrabold text-gray-800 sm:mt-5 sm:leading-none lg:text-5xl xl:text-6xl">
                    <span className="md:block">Charity in its purest essence</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-800 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    All proceeds go directly to those who need it - Kinship pays any fees involved. Manage your tax receipts, get proof of donation, and more.
                  </p>
                  <div className='m-4' />
                  <div className='flex'>
                    <PrimaryButton link = "/donate" text = "Make A Donation" iconRight = {ArrowRightIcon} />
                    <div className='m-1' />
                    <SecondaryButton link = "/about" text= "About Kinship" />
                  </div>
                </div>
              </div>
              <div className=" lg:mt-0 col-span-6 lg:col-span-6">
                <Globe
                  //@ts-ignore
                  ref={globeRef}
                  width={800}
                  height={780}
                  backgroundColor={"rgba(0,0,0,0)"}
                  globeImageUrl={imageUrl}
                  arcColor={"white"}
                  arcsData={arcsData}
                  arcDashGap={0.6}
                  arcDashLength={0.3}
                  arcDashAnimateTime={4000 + 500}
                  rendererConfig={{ preserveDrawingBuffer: true }}
              />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export function Incentives () {

  const incentives = [
    {
      name: '100% of your donation goes to those who need it',
      description: "Kinship pays for any processing or bank fees out of pocket, unless you opt to contribute it.",
      imageSrc: 'https://tailwindui.com/img/ecommerce/icons/icon-delivery-light.svg',
    },
    {
      name: 'Download tax receipts from your dashboard',
      description: 'You can access and download CRA-eligible tax receipts from your dashboard.',
      imageSrc: 'https://tailwindui.com/img/ecommerce/icons/icon-chat-light.svg',
    },
    {
      name: 'Receive proof of donation on your dashboard',
      description: "You will receive proof of all donations you make.",
      imageSrc: 'https://tailwindui.com/img/ecommerce/icons/icon-fast-checkout-light.svg',
    },
  ]

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 sm:px-2 sm:py-16 lg:px-4">
        <div className="max-w-2xl mx-auto px-4 grid grid-cols-1 gap-y-10 gap-x-8 lg:max-w-none lg:grid-cols-3">
          {incentives.map((incentive) => (
            <div key={incentive.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
              <div className="sm:flex-shrink-0">
                <div className="flow-root">
                  <img className="w-28 h-24 mx-auto" src={incentive.imageSrc} alt="" />
                </div>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3 lg:mt-3 lg:ml-0">
                <h3 className="text-sm font-medium text-gray-900">{incentive.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{incentive.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const features = [
  {
    name: 'Education',
    description: 'Help the next generation get on their feet. Break the cycle of poverty through education.',
    icon: AcademicCapIcon,
  },
  {
    name: 'Orphans',
    description: 'Cover an orphans basic housing, food, educational, and clothing needs.',
    icon: UserGroupIcon,
  },
  {
    name: 'Housing',
    description: 'Provide a roof over the heads of those who need it most. Help them get back on their feet by providing a reliable place to stay.',
    icon: HomeModernIcon,
  },
  {
    name: 'Medical Aid',
    description: 'Contribute to much needed medical aid, including life-saving operations and medication.',
    icon: BuildingLibraryIcon,
  },
  {
    name: 'Poverty Relief',
    description: 'Covers general needs of those in poverty or in extreme situation of needs, such as emergency medical relief, food & water, and more.',
    icon: HeartIcon,
  },
  {
    name: 'Khums Donations',
    description: 'Kinship is registered to recieve and distribute Khums donations, also eligible for a tax receipt.',
    icon: CalendarIcon,
  },
]

export function Causes() {
  return (
    <div className="">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:pt-20 sm:pb-24 lg:max-w-7xl lg:px-8 lg:pt-24">
        <h2 className="text-3xl font-bold tracking-tight text-slate-700">Reach those most in need</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Kinship can help direct your donations to those most in need. With your help, we can lift the next generation out of poverty and give them the education, funding, and tools needed to stand on their own feet.
        </p>
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name}>
              <div>
                <span className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-400 bg-opacity-10">
                  <feature.icon className="h-6 w-6 text-slate-700" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium text-slate-700">{feature.name}</h3>
                <p className="mt-2 text-base text-slate-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Partners() {
  const logos = [
    { name: 'Transistor', url: 'https://tailwindui.com/img/logos/transistor-logo-gray-400.svg' },
    { name: 'Mirage', url: 'https://tailwindui.com/img/logos/mirage-logo-gray-400.svg' },
    { name: 'Tuple', url: 'https://tailwindui.com/img/logos/tuple-logo-gray-400.svg' },
    { name: 'Laravel', url: 'https://tailwindui.com/img/logos/laravel-logo-gray-400.svg' },
    { name: 'StaticKit', url: 'https://tailwindui.com/img/logos/statickit-logo-gray-400.svg' },
    { name: 'Workcation', url: 'https://tailwindui.com/img/logos/workcation-logo-gray-400.svg' },
  ]

  return (
    <div className="py-16">
          <div className="mx-auto max-w-md px-4 sm:max-w-3xl sm:px-6 lg:max-w-7xl lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-24">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Vetted Partners On The Ground
                </h2>
                <p className="mt-6 max-w-3xl text-lg leading-7 text-gray-500">
                  Kinship works with a number of trusted partners on the ground, and receives proof of where funds went and who was helped. Our partners also help find those in most need to direct funds to, and continue to monitor for their health, wellbeing, and progress.
                </p>
                <div className="mt-6">
                  <a href="#" className="text-base font-medium text-blue-600">
                    About Kinship &rarr;
                  </a>
                </div>
              </div>
              <div className="mt-12 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
                {logos.map((logo) => (
                  <div key={logo.name} className="col-span-1 flex justify-center bg-gray-50 py-8 px-8">
                    <img className="max-h-12" src={logo.url} alt={logo.name} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
  )
}

function CTA () {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:flex lg:items-center lg:justify-between lg:py-16 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">Ready to contribute?</span>
          <span className="block text-blue-600">Make a donation & receive a tax receipt today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div className="px-5 py-2">
            <a
              href="#"
              className="inline-flex"
            >
            </a>
          </div>
          <PrimaryButton link = "/donate" text = {<>Donate Now &rarr;</>} />
        </div>
      </div>
    </div>
  )
}
