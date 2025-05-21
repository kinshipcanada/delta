"use client"
import { Alert, Button, ButtonSize, ButtonStyle, EventColors, Label, SelectionInput } from "@components/primitives"
import { callKinshipAPI, centsToDollars, dollarsToCents } from "@lib/utils/helpers"
import { Donation, DonationStatus, Donor } from "@prisma/client"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripePaymentElementOptions, loadStripe } from "@stripe/stripe-js"
import { useState } from "react"
import Address, { GoogleFormattedAddress } from "@components/Address"
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/20/solid"
import { v4 as uuidv4 } from 'uuid'
import { CreditCardIcon } from "@heroicons/react/24/solid"
import { ConfirmationType } from "@lib/classes/utils"
import { countries, states_and_provinces } from "@lib/utils/constants"
import { TypographyH2, TypographyH4, TypographyP } from "@components/ui/typography"
import { Checkbox } from "@radix-ui/react-checkbox"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { FileWarningIcon } from "lucide-react"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"

// TODO: redo this page once authentication is removed to reflect 
// the fields from the donation models

const causes: CauseV2[] = [
    {
        cause: "Where Most Needed",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Sehme Sadat",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Sehme Imam",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Vision Kinship",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Orphans",
        choices: [],
        subCause: undefined 
    },
    {
        cause: "Education",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Poverty Relief",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Medical Aid",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Housing",
        choices: [],
        subCause: undefined
    },
    {
        cause: "Widows",
        choices: [],
        subCause: undefined
    },
]


type DefaultCauseChoice = {
    amountCents: number
    subCause: string
}

type CauseV2 = {
    id?: string
    donation_id?: string
    amountDonatedCents?: number
    inHonorOf?: string
    cause: string
    subCause?: string
    choices: DefaultCauseChoice[]
}

const stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function Donate() {
    const [view, setView] = useState<'donation' | 'payment' | 'confirmation'>('donation');
    const [donation, setDonation] = useState<Donation | undefined>(undefined);
    const [stripeClientSecret, setStripeClientSecret] = useState<string | undefined>(undefined);
    const [confirmationType, setConfirmationType] = useState<ConfirmationType>(ConfirmationType.Unconfirmed);
    
    
    const [donorInfo, setDonorInfo] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: {
            lineAddress: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
        }
    });

    if (view === 'donation') {
        return (
            <DonationForm 
                setDonation={setDonation} 
                setStripeClientSecret={setStripeClientSecret} 
                setView={setView} 
                donorInfo={donorInfo}
                setDonorInfo={setDonorInfo}
            />
        );
    } else if (view === 'payment') {
        return (
            <Elements options={{
                appearance: { 'theme': 'stripe' },
                clientSecret: stripeClientSecret,
            }} stripe={stripeClientPromise}>
                <PaymentForm 
                    donation={donation} 
                    setDonation={setDonation} 
                    setView={setView} 
                    setConfirmationType={setConfirmationType} 
                    donorInfo={donorInfo}
                />
            </Elements>
        );
    } else if (view === 'confirmation') {
        return <ConfirmationForm donation={donation} confirmationType={confirmationType} />;
    } else {
        return <div>Something went wrong. Please try again later</div>;
    }
}

