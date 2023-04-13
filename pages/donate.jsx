import { ChevronRightIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import Loading from "../components/core/Loading";
import { Tab } from '@headlessui/react'
import { loadStripe } from "@stripe/stripe-js";
import {
    PaymentElement,
    useStripe,
    useElements
  } from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { countries, canadian_states, causes } from "../systems/helpers/constants";
import { useEffect } from "react";
import { MakeDonationHeader } from "../components/DonateForm";
import { supabase } from "../systems/helpers/supabaseClient";
import TextInput from "../components/core/inputs/TextInput";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import ReactTooltip from "react-tooltip";
import { SectionHeader } from "../components/core/Typography";
import { callKinshipAPI } from "../systems/functions/helpers";
import { useRouter } from "next/router";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function Donate() {

    const [active_step, set_active_step] = useState(0)
    const [loading, setLoading] = useState(false)

    const [amount, set_amount] = useState(0.00)

    const [first_name, set_first_name] = useState("")
    const [last_name, set_last_name] = useState("")
    const [email, set_email] = useState(null)
    const [address, set_address] = useState(null)
    const [suite, set_suite] = useState(null)
    const [country, set_country] = useState("ca")
    const [city, set_city] = useState(null)
    const [state_or_province, set_state_or_province] = useState(canadian_states[6].name)
    const [postal_code, set_postal_code] = useState(null)
    const [user, setUser] = useState(null)
    const [selected_causes, set_selected_causes] = useState([causes[0]])
    const [coverFees, setCoverFees] = useState(true)

    const [clientSecret, setClientSecret] = useState("");

    const steps = [
        { name: 'Choose Amount', href: '#' },
        { name: 'Billing Information', href: '#' },
        { name: 'Confirmation', href: '#' },
    ]

    const appearance = {
        theme: 'stripe',
    };

    const [options, setOptions] = useState({
        clientSecret,
        appearance,
    });

    return (
        <div className="bg-white">
            <header className="relative border-b border-gray-200 bg-white text-sm font-medium text-gray-700 z-[9]">
                <div className="mx-auto max-w-7xl py-4 px-4 sm:px-6 lg:px-8">
                <div className="relative flex justify-end sm:justify-center">
                    <nav aria-label="Progress" className="hidden sm:block">
                    <ol role="list" className="flex space-x-4">
                        {steps.map((step, stepIdx) => (
                        <li key={step.name} className="flex items-center">
                            {stepIdx == active_step ? (
                            <a href={step.href} aria-current="page" className="text-blue-600">
                                {step.name}
                            </a>
                            ) : (
                            <a href={step.href}>{step.name}</a>
                            )}

                            {stepIdx !== steps.length - 1 ? (
                            <ChevronRightIcon className="ml-4 h-5 w-5 text-gray-300" aria-hidden="true" />
                            ) : null}
                        </li>
                        ))}
                    </ol>
                    </nav>
                    <p className="sm:hidden">Step {active_step + 1} of 2</p>
                </div>
                </div>
            </header>
            <div className="fixed left-0 hidden h-full w-1/2 bg-white lg:block" aria-hidden="true" />
            <div className="fixed right-0 top-0 z-5 hidden h-full w-1/2 bg-blue-900 lg:block" aria-hidden="true" />
    
            <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-x-16 lg:grid-cols-2 lg:px-8 lg:pt-16 z-[8]">

                <section
                    className="py-16 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:pt-0 "
                >
                <div>
                <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                    {
                        active_step == 0 ?

                        <AmountStep 
                            amount={amount}
                            set_amount = {set_amount} 
                            selected_causes={selected_causes} 
                            set_selected_causes={set_selected_causes} 
                            global_loading={loading}
                            set_global_loading={setLoading}
                            setClientSecret={setClientSecret}
                            options={options}
                            setOptions={setOptions}
                            set_active_step={set_active_step}
                            setUser={setUser}
                        />

                        : active_step == 1 ?
                        
                        <Elements options={options} stripe={stripePromise} className="focus:outline-none">
                            <BillingStep 
                                amount={amount}
                                first_name={first_name}
                                set_first_name={set_first_name}
                                last_name={last_name}
                                set_last_name={set_last_name}
                                global_loading={loading}
                                set_global_loading={setLoading}
                                country={country} 
                                set_country={set_country} 
                                email={email} 
                                set_email={set_email} 
                                state_or_province={state_or_province} 
                                set_state_or_province={set_state_or_province} 
                                city = {city}
                                set_city = {set_city}
                                address = {address}
                                set_address = {set_address}
                                suite = {suite}
                                set_suite = {set_suite}
                                postal_code = {postal_code}
                                set_postal_code = {set_postal_code}
                                stripeOptions={options}
                                passedClientSecret={clientSecret}
                                coverFees={coverFees}
                                setCoverFees={setCoverFees}
                                user={user}
                                selected_causes={selected_causes}
                            />
                        </Elements>

                        :

                        null
                    }

                    
                    <div className="flex justify-center mt-6">
                        { active_step == 1 ? 
                        
                            <span className="flex ml-2 text-slate-500 items-center" ><LockClosedIcon className="h-4 w-4 mr-1 items-center" /> Payment Handled By Stripe</span>

                            : null 

                        }
                    </div>
                    </div>
                </div>
                </section>

                <section
                    aria-labelledby="summary-heading"
                    className="bg-blue-900 z-8 py-12 text-blue-300 md:px-10 lg:col-start-2 lg:row-start-1 lg:mx-auto lg:w-full lg:max-w-lg lg:bg-transparent lg:px-0 lg:pt-0"
                >
                    <div className="mx-auto max-w-2xl px-4 lg:max-w-none lg:px-0">
                    <dl>
                        <dt className="text-sm font-medium">Your Donation</dt>
                        <dd className="mt-1 text-3xl font-bold tracking-tight text-white">{ amount ? <>${amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</> : "$0.00" }</dd>
                        <dd className="flex text-white text-base font-medium my-4">Donating:
                        <p className="text-blue-300 flex">
                            {selected_causes.map((cause, cause_index)=>(<p key={cause.name}>{cause_index === 0 ? <span className="ml-2">{cause.name}</span> : <span>, {cause.name}</span> }</p>))}
                        </p>
                        </dd>
                    </dl>


                    <dl className="space-y-6 border-t border-white border-opacity-10 pt-6 text-sm font-medium">
                        <div className="flex items-center justify-between">
                        <dt>Subtotal</dt>
                        <dd>{ amount ? <>${amount}</> : "$0.00" }</dd>
                        </div>
                        
                        <div className="flex items-center justify-between">
                        <dt>Fees Covered</dt>
                        <dd>{ coverFees ? `$${(parseFloat(amount) * 0.029).toFixed(2)}` : "$0.00" }</dd>
                        </div>

                        <div className="flex items-center justify-between">
                        <dt>Eligible For Tax Receipt</dt>
                        <dd>{ amount && coverFees && country == 'ca' ? <>${(parseFloat(amount) * 1.029).toFixed(2)}</> : amount && !coverFees && country == 'ca'  ? <>${amount}</> : "$0.00" }</dd>
                        </div>

                        <div className="flex items-center justify-between border-t border-white border-opacity-10 pt-6 text-white">
                            <dt className="text-base">Total {country == 'ca' ? <>(Fully Tax Receipt Eligible)</> : null}</dt>
                            <dd className="text-base">{ amount && coverFees ? <>${(parseFloat(amount) * 1.029).toFixed(2)}</> : amount && !coverFees ? <>${amount}</> : "$0.00" }</dd>
                        </div>
                    </dl>
                    </div>
                </section>
            </div>
        </div>
        
    )
}

export function AmountStep({ set_active_step, options, setOptions, setClientSecret, amount, set_amount, selected_causes, set_selected_causes, global_loading, set_global_loading, setUser }) {

    const [amountError, setAmountError] = useState(null)
    const [stepError, setStepError] = useState(null)

    async function submit_step(e) {
        e.preventDefault()
        set_global_loading(true)

        if (selected_causes.length > 0 && amount > 0) {

            try {

                const loggedInUser = await supabase.auth.getUser()

                if (loggedInUser.data.user != null) {
                    const { data, error } = await supabase
                        .from('donor_profiles')
                        .select()
                        .eq('id', loggedInUser.data.user.id)

                    if (data && data.length > 0) {
                        setUser(data[0])
                    } else {
                        setUser(null)
                    }
                }

                let causes = []

                for (const cause of selected_causes) {
                    causes.push(cause.name)
                }

                await fetch("/api/donation/stripe/createPaymentIntent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ causes: causes, amount: amount*100 }),
                    })
                    .then((res) => res.json())
                    .then((data) => {
                        setClientSecret(data.clientSecret);
                        let new_options = options;
                        new_options.clientSecret = data.clientSecret;
                        setOptions(new_options);
                    })
                    .then(() => {
                        setStepError(null);
                        set_active_step(1)
                    })
                    
            } catch (error) {
                console.error(error)
                setStepError("Sorry, an internal error occured. Please try again later.")
            }
        }
        set_global_loading(false)
    }

    function validate_amount_input(event) {
        const target = parseFloat(event.target.value.replace(",","")).toFixed(2)

        if (isNaN(target)) {
            setAmountError("Amount to donate needs to be a number")
            set_amount(0.00)
        } else {
            setAmountError(null)
            set_amount(target)
        }
    }

    return (
        <div>
            <MakeDonationHeader />
                
            <form onSubmit={submit_step}>
                {/* Let donor choose an amount, and then validate the amount */}

                <label htmlFor="amount" className="text-regular font-semibold text-slate-700">
                    Choose Amount To Donate
                </label>
                            
                <div>
                    <div className="relative mt-4 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="text"
                            name="amount"
                            id="amount"
                            className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="0.00"
                            onChange={(e)=>{validate_amount_input(e)}}
                            aria-describedby="price-currency"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm" id="price-currency">
                            CAD
                        </span>
                        </div>
                    </div>

                    { amountError ? <p className="text-red-600 font-semibold">{amountError}</p> : null }
                </div>

                <div className="my-8" />


                {/* Let donor choose where they want their donation to go */}
                
                <div>
                    <label htmlFor="amount" className="text-regular font-semibold text-slate-700">
                        If you prefer your donation go to specific causes, choose those causes here
                    </label>
                    
                    <fieldset className="space-y-4 mt-4">
                        {causes.map((cause) => (
                            <PreferredCauseCheckbox key={cause.cause_id} cause_object = {cause} default_selected={cause.default_selected} selected_causes = {selected_causes} set_selected_causes = {set_selected_causes} />
                        ))}
                    </fieldset>
                </div>
                
                <div className="mt-10 flex border-t border-gray-200 pt-6 justify-between items-center">
                    <div>
                        { stepError ? <p className="text-sm font-semibold text-red-600">{ stepError }</p> : null}
                    </div>
                    <button
                        type="submit"
                        className="flex items-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none "
                    >
                        <>Continue To Payment { global_loading ? <><Loading show = {global_loading} /> </>: <>&rarr;</> }</>
                    </button>
                </div>
            </form>
        </div>
    )
}

export function PreferredCauseCheckbox({ cause_object, selected_causes, set_selected_causes }) {

    function handle_selection(event, cause_object) {
        const checked = event.target.checked
        if (checked === true) {
            // Add cause to selected_causes
            if (!selected_causes.some(causes => causes.caues_id === cause_object.cause_id)) {
                set_selected_causes(selected_causes => [...selected_causes, cause_object])
            }
        } else if (checked == false) {
            // Remove caused from selected_causes
            const new_selected_causes = selected_causes.filter(cause => cause.cause_id != cause_object.cause_id)
            set_selected_causes(new_selected_causes)
        }
    }

    return (
        <div className="relative flex items-start">
            <div className="flex h-5 items-center">
            <input
                id={cause_object.cause_id}
                aria-describedby="cause-description"
                name={cause_object.cause_id}
                type="checkbox"
                defaultChecked={cause_object.default_selected}
                onChange={(e)=>{handle_selection(e, cause_object)}}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            </div>
            <label htmlFor={cause_object.cause_id} className="cursor-pointer ml-3 text-sm">
                <p className="font-medium text-gray-700 flex items-center">
                    { cause_object.name } 
                    { cause_object.campaign == true ? 
                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Campaign
                        </span> 
                        
                        : null 
                    } 
                    { cause_object.cause_id != 0 ? <p data-tip={ cause_object.description } className="ml-2 inline"><QuestionMarkCircleIcon className="text-slate-400 hover:text-slate-600 h-4 w-4" /></p> : null }
                </p>
                {
                    cause_object.cause_id == 0 ? <p className="text-gray-500">{ cause_object.description }</p> : null
                }
            </label>
            <ReactTooltip />
        </div>
    )
}

function BillingStep({ 
    amount, 
    first_name,
    set_first_name,
    last_name,
    set_last_name,
    global_loading, 
    set_global_loading, 
    stripeOptions, country, 
    set_country, 
    state_or_province, 
    set_state_or_province, 
    email, 
    set_email,
    city,
    set_city,
    address, 
    set_address, 
    suite, 
    set_suite, 
    postal_code, 
    set_postal_code, 
    passedClientSecret,
    coverFees,
    setCoverFees,
    user,
    selected_causes
}) {

    const router = useRouter()

    const stripe = useStripe();
    const elements = useElements();
  
    const [message, setMessage] = useState(null);
    const [stepError, setStepError] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    useEffect(() => {

        if (user) {
            set_first_name(user.first_name)
            set_last_name(user.last_name)
            set_email(user.email)
            set_address(user.address_line_address)
            set_suite(user.address_suite)
            set_city(user.address_city)
            set_state_or_province(user.address_state)
            set_country(user.address_country)
            set_postal_code(user.address_postal_code)
        }

        if (!stripe) {
            return;
        }
  
        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );
    
        if (!clientSecret) {
            return;
        }
  
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {

            switch (paymentIntent.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
      });
    }, [stripe]);

    const handleETransferSubmit = async () => {
        set_global_loading(true)

        const user = await supabase.auth.getUser()
        if (!first_name || !last_name || !email || !address || !postal_code || !country || !state_or_province || !city) {
            setStepError("Please fill out all required fields")
            set_global_loading(false);
            return
        }

        let causes = []

        for (const cause of selected_causes) {
            causes.push(cause.name)
        }
        // Create a cart object
        const response = await callKinshipAPI('/api/donation/initiate', {
            donor: user.data.user ? user.data.user.id : null,
            first_name: first_name,
            last_name: last_name,
            email: email,
            phone_number: null,
            amount_in_cents: amount*100,
            donation_causes: JSON.stringify(causes),
            address_line_address: address,
            address_state: state_or_province,
            address_city: city,
            address_postal_code: postal_code,
            address_country: country
        });

        if (199 < response.status && response.status < 300) {
            // Redirect the user to the confirmation page, with the cart ID in the URL
            router.push(`/confirmation?cart_id=${response.cart.id}`)
            set_global_loading(false)
            return;
        } else {
            setStepError("Please fill out all required fields")
            set_global_loading(false);
            return;
        }

       
    }

    const handleCCSubmit = async () => {
    
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }
    
        set_global_loading(true);

        if (!first_name || !last_name || !email || !address || !postal_code || !country || !state_or_province || !city) {
            setStepError("Please fill out all required fields")
            set_global_loading(false);
            return
        }


        const payment_intent_object = await stripe.retrievePaymentIntent(passedClientSecret)
        const payment_intent_id = payment_intent_object.paymentIntent.id

        // Update the payment intent with the full details
        const update_payment_intent_response = await fetch('/api/donation/stripe/updatePaymentIntent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // BREAKPOINT
            body: JSON.stringify({
                payment_intent_id: payment_intent_id,
                stripe_customer_id: user ? user.stripe_customer_ids[0] : null,
                first_name: first_name,
                last_name: last_name,
                email: email,
                address: address,
                suite: suite,
                city: city,
                state_or_province: state_or_province,
                postal_code: postal_code,
                country: country.code != undefined ? country.code : (country != null && country != undefined) ? country : "ca",
                fees_covered: coverFees == true ? (parseFloat(amount) * 0.029 * 100).toFixed(0): 0,
            })
        })

        const update_payment_intent_response_json = await update_payment_intent_response.json()
        
        if (update_payment_intent_response_json.status === 'success') {

            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${process.env.NEXT_PUBLIC_DOMAIN}/confirmation`,
                },
            });
        
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
        
            set_global_loading(false);
        } else {
            setStepError(update_payment_intent_response_json.error)
            set_global_loading(false);
        }
    };

    return (
        <div>
            { !first_name ? <p className="text-sm text-slate-600 font-regular mb-4">You can also <a className="text-blue-600" href = "/auth/register">log in</a> and have all your information pre-filled, so that all you have to do is click donate.</p> : null }
            {/** Contact Info Section */}
            <section>
              <SectionHeader text = "Your Information" />
              <div className="mt-5" />
              <div className="mb-4 grid grid-cols-2 gap-4">
                <TextInput label={"First Name"} type={"text"} required={true} defaultValue={user ? user.first_name : null} setter = {set_first_name} />
                <TextInput label={"Last Name"} type={"text"} required={true} defaultValue={user ? user.last_name : null} setter = {set_last_name} />
              </div>
              <TextInput label={"Email Address"} type={"email"} required={true} defaultValue={user ? user.email : null} setter = {set_email} />
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-medium text-gray-900">
                Billing Address
              </h2>

              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <TextInput label = "Address" type={"text"} required={true} defaultValue={user ? user.address_line_address : null} setter = {set_address} />
                </div>

                <div className="sm:col-span-1">
                  <TextInput label = "Apartment, suite, etc." type={"text"} required={false} defaultValue={user ? user.address_suite : null} setter = {set_suite} />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="apartment" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <div className="mt-1">

                    <select
                      id="location"
                      name="location"
                      className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                      defaultValue={country}
                      onChange={(e)=>{
                        set_country(countries[e.target.value].code)
                      }}
                    >
                      {countries.map((country, countryIdx)=>(
                        <option key={countryIdx} value={countryIdx}>{country.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                    <TextInput label = "City" type={"text"} required={true} defaultValue={user ? user.address_city : null} setter = {set_city} />
                </div>

                <div>
                 
                  <div className="mt-1">
                    { country == "ca" || country.code == "ca" ?

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                State / Province
                            </label>
                            <select
                                id="state"
                                name="state"
                                className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                defaultValue={state_or_province}
                                onChange={(e)=>{set_state_or_province(e.target.value)}}
                            >
                                {canadian_states.map((state)=>(
                                    <option key={state.name} value = {state.name}>{state.name}</option>
                                ))}
                            </select>
                        </div>

                        : 

                        <TextInput label = {`State / Province`} type={"text"} required={true} defaultValue={null} setter = {set_state_or_province} />
                    }
                  </div>
                </div>
                <div>
                  <TextInput label={"Postal Code"} type={"text"} required={true} defaultValue={user ? user.address_postal_code : null}  setter={set_postal_code} />
                </div>
              </div>
            </section>


            <section aria-labelledby="cover-fees" className="mt-10">
              <h2 id="billing-heading" className="text-lg font-medium text-gray-900">
                Optional: Cover Processing Fees
              </h2>
              <p htmlFor="cover-fees-check" className="mt-2 text-sm font-regular text-gray-900">
                Kinship Canada sends 100% of what you donate to the recipient, and we personally cover administrative fees. If you would like to help us by covering credit card processing fees (tax deductible), we would greatly appreciate it.
              </p>
              <div className="mt-6 flex items-center">
                <input
                  id="cover-fees-check"
                  name="cover-fees-check"
                  type="checkbox"
                  defaultChecked
                  onClick={()=>{setCoverFees(!coverFees)}}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="ml-2">
                  <label htmlFor="cover-fees-check" className="text-sm font-medium text-gray-900">
                    Cover credit card processing fees
                  </label>
                </div>
              </div>
            </section>

            {/** Contact Info Section */}
            <section className="mt-10">
              <SectionHeader text = "Payment Details" />

              <div className="mt-6 grid grid-cols-3 gap-y-6 gap-x-4 sm:grid-cols-4">
                

                <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                    <Tab.List className="flex col-span-full p-1 shadow-sm rounded-lg border">
                        <Tab
                            className={({ selected }) =>
                                classNames(
                                'w-full rounded py-2 text-sm font-medium leading-5 text-gray-700',
                                'ring-offset-blue-400 focus:outline-none',
                                selected
                                    ? 'hover:bg-gray-100 shadow border border-gray-300 border-1'
                                    : 'text-gray-700 hover:bg-white/[0.12]'
                                )
                            }
                            >
                                Pay By Card
                            </Tab>
                        <div className="m-1" />
                        <Tab
                            className={({ selected }) =>
                                classNames(
                                'w-full rounded py-2 text-sm font-medium leading-5 text-gray-700',
                                'ring-offset-blue-400 focus:outline-none',
                                selected
                                    ? 'hover:bg-gray-100 shadow border border-gray-300 border-1'
                                    : 'text-gray-700 hover:bg-white/[0.12]'
                                )
                            }
                            >
                              Pay By eTransfer
                        </Tab>
                    </Tab.List>
                    <Tab.Panels className="flex col-span-full">
                        <Tab.Panel className="w-full col-span-full focus:outline-none">
                            {stripeOptions.clientSecret && (
                                <div>
                                    <PaymentElement id="payment-element" />
                                    {/* Show any error or success messages */}
                                    {message && <div id="payment-message">{message}</div>}
                                </div>
                            )}

                            <div className="mt-10 flex border-t border-gray-200 pt-6 justify-between items-center">
                                <div>
                                    { stepError ? <p className="text-sm font-semibold text-red-600">{ stepError }</p> : null}
                                </div>
                                <button
                                    id="submit"
                                    disabled={global_loading || !stripe || !elements}
                                    onClick={handleCCSubmit}
                                    className="flex items-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none "
                                >
                                    <>Donate ${amount} CAD { global_loading ? <><Loading show = {global_loading} /> </>: <>&rarr;</> }</>
                                </button>
                            </div>
                        </Tab.Panel>
                        <Tab.Panel className="focus:outline-none">
                            <div className="w-full">
                                <div>
                                    <p className="text-sm font-slate-600">Kinship accepts eTransfer donations. Click initiate donation, and you will receive instructions on where to send funds as well as details required.</p>
                                </div>
                                <div className="mt-10 flex border-t border-gray-200 pt-6 justify-between items-center">
                                    <div>
                                        { stepError ? <p className="text-sm font-semibold text-red-600">{ stepError }</p> : null}
                                    </div>
                                    <button
                                        id="submit"
                                        disabled={global_loading || !stripe || !elements}
                                        onClick={handleETransferSubmit}
                                        className="flex items-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none "
                                    >
                                        <>Initiate ${amount} CAD Donation { global_loading ? <><Loading show = {global_loading} /> </>: <>&rarr;</> }</>
                                    </button>
                                </div>
                            </div>
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>

                
              </div>
            </section>

            
            
        </div>
    )
}

