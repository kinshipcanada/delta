import { callKinshipAPI, supabase } from '../../lib/utils/helpers'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { toast } from "react-hot-toast"
import { useAuth } from '../../components/prebuilts/Authentication'
import { DonorEngine, NoIdDonorProfile } from '@lib/methods/donors'
import { Donor } from '@prisma/client'

export default function Register() {

	const router = useRouter()

	const { authReloadStatus, triggerAuthReload } = useAuth()

	const [step, setStep] = useState<"emailAndPassword" | "personalInfo">("emailAndPassword")
	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState<string>("")
	const [password, setPassword] = useState<string>("")
    const [confirmPassword, setConfirmPassword] = useState("")
	const [error, setError] = useState<string | undefined>(undefined)
	
	const register = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			setLoading(true)

			const { data, error } = await supabase.auth.signUp({
				email: email,
				password: password,
			})

			if (error) {
				setError(error.message)
				setLoading(false)
				return
			}

			if (!data.user) {
				alert("Supabase user is undefined")
				return
			}

			const donorProfile: Donor = {
				id: data.user.id,
				donorFirstName: "",
				donorMiddleName: null,
				donorLastName: "",
				donorEmail: email,
				donorAddressLineAddress: "43 Matson Drive",
				donorAddressCity: "Bolton",
				donorAddressState: 'ON',
				donorAddressCountry: 'CA',
				donorAddressPostalCode: 'L7E0B1',
				stripeCustomerIds: []
			}

			await callKinshipAPI<Donor>("/api/v2/donor/create", {
				donor: donorProfile,
			})
				
			triggerAuthReload(!authReloadStatus)
			router.push('/dashboard')

		} catch (error) {
			toast.error(`Error: ${error instanceof Error ? error.message : "Sorry, something went wrong creating your account"}`, { position: "top-right" })
		} finally {
			setLoading(false)
			return
		}
	}

	const verifyNotAlreadyRegistered = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		try {
			setLoading(true)
			

			if (password != confirmPassword) {
				setError("Passwords do not match")
				setLoading(false)
				return
			}

			const donorExists = await callKinshipAPI<{ donorExists: Boolean }>("/api/v2/donor/check_if_exists", {
				email
			})
			
			if (donorExists.error) {
				setError("Internal error")
				setLoading(false)
				return
			}

			console.log(donorExists)
			if (donorExists.data!.donorExists === true) {
				// Log in the donor
				const { error } = await supabase.auth.signInWithPassword({
					email: email,
					password: password,
				})
		
				if (error) {
					setError(error instanceof Error && error.message ? error.message : "Sorry, something went wrong logging into your account")
				} else {
					triggerAuthReload(!authReloadStatus)
					router.push('/dashboard')
				}
		
				setLoading(false)
				return
			}

			setStep("personalInfo")
		} catch (error) {
			toast.error(`Error: ${error instanceof Error ? error.message : "Sorry, something went wrong creating your account"}`, { position: "top-right" })
		} finally {
			setLoading(false)
			return
		}
	}

	return (
		<div className="sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<img
					className="mx-auto h-12 w-auto"
					src="/logo.png"
					alt="Kinship Canada"
				/>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign up for Kinship Canada</h2>
				<p className="mt-2 text-center text-lg text-gray-600">
					Already{' '}
					<Link href = '/auth/login'>
						<a className="font-medium text-blue-600 hover:text-blue-500">
						have an account?
						</a>
					</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow border sm:rounded-lg sm:px-10">
					{step == "emailAndPassword" && (
						<form className="space-y-6" onSubmit={verifyNotAlreadyRegistered}>
							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email address
								</label>
								<div className="mt-1">
								<input
									type="email"
									autoComplete="email"
									required
									onChange={(e)=>{setEmail(e.target.value)}}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Password
								</label>
								<div className="mt-1">
								<input
									type="password"
									autoComplete="current-password"
									required
									onChange={(e)=>{setPassword(e.target.value)}}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Confirm Password
								</label>
								<div className="mt-1">
								<input
									type="password"
									autoComplete="current-password"
									required
									onChange={(e)=>{setConfirmPassword(e.target.value)}}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
								{loading ? 'Setting up your account...' : 'Register'}
								</button>
							</div>
						</form>
					)}

					{step == "personalInfo" && (
						<form className="space-y-6" onSubmit={register}>
							<p className='text-md'>Almost there! To complete your profile, please fill out the following fields.</p>
							<div>
								<label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
									First Name
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="firstName"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
									Last Name
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="lastName"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="address" className="block text-sm font-medium text-gray-700">
									Address
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="address"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="city" className="block text-sm font-medium text-gray-700">
									City
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="city"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="state" className="block text-sm font-medium text-gray-700">
									State or Province
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="state"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="country" className="block text-sm font-medium text-gray-700">
									Country
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="country"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>

							<div>
								<label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
									Postal Code
									<span className='text-red-500'>*</span>
								</label>
								<div className="mt-1">
								<input
									type="text"
									autoComplete="postalCode"
									required
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								</div>
							</div>


							<div>
								<button
								type="submit"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
								{loading ? 'Setting up your account...' : 'Complete Registration'}
								</button>
							</div>
						</form>
					)}

					<div className='flex w-full justify-center mt-6'>
                        {error ? <p className='text-md font-semibold text-red-600'>{error}</p> : ''}
                    </div>
				</div>
			</div>
		</div>
	)
}