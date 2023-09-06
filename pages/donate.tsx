import { ButtonSize, ButtonStyle, EventColors, GenericPageProps, InputCustomizations, SpacerSize } from '../components/primitives/types';
import { GenericPageLayout } from '../components/prebuilts/Layouts';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Donor } from '../system/classes/donor';
import { Alert, BaseHeader, Button, HorizontalSpacer, TextInput, VerticalSpacer, CheckboxInput, SelectionInput } from '../components/primitives';
import { countries, states_and_provinces } from '../system/utils/constants';
import { toast } from 'react-hot-toast';
import { callKinshipAPI, isFloatOrInteger, validateEmail } from '../system/utils/helpers';
import { Donation } from '../system/classes/donation';
import { Address } from '../system/classes/address';
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import { v4 as uuidv4 } from 'uuid'
import { CurrencyList } from '../system/classes/utils';

const stripeClientPromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Donate() {
    return (
        <GenericPageLayout ChildPage={DonatePage} />
    )
}

const enum DonationStep {
    AmountAndBilling,
    DonateWithCreditOrDebitCard,
    DonateWithAcssDebit,
    Confirmation,
    Error
}

const DonatePage: React.FC<GenericPageProps> = ({ donor, parentIsLoading }) => {
    const [step, setStep] = useState<DonationStep>(DonationStep.AmountAndBilling)

    const [globalDonation, setGlobalDonation] = useState<Donation>(null)
    const [stripeClientSecret, setStripeClientSecret] = useState<string>(null)

    const donationId = uuidv4()

    if (step == DonationStep.AmountAndBilling) {
        return <AmountAndBillingStep 
            donationId={donationId}
            donor={donor}
            parentIsLoading={parentIsLoading} 
            setStep = {setStep} 
            setGlobalDonation = {setGlobalDonation}
            setStripeClientSecret={setStripeClientSecret}
        />
    } else if (step == DonationStep.DonateWithCreditOrDebitCard) {
        return (
            <StripeWrapper stripeClientSecret={stripeClientSecret}>
                <DonateWithCreditOrDebitCard globalDonation={globalDonation} stripeClientSecret={stripeClientSecret} setStep={setStep} />
            </StripeWrapper>
        )
        
    } else if (step == DonationStep.DonateWithAcssDebit) {
        return (
            <StripeWrapper stripeClientSecret={stripeClientSecret}>
                <DonateWithAcssDebit globalDonation={globalDonation} stripeClientSecret={stripeClientSecret} setStep={setStep} />
            </StripeWrapper>
        )
    } else if (step == DonationStep.Confirmation) {
        return <div>Confirmation</div>
    } else {
        return <DonationErrorMessage />
    }
    
}

