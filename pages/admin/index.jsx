import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import AdminLayout from "../../components/core/AdminLayout";
import { ErrorAlert, LoadingAlert, SuccessAlert } from "../../components/core/Alerts";
import { callKinshipAPI } from "../../systems/functions/helpers";
import TextInput from "../../components/core/inputs/TextInput";
import { PrimaryButton } from "../../components/core/Buttons";
import { toast } from "react-hot-toast";
import { FormHeader, Label, SectionHeader } from "../../components/core/Typography";
import { BoxWithHeaderAndFooter } from "../../components/core/Box";
import { SelectInput } from "../../components/core/inputs/SelectInput";
import { canadian_states, countries, causes as KinshipCauses } from "../../systems/helpers/constants";
import { validateEmail } from "../../systems/helpers/utils";
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
                    <PageHeader text={`Kinship Canada Admin Panel`} description={"View and manage donations, resend receipts, and more."}  />
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

    const [loading, setLoading] = useState(false)

    const [date, setDate] = useState(null)
    const [email, setEmail] = useState(null)
    const [amount, setAmount] = useState(null)
    const [paymentMethod, setPaymentMethod] = useState("etransfer")
    const [cause, setCause] = useState("Anywhere")
    const [address, setAddress] = useState(null)
    const [province, setProvince] = useState(canadian_states[0].code)
    const [city, setCity] = useState(null)
    const [postalCode, setPostalCode] = useState(null)
    const [country, setCountry] = useState(countries[0].code)
    const [firstName, setFirstName] = useState(null)
    const [lastName, setLastName] = useState(null)

    async function handleReceiptGeneration() {
        setLoading(true)

        if (!date || !email || !amount || !paymentMethod || !cause || !address || !province|| !city || !postalCode || !country|| !firstName || !lastName  ) {
            toast.error("Please fill out all required fields.", {
                position: "top-right",
                autoClose: 5000,
            })
            setLoading(false)
            return
        }

        if (validateEmail(email) === false) {
            toast.error("Please enter a valid email address.", {
                position: "top-right",
                autoClose: 5000,
            })
            setLoading(false)
            return
        }

        let amountInCents = 0

        try {
            amountInCents = Math.floor(parseFloat(amount.replace('$', '')) * 100)
        } catch (error) {
            toast.error("Please enter a valid amount.", {
                position: "top-right",
                autoClose: 5000,
            })
            setLoading(false)
            return
        }

        let formattedCauses = {
            total_amount_paid_in_cents: amountInCents,
            causes: { }
        }

        formattedCauses.causes[cause] = amountInCents

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
            },
            donation_method: paymentMethod
        });
        
        console.log(response)
        if (response.status == 200) {
            toast.success(response.message, {
                position: "top-right",
                autoClose: 5000,
            })
            setLoading(false)
            return;
        } else {
            toast.error(`Error generating donation: ${response.message}`, {
                position: "top-right",
                autoClose: 5000,
            })
            setLoading(false)
            return;
        }

    }

    return (
        <BoxWithHeaderAndFooter 
            loading={loading}
            Header = {()=>(<SectionHeader text={"Create A New Donation"} />)} 
            Footer = {()=>(<div className="flex justify-end"><PrimaryButton action={handleReceiptGeneration} text = {"Create donation and send receipt"} /></div>)} 
        >
            <FormHeader text={'Donation Details'} />
                    
            <div className="grid grid-cols-2 gap-4">
                <TextInput
                    label = "Amount in Cents"
                    required={true}
                    type='dollars'
                    placeholder = "1000.00"
                    setter={setAmount}
                />

                <div>
                    <Label label="Date Of Donation" required={true} />
                    <input 
                        type="date"
                        name="date"
                        id="date"
                        className="text-slate-900 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        onChange={(e)=>setDate(e.target.value)}
                    />
                </div>

                <div>
                    <SelectInput
                        label={'Causes'}
                        options={KinshipCauses.map(cause => ({ label: cause.name, value: cause.name }))}
                        setter={setCause}
                    />
                </div>

                <div>
                    <SelectInput
                        label={'Payment Method'}
                        options={[
                            { label: 'eTransfer', value: 'etransfer' },
                            { label: 'Cash', value: 'cash' },
                        ]}
                        setter={setPaymentMethod}
                    />
                </div>
            </div>
            
            <div className="mt-4" />

            <FormHeader text={'Donor Details'} />

            <div className="grid grid-cols-2 gap-4">
                <TextInput 
                    label={'First Name'} 
                    type={'text'} 
                    required={true}
                    setter={setFirstName}
                    placeholder={'Tiger'}
                />

                <TextInput 
                    label={'Last Name'} 
                    type={'text'} 
                    required={true}
                    setter={setLastName}
                    placeholder={'Woods'}
                />

                <TextInput
                    label = "Email"
                    required={true}
                    type='email'
                    placeholder = "tiger@golf.com"
                    setter={setEmail}
                />
            </div>

            <div className="mt-4" />

            <FormHeader text={'Donor Address Information'} />

            <div className="grid grid-cols-2 gap-4">
                <TextInput 
                    label={'Address'} 
                    type={'text'} 
                    required={true}
                    setter={setAddress}
                    placeholder={'55 Golf Drive'}
                />

                <TextInput 
                    label={'City'} 
                    type={'text'} 
                    required={true}
                    setter={setCity}
                    placeholder={'Pebble Beach'}
                />

                {
                    country != undefined && country != null && country.toLowerCase() === 'ca' ? (
                        <SelectInput
                            label={'Province'}
                            required={true}
                            defaultValue={{ label: canadian_states[6].name, value: canadian_states[6].code }}
                            options={canadian_states.map(state => ({ label: state.name, value: state.code }))}
                            setter={setProvince}
                        />

                    ) : (
                        <TextInput
                            label = "State/Province"
                            required={true}
                            type='text'
                            placeholder = "FL"
                            setter={setProvince}
                        />
                    )
                }

                <TextInput
                    label = "Postal Code"
                    required={true}
                    type='text'
                    placeholder = "37172"
                    setter={setPostalCode}
                />

                <SelectInput
                    label={'Country'}
                    options={countries.map(country => ({ label: country.name, value: country.code }))}
                    setter={setCountry}
                />

            </div>
            
            


        </BoxWithHeaderAndFooter>
    )
}