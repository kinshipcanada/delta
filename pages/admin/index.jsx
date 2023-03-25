import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import AdminLayout from "../../components/core/AdminLayout";
import { ErrorAlert, LoadingAlert, SuccessAlert } from "../../components/core/Alerts";
import { callKinshipAPI } from "../../systems/functions/helpers";

export default function Index() {

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(async ()=>{
        setLoading(true)

        const loggedInUser = await supabase.auth.getUser() 

        if (loggedInUser) {

            const { data, error } = await supabase
                .from('donor_profiles')
                .select()
                .eq('id', loggedInUser.data.user.id)
            
            if (data) {
                setProfile(data[0])
            } else {
                console.log(error)
            }

            setUser(loggedInUser.data.user)
            setLoading(false)
            return
        } else {
            setLoading(false)
            return
        }

    }, [])

    return (
        <AdminLayout>
            {(user && profile) ? 
            
                <div>
                    <PageHeader text={`Kinship Canada Admin Panel`} description={"View and manage donations, resend receipts, and more."} secondaryLinkHref={"#"} secondaryLinkText={"Lookup donation"} primaryLinkText="Resend Receipt" primaryLinkHref={"#"} />
                    <div className="mt-4" />
                    <ResendReceipt />
                    
                    <div className="mt-4" />
                    <ManuallyGenerateAndSend />
                </div>

                : loading ?

                <div>Loading...</div>

                : null

            }
        </AdminLayout>
    )
}

