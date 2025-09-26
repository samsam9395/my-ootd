"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RandomCloset from "./RandomCloset";
import Gallery from "./Gallery";
import AddClothForm from "./AddClothForm";
import { StyleTag } from "@/types";
import { getStyleTags } from "@/utils/api";

const categories = [
	"all",
	"top",
	"dress",
	"outerwear",
	"bottom",
	"shoes",
	"accessory",
];

const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || "";

export default function ClosetPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [dbTagStyles, setDbTagStyles] = useState<StyleTag[]>([]);

	const [randomItemsArr, setRandomItemsArr] = useState([]);

	function handleCategoryChange(category: string) {
		router.push(`/closet?category=${category}`);
	}

	useEffect(() => {
		const categoryFromURL = searchParams.get("category") || "all";
		setSelectedCategory(categoryFromURL);
	}, [searchParams]);

	useEffect(() => {
		async function getDBStyles() {
			const styles = await getStyleTags();
			setDbTagStyles(styles);
		}

		getDBStyles();
	}, []);

	useEffect(() => {
		async function fetchRandomItems() {
			const res = await fetch(`${backendUrl}/clothes/random`);
			const data = await res.json();
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
			<aside className="w-48 shrink-0 p-6 ">
				<h2 className="font-bold text-xl mb-4">Categories</h2>
				<ul className="space-y-2">
					{categories.map((cat) => (
						<li key={cat}>
							<button
								className={`hover:underline cursor-pointer ${
									selectedCategory === cat ? "font-bold text-black-800 " : ""
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
						🎲 Today's lucky picks from your closet
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