const AmountAndBillingStep: FC<{ donationId: string, donor: Donor, parentIsLoading: boolean, setStep: (value: DonationStep) => void, setGlobalDonation: (value: Donation) => void, setStripeClientSecret: (value: string) => void }> = ({ donationId, donor, setStep, parentIsLoading, setGlobalDonation, setStripeClientSecret }) => {
    const [amount, setAmount] = useState(0)
    const [recurring, setRecurring] = useState<boolean>(false)

    // Fields relating to religous obligations
    // Kinship has to collect this information as it there are certain religious donations that must be declared seperately (religously)
    const [isKhums, setIsKhums] = useState<boolean>(false)
    const [isImam, setIsImam] = useState<boolean>(true)
    const [isSadat, setIsSadat] = useState<boolean>(false)
    const [isSadaqah, setIsSadaqah] = useState<boolean>(false)

    const [loading, setLoading] = useState<boolean>(false)

    const [firstName, setFirstName] = useState<string>("")
    const [lastName, setLastName] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [lineAddress, setLineAddress] = useState<string>("")
    const [city, setCity] = useState<string>("")
    const [state, setStateOrProvince] = useState<string>("on")
    const [country, setCountry] = useState<string>("ca")
    const [postalCode, setPostalCode] = useState<string>("")

    useEffect(()=>{
        if (parentIsLoading === false && donor) {
            // We could double up an && statement, but JS doesn't shortcut boolean comparisons 
            // in every browser, so we could end up with a reading undefined property error if
            // the donor object hasn't finished loading
            if (donor.set_up) {
                setFirstName(donor.first_name)
                setLastName(donor.last_name)
                setEmail(donor.email)
                setLineAddress(donor.address.line_address)
                setCity(donor.address.city)
                setStateOrProvince(donor.address.state)
                setCountry(donor.address.country)
                setPostalCode(donor.address.postal_code)
            }
        }
    }, [parentIsLoading]) 

    const handleDonationDetailsStep = async ({ forwardingStep }: { forwardingStep: DonationStep }) => {
        try {
            // Validate that there is a valid amount being donated
            try {
                const amountDonatedInCents = parseFloat(String(amount)) * 100

                if (!isFloatOrInteger(amount)) {
                    throw new Error("Enter a valid amount to donate")
                }

                if (amountDonatedInCents < 500) {
                    // We require a minimum of $5 because there are fixed costs associated with credit card fees
                    // We could waive this minimum for eTransfers, which would add a relatively small amount of complexity
                    // However, since donations this small are extremely uncommon we have ommited the edge case
                    toast.error("Please donate a minimum of $5", { position: "top-right" })
                    setAmount(0)
                    return
                }
            } catch (e) {
                setAmount(0)
                toast.error("Please enter a valid amount to donate", { position: "top-right" })
                return
            }

            if (!validateEmail(email)) {
                toast.error("Please enter a valid email", { position: "top-right" })
                return
            }

            const amountDonatedInCents = parseFloat(String(amount)) * 100

            // Make sure all necessary fields are filled (this should already be completed by the browser, but in case)
            const fields = {
                firstName: "First Name",
                lastName: "Last Name",
                lineAddress: "Address",
                city: "City",
                state: "State",
                country: "Country",
                postalCode: "Postal Code"
            };

            for (const field in fields) {
                if (fields.hasOwnProperty(field) && !eval(field + ".length")) {
                    setLoading(false);
                    toast.error(`Please fill out the ${fields[field]} field`, { position: "top-right" });
                    return;
                }
            }

            // Once the forms fields have been vaidated, construct the donation object for the next step
            const globalDonor: Donor = {
                donor_id: donor ? donor.donor_id : null,
                first_name: firstName,
                last_name: lastName,
                email: email,
                address: {
                    line_address: lineAddress,
                    postal_code: postalCode,
                    city: city,
                    state: state,
                    country: country
                } as Address,
                admin: donor ? donor.admin : false,
                set_up: donor ? donor.set_up : false,
                stripe_customer_ids: donor ? donor.stripe_customer_ids : []
            }
            // We create donation identifiers here, so we can log them in Stripe. 
            const globalDonation: Donation = {
                identifiers: {
                    donation_id: donationId,
                    donor_id: donor.donor_id,
                },
                donor: globalDonor,
                causes: {
                    total_amount_paid_in_cents: amount,
                    currency: CurrencyList.CAD,
                    causes: null, // causes is no longer a supported field, and is kept for backwards compatability
                    is_imam_donation: isImam,
                    is_sadat_donation: isSadat,
                    is_sadaqah: isSadaqah
                },
                live: process.env.NEXT_PUBLIC_LIVEMODE == "true" ? true : false,
                amount_in_cents: amountDonatedInCents,
                fees_covered: process.env.NEXT_PUBLIC_FEES_COVERED_DEFAULT == "true" ? Math.round(amountDonatedInCents * 0.029) : 0,
                fees_charged_by_stripe: 0, // This will be filled in based on the type of card they pay with, by the post-payment Stripe webhook
                date_donated: new Date()
            }

            setGlobalDonation(globalDonation)

            // If the donation is by credit or debit, initialize a Stripe paymentIntent
            if (forwardingStep == DonationStep.DonateWithCreditOrDebitCard) {
                const response = await callKinshipAPI('/api/stripe/createPaymentIntent', {
                    donation: globalDonation,
                })
    
                if (response.status != 200) {
                    setStep(DonationStep.Error)
                    return
                }

                // If the response status is 200, we can assume the shape of the response
                setStripeClientSecret(response.clientSecret)
            }

            // Finally, set the next step
            setStep(forwardingStep)
            return
        } catch (error) {
            console.log("frontend", error)
            setStep(DonationStep.Error)
        }
    }

    return (
        <div className='p-4'>
            Donate page loaded successfully. Donor is {donor ? donor.email : "No donor"}
            {firstName ? `First name is ${firstName}`: "no first name"}
            <BaseHeader>Amount Donating Today</BaseHeader>
            <TextInput
                placeholder="0"
                type="text"
                value={amount}
                inputCustomization={InputCustomizations.Dollars}
                name="amount"
                id="amount"
                onChange={(e) => { setAmount(e.target.value); }}
                required={true}
            />
            <VerticalSpacer size={SpacerSize.Medium} />

            <BaseHeader>Your Information</BaseHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput 
                    placeholder="First Name" 
                    type="text" 
                    label="First Name"
                    name="userFirstName" 
                    id="userFirstName" 
                    value={firstName}
                    onChange={(e)=>{ setFirstName(e.target.value) }} 
                    required={true} 
                />
                <TextInput 
                    placeholder="Last Name" 
                    type="text" 
                    label="Last Name"
                    name="userLastName" 
                    id="userLastName" 
                    value={lastName}
                    onChange={(e)=>{ setLastName(e.target.value) }} 
                    required={true} 
                />
            </div>
            <VerticalSpacer size={SpacerSize.Small} />
            <TextInput 
                placeholder="you@gmail.com" 
                type="text" 
                label="Email Address"
                name="emailAddress" 
                id="emailAddress" 
                value={email}
                onChange={(e)=>{ setEmail(e.target.value) }} 
                required={true} 
            />

            <VerticalSpacer size={SpacerSize.Medium} />
            <BaseHeader>Address Information (Will Appear On Receipt)</BaseHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <TextInput 
                placeholder="Line Address" 
                type="text" 
                label="Line Address"
                name="lineAddress" 
                id="lineAddress" 
                value={lineAddress}
                onChange={(e)=>{ setLineAddress(e.target.value) }} 
                required={true} 
            />
            <VerticalSpacer size={SpacerSize.Medium} />
            <div className="grid sm:grid-cols-2 gap-4">
                <TextInput 
                    placeholder="City" 
                    type="text" 
                    label="City"
                    name="city" 
                    id="city" 
                    value={city}
                    onChange={(e)=>{ setCity(e.target.value) }} 
                    required={true} 
                />
                {states_and_provinces[country] === null || states_and_provinces[country] === undefined ? (
                    <TextInput
                        placeholder="State or Province"
                        type="text"
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={state}
                        onChange={(e) => {
                            setStateOrProvince(e.target.value);
                        }}
                        required={true}
                    />
                ) : (
                    <SelectionInput
                        label="State or Province"
                        name="state_or_province"
                        id="state_or_province"
                        value={state}
                        options={states_and_provinces[country]}
                        onChange={(e) => {
                            setStateOrProvince(e.target.value);
                        }}
                        required={true}
                    />
                )}
                <TextInput 
                    placeholder="Postal Code" 
                    type="text" 
                    label="Postal Code"
                    name="postalCode" 
                    id="postalCode" 
                    value={postalCode}
                    onChange={(e)=>{ setPostalCode(e.target.value) }} 
                    required={true} 
                />

                <SelectionInput
                    label="Country"
                    name="country" 
                    id="country" 
                    options={countries}
                    value={country}
                    onChange={(e)=>{ 
                        setCountry(e.target.value);

                        if (states_and_provinces[e.target.value]) {
                            setStateOrProvince(states_and_provinces[e.target.value][0].value)
                        } else {
                            setStateOrProvince("")
                        }
                    }}
                    required={true}
                />
            </div>
            <VerticalSpacer size={SpacerSize.Medium} />
            
            <CheckboxInput
                label="Is this donation Saqadah"
                checked={isSadaqah}
                required={false}
                onChange={(e) => { setIsSadaqah(e.target.checked) }}
            />

            <CheckboxInput
                label="Is this a khums donation?"
                checked={isKhums}
                required={false}
                onChange={(e) => { setIsKhums(e.target.checked) }}
            />

            { isKhums && (
                <div className='px-4'>
                    <CheckboxInput
                        label="Sehme Imam"
                        checked={isImam}
                        required={false}
                        onChange={(e) => { setIsImam(e.target.checked) }}
                    />
                    <CheckboxInput
                        label="Sehme Sadat"
                        checked={isSadat}
                        required={false}
                        onChange={(e) => { setIsSadat(e.target.checked) }}
                    />
                </div>
            )}

            { donor && (
                <CheckboxInput
                    label="Make this a recurring donation"
                    checked={recurring}
                    required={false}
                    onChange={(e) => { setRecurring(e.target.checked) }}
                />
            )}

            <VerticalSpacer size={SpacerSize.Medium} />

            <div className='flex'>
                <Button 
                    text="Donate By eTransfer &rarr;" 
                    isLoading={loading} 
                    style={ButtonStyle.Primary}
                    size={ButtonSize.Large} 
                    onClick={() => handleDonationDetailsStep({ forwardingStep: DonationStep.DonateWithAcssDebit })}
                />

                <HorizontalSpacer size={SpacerSize.Small} />

                <Button 
                    text="Donate By Credit Card &rarr;" 
                    isLoading={loading} 
                    style={ButtonStyle.Primary}
                    size={ButtonSize.Large} 
                    onClick={() => handleDonationDetailsStep({ forwardingStep: DonationStep.DonateWithCreditOrDebitCard })}
                />

            </div>
        </div>
    )
}

