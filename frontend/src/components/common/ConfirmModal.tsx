import React from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";

type ConfirmationModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	itemTitle: string;
};

function ConfirmationModal({
	isOpen,
	onClose,
	onConfirm,
	itemTitle,
}: ConfirmationModalProps) {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-[300] bg-white/90 backdrop-blur-sm flex items-center justify-center p-4"
			onClick={onClose}
		>
			{/* Modal Content - Brutalist Style */}
			<div
				className="bg-white w-full max-w-md border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header (Black Bar) */}
				<div className="bg-black text-white p-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<AlertTriangle size={18} className="text-red-500" />
						<h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em]">
							Warning
						</h3>
					</div>
					<button
						onClick={onClose}
						className="text-white/50 hover:text-white transition-colors cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className="p-8">
					<div className="mb-6">
						<h2 className="font-serif text-3xl italic text-black mb-2">
							Delete this item?
						</h2>
						<p className="text-sm text-gray-500 font-light leading-relaxed">
							You are about to permanently remove{" "}
							<span className="font-bold text-black border-b border-gray-300">
								"{itemTitle}"
							</span>{" "}
							from your wardrobe.
						</p>
					</div>

					<div className="p-4 bg-red-50 border border-red-100 mb-8 flex gap-3 items-start">
						<Trash2 size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
						<p className="text-xs text-red-600 font-mono uppercase tracking-wide leading-relaxed">
							This action cannot be undone. The item data will be lost forever.
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-4">
						{/* Cancel Button */}
						<button
							onClick={onClose}
							className="flex-1 py-4 border border-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-colors cursor-pointer"
						>
							Cancel
						</button>

						{/* Delete Button */}
						<button
							onClick={onConfirm}
							className="flex-1 py-4 bg-red-600 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-red-700 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer border border-black"
						>
							Confirm Delete
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ConfirmationModal;
