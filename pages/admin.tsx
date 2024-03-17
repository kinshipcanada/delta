import { useAuth } from "@components/prebuilts/Authentication"
import { callKinshipAPI, centsToDollars, classNames, dollarsToCents, parseFrontendDate } from "@lib/utils/helpers"
import { Country, Donation, PaymentMethodType } from "@prisma/client"
import { useEffect, useState } from "react"
import { Tab } from '@headlessui/react'
import { Fragment } from 'react'
import toast from "react-hot-toast"
import { Files, Mail, PlusCircle } from "lucide-react"
import { PrismaDonationPanel } from "@components/prebuilts/app/DonationPanel"
import { BaseHeader, Button, ButtonSize, ButtonStyle, CheckboxInput, Label, SpacerSize, TextInput, VerticalSpacer } from "@components/primitives"
import { Dialog } from '@headlessui/react'
import Address, { GoogleFormattedAddress } from "@components/Address"
import { InputCustomizations } from "@components/primitives/types"

export default function Admin() {
    const { donor } = useAuth()
    const [donations, setDonations] = useState<Donation[]>([])
    const [loadingDonations, setLoadingDonations] = useState(false)

    const [loadingAccess, setLoadingAccess] = useState(true)

    const fetchDonations = async () => {
        if (!donor) { return }

        const donations = await callKinshipAPI<Donation[]>("/api/v2/donor/fetch_donations", {
            donorEmail: donor.donorEmail,
        })

        if (!donations.data) {
            toast.error("Something went wrong loading your dashboard", { position: "top-right" })
            setLoadingDonations(false)
            return
        }

        setDonations(donations.data)
        setLoadingDonations(false)
        return
    }

    // useEffect(()=>{
    //     fetchDonations()
    // }, [donor])

    return (
        <div >
            {loadingDonations && <p>Loading...</p>}
            {!loadingDonations && (
                <main className="flex flex-col p-4">
                    <Tab.Group>
                        <Tab.List>
                            <Tab as={Fragment}>
                                {({ selected }) => (
                                    <button
                                        className={
                                            selected ? 'outline-none p-1.5 bg-gray-100 text-blue-600 font-semibold text-sm rounded-lg' : 'p-1.5 text-black font-semibold text-sm'
                                        }
                                    >
                                        <span className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2" />
                                            Resend Donations
                                        </span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                            {({ selected }) => (
                                    <button
                                        className={
                                            selected ? 'outline-none p-1.5 bg-gray-100 text-blue-600 font-semibold text-sm rounded-lg' : 'p-1.5 text-slate-600 font-semibold text-sm'
                                        }
                                    >
                                        <span className="flex items-center">
                                            <Files className="w-4 h-4 mr-2" />
                                            Upload Proof - Disabled
                                        </span>
                                    </button>
                                )}
                            </Tab>
                            <Tab as={Fragment}>
                            {({ selected }) => (
                                    <button
                                        className={
                                            selected ? 'outline-none p-1.5 bg-gray-100 text-blue-600 font-semibold text-sm rounded-lg' : 'p-1.5 text-slate-600 font-semibold text-sm'
                                        }
                                    >
                                        <span className="flex items-center">
                                            <PlusCircle className="w-4 h-4 mr-2" />
                                            Upload Donation
                                        </span>
                                    </button>
                                )}
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className={"my-4"}>
                            <Tab.Panel className={"space-y-4"}>
                                <ResendDonations />
                            </Tab.Panel>
                            <Tab.Panel>
                                <UploadProof />
                            </Tab.Panel>
                            <Tab.Panel>
                                <UploadDonations />
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </main>
            )}
        </div>
    )
}

const UploadProof = () => {

    const partners = ["Al Ayn", "Desk and Chair Foundation"]
    const causes = ["Education", "Poverty Relief", "Vision Kinship"]

    return (
        <div>
            <BaseHeader>Upload Proof Of Donation</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <div className="space-y-4">
                <TextInput
                    label="Amount Sent"
                    placeholder="0"
                    type="text"
                    inputCustomization={InputCustomizations.Dollars}
                    name="amount"
                    id="amount"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                    }}
                    required={true}
                />
                <div>
                    <Label label={"Where did the funds go"} htmlFor={"country"} required={true} />
                    <select
                        id={"country"}
                        name={"country"}
                        onChange={(e: any)=>{ 

                            const countrySelected = e.target.value
                            const validCountries = countries
                        }}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        defaultValue={"CA"}
                    >
                        {Object.entries(countries).map(([countryCode, countryName]) => (
                            <option key={countryCode} value={countryCode}>
                                {countryName}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label label={"Which partner delivered the funds"} htmlFor={"partner"} required={true} />
                    <select
                        id={"partner"}
                        name={"partner"}
                        onChange={(e: any)=>{ 

                            const countrySelected = e.target.value
                            const validCountries = countries
                        }}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        defaultValue={"CA"}
                    >
                        {partners.map((partner)=>(
                            <option key={partner} value={partner}>
                                {partner}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label label={"What cause did it go to"} htmlFor={"cause"} required={true} />
                    <select
                        id={"cause"}
                        name={"cause"}
                        onChange={(e: any)=>{ 

                            const countrySelected = e.target.value
                            const validCountries = countries
                        }}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                        defaultValue={"CA"}
                    >
                         {causes.map((cause)=>(
                            <option key={cause} value={cause}>
                                {cause}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div>
                    <Label label={"Upload proof documents"} htmlFor={"country"} required={true} />
                    <input type="file" />
                </div>
            </div>

            <div className="flex justify-end">
                <Button text="Upload Proof" style={ButtonStyle.Primary} />
            </div>
        </div>
    )
}

import { v4 as uuidv4 } from 'uuid'
import { countries } from "@lib/utils/constants"

const UploadDonations = () => {

    const [error, setError] = useState<string>()
    const [message, setMessage] = useState<string>()
    const [uploading, setUploading] = useState<boolean>(false)
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('ETRANSFER');
    const [date, setDate] = useState<Date>();
    const [address, setAddress] = useState<string>('')
    const [formattedAddress, setFormattedAddress] = useState<GoogleFormattedAddress>()

    const [isKhums, setIsKhums] = useState<boolean>(false)
    const [isImam, setIsImam] = useState<boolean>(false)
    const [isSadat, setIsSadat] = useState<boolean>(false)
    const [isSadaqah, setIsSadaqah] = useState<boolean>(false)
    const [isRamadhan, setIsRamadhan] = useState<boolean>(false)
    
    const handleSubmit = async () => {
        setUploading(true)
        setError(undefined)
        setMessage(undefined)

        console.log("uploading...")
        if (!date) {
            setError("Please add a valid date")
            setUploading(false)
            return
        }

        if (!formattedAddress) {
            setError("Please select an address")
            setUploading(false)
            return
        }

        let adheringLabels: string[] = []

        if (isKhums && !isImam && !isSadat) {
            setError("Please specify where to direct khums: To upload a khums donation, please specify whether it is Imam, Sadat, or both")
            setUploading(false)
            return
        }

        if (isImam) { adheringLabels.push("IMAM_DONATION") }
        if (isSadat) { adheringLabels.push("SADAT_DONATION") }
        if (isSadaqah) { adheringLabels.push("SADAQAH_DONATION") }
        if (isRamadhan) { adheringLabels.push("RAMADHAN_DONATION") }

        const donation: Donation = {
            id: uuidv4(),
            loggedAt: new Date(),
            status: "PROCESSING",
            donatedAt: date,
            adheringLabels: [
                "MANUALLY_CREATED",
            ],
            allocatedToCauses: 0,
            unallocatedToCauses: amount,
            allocationBreakdown: { v3Causes: [] },
            causeName: null,
            causeRegion: "ANYWHERE",
            transactionStatus: "SUCCEEDED",
            amountDonatedInCents: amount,
            amountRefunded: 0,
            amountChargedInCents: amount,
            feesChargedInCents: 0,
            feesDonatedInCents: 0,
            currency: "CAD",
            donorId: null,
            donorFirstName: firstName,
            donorMiddleName: null,
            donorLastName: lastName,
            donorEmail: email,
            donorAddressLineAddress: `${formattedAddress.streetNumber} ${formattedAddress.route}`,
            donorAddressCity: formattedAddress.locality!,
            donorAddressState: formattedAddress.administrativeAreaLevel1!,
            donorAddressCountry: formattedAddress.country! == "Canada" ? "CA" : "AD",
            donorAddressPostalCode: formattedAddress.postalCode!,
            billingAddressPostalCode: formattedAddress.postalCode!,
            stripeCustomerId: null,
            stripePaymentIntentId: null,
            stripePaymentMethodId: null,
            stripeChargeId: null,
            stripeBalanceTxnId: null,
            paymentMethodType: paymentMethod,
            pmCardFunding: null,
            pmCardBrand: null,
            pmCardLast4: null,
            pmCardExpMonth: null,
            pmCardExpYear: null,
            legacyIdV0: null,
            legacyIdV1: null
        }

        console.log("Built donation, calling api")

        const response = await callKinshipAPI<string>('/api/v2/donations/manual', {
            donation
        })
        
        if (response.error) {
            setError(response.error)
            setUploading(false)
        } else {
            setMessage(`Successfully generated and sent to ${email}`)
            setFirstName("")
            setLastName("")
            setEmail("")
            setAmount(0)
            setPaymentMethod('ETRANSFER')
            setDate(undefined)
            setAddress('')
            setFormattedAddress(undefined)
            setIsImam(false)
            setIsKhums(false)
            setIsSadaqah(false)
            setIsSadat(false)
            setIsRamadhan(false)
            setUploading(false)
        }
    };

    return (
        <div>
            <BaseHeader>Upload Donation</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <div className="space-y-4">
                <TextInput
                    placeholder="0"
                    type="text"
                    inputCustomization={InputCustomizations.Dollars}
                    name="amount"
                    id="amount"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setAmount(parseInt(dollarsToCents(e.target.value)))
                    }}
                    required={true}
                />
                <Label label={"Date Donated"} htmlFor={"date"} required={true} />
                <input
                    type="date"
                    name="dateDonated"
                    id="dateDonated"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setDate(new Date(e.target.value));
                    }}
                    required={true}
                    max={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <TextInput
                    label="First Name"
                    placeholder="Some"
                    type="text"
                    name="firstName"
                    id="firstName"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setFirstName(e.target.value)
                    }}
                    required={true}
                />
                <TextInput
                    label="Last Name"
                    placeholder="Donor"
                    type="text"
                    name="lastName"
                    id="lastName"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setLastName(e.target.value)
                    }}
                    required={true}
                />
                <TextInput
                    label="Email"
                    placeholder="somedonor@gmail.com"
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setEmail(e.target.value)
                    }}
                    required={true}
                />
                <Label label={"Address"} htmlFor={"address"} required={true} />
                <Address addressString={address} setAddressString={setAddress} formattedAddress={formattedAddress} setFormattedAddress={setFormattedAddress} />
                <Label label={"Payment Method"} htmlFor={"paymentMethod"} required={true} />
                <select onChange={(e)=>{setPaymentMethod(e.target.value as PaymentMethodType)}}>
                    <option value={"ETRANSFER"}>eTransfer</option>
                    <option value={"CASH"}>Cash</option>
                </select>
                <div className="">
                {/* <CheckboxInput
                label="Is this donation for the Ramadhan Campaign?"
                checked={isRamadhan}
                required={false}
                onChange={(e) => { 
                    setIsRamadhan(e.target.checked)
                }}
            /> */}

            <VerticalSpacer size={SpacerSize.Small} />

            <CheckboxInput
                label="Is this donation Sadaqah"
                checked={isSadaqah}
                required={false}
                onChange={(e) => { 
                    setIsSadaqah(e.target.checked)
                }}
            />

            <VerticalSpacer size={SpacerSize.Small} />
            
            <CheckboxInput
                label="Is this a khums donation?"
                checked={isKhums}
                required={false}
                onChange={(e) => { setIsKhums(e.target.checked) }}
            />

            <VerticalSpacer size={SpacerSize.Small} />

            { isKhums && (
                <div className='px-4'>
                    <CheckboxInput
                        label="Sehme Imam"
                        checked={isImam}
                        required={false}
                        onChange={(e) => { 
                            setIsImam(e.target.checked)
                        }}
                    />
                    <VerticalSpacer size={SpacerSize.Small} />
                    <CheckboxInput
                        label="Sehme Sadat"
                        checked={isSadat}
                        required={false}
                        onChange={(e) => { 
                            setIsSadat(e.target.checked)
                        }}
                    />
                    <VerticalSpacer size={SpacerSize.Small} />
                </div>
            )}
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSubmit} text={uploading ? "Uploading..." : "Upload"} style={ButtonStyle.Primary} />
                </div>
            </div>

            {message && <p className="text-green-600 font-semibold">{message}</p>}
            {error && <p className="text-red-600 font-semibold">{message}</p>}
        </div>
    )
}

