import { DonationPageLayout } from '../components/prebuilts/Layouts';
import { useState } from 'react';
import { Donor } from '../system/classes/donor';
import { Donation } from '../system/classes/donation';
import { loadStripe } from "@stripe/stripe-js";
import { v4 as uuidv4 } from 'uuid'
import { CurrencyList } from '../system/classes/utils';
import { ConfirmationType, DonationStep } from '../components/prebuilts/donations/helpers/types';
import AmountAndBillingStep from '../components/prebuilts/donations/information/AmountAndBilling';
import DonationErrorMessage from '../components/prebuilts/donations/helpers/ErrorMessage';
import StripeWrapper from '../components/prebuilts/donations/helpers/StripeWrapper';
import WireTransferInstructions from '../components/prebuilts/donations/payment/DonateWithWireTransfer';
import DonateWithCard from '../components/prebuilts/donations/payment/DonateWithCard';
import DonateWithAcssDebit from '../components/prebuilts/donations/payment/DonateWithAcssDebit';
import Confirmation from '../components/prebuilts/donations/confirmation/Confirmation';

const stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Donate() {
    const donationId = uuidv4();

    const [step, setStep] = useState<DonationStep>(DonationStep.AmountAndBilling);

    // Initialize globalDonation with an empty donation object, used to pass state to other elements
    const [globalDonation, setGlobalDonation] = useState<Donation>({
        identifiers: {
            donation_id: donationId,
            donor_id: null,
        },
        donor: null,
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
  
  
    const DonationFormChild = ({
        donor,
        parentIsLoading,
    }: {
        donor: Donor;
        parentIsLoading: boolean;
    }) => {
        if (step === DonationStep.AmountAndBilling) {
            return (
                <AmountAndBillingStep
                    donationId={donationId}
                    donor={donor}
                    parentIsLoading={parentIsLoading}
                    setStep={setStep}
                    setGlobalDonation={setGlobalDonation}
                    setStripeClientSecret={setStripeClientSecret}
                />
            );
        } else if (step === DonationStep.DonateWithCreditOrDebitCard) {
            return (
                <StripeWrapper stripeClientSecret={stripeClientSecret} stripeClientPromise={stripeClientPromise}>
                    <DonateWithCard
                        globalDonation={globalDonation}
                        stripeClientSecret={stripeClientSecret}
                        setConfirmationType={setConfirmationType}
                        setStep={setStep}
                    />
                </StripeWrapper>
            );
        } else if (step === DonationStep.DonateWithAcssDebit) {
            return (
                <StripeWrapper stripeClientSecret={stripeClientSecret} stripeClientPromise={stripeClientPromise}>
                    <DonateWithAcssDebit
                        globalDonation={globalDonation}
                        stripeClientSecret={stripeClientSecret}
                        setStep={setStep}
                        setConfirmationType={setConfirmationType}
                    />
                </StripeWrapper>
            );
        } else if (step === DonationStep.WireTransferInstructions) {
            return <WireTransferInstructions
                globalDonation={globalDonation}
            />;
        } else if (step === DonationStep.Confirmation) {
            return <Confirmation
                globalDonation={globalDonation}
                confirmationType={confirmationType} 
            />;
        } else {
            return <DonationErrorMessage />;
        }
    };

    return (
        <DonationPageLayout DonationForm={DonationFormChild} globalDonation={globalDonation} />
    );
}