function ResendReceipt() {

    const [donationId, setDonationId] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [success, setSuccess] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    async function handleResendReceipt(e) {
        e.preventDefault()

        setError(null)
        setSuccess(null)
        setLoading(true)

        if (!donationId) {
            setError("Please enter a donation ID.")
            setErrorMessage("Cannot process your request to generate and send receipt without a donation ID. Please enter the donation ID, stripe charge ID (ch_xyzxyzxyz), or the payment-intent id (pi_xyzxyzxyz).")
            setLoading(false)
            return
        }

        const response = await callKinshipAPI('/api/admin/resend', {
            donation_id: donationId,
        });
    
        if (response.status === 500) {
            setError("Error resending receipt.");
            setErrorMessage(response.message);
            setLoading(false)
            return;
        } else {
            console.log(response)
            setSuccess("Receipt resent successfully!");
            setSuccessMessage(response.message);
            setLoading(false)
            return;
        }
    }

    return (
        <div className="bg-white shadow border sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Resend a Receipt</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Enter the Kinship ID, Stripe Charge ID, or Stripe Payment Intent ID below to resend the receipt, or generate and send if it has not already been sent.</p>
                </div>
                <form className="mt-5 sm:flex sm:items-center w-full" onSubmit={handleResendReceipt}>
                <div className="w-full">
                    <input
                        type="text"
                        name="text"
                        onChange={(e)=>setDonationId(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="e.g. 3fc54b0f-2e1d-4939-b14b-11352c02a694"
                    />
                </div>
                <button
                    type="submit"
                    className="mt-3 shrink-0 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Generate & Receipt
                </button>
                </form>
                { loading ? <div className="mt-4"><LoadingAlert title = {"Generating and sending receipt"} message={"Kinship is crawling the database, building the donation, and sending it to the donor."} /></div> : null }
                { error ? <div className="mt-4" ><ErrorAlert title={error} message={errorMessage} /></div> : null }
                { success ? <div className="mt-4" ><SuccessAlert title={success} message={successMessage} /></div>  : null }
            </div>
        </div>
    )
}

function ManuallyGenerateAndSend() {

    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [loading, setLoading] = useState(false)

    const [date, setDate] = useState(null)
    const [email, setEmail] = useState(null)
    const [amountInCents, setAmountInCents] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState(null)
    const [causes, setCauses] = []
    const [address, setAddress] = useState(null)
    const [province, setProvince] = useState(null)
    const [city, setCity] = useState(null)
    const [postalCode, setPostalCode] = useState(null)
    const [country, setCountry] = useState(null)
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)

    async function handleResendReceipt(e) {
        e.preventDefault()

        setError(null)
        setSuccess(null)
        setLoading(true)

        if (!date || !email || !amountInCents|| !paymentMethod || !causes || !address || !province|| !city || !postalCode || !country|| !firstName || !lastName  ) {
            setError("Please fill out all required fields.")
            setErrorMessage("Cannot process your request to generate and send receipt without a donation ID. Please enter the donation ID, stripe charge ID (ch_xyzxyzxyz), or the payment-intent id (pi_xyzxyzxyz).")
            setLoading(false)
            return
        }

        let formattedCauses = {
            total_amount_paid_in_cents: amountInCents,
            causes: {}
        }

        if (len(causes) == 0) {
            setCauses(["Anywhere"])
        }

        for (const cause of causes) {
            formattedCauses.causes[cause] = Math.floor(amountInCents / len(causes))
        }

        let formattedPaymentMethod = {
            type: paymentMethod
        }

        const response = await callKinshipAPI('/api/admin/manual', {
            donation_created: date,
            email: email,
            amount_in_cents: amountInCents,
            fees_covered: 0,
            payment_method: formattedPaymentMethod,
            donation_causes: formattedCauses,
            address_line_address: address,
            address_state: province,
            address_city: city,
            address_postal_code: postalCode,
            address_country: country,
            donor_object: {
                email: email,
                first_name: firstName,
                last_name: lastName,
                middle_names: null,
            }
            
        });
    
        if (response.status === 500) {
            setError("Error resending receipt.");
            setErrorMessage(response.message);
            setLoading(false)
            return;
        } else {
            console.log(response)
            setSuccess("Receipt resent successfully!");
            setSuccessMessage(response.message);
            setLoading(false)
            return;
        }
    }
    return (
        <div className="bg-white shadow border sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 leading-7">Create A New Receipt</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                <form>
                    <div>
                        <h2 className="text-md mb-2 font-semibold leading-7 text-gray-900">Donor Information</h2>
                        {/* <p className="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p> */}
                    </div>

                    <div className="grid max-w-2xl grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-6 md:col-span-2">
                        <div className="sm:col-span-3">
                        <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                            First name
                        </label>
                        <div className="mt-2">
                            <input
                            type="text"
                            name="first-name"
                            id="first-name"
                            autoComplete="given-name"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>

                        <div className="sm:col-span-3">
                        <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                            Last name
                        </label>
                        <div className="mt-2">
                            <input
                            type="text"
                            name="last-name"
                            id="last-name"
                            autoComplete="family-name"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>

                        <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                            Email address
                        </label>
                        <div className="mt-2">
                            <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>

                        <div className="sm:col-span-3">
                        <label htmlFor="country" className="block text-sm font-medium leading-6 text-gray-900">
                            Country
                        </label>
                        <div className="mt-2">
                            <select
                                id="country"
                                name="country"
                                autoComplete="country-name"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                            >
                                <option>Canada</option>
                                <option>United States</option>
                                <option>Australia</option>
                                <option>United Kingdom</option>
                                <option>Other</option>
                            </select>
                        </div>
                        </div>

                        <div className="col-span-full">
                        <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900">
                            Street address
                        </label>
                        <div className="mt-2">
                            <input
                            type="text"
                            name="street-address"
                            id="street-address"
                            autoComplete="street-address"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>

                        <div className="sm:col-span-2 sm:col-start-1">
                        <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">
                            City
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="city"
                                id="city"
                                autoComplete="address-level2"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>

                        <div className="sm:col-span-2">
                        <label htmlFor="region" className="block text-sm font-medium leading-6 text-gray-900">
                            State / Province
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="region"
                                id="region"
                                autoComplete="address-level1"
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>

                        <div className="sm:col-span-2">
                        <label htmlFor="postal-code" className="block text-sm font-medium leading-6 text-gray-900">
                            ZIP / Postal code
                        </label>
                        <div className="mt-2">
                            <input
                            type="text"
                            name="postal-code"
                            id="postal-code"
                            autoComplete="postal-code"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            />
                        </div>
                        </div>
                    </div>
                    - donation created
                    - email 
                    - amount_in_cents
                    - fees_covered
                    - payment_method
                    - donation_causes
                    - address_line_address
                    - address_state
                    - address_city
                    - address_postal_code
                    - address_country
                    - donor_object
                        - email 
                        - first_name
                        - last_name
                        - middle_names: null
                </form>
                </div>
            </div>
        </div>
    )
}