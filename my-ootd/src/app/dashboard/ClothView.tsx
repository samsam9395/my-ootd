"use client";

import { ClothItem } from "./Wardrobe";
import { AnimatePresence, motion } from "framer-motion";

type ClothViewProps = {
	isOpen: boolean;
	item: ClothItem | null;
	onClose: () => void;
	recommendations: ClothItem[];
};

export default function ClothView({
	isOpen,
	item,
	onClose,
	recommendations,
}: ClothViewProps) {
	if (!item) return null;
	console.log("recommendations", recommendations);
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					key="modal"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
				>
					<motion.div
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 50, opacity: 0 }}
						className="bg-white rounded-lg max-h-full overflow-auto w-full max-w-3xl p-4 relative flex flex-col md:flex-row gap-4"
					>
						<button
							onClick={onClose}
							className="absolute top-2 right-2 text-black font-bold z-10"
						>
							✕
						</button>

						{/* Main image */}
						<div className="flex-1 flex justify-center items-center">
							<img
								src={item.image_url}
								alt={item.name}
								className="max-h-[70vh] w-auto md:w-full object-cover rounded-lg"
							/>
						</div>

						{/* Recommendations */}
						<div className="flex-1 flex flex-row md:flex-col md:overflow-y-auto gap-2 mt-4 md:mt-0">
							{recommendations.map((rec) => (
								<img
									key={rec.id}
									src={rec.image_url}
									alt={rec.name}
									className="w-24 h-24 md:w-full md:h-auto object-cover rounded-lg cursor-pointer"
								/>
							))}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
