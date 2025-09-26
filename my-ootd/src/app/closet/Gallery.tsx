"use client";
import { useState, useEffect, useRef } from "react";
import Loader from "@/components/common/loader";
import ClothViewer from "./ClothView";
import { ClothRecommendationSet, StyleTag, UpdateClothPayload } from "@/types";
import { fetchMoreData, getPageClothesByType, updateCloth } from "@/utils/api";
import { useAlert } from "@/contexts/AlertContext";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const clothingTypes = [
	{ type: "top", category: "top" },
	{ type: "bottom", category: "bottom" },
	{ type: "sunglass", category: "accessory" },
	{ type: "bag", category: "accessory" },
	{ type: "skirt", category: "bottom" },
	{ type: "jacket", category: "outerwear" },
	{ type: "dress", category: "dress" },
	{ type: "shoes", category: "shoes" },
	{ type: "accessory", category: "accessory" },
];

type GalleryProps = { selectedCategory: string; dbTagStyles?: StyleTag[] };

export default function Gallery({
	selectedCategory,
	dbTagStyles,
}: GalleryProps) {
	const loaderRef = useRef<HTMLDivElement>(null);
	const { showAlert } = useAlert();

	const [fetchItems, setFetchItems] = useState<any[]>([]);
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const [selectedClothIndex, setSelectedClothIndex] = useState<number | null>(
		null
	);
	const [refreshKey, setRefreshKey] = useState(0);
	useEffect(() => {
		let cancelled = false;

		const fetchInitialData = async () => {
			setIsLoading(true);
			setFetchItems([]); // reset UI
			setPage(0);
			setHasMore(true);

			const limit = 3;
			const offset = 0;

			const data = await getPageClothesByType(selectedCategory, limit, offset);

			if (!cancelled) {
				setFetchItems(data);
				setHasMore(data.length > 0);
				setIsLoading(false);
			}
		};

		fetchInitialData();

		return () => {
			cancelled = true;
		};
	}, [selectedCategory, refreshKey]);

	useEffect(() => {
		if (page === 0 || !hasMore) return; // skip initial page fetch; handled above

		const callFetchMoreData = async () => {
			setIsLoading(true);

			const data = await fetchMoreData(selectedCategory, page);

			if (!data || data.length === 0) {
				setHasMore(false);
			} else {
				setFetchItems((prev) => [...prev, ...data]);
			}

			setIsLoading(false);
		};

		callFetchMoreData();
	}, [page, selectedCategory, hasMore]);

	useEffect(() => {
		let timeout: NodeJS.Timeout | null = null;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading && hasMore) {
					if (!timeout) {
						timeout = setTimeout(() => {
							setPage((prev) => prev + 1);
							timeout = null;
						}, 200); //debounce prevent multiple calls
					}
				}
			},
			{ threshold: 0.5 } //lower means trigger observer earlier
		);

		if (loaderRef.current) observer.observe(loaderRef.current);
		return () => {
			observer.disconnect();
			if (timeout) clearTimeout(timeout);
		};
	}, [isLoading, hasMore]);

	const handleSaveItemUpdate = async (updatePayload: {
		clothId: number;
		payload: UpdateClothPayload;
	}) => {
		// Refresh the item in the gallery after save
		const res = await updateCloth(updatePayload); // your API call
		if (res.success) {
			return res; // resolved promise, success
		} else {
			throw new Error(res.error || "Failed to update"); // rejected promise
		}
	};
	const handleDeleteItem = () => {
		// Remove the item from the gallery after delete
	};
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{fetchItems.map((item, index) => (
					<div
						key={index}
						onClick={() => setSelectedClothIndex(index)}
						className="bg-white rounded-lg shadow-md cursor-pointer"
					>
						<img
							src={item.image_url}
							alt={item.name}
							className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover rounded-t-lg"
						/>
						<div className="p-2">
							<p className="text-sm font-medium">{item.name}</p>
						</div>
					</div>
				))}
			</div>
			{selectedClothIndex !== null && fetchItems[selectedClothIndex] && (
				<ClothViewer
					dbTagStyles={dbTagStyles ?? []}
					item={fetchItems[selectedClothIndex]}
					isOpen={true}
					onClose={() => setSelectedClothIndex(null)}
					onSave={(updatePayload) => handleSaveItemUpdate(updatePayload)}
					onDelete={() => handleDeleteItem()}
				/>
			)}
			{isLoading && <Loader />}
			<div ref={loaderRef} />
		</>
	);
}
