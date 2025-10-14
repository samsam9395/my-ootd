import React from "react";
import { Trash2, X } from "lucide-react";

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
			className="fixed inset-0 z-500 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm"
			onClick={onClose}
		>
			{/* Modal Content */}
			<div
				className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header/Title */}
				<div className="flex items-center justify-between p-4 border-b border-gray-100">
					<h3 className="text-xl font-semibold text-gray-800 flex items-center">
						<Trash2 className="text-red-500 mr-2" size={24} />
						Confirm Deletion
					</h3>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600  cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				{/* Body/Message */}
				<div className="p-6">
					<p className="text-gray-600 mb-6">
						Are you absolutely sure you want to delete **{itemTitle}** ? <br />
						This action cannot be undone!
					</p>

					{/* Action Buttons */}
					<div className="flex justify-end space-x-3">
						{/* Cancel Button */}
						<button
							onClick={onClose}
							className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition  cursor-pointer"
						>
							Cancel
						</button>

						{/* Delete Button */}
						<button
							onClick={onConfirm}
							className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition shadow-md cursor-pointer"
						>
							Yes, Delete It
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ConfirmationModal;
