"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ClothItem, ClothRecommendationSet } from "@/types";
import { fetchRecommendations } from "@/utils/api/clothes";
import Loader from "@/components/common/loader";
import { motion, AnimatePresence } from "framer-motion";
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
	const [recResponse, setRecResponse] = useState<ClothRecommendationSet | null>(
		null,
	);
	const [isMobile, setIsMobile] = useState(false);

	const total = randomItemsArr?.length;
	const selectedItem =
		selectedCloth !== null ? randomItemsArr[selectedCloth] : null;

	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		if (selectedCloth !== null) recommendClothes(randomItemsArr[selectedCloth]);
	}, [selectedCloth]);

	const prev = () => {
		if (recIsLoading) return;
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? randomItemsArr.length - 1 : prevIndex - 1,
		);
		setSelectedCloth(null);
		setRecResponse(null);
	};

	const next = () => {
		if (recIsLoading) return;
		setCurrentIndex((prevIndex) =>
			prevIndex === randomItemsArr.length - 1 ? 0 : prevIndex + 1,
		);
		setSelectedCloth(null);
		setRecResponse(null);
	};

	async function recommendClothes(selectedClothItem: ClothItem) {
		if (!selectedClothItem) return;
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

	// Z-INDEX FIX: Changed from z-40 to z-20 to sit below Mobile Header (z-40)
	const arrowBtnClass = `
        absolute top-1/2 -translate-y-1/2 z-20 p-3 rounded-full shadow-lg transition-all duration-300
        bg-white text-black
        ${
					recIsLoading
						? "opacity-30 cursor-not-allowed"
						: "hover:bg-black hover:text-white cursor-pointer hover:scale-110"
				}
    `;

	return (
		<div className={`w-full flex flex-col items-center justify-center mb-20`}>
			{/* 3D CAROUSEL CONTAINER */}
			<div
				className={`relative w-full md:w-[500px] h-[400px] perspective-1000 group flex items-center justify-center mt-10 ${recIsLoading ? "pointer-events-none" : ""}`}
			>
				{/* Left Arrow */}
				<button
					onClick={prev}
					disabled={recIsLoading}
					className={`${arrowBtnClass} left-2 md:-left-12`}
				>
					<ChevronLeft size={20} />
				</button>

				{/* Right Arrow */}
				<button
					onClick={next}
					disabled={recIsLoading}
					className={`${arrowBtnClass} right-2 md:-right-12`}
				>
					<ChevronRight size={20} />
				</button>

				{/* CAROUSEL ITEMS */}
				{randomItemsArr?.map((item, i) => {
					let diff = i - currentIndex;
					if (diff < -Math.floor(total / 2)) diff += total;
					if (diff > Math.floor(total / 2)) diff -= total;

					const isActive = diff === 0;
					const angle = diff * 40;
					const zOffset = -Math.abs(diff) * 300;
					const scale = isActive ? 1 : 0.8;
					const opacity = isActive ? 1 : 0.5;

					const isMobileTransform = isActive
						? `translate(-50%, -50%) scale(1)`
						: `translate(-50%, -50%) scale(0.8) translateX(${diff * 50}px)`;

					const isDesktopTransform = `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${zOffset}px) scale(${scale})`;

					return (
						<div
							key={i}
							className={`
                                absolute top-1/2 left-1/2 w-64 h-80 md:w-72 md:h-96 
                                transition-all duration-500 ease-out
                                bg-white border-4 border-white shadow-2xl
                                ${isActive ? "z-30 hover:scale-105" : "z-10 grayscale hover:grayscale-0"}
                                ${recIsLoading ? "cursor-wait" : "cursor-pointer"}
                            `}
							style={{
								transform: isMobile ? isMobileTransform : isDesktopTransform,
								zIndex: total - Math.abs(diff),
								opacity: Math.abs(diff) > 2 ? 0 : opacity,
							}}
							onClick={() => !recIsLoading && setSelectedCloth(i)}
						>
							<div className="relative w-full h-full overflow-hidden bg-gray-50 border border-gray-100">
								<Image
									fill
									src={item.image_url}
									alt={`clothing-${i}`}
									className="object-cover"
									sizes="(max-width: 768px) 100vw, 400px"
								/>
								{isActive && !selectedItem && !recIsLoading && (
									<div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
										<span className="bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-black shadow-lg">
											Click to Style
										</span>
									</div>
								)}
								{/* Loading Overlay on the card itself */}
								{isActive && recIsLoading && (
									<div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[2px]">
										<Loader />
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Helper Text */}
			{!selectedItem && !recIsLoading && (
				<p className="mt-8 text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] animate-pulse">
					Select an item to reveal AI suggestions
				</p>
			)}

			{/* RECOMMENDATION CARD */}
			<AnimatePresence mode="wait">
				{selectedItem && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 20 }}
						className="mt-8 w-full max-w-4xl bg-white border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] p-0 overflow-hidden"
					>
						{recIsLoading ? (
							<div className="p-12 flex flex-col items-center justify-center h-[300px]">
								<span className="mt-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest animate-pulse">
									Curating Editorial Look...
								</span>
							</div>
						) : recResponse && recResponse.items.length > 0 ? (
							<div className="flex flex-col md:flex-row">
								{/* Left: Info Header */}
								<div className="w-full md:w-1/3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-black bg-gray-50">
									<span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2 block">
										Selected Piece
									</span>
									<h3 className="font-serif text-2xl italic text-black mb-4">
										{selectedItem.name}
									</h3>

									<div className="space-y-4">
										{recResponse?.style_phrase && (
											<div>
												<span className="block text-[10px] font-bold uppercase tracking-widest mb-1">
													Theme
												</span>
												<p className="font-serif italic text-gray-600 leading-tight">
													"{recResponse.style_phrase}"
												</p>
											</div>
										)}
										{recResponse?.style_flair && (
											<div>
												<span className="block text-[10px] font-bold uppercase tracking-widest mb-1">
													Stylist Note
												</span>
												<p className="text-xs text-gray-500 font-light leading-relaxed">
													{recResponse.style_flair}
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Right: Suggested Items */}
								<div className="w-full md:w-2/3 p-6 md:p-8 bg-white">
									<div className="flex items-center justify-between mb-4">
										<span className="text-[10px] font-mono font-bold uppercase tracking-widest border-b border-black pb-1">
											Curated Pairs
										</span>
									</div>

									<div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
										{recResponse?.items.map((item) => (
											<div
												key={item.id}
												className="group w-32 md:w-40 flex-shrink-0 cursor-pointer"
												onClick={() => {
													handleSideBarClose();
													setModalItem(item);
												}}
											>
												<div className="relative w-full h-40 md:h-48 bg-gray-50 border border-gray-100 group-hover:border-black transition-colors mb-2">
													<Image
														fill
														src={item.image_url}
														alt={item?.name}
														className="object-contain p-2 mix-blend-multiply"
														sizes="160px"
													/>
												</div>
												<div className="pr-2">
													<p className="font-serif text-sm italic truncate group-hover:underline">
														{item?.name}
													</p>
													<p className="text-[10px] font-mono text-gray-400 uppercase">
														{item?.category}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="p-12 text-center">
								<span className="font-serif text-lg italic text-gray-400">
									No editorial suggestions available for this item.
								</span>
							</div>
						)}
					</motion.div>
				)}
			</AnimatePresence>

			{/* QUICK VIEW MODAL */}
			<AnimatePresence>
				{modalItem && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
						onClick={() => setModalItem(null)}
					>
						<motion.div
							initial={{ scale: 0.95, y: 10 }}
							animate={{ scale: 1, y: 0 }}
							exit={{ scale: 0.95, y: 10 }}
							className="bg-white border border-black shadow-2xl p-0 max-w-sm w-full relative overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							{/* Updated Close Button to match ClothView style */}
							<button
								className="absolute top-6 right-6 z-10 text-gray-400 hover:text-black transition-colors cursor-pointer"
								onClick={() => setModalItem(null)}
							>
								<X size={24} strokeWidth={1.5} />
							</button>

							<div className="w-full h-80 relative bg-gray-50 border-b border-black">
								<Image
									fill
									src={modalItem.image_url}
									alt={modalItem?.name}
									className="object-contain p-8 mix-blend-multiply"
								/>
							</div>

							<div className="p-6">
								<span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block mb-1">
									{modalItem?.category} / {modalItem?.colour}
								</span>
								<h3 className="font-serif text-xl italic text-black mb-4">
									{modalItem?.name}
								</h3>

								{modalItem.styles && (
									<div className="flex flex-wrap gap-2">
										{modalItem.styles.map((s, idx) => (
											<span
												key={idx}
												className="px-2 py-1 border border-gray-200 text-[10px] font-bold uppercase"
											>
												{typeof s === "string" ? s : s.name}
											</span>
										))}
									</div>
								)}
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
