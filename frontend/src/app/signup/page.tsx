"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { signup, SignupPayload } from "@/utils/api/auth";
import { useLoader } from "@/contexts/FullLoaderContext";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

// ==========================================
// 👇 CONFIGURATION FOR SIGNUP 👇
// ==========================================

// Option A: 結構感西裝 (呼應 "Building your wardrobe")
const IMAGE_URL =
	"https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2670&auto=format&fit=crop";
// Option B: 極簡衣架 (呼應 "Organizing")
// const IMAGE_URL = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2574&auto=format&fit=crop";

const QUOTE = "Buy less, choose well, make it last.";
const QUOTE_AUTHOR = "— Vivienne Westwood";
const MARQUEE_TEXT =
	"JOIN THE REVOLUTION • DIGITALIZE YOUR STYLE • SMART WARDROBE • ";

// ==========================================

export default function BoldLuxurySignup() {
	const router = useRouter();
	const { showAlert } = useAlert();
	const { setUser, setAccessToken } = useAuth();
	const { showLoader, hideLoader } = useLoader();

	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [pwdNotMeetRec, setPwdNotMeetRec] = useState(false);

	const handleSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!email || !username || !password) {
			setError("All fields are required");
			return;
		}
		if (!email.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}
		// Password Validation
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

		showLoader();
		try {
			const data = await signup({ email, username, password } as SignupPayload);
			showAlert("Signup successful! Please sign in.", "success");
			setAccessToken(data.access_token);
			setUser(data.user);
			router.push("/login"); // 或者直接導向 /closet，看妳的邏輯
		} catch (err: any) {
			setError(err.message || "Something went wrong. Try again.");
		} finally {
			hideLoader();
		}
	};

	return (
		<div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
			{/* ----------------------------------------------------------------------
               LEFT SIDE: Image Area (Different Vibe for Signup)
            ----------------------------------------------------------------------- */}
			<div className="hidden lg:block w-1/2 relative border-r border-white/20 overflow-hidden group">
				<div className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out">
					<img
						src={IMAGE_URL}
						alt="Fashion Structure"
						className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
					/>
				</div>
				{/* Gradient Overlay */}
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0 pointer-events-none" />

				<div className="absolute bottom-24 left-12 right-12 z-10">
					<h2 className="text-3xl xl:text-5xl font-serif italic leading-tight text-white drop-shadow-md">
						"{QUOTE}"
					</h2>
					{QUOTE_AUTHOR && (
						<p className="text-white/80 mt-6 font-mono text-xs uppercase tracking-[0.2em] drop-shadow-sm">
							{QUOTE_AUTHOR}
						</p>
					)}
				</div>
			</div>

			{/* ----------------------------------------------------------------------
               RIGHT SIDE: Form Area
            ----------------------------------------------------------------------- */}
			<div className="w-full lg:w-1/2 flex flex-col relative justify-between bg-[#050505]">
				{/* 1. TOP MARQUEE */}
				<div className="w-full border-b border-white/20 bg-white/5 py-4 overflow-hidden z-20">
					<div className="animate-marquee whitespace-nowrap text-xs font-mono font-bold tracking-[0.3em] text-white/70">
						{Array(10).fill(MARQUEE_TEXT).join("")}
					</div>
				</div>

				{/* 2. MAIN FORM CONTENT */}
				<div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-24 relative z-10">
					<div className="w-full max-w-sm space-y-10">
						{/* Header */}
						<div className="flex flex-col items-center mb-8">
							<div className="flex items-center gap-3">
								<span className="text-2xl font-black tracking-widest text-white">
									MY OOTD
								</span>
							</div>
							<p className="mt-2 text-xs font-mono text-white/40 uppercase tracking-[0.1em]">
								Create New Account
							</p>
						</div>

						{/* Form */}
						<form onSubmit={handleSignup} className="space-y-6">
							{/* Email */}
							<div className="group relative">
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) =>
										setEmail(e.target.value.toLowerCase().trim())
									}
									required
									className="block w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-white transition-colors peer text-white placeholder-transparent"
									placeholder="Email"
								/>
								<label className="absolute left-0 -top-3.5 text-white/40 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white uppercase tracking-wider cursor-text">
									Email Address
								</label>
							</div>

							{/* Username (New Field) */}
							<div className="group relative">
								<input
									id="username"
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value.trim())}
									required
									className="block w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-white transition-colors peer text-white placeholder-transparent"
									placeholder="Username"
								/>
								<label className="absolute left-0 -top-3.5 text-white/40 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white uppercase tracking-wider cursor-text">
									Username
								</label>
							</div>

							{/* Password */}
							<div className="group relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value.trim())}
									required
									className="block w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-white transition-colors peer text-white placeholder-transparent pr-10"
									placeholder="Password"
								/>
								<label className="absolute left-0 -top-3.5 text-white/40 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white uppercase tracking-wider cursor-text">
									Password
								</label>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-0 top-4 text-white/40 hover:text-white transition-colors cursor-pointer"
								>
									{showPassword ? (
										<EyeOff size={20} strokeWidth={1.5} />
									) : (
										<Eye size={20} strokeWidth={1.5} />
									)}
								</button>

								{/* Password Requirements / Error */}
								<div
									className={`mt-2 text-[10px] tracking-wide transition-colors ${pwdNotMeetRec ? "text-red-400" : "text-white/30"}`}
								>
									{pwdNotMeetRec
										? "⚠️ 8+ chars, 1 Uppercase, 1 Number required"
										: "Must contain 8+ chars, 1 Uppercase, 1 Number"}
								</div>
							</div>

							{/* General Error */}
							{error && (
								<div className="text-red-400 text-xs text-center border border-red-500/20 bg-red-500/10 p-2 tracking-wider uppercase">
									{error}
								</div>
							)}

							{/* Submit Button */}
							<button
								type="submit"
								className="group w-full bg-white text-[#050505] py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 mt-4 flex items-center justify-center gap-2 cursor-pointer"
							>
								Create Account
								<ArrowRight
									size={14}
									className="transition-transform group-hover:translate-x-1"
								/>
							</button>
						</form>

						{/* Footer */}
						<div className="text-center">
							<Link
								href="/login"
								className="inline-flex items-center gap-2 text-[10px] text-white/40 hover:text-white border-b border-transparent hover:border-white/50 transition-all pb-1 uppercase tracking-[0.2em]"
							>
								Already a member? Sign In
							</Link>
						</div>
					</div>
				</div>

				{/* 3. BOTTOM MARQUEE */}
				<div className="w-full border-t border-white/20 bg-white/5 py-4 overflow-hidden z-20">
					<div className="animate-marquee-reverse whitespace-nowrap text-xs font-mono font-bold tracking-[0.3em] text-white/70">
						{Array(10).fill(MARQUEE_TEXT).join("")}
					</div>
				</div>
			</div>

			<style jsx global>{`
				@keyframes marquee {
					0% {
						transform: translateX(0);
					}
					100% {
						transform: translateX(-50%);
					}
				}
				@keyframes marquee-reverse {
					0% {
						transform: translateX(-50%);
					}
					100% {
						transform: translateX(0);
					}
				}
				.animate-marquee {
					animation: marquee 20s linear infinite;
				}
				.animate-marquee-reverse {
					animation: marquee-reverse 20s linear infinite;
				}
			`}</style>
		</div>
	);
}
