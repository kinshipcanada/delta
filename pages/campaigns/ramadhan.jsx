import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid'
import { PrimaryButton } from '../../components/core/Buttons'

export default function RamadhanCampaign() {
    return (
        <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
            <div className="absolute inset-0 -z-10 overflow-hidden">
            <svg
                className="absolute top-0 left-[max(50%,25rem)] h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
                aria-hidden="true"
            >
                <defs>
                <pattern
                    id="e813992c-7d03-4cc4-a2bd-151760b470a0"
                    width={200}
                    height={200}
                    x="50%"
                    y={-1}
                    patternUnits="userSpaceOnUse"
                >
                    <path d="M100 200V.5M.5 .5H200" fill="none" />
                </pattern>
                </defs>
                <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
                <path
                    d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                    strokeWidth={0}
                />
                </svg>
                <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
            </svg>
            </div>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-y-16 gap-x-8 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
            <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                <div className="lg:pr-4">
                <div className="lg:max-w-lg">
                    <p className="text-base font-semibold leading-7 text-blue-600">Campaign</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Ramadhan Campaign</h1>
                    <p className="mt-6 text-xl leading-8 text-gray-700">
                        This Ramadhan, help provide food and shelter for Muslims who can&apos;t afford to break their fasts. Kinship takes 0 admin fees and all proceeds are sent directly to those who need it most.
                    </p>
                </div>
                </div>
            </div>
            <div className="-mt-12 -ml-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
                <img
                className="w-[48rem] max-w-none rounded-xl bg-gray-900 shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                src="https://lirp.cdn-website.com/f2766bde/dms3rep/multi/opt/e6ec87a5c8abaa89d6dd149e9d85f73d-d97d8381-640w.jpg"
                alt=""
                />
            </div>
            <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
                <div className="lg:pr-4">
                <div className="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg space-y-4">
                    <p>This Ramadhan, join hands with Kinship to make a difference in the lives of Muslims who are struggling to break their fasts due to financial difficulties. With Kinship, you can ensure that your donation goes directly to those who need it most, as they take 0 admin fees.</p>
                    <p>Imagine not being able to have a proper meal to break your fast during the holy month of Ramadhan. This is a reality for many Muslims around the world. With your support, Kinship can provide essential food and shelter to those in need, ensuring that they have a comfortable and fulfilling Ramadhan.</p>
                    <p>By donating to Kinship, you can help make a positive impact in the lives of those less fortunate. Your generosity can make all the difference to families who are struggling to make ends meet.</p>
                    <ul role="list" className="mt-8 space-y-8 text-gray-600">
                    <li className="flex gap-x-3">
                        <CloudArrowUpIcon className="mt-1 h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                        <span>
                        <strong className="font-semibold text-gray-900">Proof of donation.</strong> Receive proof that your donation was sent 
                        where it was needed most, and see who, where, and when your donation was able to help.
                        </span>
                    </li>
                    <li className="flex gap-x-3">
                        <LockClosedIcon className="mt-1 h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                        <span>
                        <strong className="font-semibold text-gray-900">Vetted Partners.</strong> Kinship works with vetted
                        partners on the ground to ensure your donation goes where it is needed most.
                        </span>
                    </li>
                    <li className="flex gap-x-3">
                        <ServerIcon className="mt-1 h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                        <span>
                        <strong className="font-semibold text-gray-900">CRA-Eligible Tax Receipts.</strong> Receive a CRA-eligible
                        tax deduction for your donation (for Canadians only).
                        </span>
                    </li>
                    </ul>
                    <p className=''>Let's come together as a community and make this Ramadhan a little brighter for those in need. Donate to Kinship today and help provide food and shelter to those who can't afford to break their fasts.</p>
                    <PrimaryButton link = "/donate" text = "Make a donation &rarr;" />
                </div>
                </div>
            </div>
            </div>
        </div>
    )
}