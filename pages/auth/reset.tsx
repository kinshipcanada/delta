import { useRouter } from "next/router";
import { useState } from "react"
import { supabase } from "../../lib/utils/helpers";

export default function Reset() {
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string>()
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return;
        }

        supabase.auth
            .updateUser({ password: password })
            .then(() => {
                router.push("/auth/login");
            })
            .catch(() => {
                setError("Sorry, something went wrong. Please try again later")
            });
        
        router.push('/dashboard')
        setLoading(false)
    };

    return (
        <div className="sm:px-6 lg:px-8 flex-grow flex flex-col justify-center">

			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<img
					className="mx-auto h-12 w-auto"
					src="/logo.png"
					alt="Kinship Canada"
				/>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset Your Kinship Password</h2>
				
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow border sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700">
						New Password
						</label>
						<div className="mt-1">
						<input
							type="password"
							required
							onChange={(e)=>{setPassword(e.target.value)}}
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
						/>
						</div>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700">
						Confirm New Password
						</label>
						<div className="mt-1">
						<input
							type="password"
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
						{loading ? 'Resetting...' : 'Reset Your Password'}
						</button>
					</div>
					</form>

					{error ? <div className='w-full flex justify-center mt-4 -mb-4'><p className='text-md font-semibold text-red-600'>{error}</p></div> : ''}

				</div>
			</div>

		</div>
    )
}