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
		null,
	);

	useEffect(() => {
		let cancelled = false;

		const fetchInitialData = async () => {
			setIsLoading(true);
			setFetchItems([]);
			setPage(0);
			setHasMore(true);

			const offset = 0;

			const data = await getPageClothesByType(
				selectedCategory,
				ITEM_LIMIT,
				offset,
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
		if (page === 0 || !hasMore) return;

		const callFetchMoreData = async () => {
			setIsLoading(true);

			const offset = page * ITEM_LIMIT;
			const data = await getPageClothesByType(
				selectedCategory,
				ITEM_LIMIT,
				offset,
			);

			if (!data || data.length === 0) {
				setHasMore(false);
			} else {
				setFetchItems((prev) => {
					const existingIds = new Set(prev.map((item) => item.id));
					const filteredData = data.filter(
						(item: ClothItem) => !existingIds.has(item.id),
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
						}, 200);
					}
				}
			},
			{ threshold: 0.5 },
		);

		if (loaderRef.current) observer.observe(loaderRef.current);
		return () => {
			observer.disconnect();
			if (timeout) clearTimeout(timeout);
		};
	}, [isLoading, hasMore]);

	const handleSaveItemUpdate = async (updatePayload: AddUpdateClothPayload) => {
		showLoader();
		try {
			const savedRes = await addUpdateCloth(updatePayload);
			if (!savedRes.success) throw new Error("No data returned from server");
			const savedItem = savedRes.cloth;

			setFetchItems((prevItems) => {
				const existingIndex = prevItems.findIndex(
					(item) => item.id === savedItem.id,
				);
				if (existingIndex !== -1) {
					const oldItem = prevItems[existingIndex];
					if (
						oldItem.category !== savedItem.category &&
						selectedCategory !== "all"
					) {
						const filtered = prevItems.filter((i) => i.id !== savedItem.id);
						return filtered;
					}
					const updated = [...prevItems];
					updated[existingIndex] = savedItem;
					return updated;
				}
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
		if (selectedClothIndex === null || !fetchItems[selectedClothIndex]) return;
		const itemToDelete = fetchItems[selectedClothIndex];
		const confirmDelete = window.confirm(
			`Are you sure you want to delete this item? This action cannot be undone.`,
		);

		if (!confirmDelete) return;
		showLoader();
		try {
			const res = await deleteCloth(itemToDelete.id);
			if (res) {
				setFetchItems((prev) =>
					prev.filter((item) => item.id !== itemToDelete.id),
				);
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
			if (newCloth.category === selectedCategory) {
				setFetchItems((prev) => [...prev, newCloth]);
			}
			onNewClothHandled?.();
		}
	}, [newCloth]);

	return (
		<>
			<div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-8">
				{fetchItems.map((item, index) => (
					<div
						key={index}
						onClick={() => {
							handleSideBarClose();
							setSelectedClothIndex(index);
						}}
						className="group bg-white cursor-pointer flex flex-col gap-3"
					>
						{/* IMAGE FIX:
                           1. aspect-[3/4]: Keeps the editorial shape.
                           2. bg-gray-50: A light background to frame the item.
                        */}
						<div className="relative w-full aspect-[3/4] bg-gray-50 transition-colors duration-300">
							<Image
								fill
								src={item.image_url}
								alt={item.name}
								/* STYLE FIX HERE:
                                   - object-contain: Ensures the WHOLE item (boot, heel) fits in the box. No cropping.
                                   - p-4: Adds breathing room so it doesn't touch the edges.
                                   - mix-blend-multiply: Blends the white background of the photo into the gray card.
                                */
								className="object-contain p-4 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
								sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
							/>
						</div>

						<div className="flex flex-col gap-0.5">
							<p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
								{item.category}
							</p>
							<h3 className="text-sm md:text-base font-serif italic text-black leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
								{item.name}
							</h3>
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

			{isLoading && (
				<div className="py-10">
					<Loader />
				</div>
			)}

			<div ref={loaderRef} className="h-4" />
		</>
	);
}