const StripeWrapper: React.FC<{ children: ReactNode, stripeClientSecret: string }> = ({ children, stripeClientSecret }) => (
    <Elements options={{
        appearance: { 'theme': 'stripe' },
        clientSecret: stripeClientSecret,
    }} stripe={stripeClientPromise}>
        { children }
    </Elements>
);

const DonateWithCreditOrDebitCard: FC<{ globalDonation: Donation, stripeClientSecret: string,  setStep: (value: DonationStep) => void }> = ({ globalDonation, stripeClientSecret, setStep }) => {
    if (globalDonation == null || globalDonation == undefined) {
        setStep(DonationStep.Error)
        return null
    } else {
        const [processingDonation, setProcessingDonation] = useState<boolean>(false)
        const [stripeMessages, setStripeMessages] = useState<string>(null)
        const [savePaymentMethod, setSavePaymentMethod] = useState<boolean>(globalDonation.donor.donor_id ? true : false)

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

        const handleCardSubmit = async (event) => {
            // Stop the page from refreshing
            event.preventDefault();

            setProcessingDonation(true)

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
                setStripeMessages(`Payment Succeeded: ${response.paymentIntent.id}`)
            }

            setProcessingDonation(false)
            return;
        }


        const handleSubmit = async (event) => {
            event.preventDefault()

            setProcessingDonation(true)

            console.log('paying with bank')
        
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
                console.error(error.message);
              } else {
                // Handle the successful payment
                console.log('PaymentIntent ID: ' + paymentIntent.id);
                console.log('PaymentIntent status: ' + paymentIntent.status);
              }
            } catch (error) {
              console.error(error);
            }
          };

        return (
            <div>
                Donate with a credit or debit card.
                {stripeClientSecret && (
                    <form onSubmit={handleCardSubmit}>
                        <PaymentElement id="payment-element" />
                        {/* Show any error or success messages */}
                        {stripeMessages && <div id="payment-message">{stripeMessages}</div>}
                        {globalDonation.donor.donor_id && (
                            <CheckboxInput
                                label="Save this payment method for future donations"
                                checked={savePaymentMethod}
                                required={false}
                                onChange={(e) => { setSavePaymentMethod(e.target.checked) }}
                            />
                        )}

                        <div>
                            Bank checkout
                        </div>

                        


                        <button type='submit' disabled={!stripe}>{processingDonation ? "loading" : "Donate"}</button>
                    </form>
                )}

                {stripeClientSecret && (
                    <form onSubmit={handleSubmit}>
                        <button type='submit' disabled={!stripe}>{processingDonation ? "loading" : "Donate With bank"}</button>
                    </form>
                )}
            </div>
        )
    }
}

