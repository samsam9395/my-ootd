"use client";
import { useAlert } from "@/contexts/AlertContext";
import { Check, CircleAlert, X } from "lucide-react";
export const Alert = () => {
	const { alert, closeAlert } = useAlert();

	if (!alert) return null;

	return (
		<div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
			<div
				className={`pointer-events-auto flex items-center space-x-3 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm bg-white/80 text-black transition-all duration-300 ease-in-out`}
			>
				<span className="text-lg">
					{alert.type === "success" ? (
						<Check size={20} />
					) : (
						<CircleAlert size={20} />
					)}
				</span>
				<p className="text-sm md:text-base">{alert.message}</p>
				<button
					onClick={closeAlert}
					className="ml-2 p-1 hover:bg-gray-200 rounded-full cursor-pointer"
					aria-label="Close alert"
				>
					<X size={16} />
				</button>
			</div>
		</div>
	);
};
