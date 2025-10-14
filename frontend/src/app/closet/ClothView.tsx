"use client";

import {
	AddUpdateClothPayload,
	ClothItem,
	ClothRecommendationSet,
	StyleTag,
} from "@/types";
import { fetchRecommendations } from "@/utils/api/clothes";
import { AnimatePresence, motion } from "framer-motion";
import { X, Ellipsis } from "lucide-react";
import { useState } from "react";
import ClothViewRecommendations from "./ClothViewRecommendations";
import ClothViewEditForm from "./ClothViewEditForm";
import Image from "next/image";

type ClothViewProps = {
	dbTagStyles: StyleTag[];
	isOpen: boolean;
	item: ClothItem | null;
	onClose: () => void;
	onSave: (payload: AddUpdateClothPayload) => Promise<any>;
	onDelete: () => void;
};

export default function ClothView({
	dbTagStyles,
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
					className="fixed inset-0 bg-black/50 flex justify-center items-start md:items-center z-200 p-4 overflow-y-auto"
				>
					<motion.div
						initial={{ y: 50, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: 50, opacity: 0 }}
						className="bg-white rounded-lg w-full max-w-3xl p-6 pt-15 relative flex flex-col md:flex-row gap-4
    max-h-[90vh] overflow-hidden
    mt-16 md:mt-0"
					>
						{/* Manage Button */}
						<button
							onClick={handleManageClick}
							className="absolute top-4 left-4 font-bold z-20 text-gray-400 hover:text-gray-600  cursor-pointer"
							aria-label="Manage"
						>
							<Ellipsis size={24} />
						</button>

						{/* Close button */}
						<button
							onClick={onClose}
							className="absolute top-4 right-4 font-bold z-20 text-gray-400 hover:text-gray-600  cursor-pointer"
							aria-label="Close"
						>
							<X size={24} />
						</button>

						{/* Main image */}
						<div className="w-full md:w-[400px] flex justify-center items-center shrink-0">
							<div className="relative w-full h-[60vh] md:h-[70vh] max-h-[70vh]">
								<Image
									fill
									src={item.image_url}
									alt={item.name}
									className="
              object-contain
              rounded-lg
              mb-4 md:mb-0
            "
									sizes="(max-width: 768px) 100vw, 400px"
								/>
							</div>
						</div>

						{/* Right panel (scrollable) */}
						<div className="flex-1 w-full flex flex-col overflow-y-auto pr-2">
							{isEditMode ? (
								<ClothViewEditForm
									dbTagStyles={dbTagStyles}
									item={item}
									onSave={onSave}
									onClose={onClose}
									onDelete={onDelete}
								/>
							) : (
								<ClothViewRecommendations
									item={item}
									isLoadingRecs={isLoadingRecs}
									recommendations={recommendations}
									hasTriedAISuggestions={hasTriedAISuggestions}
									onFetchRecommendations={() =>
										handleFetchRecommendations(item.id)
									}
								/>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
