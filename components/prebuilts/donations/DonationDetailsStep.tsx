import { useState, FC, useEffect } from "react"
import { DonationStep } from "./helpers/types"
import { Donation, DonationRegion } from "@prisma/client"
import { callKinshipAPI, centsToDollars, dollarsToCents, isFloatOrInteger, validateEmail } from "../../../lib/utils/helpers"
import { Alert, BaseHeader, BasicPanel, Button, TextInput, VerticalSpacer } from "../../primitives"
import { ButtonSize, ButtonStyle, EventColors, InputCustomizations, SpacerSize } from "../../primitives/types"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import { useAuth } from "../Authentication"
import { ObjectIdApiResponse } from "@lib/classes/api"
import { ArrowLeftIcon, CheckCircle, HeartHandshake, Home, MailIcon, PlusIcon } from "lucide-react"
import { HandRaisedIcon } from "@heroicons/react/24/outline"

type DefaultCauseChoice = {
    amountCents: number
    description: string
}

type CauseV2 = {
    region: DonationRegion
    title: string
    shortDescription: string
    longDescription: string
    icon: React.ReactElement
    defaults: DefaultCauseChoice[]
}

type SelectedCause = CauseV2 & { amountCents: number }

const causes: CauseV2[] = [
    {
        region: DonationRegion.ANYWHERE,
        title: "Sadaqah",
        shortDescription: "Something something this will do good",
        longDescription: "Support our projects in India long long long description yk how it goes",
        icon: <HeartHandshake className="w-4 h-4" />,
        defaults: []
    },
    {
        region: DonationRegion.IRAQ,
        title: "Sehme Sadat",
        shortDescription: "Something something this will do good",
        longDescription: "Support our projects in India long long long description yk how it goes",
        icon: <Home className="w-4 h-4" />,
        defaults: []
    },
    {
        region: DonationRegion.IRAQ,
        title: "Sehme Imam",
        shortDescription: "Something something this will do good",
        longDescription: "Support our projects in India long long long description yk how it goes",
        icon: <HandRaisedIcon className="w-4 h-4" />,
        defaults: []
    },
    {
        region: DonationRegion.INDIA,
        title: "Vision Kinship - India",
        shortDescription: "Break the cycle of poverty in India",
        longDescription: "Support our projects in India long long long description yk how it goes",
        icon: <MailIcon className="w-4 h-4" />,
        defaults: [
            {
                amountCents: 5000,
                description: "Support a child for a year"
            },
            {
                amountCents: 10000,
                description: "Support a family for a year"
            },
            {
                amountCents: 25000,
                description: "Support a community for a year"
            }
        ]
    },
    {
        region: DonationRegion.AFRICA,
        title: "Africa",
        shortDescription: "Support our projects in Africa",
        longDescription: "Something something this is a desc",
        icon: <MailIcon className="w-4 h-4" />,
        defaults: [
            {
                amountCents: 5000,
                description: "Build a road"
            },
        ]
    
    }
]

