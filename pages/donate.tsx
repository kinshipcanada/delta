import { Button, ButtonSize, ButtonStyle, Label, SelectionInput } from "@components/primitives"
import { callKinshipAPI, centsToDollars, dollarsToCents } from "@lib/utils/helpers"
import { Donation, DonationRegion } from "@prisma/client"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { StripePaymentElementOptions, loadStripe } from "@stripe/stripe-js"
import { useState } from "react"
import Address, { GoogleFormattedAddress } from "@components/Address"
import { CheckCircleIcon, LockClosedIcon } from "@heroicons/react/20/solid"
import { v4 as uuidv4 } from 'uuid'
import { CreditCardIcon } from "@heroicons/react/24/solid"
import { ConfirmationType } from "@lib/classes/utils"
import { countries, states_and_provinces } from "@lib/utils/constants"

const causes: CauseV2[] = [
    {
        region: DonationRegion.ANYWHERE,
        title: "Where Most Needed",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Sehme Sadat",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Sehme Imam",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Vision Kinship",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Orphans",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Education",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Poverty Relief",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Medical Aid",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Housing",
        choices: []
    },
    {
        region: DonationRegion.ANYWHERE,
        title: "Widows",
        choices: []
    },
]


type DefaultCauseChoice = {
    amountCents: number
    description: string
}

type CauseV2 = {
    region: DonationRegion
    title: string
    choices: DefaultCauseChoice[]
    amountCents?: number
}

const stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function Donate() {

    const [view, setView] = useState<'donation' | 'payment' | 'confirmation'>('donation')
    const [donation, setDonation] = useState<Donation | undefined>(undefined)

    const [stripeClientSecret, setStripeClientSecret] = useState<string | undefined>(undefined)
    const [confirmationType, setConfirmationType] = useState<ConfirmationType>(ConfirmationType.Unconfirmed)

    if (view === 'donation') {
        return <DonationForm setDonation={setDonation} setStripeClientSecret={setStripeClientSecret} setView={setView} />
    } else if (view === 'payment') {
        return (
            <Elements options={{
                appearance: { 'theme': 'stripe' },
                clientSecret: stripeClientSecret,
            }} stripe={stripeClientPromise}>
                <PaymentForm donation={donation} setDonation={setDonation} setView={setView} setConfirmationType={setConfirmationType} />
            </Elements>
        )
    } else if (view === 'confirmation'){
        return <ConfirmationForm donation={donation} confirmationType={confirmationType} />
    } else {
        <div>Something went wrong. Please try again later</div>
    }
}

