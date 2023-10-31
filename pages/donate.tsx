import { useEffect, useState } from "react";
import { AuthProvider } from "../components/prebuilts/Authentication";
import { callKinshipAPI, supabase } from "../system/utils/helpers";
import { ConfirmationType, DonationStep } from "../components/prebuilts/donations/helpers/types";
import { v4 as uuidv4 } from 'uuid'
import { CurrencyList } from "../system/classes/utils";
import { Donation } from "../system/classes/donation";
import { loadStripe } from "@stripe/stripe-js";
import { DonationSummary } from "../components/prebuilts/Layouts";
import DonationInformationStep from "../components/prebuilts/donations/DonationInformationStep";
import StripeWrapper from "../components/prebuilts/donations/helpers/StripeWrapper";
import PaymentInfoStep from "../components/prebuilts/donations/PaymentInfoStep";
import WireTransferInstructions from "../components/prebuilts/donations/WireTransferInstructions";
import Confirmation from "../components/prebuilts/donations/confirmation/Confirmation";
import DonationErrorMessage from "../components/prebuilts/donations/helpers/ErrorMessage";

const stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Donate() {

    const [donor, setDonor] = useState(undefined)

    const fetchUser = async () => {
        try {
            const loggedInUser = await supabase.auth.getUser();

            if (loggedInUser.data.user) {
                const donorResponse = await callKinshipAPI('/api/donor/profile/fetch', {
                    donor_id: loggedInUser.data.user.id,
                })

                setDonor(donorResponse.donor);
            }
        } catch (error) {
            // Log error
            console.error(error)
        }
    };

    useEffect(() => {
        if (!donor) {
            fetchUser();
        }
    }, [supabase, donor]);

    const donationId = uuidv4();
    const [step, setStep] = useState<DonationStep>(DonationStep.AmountAndBilling);
    const [globalDonation, setGlobalDonation] = useState<Donation>({
        identifiers: {
            donation_id: donationId,
            donor_id: null,
        },
        donor: {
            first_name: "",
            last_name: "",
            email: "",
            address: {
                line_address: "",
                postal_code: "",
                city: "",
                state: "",
                country: ""
            },
            admin: false,
            set_up: false,
            stripe_customer_ids: []
        },
        causes: {
            total_amount_paid_in_cents: 0,
            currency: CurrencyList.CAD,
            causes: null, // causes is no longer a supported field, and is kept for backwards compatability
            is_imam_donation: false,
            is_sadat_donation: false,
            is_sadaqah: false
        },
        live: process.env.NEXT_PUBLIC_LIVEMODE == "true" ? true : false,
        amount_in_cents: 0,
        fees_covered: 0,
        fees_charged_by_stripe: 0, // This will be filled in based on the type of card they pay with, by the post-payment Stripe webhook
        date_donated: new Date()
    });
    const [confirmationType, setConfirmationType] = useState<ConfirmationType>(ConfirmationType.Unconfirmed)
    const [stripeClientSecret, setStripeClientSecret] = useState<string>(null);
    
    return (
        <AuthProvider donor={donor}>
            <div className="bg-white">
                <div className="fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block" />
                <div className="fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 lg:block" />

                <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 lg:pt-16">
                    <DonationSummary globalDonation={globalDonation} />

                    <section
                        aria-labelledby="payment-and-shipping-heading"
                        className="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pb-24 lg:pt-0"
                        >
                        <div>
                            <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                                {
                                    step == DonationStep.AmountAndBilling ?

                                        <DonationInformationStep
                                            globalDonation={globalDonation} 
                                            setGlobalDonation={setGlobalDonation} 
                                            setStep={setStep}
                                            setStripeClientSecret={setStripeClientSecret}
                                        />

                                    : step == DonationStep.PaymentInfo ?
                                        
                                        <StripeWrapper stripeClientSecret={stripeClientSecret} stripeClientPromise={stripeClientPromise}>
                                            <PaymentInfoStep
                                                globalDonation={globalDonation}
                                                stripeClientSecret={stripeClientSecret}
                                                setConfirmationType={setConfirmationType}
                                                setStep={setStep}
                                            />
                                        </StripeWrapper>

                                    : step == DonationStep.WireTransferInstructions ?

                                        <WireTransferInstructions
                                            globalDonation={globalDonation}
                                        />

                                    : step == DonationStep.Confirmation ?

                                        <Confirmation
                                            globalDonation={globalDonation}
                                            confirmationType={confirmationType} 
                                        />

                                    : <DonationErrorMessage />
                                }
                            {/* {globalDonation.identifiers.donation_id} {globalDonation.donor.first_name} {globalDonation.amount_in_cents}
                                <Page2 
                                    globalDonation={globalDonation} 
                                    setGlobalDonation={setGlobalDonation} 
                                    setStep={setStep}
                                    setStripeClientSecret={setStripeClientSecret}
                                /> */}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </AuthProvider>
    )
}

// const Page: FC<{ globalDonation: Donation, setGlobalDonation: (value: Donation) => void }> = ({ globalDonation, setGlobalDonation }) => {
//     const { donor } = useAuth()

//     useEffect(()=>{
//         console.log("hook called")
//         if (donor) {
//             setGlobalDonation({
//                 ...globalDonation,
//                 donor: donor
//             })
//         }
//     }, [donor])

//     return (
//         <div>
//             <input 
//                 value={globalDonation.donor.first_name}
//                 onChange={(e)=>{
//                     setGlobalDonation({
//                         ...globalDonation,
//                         donor: {
//                             ...globalDonation.donor,
//                             first_name: e.target.value
//                         }
//                     })
//                 }}
//             />

//             <TextInput
//                 placeholder="0"
//                 type="text"
//                 value={globalDonation.donor.first_name}
//                 name="amount"
//                 id="amount"
//                 onChange={(e) => { 
//                     setGlobalDonation({
//                         ...globalDonation,
//                         donor: {
//                             ...globalDonation.donor,
//                             first_name: e.target.value
//                         }
//                     })
//                 }}
//                 required={true}
//             />

//             { donor ?
//                 <p>{donor.first_name}</p>

//                 : "No donor"
//             }
//         </div>
//     )
// }