const DonationDetailsStep: FC<{ globalDonation: Donation, setGlobalDonation: (value: Donation) => void, setStep: (value: DonationStep) => void, setStripeClientSecret: (value: string) => void }> = ({ globalDonation, setGlobalDonation, setStep, setStripeClientSecret }) => {
    const { donor } = useAuth()

    useEffect(()=>{
        if (donor) {
            setGlobalDonation({
                ...globalDonation,
                donorFirstName: donor.donorFirstName,
                donorLastName: donor.donorLastName,
                donorEmail: donor.donorEmail,
                donorAddressLineAddress: donor.donorAddressLineAddress,
                donorAddressCity: donor.donorAddressCity,
                donorAddressState: donor.donorAddressState,
                donorAddressPostalCode: donor.donorAddressPostalCode,
                donorAddressCountry: donor.donorAddressCountry
            })
        }
    }, [donor])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<{ title: string, message: string } | undefined>(undefined)

    const [selectedCauses, setSelectedCauses] = useState<SelectedCause[]>([])
    const [view, setView] = useState<"causesList" | "chooseAmount" | "checkoutOrDonateMore">("causesList")
    const [causeChoosingAmountFor, setCauseChoosingAmountFor] = useState<CauseV2>()
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

    const addToSelectedCauses = (cause: CauseV2, amountCents: number) => {
        // setGlobalDonation({
        //     ...globalDonation,
        //     causes: [...globalDonation.causes, { ...cause, amountCents }]
        // })
        setSelectedCauses([...selectedCauses, { ...cause, amountCents }])
        return
    }

    const handleDonationDetailsStep = async () => {
        setLoading(true)

        try {
            setError(undefined)

            // Validate that there is a valid amount being donated
            try {
                if (!isFloatOrInteger(globalDonation.amountDonatedInCents)) {
                    throw new Error("Enter a valid amount to donate")
                }

                const amountDonatedInCents = globalDonation.amountDonatedInCents

                if (amountDonatedInCents < 500) {
                    // We require a minimum of $5 because there are fixed costs associated with credit card fees
                    // We could waive this minimum for eTransfers, which would add a relatively small amount of complexity
                    // However, since donations this small are extremely uncommon we have ommited the edge case
                    setError({
                        title: "minimum donation required",
                        message: "Please donate a minimum of $5"
                    })
                    setLoading(false)
                    return
                }
            } catch (e) {
                setError({
                    title: "invalid donation amount",
                    message: "Please enter a valid amount to donate"
                })
                setLoading(false)
                return
            }

            if (!validateEmail(globalDonation.donorEmail)) {
                setError({
                    title: "invalid email",
                    message: "Please enter a valid email"
                })
                setLoading(false)
                return
            }


            const response: ObjectIdApiResponse = await callKinshipAPI<string>('/api/v2/stripe/createPaymentIntent', {
                donation: globalDonation
            })

            if (response.error) {
                setStep(DonationStep.Error)
                setLoading(false)
                return
            }

            // If the response status is 200, we can assume the shape of the response
            setStripeClientSecret(response.data!)

            // Finally, set the next step
            if (globalDonation.amountDonatedInCents > 10_000_00) {
                setStep(DonationStep.WireTransferInstructions)
            } else {
                setStep(DonationStep.PaymentInfo)
            }
            setLoading(false)
            return
        } catch (error) {
            setStep(DonationStep.Error)
            return
        }
    }

    return (
        <div>
            {view == "causesList" ? (
               <div>
                    <VerticalSpacer size={SpacerSize.Small} />
                    <div className="space-y-4">
                        {causes.map((cause) => (
                            <div 
                                onClick={()=>{
                                    setCauseChoosingAmountFor(cause)
                                    setView("chooseAmount")
                                }}
                                key={cause.title}
                                className="overflow-hidden rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-gray-100 cursor-pointer flex p-4"
                            >
                               
                                <div className="flex flex-col items-center mr-4">
                                    <div className="rounded-full bg-blue-600 p-2 text-white">
                                        {cause.icon}
                                    </div>
                                </div>
                                <div>
                                    <h2 className="font-semibold">{cause.title}</h2>
                                    <p className="text-md text-slate-700">{cause.shortDescription}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : view == "chooseAmount" && causeChoosingAmountFor ? (
                <div className="space-y-3">
                    <Button 
                        text="&larr; Go Back" 
                        style={ButtonStyle.OutlineUnselected}
                        onClick={() => {
                            setView("causesList")
                            setCauseChoosingAmountFor(undefined)
                            setSelectedAmount(null)
                    }} />

                    <p>Select a suggested amount, or enter how much you would like to donate.</p>
                
                {causeChoosingAmountFor.defaults.map((option) => (
                  <label key={option.amountCents} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value={option.amountCents}
                      checked={selectedAmount === option.amountCents}
                      onChange={() => setSelectedAmount(option.amountCents)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="text-gray-700">${centsToDollars(option.amountCents)} {option.description}</span>
                  </label>
                ))}
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={!causeChoosingAmountFor.defaults.some(d => d.amountCents === selectedAmount)}
                    onChange={() => setSelectedAmount(0)}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="text-gray-700">Pay your own amount:</span>
                  <TextInput
                    placeholder="0"
                    type="text"
                    inputCustomization={InputCustomizations.Dollars}
                    name="amount"
                    id="amount"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { 
                        setSelectedAmount(parseInt(dollarsToCents(e.target.value)))
                    }}
                    required={true}
                />
                </label>

                <div className="flex justify-end">
                  <Button 
                    text="Add Donation To Cart" 
                    style={ButtonStyle.Primary}
                    onClick={() => {
                        if (selectedAmount) {
                            addToSelectedCauses(causeChoosingAmountFor, selectedAmount)
                            setView("checkoutOrDonateMore")
                            setCauseChoosingAmountFor(undefined)
                            setSelectedAmount(null)
                        } else {
                            alert("Please select an amount to donate")
                        }
                }} />
                </div>
              </div>
            ) : view == "checkoutOrDonateMore" ? (
                <div className="flex flex-col space-y-3">
                    <div className="flex space-x-2">
                        <div className="rounded-full bg-green-600 p-2 text-white">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-gray-900">Donation successfully added to cart!</h3>
                    </div>
                   
                    <p className="mt-1 text-lg text-slate-500">You can continue to add more donations, or check out if you are ready</p>

                    <div className='flex w-full justify-end space-x-3 mt-8'>
                        <Button 
                            text="Donate More" 
                            isLoading={loading} 
                            icon={<PlusIcon className="w-4 h-4" />}
                            style={ButtonStyle.Secondary}
                            size={ButtonSize.Large} 
                            onClick={()=>{setView("causesList")}}
                        />

                        <Button 
                            text="Checkout &rarr;" 
                            isLoading={loading} 
                            icon={<LockClosedIcon className="w-4 h-4" />}
                            style={ButtonStyle.Primary}
                            size={ButtonSize.Large} 
                            onClick={handleDonationDetailsStep}
                        /> 
                    </div>
                </div>
            ) : <p>Sorry, an error occurred</p>}

        

            <VerticalSpacer size={SpacerSize.Large} />
            

            {error && (
                <span>
                    <VerticalSpacer size={SpacerSize.Large} />
                    <Alert 
                        type={EventColors.Error} 
                        title={`Error: ${error.title}`} 
                        message={error.message} 
                    />
                </span>
            )}

            
        </div>
    )
}

export default DonationDetailsStep