"use client";

import Loader from "@/components/common/loader";
import { ClothItem, ClothRecommendationSet } from "@/types";
import { fetchRecommendations } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

type ClothViewProps = {
	isOpen: boolean;
	item: ClothItem | null;
	onClose: () => void;
};

export default function ClothView({ isOpen, item, onClose }: ClothViewProps) {
	if (!item) return null;

	const [isLoadingRecs, setIsLoadingRecs] = useState(false);
	const [recommendations, setRecommendations] =
		useState<ClothRecommendationSet | null>(null);
	const [hasTriedAISuggestions, setHasTriedAISuggestions] = useState(false);

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

						{/* Recommendations + Button */}
						<div className="flex-1 flex flex-col gap-4 w-full max-w-3xl mx-auto md:overflow-y-auto mt-4 md:mt-0">
							{/* Generate button */}
							{!recommendations && !isLoadingRecs && (
								<button
									className="bg-black text-white py-2 px-4 rounded transition cursor-pointer"
									onClick={async () => handleFetchRecommendations(item.id)}
								>
									Generate AI Suggestions
								</button>
							)}

							{/* Loader */}
							{isLoadingRecs && (
								<div className="flex w-full flex-col items-center mt-6">
									<div className="text-gray-700 italic text-md mb-2">
										Curating your chic look… This takes a moment!
									</div>
									<Loader />
								</div>
							)}

							{/* Recommendations */}
							{recommendations && !isLoadingRecs && (
								<div className="flex flex-col gap-4 mt-6">
									<div className="border border-gray-200 rounded-lg p-2 flex flex-col gap-2">
										{recommendations._style_phrase && (
											<div className="text-gray-700 italic text-md mb-2">
												Recommend theme: {recommendations._style_phrase}
											</div>
										)}
										{recommendations.items
											.filter(({ item }) => item && item.id)
											.map(({ category, item }) => (
												<div
													key={item.id}
													className="flex flex-row items-center gap-2"
												>
													<img
														src={item.image_url}
														alt={item.name}
														className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg"
													/>
													<div className="flex flex-col text-sm">
														<span className="font-semibold">{item.name}</span>
														<span className="text-gray-500">{category}</span>
													</div>
												</div>
											))}
									</div>
								</div>
							)}

							{/* No recommendations */}
							{hasTriedAISuggestions && !recommendations && !isLoadingRecs && (
								<div className="text-gray-500 text-sm p-2">
									No recommendations yet
								</div>
							)}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