const ResendDonations = () => {
    const [emailQueryingFor, setEmailQueryingFor] = useState<string>()
    const [queryTriggered, setQueryTriggered] = useState<boolean>(false)
    const [loadingDonations, setLoadingDonations] = useState<boolean>(false)
    const [error, setError] = useState<string>()

    const [donations, setDonations] = useState<Donation[]>([])

    const searchForDonations = async () => {
        setLoadingDonations(true)

        if (!emailQueryingFor || emailQueryingFor.length < 3 || !emailQueryingFor.includes("@")) {
            setError("Invalid email")
        }

        const donations = await callKinshipAPI<Donation[]>("/api/v2/donor/fetch_donations", {
            donorEmail: emailQueryingFor
        })

        if (!donations.data) {
            toast.error("Something went wrong loading the donations", { position: "top-right" })
            setLoadingDonations(false)
            return
        }

        setQueryTriggered(true)
        setDonations(donations.data)
        setLoadingDonations(false)
        return
    }

    const [resendPanelOpen, setResendPanelOpen] = useState(false)
    const [emailToBeSent, setEmailToBeSent] = useState('')

    const resendAllDonations = async () => {
        const constructedBody = `
            Dear Ali Pirbhai,

            Attached are your donations for the previous year. We've also included other donations under ali@metrowest.ca (including by the Pirbhai Foundation and Amir Pirbhai) for convenience. 

            Please let us know if anything else is needed.

            Donations: 
            ${donations.map((donation)=>                
                `${centsToDollars(donation.amountChargedInCents)} donated on ${parseFrontendDate(donation.donatedAt).split(",")[-1]} ${parseFrontendDate(donation.donatedAt)} by ${donation.donorFirstName} ${donation.donorLastName}: ${process.env.NEXT_PUBLIC_DOMAIN}/receipts/${donation.id}\n`
            )}

            Best,
            Team At Kinship Canada
        `

        setEmailToBeSent(constructedBody)
        setResendPanelOpen(true)
    }

    return (
        <div className="flex flex-col">
            <div className="flex w-full flex-col space-y-4">
                <TextInput
                    placeholder="example@gmail.com"
                    type="email"
                    name="email"
                    id="email"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setQueryTriggered(false)
                        setEmailQueryingFor(e.target.value)
                    }}
                    required={true}
                />
                <div>
                    <Button text={loadingDonations ? "Please wait..." : "Search For Donations"} style={ButtonStyle.Primary} onClick={searchForDonations} />
                </div>
                {error && <p className="text-red-600 font-semibold">{error}</p>}
            </div>
            <VerticalSpacer size={SpacerSize.Medium} />
            <div className="mt-4">
                {
                    loadingDonations ? "Loading donations..." :

                    <div className="flex w-full flex-col">
                        {(donations.length === 0 && queryTriggered === true) && `No Donations Found For ${emailQueryingFor}`}
                        {donations.length > 0 && (
                            <div className="w-full">
                                <div className="flex justify-between">
                                    <p className="font-medium">
                                        {donations.length} Donations issued to {
                                            Array.from(new Set(donations.map(donation => `${donation.donorFirstName} ${donation.donorLastName}`)))
                                            .join(", ")
                                        }
                                    </p>
                                    <Button text={loadingDonations ? "Please wait..." : "Resend All For Last Year"} style={ButtonStyle.Secondary} onClick={resendAllDonations} />
                                </div>
                                
                                <table className="table-auto w-full mt-4">
                                        <thead>
                                            <tr className="">
                                                <th className="">Amount Charged</th>
                                                <th className="">Issued To</th>
                                                <th className="">Date</th>
                                                <th className="">Payment Method</th>
                                                <th className="">Stripe ID</th>

                                                <th className=""></th>
                                                <th className=""></th>
                                            </tr>
                                        </thead>
                                        <tbody className="">
                                        {donations.map((donation, donationIdx)=>{
                                            return (
                                                <tr className={donationIdx % 2 != 0 ? "bg-gray-200" : ""}>
                                                    <td className="font-semibold">${centsToDollars(donation.amountChargedInCents)}</td>
                                                    <td>{donation.donorFirstName} {donation.donorMiddleName ? donation.donorMiddleName : ""} {donation.donorLastName}</td>
                                                    <td>{parseFrontendDate(donation.donatedAt)}</td>
                                                    <td>{donation.paymentMethodType == "CARD" ? `${donation.paymentMethodType} (${donation.pmCardLast4})` : donation.paymentMethodType}</td>
                                                    <td className="font-semibold">{donation.stripePaymentIntentId ? donation.stripePaymentIntentId : "None"}</td>
                                                   
                                                    <td>
                                                        <Button href={`https://www.kinshipcanada.com/receipts/${donation.id}`} size={ButtonSize.Small} style={ButtonStyle.Primary} text="View Receipt" />
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    <tr className="font-semibold">
                                        <td>Total: ${centsToDollars(donations.reduce((acc, donation) => acc + donation.amountChargedInCents, 0))}</td>
                                        <td></td>
                                        <td></td>
                                        
                                    </tr>
                                        
                                    </tbody>
                            </table>
                          </div>
                        )}
                        <Dialog open={resendPanelOpen} onClose={() => setResendPanelOpen(false)}>
                            <Dialog.Panel>
                                <Dialog.Title>Preview Email</Dialog.Title>
                                <Dialog.Description>
                                This email will be sent to {emailQueryingFor}
                                </Dialog.Description>

                                {emailToBeSent}

                                <button onClick={() => setResendPanelOpen(false)}>Send Email</button>
                                <button onClick={() => setResendPanelOpen(false)}>Cancel</button>
                            </Dialog.Panel>
                        </Dialog>
                    </div>
                }
            </div>
        </div>
    )
}
