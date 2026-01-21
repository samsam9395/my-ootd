"use client";

import {
	AddUpdateClothPayload,
	ClothItem,
	ClothRecommendationSet,
	StyleTag,
} from "@/types";
import { fetchRecommendations } from "@/utils/api/clothes";
import { AnimatePresence, motion } from "framer-motion";
import { X, Settings2 } from "lucide-react";
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
					className="fixed inset-0 bg-white/80 backdrop-blur-sm flex justify-center items-center z-[200] p-4"
					onClick={onClose}
				>
					<motion.div
						initial={{ y: 20, opacity: 0, scale: 0.98 }}
						animate={{ y: 0, opacity: 1, scale: 1 }}
						exit={{ y: 20, opacity: 0, scale: 0.98 }}
						transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
						onClick={(e) => e.stopPropagation()}
						/* Container Layout Logic:
                            Mobile: overflow-y-auto allows the entire card to scroll.
                            Desktop: overflow-hidden locks the card size, inner content scrolls independently.
                        */
						className={`
                            bg-white w-full max-w-5xl h-[85vh] relative flex flex-col md:flex-row 
                            overflow-y-auto md:overflow-hidden
                            border border-black shadow-2xl
                        `}
					>
						{/* LEFT SIDE: Image Area 
                           Mobile: Fixed height (50vh) to ensure image visibility.
                           Desktop: Full height.
                        */}
						<div className="w-full md:w-[50%] h-[50vh] min-h-[400px] md:h-full md:min-h-0 flex justify-center items-center bg-gray-50 relative border-b md:border-b-0 md:border-r border-black p-8 shrink-0">
							{/* Manage Button */}
							<button
								onClick={handleManageClick}
								className={`
                                    absolute top-6 left-6 z-20 flex items-center gap-2 
                                    text-xs font-mono font-bold uppercase tracking-widest 
                                    transition-all duration-300 cursor-pointer
                                    px-3 py-1 border
                                    ${
																			isEditMode
																				? "bg-white text-black border-black"
																				: "bg-transparent text-gray-400 border-transparent hover:text-black"
																		}
                                `}
							>
								<Settings2 size={16} />
								<span className="min-w-[4.5rem] text-left">
									{isEditMode ? "Editing" : "Edit Item"}
								</span>
							</button>

							{/* Image Container */}
							<div className="relative w-full h-full max-h-[70vh]">
								<Image
									fill
									src={item.image_url}
									alt={item.name}
									className="object-contain drop-shadow-lg"
									sizes="(max-width: 768px) 100vw, 500px"
									priority
								/>
							</div>

							{/* Tech Specs */}
							<div className="absolute bottom-6 left-6 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
								REF. {item.id.toString().padStart(6, "0")}
							</div>
						</div>

						{/* RIGHT SIDE: Content Area
                           Mobile: Auto height to fit content, overflow visible (scrolls with parent).
                           Desktop: Full height, independent scroll.
                        */}
						<div className="w-full md:w-[50%] h-auto md:h-full flex flex-col bg-white relative">
							{/* Close button */}
							<button
								onClick={onClose}
								className="absolute top-6 right-6 z-20 text-gray-400 hover:text-black transition-colors cursor-pointer"
								aria-label="Close"
							>
								<X size={24} strokeWidth={1.5} />
							</button>

							{/* Content Wrapper */}
							<div className="flex-1 p-8 md:p-12 pt-16 overflow-visible md:overflow-y-auto">
								{isEditMode ? (
									<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
										<div className="mb-8 border-b border-gray-100 pb-4">
											<h3 className="font-serif text-3xl italic text-black mb-2">
												Edit Details
											</h3>
											<p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
												Update your item information
											</p>
										</div>
										<ClothViewEditForm
											dbTagStyles={dbTagStyles}
											item={item}
											onSave={onSave}
											onClose={onClose}
											onDelete={onDelete}
										/>
									</div>
								) : (
									<div className="h-full flex flex-col">
										{/* Product Title Header */}
										<div className="mb-8">
											<h2 className="font-serif text-4xl italic text-black mb-2">
												{item.name || "Unknown Brand"}
											</h2>
											<p className="font-mono text-xs text-gray-500 uppercase tracking-[0.2em]">
												{item.category} / {item.name}
											</p>
										</div>

										{/* Recommendations Component */}
										<div className="flex-1">
											<ClothViewRecommendations
												item={item}
												isLoadingRecs={isLoadingRecs}
												recommendations={recommendations}
												hasTriedAISuggestions={hasTriedAISuggestions}
												onFetchRecommendations={() =>
													handleFetchRecommendations(item.id)
												}
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
