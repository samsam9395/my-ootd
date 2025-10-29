"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ClothItem, ClothRecommendationSet } from "@/types";
import { fetchRecommendations } from "@/utils/api/clothes";
import Loader from "@/components/common/loader";
import { motion } from "framer-motion";
import Image from "next/image";

type RandomClosetProps = {
	randomItemsArr: ClothItem[];
	handleSideBarClose: () => void;
};

export default function RandomCloset({
	randomItemsArr,
	handleSideBarClose,
}: RandomClosetProps) {
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
		if (selectedCloth !== null) recommendClothes(randomItemsArr[selectedCloth]);
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

			const aiRecs = await fetchRecommendations(itemId);

			setRecResponse(aiRecs);
		} catch (error) {
			console.error("Error fetching recResponse:", error);
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
			<div className="relative w-96 h-80 perspective-1000 group">
				{/* Left Arrow */}
				<button
					onClick={prev}
					className="absolute top-1/2 left-2 -translate-y-1/2 
  bg-black/40 text-white p-3 rounded-full z-30 cursor-pointer
  md:left-0 md:-translate-x-full md:opacity-0 md:group-hover:opacity-100 
  transition-opacity duration-300"
				>
					<ChevronLeft size={18} />
				</button>

				{/* Right Arrow */}
				<button
					onClick={next}
					className="absolute top-1/2 right-2 -translate-y-1/2 
  bg-black/40 text-white p-3 rounded-full z-30 cursor-pointer
  md:right-0 md:translate-x-full md:opacity-0 md:group-hover:opacity-100 
  transition-opacity duration-300"
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

					// On mobile: stack behind center, on desktop: carousel effect
					const isMobileTransform =
						diff === 0
							? `translate(-50%, -50%)`
							: `translate(-50%, -50%) scale(0.85)`;

					const isDesktopTransform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${zOffset}px) scale(${scale})`;

					return (
						<div
							key={i}
							className="absolute top-1/2 left-1/2 w-full h-72 rounded-xl shadow-lg transition-transform duration-300 cursor-pointer"
							style={{
								transform:
									window.innerWidth < 768
										? isMobileTransform
										: isDesktopTransform,
								zIndex: total - Math.abs(diff),
							}}
							onClick={() => setSelectedCloth(i)}
						>
							<Image
								fill
								src={item.image_url}
								alt={`clothing-${i}`}
								className="object-cover rounded-xl"
								sizes="100vw"
							/>
						</div>
					);
				})}
			</div>
			<p className="mt-2 text-gray-500">Click an item to see suggestions</p>
			{/* Recommendation Card */}
			{selectedItem && (
				<div className="mt-2 w-[90%] max-w-[600px] bg-white rounded-xl shadow-lg p-4">
					{recIsLoading ? (
						<div className="flex w-full flex-col items-center mt-6">
							<div className="text-gray-700 italic text-md">
								Analyzing your best fit...... can take a moment!
							</div>
							<Loader />
						</div>
					) : recResponse && recResponse.items.length > 0 ? (
						<>
							<h3 className=" text-lg mb-2">
								Suggested items for: <br />
								<span className="font-bold italic">"{selectedItem.name}"</span>
							</h3>
							<div className="space-y-0.8 text-sm mb-4">
								{recResponse?.style_phrase && (
									<div className="grid grid-cols-[55px_auto] md:grid-cols-[65px_auto] gap-1">
										<div className="text-gray-700 font-semibold">Theme:</div>
										<span className="font-normal italic text-gray-600">
											{recResponse.style_phrase}
										</span>
									</div>
								)}
								{recResponse?.style_flair && (
									<div className="grid grid-cols-[55px_auto] md:grid-cols-[65px_auto] gap-1">
										<div className="text-gray-700 font-semibold">The Edit:</div>
										<span className="font-normal italic text-gray-600">
											{recResponse.style_flair}
										</span>
									</div>
								)}
							</div>
							<div className="flex gap-4 overflow-x-auto px-2 py-2">
								{recResponse?.items.map((item) => (
									<div
										key={item.id}
										className="w-[200px] flex-shrink-0 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform cursor-pointer"
										onClick={() => {
											handleSideBarClose();
											setModalItem(item);
										}}
									>
										<div className="relative w-full h-[200px]">
											<Image
												fill
												src={item.image_url}
												alt={item?.name}
												className="object-cover"
												sizes="200px"
												quality={90}
											/>
										</div>
										<div className="p-1 text-xs text-gray-700">
											<p>{item?.name}</p>
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
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-200
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
							className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 cursor-pointer z-5"
							onClick={() => setModalItem(null)}
						>
							<X size={26} />
						</button>

						<div
							className={`relative w-full h-100 mb-3 ${
								imgLoaded ? "opacity-100" : "opacity-0"
							}`}
						>
							<Image
								fill
								src={modalItem.image_url}
								alt={modalItem?.name}
								onLoad={() => setImgLoaded(true)}
								className="object-contain rounded-lg transition-opacity duration-300"
								sizes="(max-width: 768px) 100vw, 400px"
							/>
						</div>

						<h3 className="font-bold text-lg">{modalItem?.name}</h3>
						<p className="text-gray-500">{modalItem?.type}</p>
						<p className="text-gray-400 text-sm">{modalItem?.colour}</p>
						{modalItem.styles && (
							<div className="flex text-gray-400 text-sm">
								Styles: {modalItem.styles.map((s) => s).join(", ")}
							</div>
						)}
					</motion.div>
				</div>
			)}
		</div>
	);
}