function PaymentForm({ donation, setDonation, setView, setConfirmationType }: { donation: Donation | undefined, setDonation: (donation: Donation) => void, setView: (view: 'donation' | 'payment' | 'confirmation') => void, setConfirmationType: (value: ConfirmationType) => void}) {

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
                name: `${donation.donorFirstName} ${donation.donorLastName}`,
                email: donation.donorEmail,
                address: {
                  country: donation.donorAddressCountry,
                  postal_code: donation.donorAddressPostalCode,
                  state: donation.donorAddressState,
                  city: donation.donorAddressCity,
                  line1: donation.donorAddressLineAddress
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
                stripePaymentIntentId: response.paymentIntent.id,
                stripePaymentMethodId: response.paymentIntent.payment_method!.toString()
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
                    <p className="mt-2 text-base text-gray-500">A receipt will be issued soon and sent to {donation.donorEmail}. Please reach out to info@kinshipcanada.com with any questions.</p>
        
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
                                <span className="block">{donation.donorAddressLineAddress}</span>
                                <span className="block">{donation.donorAddressCity} {donation.donorAddressState}</span>
                                <span className="block">{donation.donorAddressCountry}, {donation.donorAddressPostalCode}</span>
                            </address>
                        </dd>
                        </div>
                        <div>
                        <dt className="font-medium text-gray-900">Donor Details</dt>
                        <dd className="mt-2 text-gray-700">
                            <address className="not-italic">
                            <span className="block">{donation.donorFirstName} {donation.donorLastName}</span>
                            <span className="block">{donation.donorEmail}</span>
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

function DonationForm({ setDonation, setStripeClientSecret, setView }: { setDonation: (donation: Donation) => void, setStripeClientSecret: (clientSecret: string) => void, setView: (view: 'donation' | 'payment' | 'confirmation') => void}) {
    const [loading, setLoading] = useState<boolean>(false)
    
    const [selectedCauses, setSelectedCauses] = useState<CauseV2[]>([])

    const [address, setAddress] = useState<string>('')
    const [manualAddressCollectionMode, setManualAddressCollectionMode] = useState<boolean>(false)
    const [formattedAddress, setFormattedAddress] = useState<GoogleFormattedAddress | undefined>(undefined)

    const [firstName, setFirstName] = useState<string>('')
    const [lastName, setLastName] = useState<string>('')
    const [email, setEmail] = useState<string>('')

    const getStripeClientSecret = async (donation: Donation) => {
        setLoading(true)

        const response = await callKinshipAPI<string>('/api/v2/stripe/createPaymentIntent', {
            donation
        })

        if (response.error || response.data == undefined) {
            alert("Internal error - please try again later")
            setLoading(false)
            return;
        } else {
            setStripeClientSecret(response.data)
            setLoading(false)
            setView('payment')
        }
    }

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
            if (cause.amountCents === undefined) {
                issues.push(`Please select an amount to donate to ${cause.title}`)
            }
        }

        const sum = sumCauses(selectedCauses)

        if (issues.length > 0) {
            alert(issues.join('\n'))
            return;
        } else {
            const donation: Donation = {
                id: uuidv4(),
                loggedAt: new Date(),
                status: "PROCESSING",
                donatedAt: new Date(),
                adheringLabels: [
                    "V4_STRIPE_PAYMENT"
                ],
                allocatedToCauses: 0,
                unallocatedToCauses: 0,
                allocationBreakdown: { },
                causeName: null,
                causeRegion: "ANYWHERE",
                transactionStatus: "PENDING",
                amountDonatedInCents: sum,
                amountRefunded: 0,
                amountChargedInCents: sum,
                feesChargedInCents: 0,
                feesDonatedInCents: 0,
                currency: "CAD",
                donorId: null,
                donorFirstName: firstName,
                donorMiddleName: null,
                donorLastName: lastName,
                donorEmail: email,
                donorAddressLineAddress: `${formattedAddress!.streetNumber} ${formattedAddress!.route}`,
                donorAddressCity: formattedAddress!.locality!,
                donorAddressState: formattedAddress!.administrativeAreaLevel1!,
                donorAddressCountry: formattedAddress!.country! == "Canada" ? "CA" : "AD",
                donorAddressPostalCode: formattedAddress!.postalCode!,
                billingAddressPostalCode: formattedAddress!.postalCode!,
                stripeCustomerId: null,
                stripePaymentIntentId: null,
                stripePaymentMethodId: null,
                stripeChargeId: null,
                stripeBalanceTxnId: null,
                paymentMethodType: "CARD",
                pmCardFunding: null,
                pmCardBrand: null,
                pmCardLast4: null,
                pmCardExpMonth: null,
                pmCardExpYear: null,
                legacyIdV0: null,
                legacyIdV1: null
            }

            await getStripeClientSecret(donation)
            setDonation(donation)
        }
        
    }

    return (
        <div className="flex justify-center px-4 sm:px-0">
            <div className="space-y-6 w-full max-w-2xl py-8">
                <h1 className="flex w-full items-center justify-center space-x-4 mt-4 font-extrabold text-4xl text-center">
                    <img
                        className="h-8 w-auto sm:h-10"
                        loading='eager'
                        src="/logo.png"
                        alt=""
                    />
                    <div>Make A Donation</div>
                </h1>

                <div className="w-full flex flex-col justify-start space-y-2 items-center">
                    <p className={HEADER_CLASS}>Select Your Causes</p>
                    <div className="flex items-center grid grid-cols-2 gap-4">
                    {causes.map((cause)=> (
                        <div key={cause.title}>
                            <input 
                                type="checkbox"
                                id={cause.title} 
                                name={cause.title} 
                                value={cause.title} 
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedCauses([...selectedCauses, cause])
                                    } else {
                                        setSelectedCauses(selectedCauses.filter((selectedCause) => selectedCause.title != cause.title))
                                    }
                                }}
                            />
                            <label htmlFor={cause.title}>{cause.title}</label>
                        </div>
                    ))}
                        </div>

                </div>

                {selectedCauses.length > 0 && (
                    <div className="text-center space-y-2">
                        <p className={HEADER_CLASS}>Choose How Much To Donate</p>
                        {selectedCauses.map((cause) => (
                            <AmountSelection key={cause.title} cause={cause} selectedCauses={selectedCauses} setSelectedCauses={setSelectedCauses} />
                        ))}
                    </div>
                )}

                <div className="flex flex-col space-y-2 items-center">
                    <p className={HEADER_CLASS}>Your Info</p>
                    <div className="flex space-x-2 w-full">
                        <div className="w-1/2">
                            <Label label="First Name" required={true} htmlFor={"firstName"} />
                            <input 
                                type="text" 
                                id="firstName"
                                placeholder="First"
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
                                <li key={cause.title} className="flex space-x-2 items-center">
                                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                                    <span>{cause.title}: {centsToDollars(cause.amountCents ?? 0)}</span>
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
    return causes.reduce((acc, cause) => acc + (cause.amountCents || 0), 0)
}

