import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState, FC, useRef } from "react";
import { ConfirmationType, DonationStep } from "./helpers/types";
import { Donation } from "../../../system/classes/donation";
import { callKinshipAPI } from "../../../system/utils/helpers";
import GoBackHelper from "./helpers/GoBackButton";
import { BaseHeader, Button, ButtonSize, ButtonStyle, CheckboxInput, InlineLink, Loading, LoadingColors, SpacerSize, Text, VerticalSpacer } from "../../primitives";
import { CreditCardIcon } from "@heroicons/react/24/solid";
import { StripePaymentElementOptions } from "@stripe/stripe-js";

const PaymentInfoStep: FC<{ globalDonation: Donation, stripeClientSecret: string, setStep: (value: DonationStep) => void, setConfirmationType: (value: ConfirmationType) => void }> = ({ globalDonation, stripeClientSecret, setStep, setConfirmationType }) => {
    if (globalDonation == null || globalDonation == undefined) {
        console.log("No global donation")
        setStep(DonationStep.Error)
        return null
    } else {
        const [processingDonation, setProcessingDonation] = useState<boolean>(false)
        const [stripeMessages, setStripeMessages] = useState<string>(null)
        const [savePaymentMethod, setSavePaymentMethod] = useState<boolean>(false)

        // This is a hook that access the client created by stripeClientPromise once it loads
        const stripe = useStripe()
        // This hook securely accesses sensitive details like CC details inputted to the stripe client, to be passed directly to Stripe
        // Kinship servers should never access these details in raw form, even in submitting to Stripe
        const elements = useElements()

        const savePaymentMethodToStripeCustomer = async (clientSecret) => {
            try {
                await callKinshipAPI('/api/stripe/updatePaymentIntent', {
                    clientSecret: clientSecret,
                })
            } catch (err) {
                // implement Logging error here
                console.error(err)
            }
        }

        const handleCardSubmit = async () => {
            setProcessingDonation(true)
            console.log("submitting")

            if (!stripe || !elements) {
                return;
            }

            // If they want to save the payment method, update the payment intent to support this
            if (savePaymentMethod === true) {
                await savePaymentMethodToStripeCustomer(stripeClientSecret)
            }

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
                setConfirmationType(ConfirmationType.ConfirmedAndReceived)
                setStep(DonationStep.Confirmation)
            }

            setProcessingDonation(false)
            return;
        }

        const paymentElementOptions: StripePaymentElementOptions = {
            defaultValues: {
                billingDetails: {
                    name: `${globalDonation.donor.first_name} ${globalDonation.donor.last_name}`,
                    email: globalDonation.donor.email,
                    address: {
                      country: globalDonation.donor.address.country,
                      postal_code: globalDonation.donor.address.postal_code,
                      state: globalDonation.donor.address.state,
                      city: globalDonation.donor.address.city,
                      line1: globalDonation.donor.address.line_address
                    }
                }
            }
        }
        return (
            <div>
                <GoBackHelper setStep={setStep} />
                <VerticalSpacer size={SpacerSize.Small} />
                <BaseHeader>Credit Card Details</BaseHeader>
                <VerticalSpacer size={SpacerSize.Small} />
                <Text>
                    <span>Kinship does not store any credit card details, and all payments and optional payment method storage are handled by <InlineLink href={"https://stripe.com"} text={"Stripe"} />.</span>
                </Text>
                <VerticalSpacer size={SpacerSize.Medium} />

                { !stripeClientSecret && <span className="flex items-center text-md font-medium w-full justify-center"><Loading color={LoadingColors.Blue} /><span className="ml-2">Loading secure payment form</span></span> }

                { stripeClientSecret && (
                    <form>
                        <PaymentElement id="payment-element" options={paymentElementOptions} />
                        
                        <VerticalSpacer size={SpacerSize.Medium} />
                        {globalDonation.donor.donor_id && (
                            <CheckboxInput
                                label="Save this payment method for future donations (optional)"
                                checked={savePaymentMethod}
                                required={false}
                                onChange={(e) => { setSavePaymentMethod(e.target.checked) }}
                            />
                        )}


                        
                        {stripeClientSecret && (
                            <div>
                                <VerticalSpacer size={SpacerSize.Medium} />
                                <div className='w-full flex justify-end'>
                                    <Button 
                                        text={processingDonation ? "Processing Donation" : "Donate"}
                                        icon={<CreditCardIcon />}
                                        style={ButtonStyle.Primary}
                                        size={ButtonSize.Large} 
                                        isLoading={processingDonation || !stripe} 
                                        onClick={handleCardSubmit}
                                    />
                                </div>
                            </div>
                        )}

                        {stripeMessages && <div id="payment-message">{stripeMessages}</div>}

                    </form>
                )}
            </div>
        )
    }
}

export default PaymentInfoStep