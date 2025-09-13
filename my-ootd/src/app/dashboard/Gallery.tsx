"use client";
import { useState, useEffect, useRef } from "react";
import Loader from "@/components/common/loader";
import ClothViewer from "./ClothView";
import { ClothItem } from "./Wardrobe";

type GalleryProps = { selectedCategory: string };

export default function Gallery({ selectedCategory }: GalleryProps) {
	const loaderRef = useRef<HTMLDivElement>(null);

	const [fetchItems, setFetchItems] = useState<any[]>([]);
	const [page, setPage] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const currentCategoryRef = useRef(selectedCategory);
	const [selectedClothIndex, setSelectedClothIndex] = useState<number | null>(
		null
	);
	const [recommendations, setRecommendations] = useState<ClothItem[]>([]);

	useEffect(() => {
		let cancelled = false;

		const fetchInitialData = async () => {
			setIsLoading(true);
			setFetchItems([]); // reset UI
			setPage(0);
			setHasMore(true);

			const limit = 3;
			const offset = 0;

			const res = await fetch(
				`/api/wardrobe?type=${selectedCategory}&limit=${limit}&offset=${offset}`
			);
			const data = await res.json();

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

		const fetchMoreData = async () => {
			setIsLoading(true);
			const limit = 3;
			const offset = page * limit;

			const res = await fetch(
				`/api/wardrobe?type=${selectedCategory}&limit=${limit}&offset=${offset}`
			);
			const data = await res.json();

			if (data.length === 0) {
				setHasMore(false);
			} else {
				setFetchItems((prev) => [...prev, ...data]);
			}

			setIsLoading(false);
		};

		fetchMoreData();
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

	function handleClick(itemIndex: number) {
		setSelectedClothIndex(itemIndex);
	}

	useEffect(() => {
		if (selectedClothIndex === null) {
			setRecommendations([]);
			return;
		}

		const clickedItem = fetchItems[selectedClothIndex];
		console.log("clickedItem", clickedItem);
		if (!clickedItem) return; // extra guard

		const recs = fetchItems.filter(
			(i) =>
				i.id !== clickedItem.id &&
				i.type !== clickedItem.type &&
				i.styles.some((s: string) => clickedItem.styles.includes(s)) &&
				(i.colour === clickedItem.colour ||
					i.colour === "black" ||
					i.colour === "white")
		);
		console.log("Recommendations:", recs);

		setRecommendations(recs);
	}, [selectedClothIndex, fetchItems]);

	return (
		<>
			<div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
				{fetchItems.map((item, index) => (
					<div
						key={index}
						onClick={() => {
							console.log("Clicked item index:", index);
							console.log("Clicked item:", item);
							handleClick(index);
						}}
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
					item={fetchItems[selectedClothIndex]}
					isOpen={true}
					recommendations={recommendations}
					onClose={() => setSelectedClothIndex(null)}
				/>
			)}
			{isLoading && <Loader />}
			<div ref={loaderRef} />
		</>
	);
}
