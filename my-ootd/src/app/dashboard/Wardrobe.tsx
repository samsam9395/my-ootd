"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type ClothItem = {
	id: number;
	name: string;
	type: string;
	colour: string;
	image_url: string;
	category: string;
	styles: string[];
};

export default function Wardrobe() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedCloth, setSelectedCloth] = useState<number | null>(null);
	const [modalItem, setModalItem] = useState<ClothItem | null>(null);
	const [fetchItems, setFetchItems] = useState<any[]>([]);
	const total = fetchItems.length;

	const selectedItem =
		selectedCloth !== null ? fetchItems[selectedCloth] : null;
	const recommendations = selectedItem ? recommendClothes(selectedItem) : [];

	useEffect(() => {
		async function fetchData() {
			const res = await fetch(`/api/wardrobe?type=all`);
			const data = await res.json();

			setFetchItems(data);
		}
		fetchData();
	}, []);

	// Log selection
	useEffect(() => {
		if (selectedCloth !== null) {
			console.log("Selected cloth:", fetchItems[selectedCloth]);
		}
	}, [selectedCloth]);

	const prev = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === 0 ? fetchItems.length - 1 : prevIndex - 1
		);
		setSelectedCloth(null);
	};

	const next = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex === fetchItems.length - 1 ? 0 : prevIndex + 1
		);
		setSelectedCloth(null);
	};

	function recommendClothes(selectedClothItem: ClothItem) {
		if (!selectedClothItem) return [];
		const filtered = fetchItems.filter(
			(item) =>
				item.id !== selectedClothItem.id && item.type !== selectedClothItem.type
		);
		const recommendations = filtered.sort((a, b) =>
			a.colour === selectedClothItem.colour ? -1 : 0
		);
		return recommendations.slice(0, 3);
	}

	return (
		<div className="w-full flex flex-col items-center justify-center mt-10">
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
				{/* Wardrobe images */}
				{fetchItems.map((item, i) => {
					let diff = i - currentIndex;
					if (diff < -Math.floor(total / 2)) diff += total;
					if (diff > Math.floor(total / 2)) diff -= total;

					const angle = diff * 30;
					const zOffset = -Math.abs(diff) * 100;
					const scale = diff === 0 ? 1 : 0.8;

					return (
						<img
							key={i}
							src={item.image_url}
							alt={`clothing-${i}`}
							className="absolute top-1/2 left-1/2 w-60 h-72 rounded-xl shadow-lg object-cover transition-transform duration-300 cursor-pointer"
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
			{selectedItem && recommendations.length > 0 && (
				<div className="mt-6 w-96 bg-white rounded-xl shadow-lg p-4">
					<h3 className="font-bold text-lg mb-2">
						Suggested items for "{selectedItem.name}"
					</h3>
					<div className="flex gap-3 overflow-x-auto">
						{recommendations.map((item) => (
							<div
								key={item.id}
								className="min-w-[120px] flex-shrink-0 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform cursor-pointer"
								onClick={() => setModalItem(item)}
							>
								<img
									src={item.image_url}
									alt={item.name}
									className="w-full h-32 object-cover"
								/>
								<div className="p-1 text-xs text-gray-700">
									<p className="truncate">{item.name}</p>
									<p className="text-gray-400">{item.type}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
			{/* Modal for large image */}
			{modalItem && (
				<div
					className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
					onClick={() => setModalItem(null)}
				>
					<div
						className="relative bg-white rounded-xl p-4 max-w-md w-full max-h-[80vh] overflow-auto"
						onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
					>
						<button
							className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
							onClick={() => setModalItem(null)}
						>
							<X size={20} className="hover:cursor-pointer" />
						</button>
						<img
							src={modalItem.image_url}
							alt={modalItem.name}
							className="w-full max-h object-cover rounded-lg mb-3"
						/>
						<h3 className="font-bold text-lg">{modalItem.name}</h3>
						<p className="text-gray-500">{modalItem.type}</p>
						<p className="text-gray-400 text-sm">
							{modalItem.colour}, {modalItem.styles}
						</p>
					</div>
				</div>
			)}
		</div>
	);
}
