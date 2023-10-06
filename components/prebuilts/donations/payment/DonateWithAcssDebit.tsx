import { useElements, useStripe } from "@stripe/react-stripe-js"
import { useState, FC } from "react"
import { Donation } from "../../../../system/classes/donation"
import { ConfirmationType, DonationStep } from "../helpers/types"
import GoBackHelper from "../helpers/GoBackButton"
import { Alert, Button, ButtonSize, ButtonStyle, EventColors, SpacerSize, VerticalSpacer } from "../../../primitives"
import { BuildingLibraryIcon } from "@heroicons/react/24/solid"

const DonateWithAcssDebit: FC<{ globalDonation: Donation, stripeClientSecret: string,  setStep: (value: DonationStep) => void, setConfirmationType: (value: ConfirmationType) => void }> = ({ globalDonation, stripeClientSecret, setStep, setConfirmationType }) => {
    if (globalDonation == null || globalDonation == undefined) {
        setStep(DonationStep.Error)
        return null
    } else {
        const [processingDonation, setProcessingDonation] = useState<boolean>(false)

        // This is a hook that access the client created by stripeClientPromise once it loads
        const stripe = useStripe()
        // This hook securely accesses sensitive details like CC details inputted to the stripe client, to be passed directly to Stripe
        // Kinship servers should never access these details in raw form, even in submitting to Stripe
        const elements = useElements()

        const handleBankProcessingSubmit = async () => {
            setProcessingDonation(true)

            if (!stripe || !elements) {
                return;
            }
        
            try {
                const { paymentIntent, error } = await stripe.confirmAcssDebitPayment(
                        stripeClientSecret,
                    {
                        payment_method: {
                            billing_details: {
                                name: `Jenny Rosen`,
                                email: 'jenny.rosen@example.com',
                            },
                        },
                        return_url: "http://localhost:3000/this_isMyreturn"
                    }
                );
        
              if (error) {
                // Handle the error and inform the user
                setStep(DonationStep.Error)
                return
              } else {
                // Handle the successful payment
                const paymentIntentStatus = paymentIntent.status

                if (paymentIntentStatus == "processing") {
                    setConfirmationType(ConfirmationType.ConfirmedProcessing)
                } else if (paymentIntentStatus == "requires_action") {
                    setConfirmationType(ConfirmationType.FurtherStepsRequired)
                } else if (paymentIntentStatus == "succeeded") {
                    setConfirmationType(ConfirmationType.ConfirmedAndReceived)
                } else {
                    setStep(DonationStep.Error)
                    return
                }

                setStep(DonationStep.Confirmation)
              }
            } catch (error) {
              setStep(DonationStep.Error)
            }
        };

        return (
            <div>
                <GoBackHelper setStep={setStep} />
                <VerticalSpacer size={SpacerSize.Small} />
                <Alert 
                    type={EventColors.Info}
                    title={"Kinship Canada uses Stripe"}
                    message={
                        "Kinship Canada uses Stripe (stripe.com) to process direct bank transfers. We do not collect or store your sensitive banking information. Upon clicking 'Connect Bank And Donate', you will see a secure bank connection form, and can choose what account to donate with."
                    }
                />
                {stripeClientSecret && (
                    <div>
                        <VerticalSpacer size={SpacerSize.Medium} />
                        <div className='w-full flex justify-end'>
                            <Button 
                                text={processingDonation ? "Connecting to Stripe" : "Connect Bank And Donate"}
                                icon={<BuildingLibraryIcon />}
                                style={ButtonStyle.Primary}
                                size={ButtonSize.Large} 
                                isLoading={processingDonation || !stripe} 
                                onClick={handleBankProcessingSubmit}
                            />
                        </div>
                    </div>
                )}
            </div>
        )
    }
}

export default DonateWithAcssDebit