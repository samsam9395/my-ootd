"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLoader } from "@/contexts/FullLoaderContext";
import { login, LoginPayload } from "@/utils/api/auth";
import { Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

// ==========================================
// CONFIGURATION
// ==========================================

const IMAGE_URL = "/charlota-blunarova-r5xHI_H44aM-unsplash.jpg";
const QUOTE = "People will stare. Make it worth their while.";
const QUOTE_AUTHOR = "— Harry Winston";
const MARQUEE_TEXT =
	"YOUR DIGITAL CLOSET • AI POWERED STYLING • EFFORTLESS FASHION • SMART WARDROBE • ";

// ==========================================

export default function BoldLuxuryLogin() {
	const router = useRouter();
	const { setUser, setAccessToken } = useAuth();
	const { showLoader, hideLoader } = useLoader();

	const [email, setEmail] = useState("sammimi@gmail.com");
	const [password, setPassword] = useState("Test123456");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		showLoader();
		try {
			const data = await login({ email, password } as LoginPayload);
			console.log(data);
			setAccessToken(data.access_token);
			setUser(data.user);
			router.push("/closet");
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			hideLoader();
		}
	};

	return (
		<div className="min-h-screen bg-[#050505] text-white flex overflow-hidden font-sans">
			{/* ----------------------------------------------------------------------
               LEFT SIDE: Image Area
            ----------------------------------------------------------------------- */}
			<div className="hidden lg:block w-1/2 relative border-r border-white/20 overflow-hidden group">
				{/* Background Image */}
				<div className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-1000 ease-in-out">
					<img
						src={IMAGE_URL}
						alt="Fashion Mood"
						className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
					/>
				</div>

				{/* ✨ FIX: Gradient Overlay (讓文字一定看得到) */}
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-0 pointer-events-none" />

				{/* Quote Text (移除 mix-blend-difference，加上 drop-shadow) */}
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
					<div className="w-full max-w-sm space-y-12">
						{/* Branding Header - LOGO STYLE (TEXT ONLY) */}
						<div className="flex flex-col items-center mb-12">
							<div className="flex items-center gap-3">
								{/* Brand Name */}
								<span className="text-3xl font-black tracking-widest text-white">
									MY OOTD
								</span>
							</div>
						</div>

						{/* Form */}
						<form onSubmit={handleLogin} className="space-y-8">
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
								<label
									htmlFor="email"
									className="absolute left-0 -top-3.5 text-white/40 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white uppercase tracking-wider cursor-text"
								>
									Email Address
								</label>
							</div>

							<div className="group relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="block w-full bg-transparent border-b border-white/20 py-4 text-lg focus:outline-none focus:border-white transition-colors peer text-white placeholder-transparent pr-10"
									placeholder="Password"
								/>
								<label
									htmlFor="password"
									className="absolute left-0 -top-3.5 text-white/40 text-xs transition-all peer-placeholder-shown:text-lg peer-placeholder-shown:top-4 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-white uppercase tracking-wider cursor-text"
								>
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
							</div>

							{error && (
								<div className="text-red-400 text-xs text-center border border-red-500/20 bg-red-500/10 p-2 tracking-wider uppercase">
									{error}
								</div>
							)}

							<button
								type="submit"
								className="group w-full bg-white text-[#050505] py-4 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-200 transition-all duration-300 mt-8 flex items-center justify-center gap-2 cursor-pointer"
							>
								Enter Wardrobe
								<ArrowRight
									size={14}
									className="transition-transform group-hover:translate-x-1"
								/>
							</button>
						</form>

						<div className="text-center">
							<Link
								href="/signup"
								className="inline-flex items-center gap-2 text-[10px] text-white/40 hover:text-white border-b border-transparent hover:border-white/50 transition-all pb-1 uppercase tracking-[0.2em]"
							>
								Apply for Membership{" "}
								<Sparkles size={10} className="text-yellow-200" />
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
