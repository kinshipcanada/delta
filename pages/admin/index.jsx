import { useState, useEffect } from "react";
import { supabase } from "../../systems/helpers/supabaseClient";
import PageHeader from "../../components/app/PageHeader";
import AdminLayout from "../../components/core/AdminLayout";
import { ErrorAlert, LoadingAlert, SuccessAlert } from "../../components/core/Alerts";
import { fetchPostJSON } from "../../systems/helpers/apiHelpers";

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

        const response = await fetchPostJSON('/api/backend/admin/resend', {
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
    return (
        <div className="bg-white shadow border sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Generate a Receipt</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>Manually Fill Out This Form To Generate A Receipt</p>
                </div>
            </div>
        </div>
    )
}