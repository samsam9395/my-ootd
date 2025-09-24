"use client";

import Loader from "@/components/common/loader";
import { ClothItem, ClothRecommendationSet } from "@/types";
import { fetchRecommendations } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { X, Ellipsis } from "lucide-react";
import { useState } from "react";
import ClothViewRecommendations from "./ClothViewRecommendations";
import ClothViewEditForm from "./ClothViewEditForm";

type ClothViewProps = {
	isOpen: boolean;
	item: ClothItem | null;
	onClose: () => void;
	onSave: () => void;
	onDelete: () => void;
};

export default function ClothView({
	isOpen,
	item,
	onClose,
	onSave,
	onDelete,
}: ClothViewProps) {
	if (!item) return null;

	const [isLoadingRecs, setIsLoadingRecs] = useState(false);
	const [recommendations, setRecommendations] =
		useState<ClothRecommendationSet | null>(null);
	const [hasTriedAISuggestions, setHasTriedAISuggestions] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);

	const handleFetchRecommendations = async (itemId: number) => {
		try {
			setHasTriedAISuggestions(true);
			setIsLoadingRecs(true);
			const normalizedRecs = await fetchRecommendations(itemId);
			setRecommendations(normalizedRecs);
		} catch (error) {
			console.error("Error fetching recommendations:", error);
			setRecommendations(null);
		} finally {
			setIsLoadingRecs(false);
		}
	};

	const handleManageClick = () => {
		setIsEditMode((prev) => !prev);
	};
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
						className="bg-white rounded-lg max-h-full overflow-auto w-full max-w-3xl p-6 pt-15 relative flex flex-col md:flex-row gap-4"
					>
						{/* Manage Button */}
						<button
							onClick={handleManageClick}
							className="absolute top-4 left-4 text-black font-bold z-20 cursor-pointer"
							aria-label="Manage"
						>
							<Ellipsis size={24} />
						</button>

						{/* Close button */}
						<button
							onClick={onClose}
							className="absolute top-4 right-4 text-black font-bold z-20 cursor-pointer"
							aria-label="Close"
						>
							<X size={24} />
						</button>
						{/* Main image */}
						<div className="flex-1 flex justify-center items-center">
							<img
								src={item.image_url}
								alt={item.name}
								className="max-h-[70vh] w-auto md:w-full object-cover rounded-lg"
							/>
						</div>
						{isEditMode ? (
							<ClothViewEditForm
								item={item}
								onSave={onSave}
								onDelete={onDelete}
								setIsEditMode={setIsEditMode}
							/>
						) : (
							<ClothViewRecommendations
								isLoadingRecs={isLoadingRecs}
								recommendations={recommendations}
								hasTriedAISuggestions={hasTriedAISuggestions}
								onFetchRecommendations={() =>
									handleFetchRecommendations(item.id)
								}
							/>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
