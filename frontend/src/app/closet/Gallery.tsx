"use client";

import { useState, useEffect, useRef } from "react";
import Loader from "@/components/common/loader";
import ClothViewer from "./ClothView";
import { AddUpdateClothPayload, ClothItem, StyleTag } from "@/types";
import {
	addUpdateCloth,
	deleteCloth,
	getPageClothesByType,
} from "@/utils/api/clothes";
import { useAlert } from "@/contexts/AlertContext";
import Image from "next/image";
import { useLoader } from "@/contexts/FullLoaderContext";

const ITEM_LIMIT = 3;

export const clothingTypes = [
	{ type: "top", category: "top" },
	{ type: "bottom", category: "bottom" },
	{ type: "sunglasses", category: "accessory" },
	{ type: "bag", category: "accessory" },
	{ type: "skirt", category: "bottom" },
	{ type: "jacket", category: "outerwear" },
	{ type: "dress", category: "dress" },
	{ type: "shoes", category: "shoes" },
	{ type: "accessory", category: "accessory" },
];

type GalleryProps = {
	selectedCategory: string;
	dbTagStyles?: StyleTag[];
	newCloth?: ClothItem | null;
	onNewClothHandled?: () => void;
	handleSideBarClose: () => void;
};

export default function Gallery({
	selectedCategory,
	dbTagStyles,
	newCloth,
	onNewClothHandled,
	handleSideBarClose,
}: GalleryProps) {
	const loaderRef = useRef<HTMLDivElement>(null);
	const { showAlert } = useAlert();

	const { showLoader, hideLoader } = useLoader();
	const [fetchItems, setFetchItems] = useState<any[]>([]);
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);

	const [selectedClothIndex, setSelectedClothIndex] = useState<number | null>(
		null
	);

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
				setFetchItems((prev) => {
					const existingIds = new Set(prev.map((item) => item.id));
					const filteredData = data.filter(
						(item: ClothItem) => !existingIds.has(item.id)
					);
					return [...prev, ...filteredData];
				});
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
		showLoader();
		try {
			const savedRes = await addUpdateCloth(updatePayload);

			if (!savedRes.success) throw new Error("No data returned from server");

			const savedItem = savedRes.cloth;

			setFetchItems((prevItems) => {
				const existingIndex = prevItems.findIndex(
					(item) => item.id === savedItem.id
				);

				// If the cloth already exists in local list (update)
				if (existingIndex !== -1) {
					const oldItem = prevItems[existingIndex];

					// Case 1: category changed → remove from current list
					if (
						oldItem.category !== savedItem.category &&
						selectedCategory !== "all"
					) {
						const filtered = prevItems.filter((i) => i.id !== savedItem.id);
						return filtered;
					}

					// Case 2: same category → update in place
					const updated = [...prevItems];
					updated[existingIndex] = savedItem;
					return updated;
				}

				// Otherwise ignore (belongs to another category)
				return prevItems;
			});

			showAlert("Cloth updated successfully!", "success");
		} catch (error) {
			console.error("Error saving cloth:", error);
			showAlert(`Failed to save cloth: ${error}`, "error");
		} finally {
			hideLoader();
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
		showLoader();
		try {
			const res = await deleteCloth(itemToDelete.id);

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
			hideLoader();
		}
	};

	useEffect(() => {
		if (newCloth) {
			// only add if same category
			if (newCloth.category === selectedCategory) {
				setFetchItems((prev) => [...prev, newCloth]);
			}
			onNewClothHandled?.();
		}
	}, [newCloth]);
	return (
		<>
			<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{fetchItems.map((item, index) => (
					<div
						key={index}
						onClick={() => {
							handleSideBarClose();
							setSelectedClothIndex(index);
						}}
						className="bg-white rounded-lg shadow-md cursor-pointer"
					>
						<div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 rounded-t-lg">
							<Image
								fill
								src={item.image_url}
								alt={item.name}
								className="object-cover rounded-t-lg"
								sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
							/>
						</div>
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
