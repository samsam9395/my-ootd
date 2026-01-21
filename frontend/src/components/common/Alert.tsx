"use client";
import { useAlert } from "@/contexts/AlertContext";
import { Check, CircleAlert, X } from "lucide-react";
import { useEffect } from "react";

export const Alert = () => {
	const { alert, closeAlert } = useAlert();

	// Logic: Auto-dismiss after 10 seconds
	useEffect(() => {
		if (!alert) return;

		const timer = setTimeout(() => {
			closeAlert();
		}, 10000); // 10000ms = 10s

		return () => clearTimeout(timer);
	}, [alert, closeAlert]);

	if (!alert) return null;

	const isSuccess = alert.type === "success";

	return (
		<div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[500] pointer-events-none w-[90%] max-w-md">
			<div
				className={`
                    pointer-events-auto flex items-start gap-4 p-4 
                    bg-white border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)]
                    transition-all duration-300 ease-in-out
                    border-l-4 ${isSuccess ? "border-l-black" : "border-l-red-500"}
                `}
			>
				{/* Icon Area */}
				<div className={`mt-0.5 ${isSuccess ? "text-black" : "text-red-500"}`}>
					{isSuccess ? (
						<Check size={18} strokeWidth={3} />
					) : (
						<CircleAlert size={18} strokeWidth={2.5} />
					)}
				</div>

				{/* Content Area */}
				<div className="flex-1 min-w-0">
					<p className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-1">
						{isSuccess ? "Update" : "Error"}
					</p>
					<p className="text-sm font-medium text-black leading-snug">
						{alert.message}
					</p>
				</div>

				{/* Close Button */}
				<button
					onClick={closeAlert}
					className="text-gray-400 hover:text-black transition-colors cursor-pointer"
					aria-label="Close alert"
				>
					<X size={16} />
				</button>
			</div>
		</div>
	);
};