function AmountSelection({ cause, selectedCauses, setSelectedCauses }: { cause: CauseV2, selectedCauses: CauseV2[], setSelectedCauses: (causes: CauseV2[]) => void}) {
    const [customAmount, setCustomAmount] = useState<number | null>(null);
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const handleAmountChange = (amount: number) => {
        setSelectedCauses(selectedCauses.map((selectedCause) => 
            selectedCause.title === cause.title ? { ...selectedCause, amountCents: amount } : selectedCause
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
            selectedCause.title === cause.title ? { ...selectedCause, amountCents: 0 } : selectedCause
        ));
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm border">
            <div className="px-4 py-5 sm:p-6 flex justify-between">
                <p className={HEADER_CLASS}>{cause.title}</p>
                <div className="flex flex-col space-y-3 justify-start">
                    {cause.choices.map((choice) => (
                        <span key={choice.description} className="space-x-4">
                            <input 
                                type="radio"
                                id={`${cause.title}-${choice.description}`}
                                name={cause.title} 
                                value={choice.amountCents} 
                                checked={selectedAmount === choice.amountCents}
                                onChange={() => handleAmountChange(choice.amountCents)}
                            />
                            <label htmlFor={`${cause.title}-${choice.description}`}>${centsToDollars(choice.amountCents)} {choice.description}</label>
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
                                    onChange={(e) => {
                                        const value = Number(e.target.value);
                                        setCustomAmount(value);
                                        setSelectedAmount(value);
                                        setSelectedCauses(selectedCauses.map((selectedCause) => 
                                            selectedCause.title === cause.title ? { ...selectedCause, amountCents: Number(dollarsToCents(value)) } : selectedCause
                                        ));
                                    }}
                                />
                            </div>
                        ) : (
                            <span className="space-x-4 flex items-center">
                                <input 
                                    type="radio"
                                    id={`${cause.title}-custom`} 
                                    name={cause.title} 
                                    value={customAmount || ''}
                                    checked={selectedAmount === customAmount && customAmount !== null}
                                    onChange={handleCustomSelect}
                                />
                                <label htmlFor={`${cause.title}-custom`} onClick={handleCustomSelect}>Custom</label>
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
                                                selectedCause.title === cause.title ? { ...selectedCause, amountCents: Number(dollarsToCents(value)) } : selectedCause
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