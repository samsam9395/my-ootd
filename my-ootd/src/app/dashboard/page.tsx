"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Wardrobe from "./Wardrobe";
import Gallery from "./Gallery";
import AddClothForm from "./AddClothForm";
import { StyleTag } from "@/types";

const categories = [
	"all",
	"top",
	"dress",
	"outerwear",
	"bottom",
	"shoes",
	"accessory",
];

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function DashboardPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [selectedCategory, setSelectedCategory] = useState("all");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [dbTagStyles, setDbTagStyles] = useState<StyleTag[]>([]);

	function handleCategoryChange(category: string) {
		router.push(`/dashboard?category=${category}`);
	}

	useEffect(() => {
		const categoryFromURL = searchParams.get("category") || "all";
		setSelectedCategory(categoryFromURL);
	}, [searchParams]);

	useEffect(() => {
		async function getDBStyles() {
			console.log("url is", `${backendUrl}/get_style_tags`);
			const styles = await fetch(`${backendUrl}/get_style_tags`);
			return styles.json();
		}
		console.log("should run here");
		getDBStyles().then((data) => setDbTagStyles(data));
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
								className={`hover:underline ${
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

			{/* Right wardrobe */}
			<main className="flex-1 flex flex-col pt-24 overflow-y-auto bg-white">
				<div className="w-full px-6 mb-4 flex justify-start">
					<button
						className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-600 cursor-pointer"
						onClick={() => setIsFormOpen(true)}
					>
						+ Add New Item To Closet
					</button>
				</div>
				<div className="w-full px-6">
					{selectedCategory == "all" ? (
						<Wardrobe />
					) : (
						<Gallery selectedCategory={selectedCategory} />
					)}
				</div>
			</main>
		</div>
	);
}
