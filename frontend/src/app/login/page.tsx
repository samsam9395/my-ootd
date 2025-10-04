"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import logo from "@/public/my-ootd-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeClosed } from "lucide-react";
import { login, LoginPayload } from "@/utils/api/auth";

function LoginPage() {
	const router = useRouter();
	const { setUser, setAccessToken } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		setError(null);

		try {
			const data = await login({ email, password } as LoginPayload);
			setAccessToken(data.access_token);
			setUser(data.user);
			router.push("/closet");
		} catch (err: any) {
			console.error("Login error:", err);
			setError(err.message);
		}
	};

	return (
		<div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8 justify-self-center">
			<div className="sm:mx-auto sm:w-full sm:max-w-sm">
				<img
					alt="Your Company"
					src={logo.src}
					className="mx-auto h-50 w-auto"
				/>
				<h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
					Sign in to your account
				</h2>
			</div>

			<div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
				<form
					action="#"
					method="POST"
					className="space-y-6"
					onSubmit={handleLogin}
				>
					<div>
						<label
							htmlFor="email"
							className="block text-sm/6 font-medium text-gray-900"
						>
							Email address
						</label>
						<div className="mt-2">
							<input
								id="email"
								name="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								autoComplete="email"
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
							/>
						</div>
					</div>

					<div>
						<div className="flex items-center justify-between">
							<label
								htmlFor="password"
								className="block text-sm/6 font-medium text-gray-900"
							>
								Password
							</label>
							<div className="text-sm">
								<a
									href="#"
									className="font-semibold text-slate-400 hover:text-blue-400"
								>
									Forgot password?
								</a>
							</div>
						</div>
						<div className="mt-2 flex items-center">
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								autoComplete="current-password"
								className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-black sm:text-sm/6"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((prev) => !prev)}
								style={{
									marginLeft: "8px",
									fontSize: "0.9rem",
									cursor: "pointer",
								}}
							>
								{showPassword ? <EyeClosed /> : <Eye />}
							</button>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="flex w-full justify-center rounded-md bg-slate-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark-gray  cursor-pointer"
						>
							Log in
						</button>
					</div>
					{error && <p style={{ color: "red" }}>{error}</p>}
				</form>

				<p className="mt-10 text-center text-sm/6 text-gray-500">
					Not a member?{" "}
					<a
						href="/signup"
						className="font-semibold text-slate-400 hover:text-blue-400"
					>
						Join now
					</a>
				</p>
			</div>
		</div>
	);
}

export default LoginPage;
