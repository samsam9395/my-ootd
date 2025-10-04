"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/my-ootd-logo.png";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { signup, SignupPayload } from "@/utils/api/auth";

export default function SignupPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [pwdNotMeetRec, setPwdNotMeetRec] = useState(false);
	const { showAlert } = useAlert();
	const { setUser, setAccessToken } = useAuth();

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email || !username || !password) {
			showAlert("All fields are required", "error");
			return;
		}

		if (!email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}

		if (
			password.length < 8 ||
			!/[A-Z]/.test(password) ||
			!/\d/.test(password)
		) {
			setPwdNotMeetRec(true);
			return;
		} else {
			setPwdNotMeetRec(false);
		}

		try {
			const data = await signup({ email, username, password } as SignupPayload);
			showAlert("Signup successful! Please sign in.", "success");
			setAccessToken(data.access_token);
			setUser(data.user);
			router.push("/login");
		} catch (err: any) {
			console.error(err);
			setError(err.message || "Something went wrong. Try again.");
		}
	};

	return (
		<div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<img alt="My OOTD" src={logo.src} className="mx-auto h-50 w-auto" />
				<h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
					Create your account
				</h2>
			</div>

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form className="space-y-6" onSubmit={handleSignup}>
					{/* Email */}
					<div>
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-900"
						>
							Email address
						</label>
						<div className="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
								required
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
							/>
						</div>
					</div>

					{/* Username */}
					<div>
						<label
							htmlFor="username"
							className="block text-sm font-medium text-gray-900"
						>
							Username
						</label>
						<div className="mt-2">
							<input
								id="username"
								name="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value.trim())}
								required
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
							/>
						</div>
					</div>

					{/* Password */}
					<div>
						<label
							htmlFor="password"
							className="block text-sm font-medium text-gray-900"
						>
							Password
						</label>
						<div className="mt-2">
							<input
								id="password"
								name="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value.trim())}
								required
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
							/>
						</div>
						<div className="text-xs text-gray-500 mt-1">
							At least 8 characters, 1 uppercase letter, 1 number
						</div>
						{pwdNotMeetRec && (
							<div className="text-xs text-red-500 mt-1">
								Password does not meet the requirements
							</div>
						)}
					</div>

					{/* Error Message */}
					{error && <p className="text-red-500 text-sm">{error}</p>}

					{/* Submit Button */}
					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-gray cursor-pointer"
						>
							Sign up
						</button>
					</div>
				</form>

				<p className="mt-10 text-center text-sm text-gray-500">
					Already have an account?{" "}
					<a
						href="/login"
						className="font-semibold text-slate-400 hover:text-blue-400"
					>
						Sign in
					</a>
				</p>
			</div>
		</div>
	);
}