const DonateWithAcssDebit: FC<{ globalDonation: Donation, stripeClientSecret: string,  setStep: (value: DonationStep) => void }> = ({ globalDonation, stripeClientSecret, setStep }) => {
    if (globalDonation == null || globalDonation == undefined) {
        setStep(DonationStep.Error)
        return null
    } else {
        const [processingDonation, setProcessingDonation] = useState<boolean>(false)
        const [stripeMessages, setStripeMessages] = useState<string>(null)
        const [savePaymentMethod, setSavePaymentMethod] = useState<boolean>(globalDonation.donor.donor_id ? true : false)

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

        const handleSubmit = async (event) => {
            event.preventDefault()

            setProcessingDonation(true)
        
            if (!stripe || !elements) {
                return;
            }
            
            // If they want to save the payment method, update the payment intent to support this
            if (savePaymentMethod === true) {
                await savePaymentMethodToStripeCustomer(stripeClientSecret)
            }

            try {
                const { paymentIntent, error } = await stripe.confirmAcssDebitPayment(
                        stripeClientSecret,
                    {
                        payment_method: {
                            billing_details: {
                                name: `${globalDonation.donor.first_name} ${globalDonation.donor.last_name}`,
                                email: 'jenny.rosen@example.com',
                            },
                        },
                        return_url: "http://localhost:3000/this_isMyreturn"
                    }
                );
        
              if (error) {
                // Handle the error and inform the user
                console.error(error.message);
              } else {
                // Handle the successful payment
                console.log('PaymentIntent ID: ' + paymentIntent.id);
                console.log('PaymentIntent status: ' + paymentIntent.status);
              }
            } catch (error) {
              console.error(error);
            }
          };

        return (
            <div>
                Donate with a bank account

                {stripeClientSecret && (
                    <form onSubmit={handleSubmit}>
                        <button type='submit' disabled={!stripe}>{processingDonation ? "loading" : "Donate With bank"}</button>
                    </form>
                )}
            </div>
        )
    }
}

const DonationErrorMessage = () => {
    return (
        <div className='p-4'>
            <Alert 
                type={EventColors.Error} 
                title={'Sorry, something went wrong'} 
                message={`Something went wrong in creating this donation. Please try again shortly. If the issue persists, please contact ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} 
            />
        </div> 
    )
}