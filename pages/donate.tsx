import { useState } from "react";
import { ConfirmationType, DonationStep } from "../components/prebuilts/donations/helpers/types";
import { v4 as uuidv4 } from 'uuid'
import { Donation } from "@prisma/client";
import { loadStripe } from "@stripe/stripe-js";
import { DonationSummary } from "../components/prebuilts/Layouts";
import DonationInformationStep from "../components/prebuilts/donations/DonationInformationStep";
import StripeWrapper from "../components/prebuilts/donations/helpers/StripeWrapper";
import PaymentInfoStep from "../components/prebuilts/donations/PaymentInfoStep";
import WireTransferInstructions from "../components/prebuilts/donations/WireTransferInstructions";
import Confirmation from "../components/prebuilts/donations/confirmation/Confirmation";
import DonationErrorMessage from "../components/prebuilts/donations/helpers/ErrorMessage";
import { Stripe } from "@stripe/stripe-js";

const stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function Donate() {
    const donationId = uuidv4();
    const [step, setStep] = useState<DonationStep>(DonationStep.AmountAndBilling);

    const [globalDonation, setGlobalDonation] = useState<Donation>({
        id: uuidv4(),
        loggedAt: new Date(),
        status: "PROCESSING",
        donatedAt: new Date(),
        adheringLabels: [
            "V3_STRIPE_PAYMENT"
        ],
        allocatedToCauses: 0,
        unallocatedToCauses: 0,
        allocationBreakdown: { v3Causes: [] },
        causeName: null,
        causeRegion: "ANYWHERE",
        transactionStatus: "PENDING",
        amountDonatedInCents: 0,
        amountRefunded: 0,
        amountChargedInCents: 0,
        feesChargedInCents: 0,
        feesDonatedInCents: 0,
        currency: "CAD",
        donorId: null,
        donorFirstName: "",
        donorMiddleName: null,
        donorLastName: "",
        donorEmail: "",
        donorAddressLineAddress: "",
        donorAddressCity: "",
        donorAddressState: "ON",
        donorAddressCountry: "CA",
        donorAddressPostalCode: "",
        billingAddressPostalCode: "",
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
    });
    const [confirmationType, setConfirmationType] = useState<ConfirmationType>(ConfirmationType.Unconfirmed)
    const [stripeClientSecret, setStripeClientSecret] = useState<string | undefined>(undefined);
    
    return (
        <div className="bg-white">
            <div className="z-1 fixed left-0 top-0 hidden h-full w-1/2 bg-white lg:block" />
            <div className="z-1 fixed right-0 top-0 hidden h-full w-1/2 bg-gray-50 lg:block" />

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
                                    
                                    <StripeWrapper stripeClientSecret={stripeClientSecret ? stripeClientSecret : ""} stripeClientPromise={stripeClientPromise as Promise<Stripe>}>
                                        <PaymentInfoStep
                                            globalDonation={globalDonation}
                                            stripeClientSecret={stripeClientSecret ? stripeClientSecret : ""}
                                            setGlobalDonation={setGlobalDonation}
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
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}