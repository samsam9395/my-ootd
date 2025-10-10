"use client";
import { useState, useEffect, useRef } from "react";
import Loader from "@/components/common/loader";
import ClothViewer from "./ClothView";
import { AddUpdateClothPayload, StyleTag } from "@/types";
import { deleteCloth, getPageClothesByType } from "@/utils/api/clothes";
import { useAlert } from "@/contexts/AlertContext";
import FullPageLoader from "@/components/common/fullPageLoader";
import Image from "next/image";
import { apiClient } from "@/utils/api/apiClient";

const ITEM_LIMIT = 3;

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
	const [isDeleting, setIsDeleting] = useState(false);

	useEffect(() => {
		let cancelled = false;

		const fetchInitialData = async () => {
			setIsLoading(true);
			setFetchItems([]); // reset UI
			setPage(0);
			setHasMore(true);

			const offset = 0; //always start fresh

			const data = await getPageClothesByType(
				selectedCategory,
				ITEM_LIMIT,
				offset
			);

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
	}, [selectedCategory]);

	useEffect(() => {
		if (page === 0 || !hasMore) return; // skip initial page fetch; handled above

		const callFetchMoreData = async () => {
			setIsLoading(true);

			const offset = page * ITEM_LIMIT; // calculate offset
			const data = await getPageClothesByType(
				selectedCategory,
				ITEM_LIMIT,
				offset
			);

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

	const handleSaveItemUpdate = async (updatePayload: AddUpdateClothPayload) => {
		// Refresh the item in the gallery after save
		const res = await await apiClient.post("/clothes/embedded", updatePayload);
		if (res.success) {
			return res; // resolved promise, success
		} else {
			showAlert(`Failed to update cloth. ${res.message}`, "error");
		}
	};
	const handleDeleteItem = async () => {
		// Remove the item from the gallery after delete
		if (selectedClothIndex === null || !fetchItems[selectedClothIndex]) return;

		const itemToDelete = fetchItems[selectedClothIndex];
		const confirmDelete = window.confirm(
			`Are you sure you want to delete this item? This action cannot be undone.`
		);

		if (!confirmDelete) return;
		try {
			setIsDeleting(true);
			const res = await deleteCloth(itemToDelete.id);
			console.log("deletion res:", res);
			if (res) {
				// Remove item from local state
				setFetchItems((prev) =>
					prev.filter((item) => item.id !== itemToDelete.id)
				);

				// Close the viewer
				setSelectedClothIndex(null);

				showAlert("Cloth deleted successfully!", "success");
			} else {
				showAlert(`Failed to delete cloth: ${itemToDelete.name}`, "error");
			}
		} catch (error) {
			console.error("Error deleting item:", error);
			showAlert(`Failed to delete cloth: ${error || "Unknown error"}`, "error");
		} finally {
			setIsDeleting(false);
		}
	};
	return (
		<>
			{isDeleting && <FullPageLoader />}
			<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{fetchItems.map((item, index) => (
					<div
						key={index}
						onClick={() => setSelectedClothIndex(index)}
						className="bg-white rounded-lg shadow-md cursor-pointer"
					>
						<Image
							width={400}
							height={400}
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
