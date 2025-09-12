"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ClothItem } from "./Wardrobe";
import Loader from "@/components/common/loader";

type GalleryProps = {
	selectedCategory: string;
};

export default function Gallery({ selectedCategory }: GalleryProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [fetchItems, setFetchItems] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		console.log("selectedCategory would be:", selectedCategory);
		async function fetchData() {
			setIsLoading(true);
			const res = await fetch(`/api/wardrobe?type=${selectedCategory}`);
			const data = await res.json();
			console.log("Fetched data:", data);
			setFetchItems(data);
			setIsLoading(false);
		}
		fetchData();
	}, [selectedCategory]);

	function handleClick(item: ClothItem) {
		console.log("Clicked item:", item);
	}

	return (
		<>
			{isLoading ? (
				<Loader />
			) : (
				<div
					ref={containerRef}
					className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
				>
					{fetchItems?.map((item, i) => (
						<div
							key={item.id}
							className="bg-white rounded-lg shadow-md cursor-pointer"
							onClick={() => handleClick(item)}
						>
							<img
								key={i}
								src={item.image_url}
								alt={item.name}
								className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-t-lg"
							/>
							<div className="p-2">
								<p className="text-sm font-medium">{item.name}</p>
							</div>
						</div>
					))}

					{/* {selectedCloth && (
				<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
					<div className="bg-white rounded-lg max-h-full overflow-auto w-full max-w-md p-4 relative">
						<button
							className="absolute top-2 right-2 text-black font-bold"
							onClick={() => setSelectedCloth(null)}
						>
							X
						</button>
						<img
							src={selectedCloth.img}
							alt={selectedCloth.name}
							className="w-full h-auto max-h-[70vh] object-cover rounded-lg mb-3"
						/>
						<p className="font-semibold text-lg mb-2">{selectedCloth.name}</p>
						<p className="text-sm text-gray-600">
							Category: {selectedCloth.type}
						</p>
					</div>
				</div>
			)} */}
				</div>
			)}
		</>
	);
}
