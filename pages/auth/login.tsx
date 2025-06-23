import { supabase } from '../../lib/utils/helpers'
import { useState, useRef, Fragment, FC } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Dialog, Transition } from '@headlessui/react'
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../components/prebuilts/Authentication'

export default function Register() {

	const router = useRouter()
	const { authReloadStatus, triggerAuthReload } = useAuth()

	const [open, setOpen] = useState(false)
	const cancelButtonRef = useRef(null)

	const [loading, setLoading] = useState(false)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string>()

	const login = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setLoading(true)

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
	}

	return (
		<div className="sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<img
					className="mx-auto h-12 w-auto"
					src="/logo.png"
					alt="Kinship Canada"
				/>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
				<p className="mt-2 text-center text-lg text-gray-600">
					Or{' '}
					<Link href="/auth/register">Click here</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow border sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={login}>
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

					<div className="flex items-center justify-end">
						<div className="text-sm">
							<a href = '#' onClick = {()=>{setOpen(true)}} className="font-medium text-blue-600 hover:text-blue-500">
								Forgot your password?
							</a>
						</div>
					</div>

					<div>
						<button
						type="submit"
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
						{loading ? 'Logging you in...' : 'Login'}
						</button>
					</div>
					</form>

					{error ? <div className='w-full flex justify-center mt-4 -mb-4'><p className='text-md font-semibold text-red-600'>{error}</p></div> : ''}

					<div className="mt-6">

					<div className="mt-6 grid grid-cols-3 gap-3">
						<div>
						</div>
					</div>
					</div>
				</div>
			</div>

			<ResetModal cancelButtonRef={cancelButtonRef} open={open} setOpen = {setOpen} email = {email} setEmail = {setEmail} />
			
		</div>
	)
}

// todo proper typings
export const ResetModal: FC<{ open: boolean, setOpen: (value: boolean) => void, email: string, setEmail: (value: string) => void, cancelButtonRef: any }> = ({ open, setOpen, email, setEmail, cancelButtonRef }) => {
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState("")

	return (
		<Transition.Root show={open} as={Fragment}>
			<Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpen}>
				<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<Dialog.Overlay className="fixed min-h-screen inset-0 bg-gray-200 bg-opacity-75 transition-opacity" />
				</Transition.Child>

				{/* This element is to trick the browser into centering the modal contents. */}
				<span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
					&#8203;
				</span>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
					enterTo="opacity-100 translate-y-0 sm:scale-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100 translate-y-0 sm:scale-100"
					leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
				>
					<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
					<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div className="sm:flex sm:items-start">
						<div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
							<QuestionMarkCircleIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
						</div>
						<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
							<Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
								Forgot Password
							</Dialog.Title>
							<div className="mt-2">

							<p className="text-sm text-gray-500 mb-2">
								If you forgot your password, enter your email below to get a password reset link. Click on the link and you will be able to enter a new password.
							</p>

							<div>
								<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email address
								</label>
								<div className="mt-1">
								<input
									type="email"
									autoComplete="email"
									required
									defaultValue={email}
									onChange={(e)=>{setEmail(e.target.value)}}
									className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
								{
									message ? 

									<p className='text-sm text-left mt-4 text-green-600 font-medium'>
										{message}
									</p>

									: null
								}
								</div>
							</div>


							
							</div>
						</div>
						</div>
					</div>
					<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
						<button
							type="button"
							className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 sm:ml-3 sm:w-auto sm:text-sm"
							onClick={async () => {
								setLoading(true)
								const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
									redirectTo: `${process.env.NEXT_PUBLIC_DOMAIN}/auth/reset`,
								})
	
								if (error) {
									console.error(error)
									// setMessage(error.message)
								} else {
									setMessage("Success! Password reset link sent to your email, if you have already signed up.")
								}
								setLoading(false)
								return
							}}
						>
							{ loading ? "Sending your link..." : "Get Reset Link" }
						</button>
						<button
							type="button"
							className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
							onClick={() => setOpen(false)}
							ref={cancelButtonRef}
						>
							Close Panel
						</button>
					</div>
					</div>
				</Transition.Child>
				</div>
			</Dialog>
		</Transition.Root>
	)
}