function PaymentForm({ donation, setDonation, setView, setConfirmationType, donorInfo }: { donation: Donation | undefined, setDonation: (donation: Donation) => void, setView: (view: 'donation' | 'payment' | 'confirmation') => void, setConfirmationType: (value: ConfirmationType) => void, donorInfo: any }) {

    const [loading, setLoading] = useState<boolean>(false)
    const [stripeMessages, setStripeMessages] = useState<string | undefined>(undefined)

    const stripe = useStripe()
    const elements = useElements()

    if (donation == undefined) {
        return <div>Something went wrong. Please try again later</div>
    }

    const paymentElementOptions: StripePaymentElementOptions = {
        defaultValues: {
            billingDetails: {
                name: `${donorInfo.firstName} ${donorInfo.lastName}`,
                email: donorInfo.email,
                address: {
                  country: donorInfo.address.country,
                  postal_code: donorInfo.address.postalCode,
                  state: donorInfo.address.state,
                  city: donorInfo.address.city,
                  line1: donorInfo.address.lineAddress
                }
            }
        }
    }

    const handleCardSubmit = async () => {
        if (!stripe || !elements) {
            return;
        }

        setLoading(true)

        const response = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_DOMAIN}/confirmation`,
            },
            redirect: 'if_required'
        });

        if (response.error) {
            const error = response.error
            if (error.type === "card_error" || error.type === "validation_error") {
                setStripeMessages(error.message)
            } else { 
                console.error(error)
                setStripeMessages("An unknown error occured") 
            }
        } else {
            setDonation({
                ...donation,
            })

            if (response.paymentIntent.status == "succeeded") {
                setConfirmationType(ConfirmationType.ConfirmedAndReceived)
            } else if (response.paymentIntent.status == "processing") {
                setConfirmationType(ConfirmationType.ConfirmedProcessing)
            } else if (response.paymentIntent.status == "requires_action") {
                setConfirmationType(ConfirmationType.FurtherStepsRequired)
            } else {
                setConfirmationType(ConfirmationType.Unconfirmed)
            }
            
            setView("confirmation")
        }

        setLoading(false)
        return;
    }

    return (
        <div className="flex justify-center px-4 sm:px-0">
            <div className="space-y-6 w-full max-w-2xl px-4 py-8">
                <button onClick={()=>{setView("donation")}}>&larr; Go Back</button>
                <PaymentElement id="payment-element" options={paymentElementOptions} />
                <div className='w-full flex justify-end'>
                    <Button 
                        text={loading ? "Processing Donation" : `Donate ${centsToDollars(donation.amountChargedInCents)}`}
                        icon={<CreditCardIcon />}
                        style={ButtonStyle.Primary}
                        size={ButtonSize.Large} 
                        isLoading={loading || !stripe} 
                        onClick={handleCardSubmit}
                    />
                </div>

                {stripeMessages && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{stripeMessages}</span>
                    </div>
                )}
            </div>
        </div>
        
    )
}

function ConfirmationForm({ donation, confirmationType }: { donation: Donation | undefined, confirmationType: ConfirmationType }) {

    if (!donation) {
        return (
            <div>Thank you so much! Your Donation Has Been Processed. A receipt will be sent shortly.</div>
        )
    }

    return (
        <div className="flex justify-center px-4 sm:px-0">
            <div className="space-y-6 w-full max-w-2xl px-4 ">
            <div className="mx-auto max-w-3xl py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="max-w-xl">
                    <h1 className="text-base font-medium text-blue-600">Donation Successful</h1>
                    <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Thank You!</p>
                    
                    {/* TODO: revert to prev after authentication is removed */}
                    <p className="mt-2 text-base text-gray-500">A receipt will be issued soon and sent to email@email.com. Please reach out to info@kinshipcanada.com with any questions.</p>
                    {/* <p className="mt-2 text-base text-gray-500">A receipt will be issued soon and sent to {donation.donorEmail}. Please reach out to info@kinshipcanada.com with any questions.</p> */}
        
                    <dl className="mt-12 text-sm font-medium">
                    <dt className="text-gray-900">Donation ID</dt>
                    <dd className="mt-2 text-blue-600">{donation.id}</dd>
                    </dl>
                </div>
        
                <div className="mt-10 border-t border-gray-200">
                    <div className="sm:ml-40 sm:pl-6">

                    <dl className="grid grid-cols-2 gap-x-6 py-10 text-sm">
                        <div>
                        <dt className="font-medium text-gray-900">Address Details</dt>
                        <dd className="mt-2 text-gray-700">
                            <address className="not-italic">
                                {/* TODO: revert to prev after authentication is removed */}
                                <span className="block">123 Main St</span>
                                <span className="block">Toronto ON M5A 0J5</span>
                                <span className="block">Canada</span>
                                {/* <span className="block">{donation.donorAddressLineAddress}</span>
                                <span className="block">{donation.donorAddressCity} {donation.donorAddressState}</span>
                                <span className="block">{donation.donorAddressCountry}, {donation.donorAddressPostalCode}</span> */}
                            </address>
                        </dd>
                        </div>
                        <div>
                        <dt className="font-medium text-gray-900">Donor Details</dt>
                        <dd className="mt-2 text-gray-700">
                            <address className="not-italic">
                                {/* TODO: revert to prev after authentication is removed */}
                                <span className="block">firstName lastName</span>
                                <span className="block">email@email.com</span>
                                {/* <span className="block">{donation.donorFirstName} {donation.donorLastName}</span>
                                <span className="block">{donation.donorEmail}</span> */}
                            </address>
                        </dd>
                        </div>
                    </dl>
        
        
                    <h3 className="sr-only">Summary</h3>
        
                    <dl className="space-y-6 border-t border-gray-200 pt-10 text-lg">
                        <div className="flex justify-between">
                            <dt className="font-regular text-gray-900">Total Donated</dt>
                            <dd className="text-gray-700 font-extrabold">${centsToDollars(donation.amountChargedInCents)}</dd>
                        </div>
                    </dl>
                    </div>
                </div>
                </div>
                
            </div>
        </div>
    )
}

const HEADER_CLASS="text-lg font-bold leading-7 tracking-tight text-slate-800 sm:truncate sm:text-xl"

function DonationForm({ setDonation, setStripeClientSecret, setView, donorInfo, setDonorInfo }: { setDonation: (donation: Donation) => void, setStripeClientSecret: (clientSecret: string) => void, setView: (view: 'donation' | 'payment' | 'confirmation') => void, donorInfo: any, setDonorInfo: (info: any) => void}) {
    const devToolsEnabled = process.env.NEXT_PUBLIC_DEV_ENVIRONMENT && process.env.NEXT_PUBLIC_DEV_ENVIRONMENT == "true"
    const [loading, setLoading] = useState<boolean>(false)
    
    const [selectedCauses, setSelectedCauses] = useState<CauseV2[]>([])

    const [address, setAddress] = useState<string>('')
    const [manualAddressCollectionMode, setManualAddressCollectionMode] = useState<boolean>(false)
    const [formattedAddress, setFormattedAddress] = useState<GoogleFormattedAddress | undefined>(undefined)

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [email, setEmail] = useState<string>('')

    const [inHonorOf, setInHonorOf] = useState<string>('')

    const getStripeClientSecret = async (donation: Donation) => {
        setLoading(true)

        const isAutoAddressComplete = formattedAddress && 
            formattedAddress.streetNumber && 
            formattedAddress.route && 
            formattedAddress.locality && 
            formattedAddress.administrativeAreaLevel1 && 
            formattedAddress.country && 
            formattedAddress.postalCode;

        const address = isAutoAddressComplete ? {
            lineAddress: `${formattedAddress!.streetNumber} ${formattedAddress!.route}`,
            city: formattedAddress!.locality!,
            state: formattedAddress!.administrativeAreaLevel1!,
            country: formattedAddress!.country!,
            postalCode: formattedAddress!.postalCode!,
        } : {
            lineAddress: `${formattedAddress?.streetNumber || ''} ${formattedAddress?.route || ''}`,
            city: formattedAddress?.locality || '',
            state: formattedAddress?.administrativeAreaLevel1 || '',
            country: formattedAddress?.country || '',
            postalCode: formattedAddress?.postalCode || '',
        };

        const donorInfo = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            ...address
        };
        
        const causesData = selectedCauses.map(cause => {
            const causeEntry: any = {
                id: uuidv4(),
                donation_id: donation.id,
                amountDonatedCents: cause.amountDonatedCents || 0,
                cause: cause.cause,
            };

            if (inHonorOf && inHonorOf.trim() !== "") {
                causeEntry.inHonorOf = inHonorOf;
            }

            if (cause.subCause && cause.subCause.trim() !== "") {
                causeEntry.subCause = cause.subCause;
            }
            return causeEntry;
        });

        const response = await callKinshipAPI<string>('/api/v2/stripe/createPaymentIntent', {
            donation,
            donorInfo,
            causesData
        });

        if (response.error || response.data == undefined) {
            alert("Internal error - please try again later");
            setLoading(false);
            return;
        } else {
            setStripeClientSecret(response.data);
            setLoading(false);
            setView('payment');
        }
    };

    const validateDonation = async () => {
        let issues = []

        if (selectedCauses.length === 0) {
            issues.push("Please select a cause to donate to")
        }

        if (firstName === '') {
            issues.push("First name is required")
        }

        if (lastName === '') {
            issues.push("Last name is required")
        }

        if (email === '' || !email.includes('@')) {
            issues.push("Email is required")
        }

        if (formattedAddress == undefined || formattedAddress?.streetNumber === undefined || formattedAddress?.route === undefined || formattedAddress?.locality === undefined || formattedAddress?.administrativeAreaLevel1 === undefined || formattedAddress?.country === undefined || formattedAddress?.postalCode === undefined) {
            issues.push("Address is required. Please start typing your address and select one from the dropdown menu")
        }

        for (const cause of selectedCauses) {
            if (cause.amountDonatedCents === undefined) {
                issues.push(`Please select an amount to donate to ${cause.cause}`)
            }
        }

        const sum = sumCauses(selectedCauses)

        if (issues.length > 0) {
            alert(issues.join('\n'))
            return;
        } else { 
            console.log(selectedCauses)

            const donation: Donation = {
                id: uuidv4(),
                status: "PROCESSING" as DonationStatus,
                date: new Date(),
                amountDonatedInCents: sum,
                amountChargedInCents: sum,
                feesChargedInCents: 0,
                feesDonatedInCents: 0,
                stripeCustomerId: null,
                stripeTransferId: null,
                stripeChargeId: null,
                version: 2,
            }

            await getStripeClientSecret(donation)
            setDonation(donation)
        }
        
    }

    return (
        <div className="flex justify-center px-4 sm:px-0">
            <div className="space-y-12 w-full max-w-2xl py-8">
                {devToolsEnabled && 
                    <div className="bg-blue-100 rounded p-4">
                        DevTools 
                        <div className="flex items-center">
                            <input 
                                type="checkbox"
                                id="prefillCheckbox"
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setFirstName("Testing")
                                        setLastName("Sample")
                                        setEmail("zain@kinshipcanada.com")
                                    } else {
                                        setFirstName('')
                                        setLastName('')
                                        setEmail('')
                                    }
                                }}
                            />
                            <label htmlFor="prefillCheckbox">Prefill sample donor info</label>
                        </div>
                    </div>
                }
                <div>
                    <h1 className="flex w-full items-center justify-center space-x-4 mt-4">
                        <img
                            className="h-8 w-auto sm:h-10"
                            loading='eager'
                            src="/logo.png"
                            alt=""
                        />
                        <TypographyH2>Make A Donation</TypographyH2>
                    </h1>

                    <TypographyP>If you would like to make an eTransfer donation, please etransfer <a href="mailto:info@kinshipcanada.com" className="text-blue-500 underline">info@kinshipcanada.com</a>, and email us with the amount and what causes you prefer to support.</TypographyP>

                    <TypographyP>For very large donations kindly contact us at <a href="mailto:info@kinshipcanada.com" className="text-blue-500 underline">info@kinshipcanada.com</a> to arrange an ACH or wire transfer.</TypographyP>
                </div>
                
                <div className="w-full flex flex-col justify-start space-y-4">
                    <TypographyH4>
                        Select Your Causes
                    </TypographyH4>
                    <div className="flex items-center grid grid-cols-2 gap-4">
                    {causes.map((cause)=> (
                        <div key={cause.cause}>
                            <input 
                                type="checkbox"
                                id={cause.cause} 
                                name={cause.cause} 
                                value={cause.cause} 
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedCauses([...selectedCauses, cause]);
                                    } else {
                                        setSelectedCauses(selectedCauses.filter((selectedCause) => selectedCause.cause != cause.cause));
                                    }
                                }}
                            />
                            <label htmlFor={cause.cause}>{cause.cause}</label>
                        </div>
                    ))}
                        </div>

                </div>
                
                {selectedCauses.length > 3 && (
                    <div className=" flex items-center justify-between gap-x-6 bg-red-600 px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
                    <ExclamationTriangleIcon  className="w-5 h-5 text-white"/>
                    <p className="text-sm/6 text-white font-semibold">
                        Sorry! You can only add up to 3 causes at once. Please remove one
                    </p>
                    <button type="button" className="-m-1.5 flex-none p-1.5">
                        <span className="sr-only">Dismiss</span>
                    </button>
                    </div>
                )}

                {selectedCauses.length > 0 && (
                    <>
                    <div className="space-y-2">
                        <TypographyH4>
                            Choose How Much To Donate
                        </TypographyH4>
                        {selectedCauses.map((cause) => (
                            <AmountSelection key={cause.cause} cause={cause} selectedCauses={selectedCauses} setSelectedCauses={setSelectedCauses} />
                        ))}

                        
                    </div>
                    <div className="space-y-2">
                        <TypographyH4>
                            <span className="inline-flex items-center rounded-full bg-green-200 px-2.5 py-0.5 text-sm font-medium text-green-800 mr-2">
                                Optional
                            </span>
                            Donate In Someones Honor
                        </TypographyH4>
                        <p>Make this donation in someone else's honor. If you have selected prayers or recitations, this is whos name it will be recited for.</p>
                        <input 
                            type="text"
                            value={inHonorOf ?? ''}
                            className="w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                            placeholder="Optional"
                            onChange={(e) => {
                                setInHonorOf(e.target.value);
                            }}
                        />
                    </div>
                    </>
                )}

                <div className="flex flex-col space-y-2">
                    <TypographyH4>
                        Your Information
                    </TypographyH4>
                    <div className="flex space-x-2 w-full">
                        <div className="w-1/2">
                            <Label label="First Name" required={true} htmlFor={"firstName"} />
                            <input 
                                type="text" 
                                id="firstName"
                                placeholder="First"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                        <div className="w-1/2">
                            <Label label="Last Name" required={true} htmlFor={"lastName"} />
                            <input 
                                id="lastName"
                                type="text" 
                                placeholder="Last"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full"
                            />
                        </div>
                    </div>
                    <div className="w-full space-y-1">
                        <Label label="Email (Tax Receipt Will Be Sent Here)" required={true} htmlFor={"email"} />
                        <input 
                            type="email" 
                            id="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full"
                        />
                    </div>
                    <div className="w-full space-y-1">
                        <div className="flex justify-between">
                            <Label label="Address" required={true} htmlFor={"address"} />
                            <p className="block text-sm font-medium text-blue-600 underline cursor-pointer" onClick={()=>{ setManualAddressCollectionMode(!manualAddressCollectionMode)}}>{manualAddressCollectionMode ? "Enter Address Automatically" : "Enter Address Manually"}</p>
                        </div>

                        {manualAddressCollectionMode ? (
                            <ManualAddressCollection 
                                formattedAddress={formattedAddress}
                                setFormattedAddress={setFormattedAddress}
                            />
                        ) : (
                            <Address addressString={address} setAddressString={setAddress} formattedAddress={formattedAddress} setFormattedAddress={setFormattedAddress} />
                        )}
                    </div>
                </div>

                {sumCauses(selectedCauses) > 0 && (
                    <div className="flex flex-col bg-gray-100 rounded-md p-4">
                        <h1 className={HEADER_CLASS}>Total: ${centsToDollars(sumCauses(selectedCauses))}</h1>
                        <ul>
                            {selectedCauses.map((cause) => (
                                <li key={cause.cause} className="flex space-x-2 items-center">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    <span>{cause.cause}: {centsToDollars(cause.amountDonatedCents ?? 0)}</span>
                                </li>
                            ))} 
                        </ul>
                    </div>
                )}

                <div className="w-full flex justify-center">
                    <Button text={loading ? "Loading..." : "Proceed To Payment"} onClick={validateDonation} icon={<LockClosedIcon className="text-white w-4 h-4" />} style={ButtonStyle.Primary} size={ButtonSize.Large} />
                </div>
            </div>
        </div>
    )
}

function ManualAddressCollection(
    { formattedAddress, setFormattedAddress }: 
    { formattedAddress: GoogleFormattedAddress | undefined, setFormattedAddress: (address: GoogleFormattedAddress) => void }
) {
    return (
        <div className="space-y-2">
            <div className="w-full space-y-1">
                <Label label="Street Number" required={true} htmlFor={"streetNumber"} />
                <input 
                    type="text" 
                    id="streetNumber"
                    placeholder="Street Number"
                    onChange={(e) => setFormattedAddress({ ...formattedAddress, streetNumber: e.target.value })}
                    className="focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full"
                />
            </div>
            <div className="w-full space-y-1">
                <Label label="Street Name" required={true} htmlFor={"streetName"} />
                <input 
                    type="text" 
                    id="streetName"
                    placeholder="Street Name"
                    onChange={(e) => setFormattedAddress({ ...formattedAddress, route: e.target.value })}
                    className="focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full"
                />
            </div>
            <div className="w-full space-y-1">
                <Label label="City" required={true} htmlFor={"city"} />
                <input 
                    type="text" 
                    id="city"
                    placeholder="City"
                    onChange={(e) => setFormattedAddress({ ...formattedAddress, locality: e.target.value })}
                    className="focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full"
                />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                <div>
                    {states_and_provinces[formattedAddress?.country ?? ''] === null || states_and_provinces[formattedAddress?.country ?? ''] === undefined ? (
                        <div className="space-y-2">
                            <Label label="Province" required={true} htmlFor={"province"} />
                            <input 
                                type="text" 
                                id="province"
                                placeholder="Province"
                                onChange={(e) => setFormattedAddress({ ...formattedAddress, administrativeAreaLevel1: e.target.value })}
                                className="focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md w-full"
                            />
                        </div>
                    ) : (
                        <SelectionInput
                            label="State or Province"
                            name="state_or_province"
                            id="state_or_province"
                            value={formattedAddress?.administrativeAreaLevel1 ?? ''}
                            options={states_and_provinces[formattedAddress?.country ?? 'CA']}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                setFormattedAddress({ ...formattedAddress, administrativeAreaLevel1: e.target.value })
                            }}
                            required={true}
                        />
                    )}
                </div>
                
                <div>
                    <Label label={"Country"} htmlFor={"country"} required={true} />
                    <select
                        id={"country"}
                        name={"country"}
                        onChange={(e: any)=>{ 
                            const countrySelected = e.target.value
                            setFormattedAddress({ ...formattedAddress, country: countrySelected })
                        }}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                    >
                        <option value="">Select a Country</option>
                        {Object.entries(countries).map(([countryCode, countryName]) => (
                            <option key={countryCode} value={countryCode}>
                                {countryName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    )
}

function sumCauses(causes: CauseV2[]) {
    return causes.reduce((acc, cause) => acc + (cause.amountDonatedCents || 0), 0)
}

function AmountSelection({ cause, selectedCauses, setSelectedCauses }: { cause: CauseV2, selectedCauses: CauseV2[], setSelectedCauses: (causes: CauseV2[]) => void}) {
    const [customAmount, setCustomAmount] = useState<number | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const handleAmountChange = (amount: number, description?: string) => {
        setSelectedCauses(selectedCauses.map((selectedCause) => 
            selectedCause.cause === cause.cause 
                ? { 
                    ...selectedCause, 
                    amountDonatedCents: amount,
                    subCause: description || selectedCause.subCause 
                  } 
                : selectedCause
        ));
        
        setSelectedAmount(amount);
        if (amount !== customAmount) {
            setCustomAmount(null);
        }
    };

    const handleCustomSelect = () => {
        setSelectedAmount(0);
        setCustomAmount(0);
        setSelectedCauses(selectedCauses.map((selectedCause) => 
            selectedCause.cause === cause.cause ? { ...selectedCause, amountDonatedCents: 0 } : selectedCause
        ));
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm border">
            <div className="px-4 py-5 sm:p-6 flex justify-between">
                <p className={HEADER_CLASS} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>{cause.cause}</p>
                <div className="flex flex-col space-y-3 justify-start items-start">
                    {cause.choices.map((choice) => (
                        <span key={choice.subCause} className="flex items-center space-x-4">
                            <input 
                                type="radio"
                                id={`${cause.cause}-${choice.subCause}`}
                                name={cause.cause} 
                                value={choice.amountCents} 
                                checked={selectedAmount === choice.amountCents}
                                onChange={() => handleAmountChange(choice.amountCents, choice.subCause)}
                            />
                            <label htmlFor={`${cause.cause}-${choice.subCause}`}>
                                <span className="font-bold">${centsToDollars(choice.amountCents)}</span> {choice.subCause}
                            </label>
                        </span>
                    ))}
                    {
                        cause.choices.length === 0 ? (
                            <div className="flex items-center space-x-1">
                                <span className="text-xl font-bold">$</span>
                                <input 
                                    type="number"
                                    value={customAmount ?? ''}
                                    min={0}
                                    className="w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setCustomAmount(value);
                                        setSelectedAmount(value);
                                        setSelectedCauses(selectedCauses.map((selectedCause) => 
                                            selectedCause.cause === cause.cause ? { ...selectedCause, amountDonatedCents: Number(dollarsToCents(value)) } : selectedCause
                                        ));
                                    }}
                                />
                            </div>
                        ) : (
                            <span className="flex items-center space-x-4">
                                <input 
                                    type="radio"
                                    id={`${cause.cause}-custom`} 
                                    name={cause.cause} 
                                    value={customAmount || ''}
                                    checked={selectedAmount === customAmount && customAmount !== null}
                                    onChange={handleCustomSelect}
                                />
                                <label htmlFor={`${cause.cause}-custom`} onClick={handleCustomSelect}>Custom</label>
                                <div className="flex items-center space-x-1">
                                    <span className="text-xl font-bold">$</span>
                                    <input 
                                        type="number"
                                        value={customAmount ?? ''}
                                        min={0}
                                        className="w-full focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 rounded-md"
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            setCustomAmount(value);
                                            setSelectedAmount(value);
                                            setSelectedCauses(selectedCauses.map((selectedCause) => 
                                                selectedCause.cause === cause.cause ? { ...selectedCause, amountDonatedCents: Number(dollarsToCents(value)) } : selectedCause
                                            ));
                                        }}
                                        onClick={handleCustomSelect}
                                    />
                                </div>
                            </span>
                        )
                    }
                </div>
            </div>
        </div>
        
    )
}