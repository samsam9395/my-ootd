"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import RandomCloset from "./RandomCloset";
import Gallery from "./Gallery";
import AddClothForm from "./AddClothForm";
import { StyleTag } from "@/types";
import { getRandomClothes, getStyleTags } from "@/utils/api/clothes";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
	"all",
	"top",
	"dress",
	"outerwear",
	"bottom",
	"shoes",
	"accessory",
];

function ClosetContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { accessToken } = useAuth();
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [dbTagStyles, setDbTagStyles] = useState<StyleTag[]>([]);
	const [randomItemsArr, setRandomItemsArr] = useState([]);

	function handleCategoryChange(category: string) {
		if (category === selectedCategory) return;
		router.push(`/closet?category=${category}`);
	}

	useEffect(() => {
		const categoryFromURL = searchParams.get("category") || "all";
		setSelectedCategory(categoryFromURL);
	}, [searchParams]);

	useEffect(() => {
		if (!accessToken) return;
		async function getDBStyles() {
			const styles = await getStyleTags();
			setDbTagStyles(styles);
		}
		getDBStyles();
	}, [accessToken]);

	useEffect(() => {
		async function fetchRandomItems() {
			const data = await getRandomClothes();
			setRandomItemsArr(data);
		}
		fetchRandomItems();
	}, []);

	return (
		<div className="flex h-screen">
			<AddClothForm
				isOpen={isFormOpen}
				dbTagStyles={dbTagStyles}
				onClose={() => setIsFormOpen(false)}
			/>
			{/* Left sidebar */}
			<aside className="w-48 shrink-0 p-6">
				<h2 className="font-bold text-xl mb-4">Categories</h2>
				<ul className="space-y-2">
					{categories.map((cat) => (
						<li key={cat}>
							<button
								className={`hover:underline cursor-pointer ${
									selectedCategory === cat ? "font-bold text-black-800" : ""
								}`}
								onClick={() => handleCategoryChange(cat)}
							>
								{cat.charAt(0).toUpperCase() + cat.slice(1)}
							</button>
						</li>
					))}
				</ul>
			</aside>

			{/* Right Clothes Display */}
			<main className="flex-1 flex flex-col pt-24 overflow-y-auto bg-white">
				<div className="w-full px-6 flex justify-start mb-10">
					<button
						className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
						onClick={() => setIsFormOpen(true)}
					>
						+ Add New Item To Closet
					</button>
				</div>
				<div className="w-full px-6 mb-2">
					<p className="text-gray-500 italic text-sm">
						{"🎲 Today's lucky picks from your closet"}
					</p>
				</div>
				<RandomCloset randomItemsArr={randomItemsArr} />
				<div className="w-full px-6">
					<Gallery
						selectedCategory={selectedCategory}
						dbTagStyles={dbTagStyles}
					/>
				</div>
			</main>
		</div>
	);
}

export default function ClosetPage() {
	return (
		<Suspense
			fallback={
				<div className="flex items-center justify-center h-screen">
					Loading...
				</div>
			}
		>
			<ClosetContent />
		</Suspense>
	);
}
