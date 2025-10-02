"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ClothItem, ClothRecommendationSet } from "@/types";
import { fetchRecommendations } from "@/utils/api/clothes";
import Loader from "@/components/common/loader";
import { motion } from "framer-motion";

type RandomClosetProps = { randomItemsArr: ClothItem[] };

export default function RandomCloset({ randomItemsArr }: RandomClosetProps) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedCloth, setSelectedCloth] = useState<number | null>(null);
	const [modalItem, setModalItem] = useState<ClothItem | null>(null);
	const [recIsLoading, setRecIsLoading] = useState(false);
	const [imgLoaded, setImgLoaded] = useState(false);
	const total = randomItemsArr?.length;

	const selectedItem =
		selectedCloth !== null ? randomItemsArr[selectedCloth] : null;

	const [recResponse, setRecResponse] = useState<ClothRecommendationSet | null>(
		null
	);

	// Log selection
	useEffect(() => {
		if (selectedCloth !== null) {
			console.log("Selected cloth:", randomItemsArr[selectedCloth]);
			recommendClothes(randomItemsArr[selectedCloth]);
		}
	}, [selectedCloth]);

	const prev = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? randomItemsArr.length - 1 : prevIndex - 1
		);
		setSelectedCloth(null);
	};

	const next = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === randomItemsArr.length - 1 ? 0 : prevIndex + 1
		);
		setSelectedCloth(null);
	};

	async function recommendClothes(selectedClothItem: ClothItem) {
		if (!selectedClothItem) return [];
		setRecIsLoading(true);
		try {
			const itemId = selectedClothItem.id;
			const normalizedRecs = await fetchRecommendations(itemId);
			console.log("Normalized recommendations:", normalizedRecs);
			setRecResponse(normalizedRecs);
		} catch (error) {
			console.error("Error fetching recommendations:", error);
			setRecResponse(null);
		} finally {
			setRecIsLoading(false);
		}
	}

	return (
		<div
			className={`w-full flex flex-col items-center justify-center mb-20 ${
				recIsLoading ? "pointer-events-none opacity-70" : ""
			}`}
		>
			{/* Left Arrow */}

			<div className="relative w-96 h-80 perspective-1000 group">
				<button
					onClick={prev}
					className="absolute top-1/2 left-0 -translate-x-full -translate-y-1/2 
               bg-black/40 text-white p-3 rounded-full z-10 cursor-pointer
               opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				>
					<ChevronLeft size={18} />
				</button>

				{/* Right Arrow */}
				<button
					onClick={next}
					className="absolute top-1/2 right-0 translate-x-full -translate-y-1/2 
               bg-black/40 text-white p-3 rounded-full z-10 cursor-pointer
               opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				>
					<ChevronRight size={18} />
				</button>
				{/* RandomCloset images */}
				{randomItemsArr?.map((item, i) => {
					let diff = i - currentIndex;
					if (diff < -Math.floor(total / 2)) diff += total;
					if (diff > Math.floor(total / 2)) diff -= total;

					const angle = diff * 25;
					const zOffset = -Math.abs(diff) * 130;
					const scale = diff === 0 ? 1 : 0.5;

					return (
						<img
							key={i}
							src={item.image_url}
							alt={`clothing-${i}`}
							className="absolute top-1/2 left-1/2 w-100 h-72 rounded-xl shadow-lg object-cover transition-transform duration-300 cursor-pointer"
							style={{
								transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${zOffset}px) scale(${scale})`,
								zIndex: total - Math.abs(diff),
							}}
							onClick={() => setSelectedCloth(i)}
						/>
					);
				})}
			</div>
			<p className="mt-2 text-gray-500">Click an item to see suggestions</p>
			{/* Recommendation Card */}
			{selectedItem && (
				<div className="mt-2 w-100 bg-white rounded-xl shadow-lg p-4">
					{recIsLoading ? (
						<div className="flex w-full flex-col items-center mt-6">
							<div className="text-gray-700 italic text-md">
								Analyzing your best fit......
							</div>
							<Loader />
						</div>
					) : recResponse && recResponse.items.length > 0 ? (
						<>
							<h3 className="font-bold text-lg mb-2">
								Suggested items for "{selectedItem.name}"
							</h3>
							<div className="text-sm text-gray-500 mb-4">
								Theme: <em>{recResponse?._style_phrase}</em>
							</div>
							<div className="flex gap-3 overflow-x-auto">
								{recResponse.items
									.filter(({ item }) => item && item.id) // safety filter
									.map(({ item }) => (
										<div
											key={item.id}
											className="min-w-[120px] flex-shrink-0 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform cursor-pointer"
											onClick={() => setModalItem(item)}
										>
											<img
												src={item.image_url}
												alt={item?.name}
												className="w-full h-32 object-cover"
											/>
											<div className="p-1 text-xs text-gray-700">
												<p className="truncate">{item?.name}</p>
												<p className="text-gray-400">{item?.type}</p>
											</div>
										</div>
									))}
							</div>
						</>
					) : (
						<h3 className="font-bold text-lg mb-2">No suggestions available</h3>
					)}
				</div>
			)}
			{/* Modal for large image */}
			{modalItem && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50
               opacity-0 animate-fadeIn"
					onClick={() => setModalItem(null)}
				>
					<motion.div
						className="relative bg-white rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-auto"
						onClick={(e) => e.stopPropagation()}
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.2 }}
					>
						<button
							className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 cursor-pointer"
							onClick={() => setModalItem(null)}
						>
							<X size={26} />
						</button>

						<img
							src={modalItem.image_url}
							alt={modalItem?.name}
							onLoad={() => setImgLoaded(true)}
							className={`w-full max-h object-cover rounded-lg mb-3 transition-opacity duration-300 ${
								imgLoaded ? "opacity-100" : "opacity-0"
							}`}
						/>

						<h3 className="font-bold text-lg">{modalItem?.name}</h3>
						<p className="text-gray-500">{modalItem?.type}</p>
						<p className="text-gray-400 text-sm">{modalItem?.colour}</p>
						<div className="flex text-gray-400 text-sm">
							{modalItem?.styles.map((s) => s.name).join(", ")}
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
}
