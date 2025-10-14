"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import RandomCloset from "./RandomCloset";
import Gallery from "./Gallery";
import AddClothForm from "./AddClothForm";
import { ClothItem, StyleTag } from "@/types";
import { getRandomClothes, getStyleTags } from "@/utils/api/clothes";
import { useAuth } from "@/contexts/AuthContext";
import { Menu } from "lucide-react";
import Loader from "@/components/common/loader";

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
	const [randomIsLoading, setRandomIsLoading] = useState(true);
	const [newCloth, setNewCloth] = useState<ClothItem | null>(null);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	function handleCategoryChange(category: string) {
		if (category === selectedCategory) return;
		router.push(`/closet?category=${category}`);
		setSidebarOpen(false); // close drawer on selection (mobile)
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
			try {
				setRandomIsLoading(true);
				const data = await getRandomClothes();
				setRandomItemsArr(data);
			} catch (error) {
				console.error("Error fetching random clothes:", error);
			} finally {
				setRandomIsLoading(false);
			}
		}
		fetchRandomItems();
	}, []);

	return (
		<div className="flex h-screen">
			<AddClothForm
				isOpen={isFormOpen}
				dbTagStyles={dbTagStyles}
				onClose={() => setIsFormOpen(false)}
				onAddCloth={(newCloth) => setNewCloth(newCloth)}
			/>

			{/* Hamburger button for mobile */}
			<div className="w-full fixed top-[64px]left-0 bg-gray-800 p-1 z-50 flex justify-between items-center sm:hidden">
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className="sm:hidden text-white px-3 py-2 rounded cursor-pointer"
				>
					<Menu size={20} />
				</button>
			</div>

			{/* Sidebar */}
			<aside
				className={`
					z-[101] fixed top-0 left-0 h-full w-48 bg-white p-6 shadow-lg transform
					${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
					transition-transform duration-300 ease-in-out
					sm:translate-x-0 sm:static sm:block sm:shadow-none
				`}
			>
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

			{/* Main content */}
			<main className="flex-1 flex flex-col pt-[80px] sm:pt-[50px] overflow-y-auto bg-white ml-0 ">
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

				{randomIsLoading ? (
					<Loader />
				) : randomItemsArr.length === 0 ? (
					<div className="flex w-full flex-col items-center mt-6">
						<div className="text-gray-700 text-lg mb-2">
							<div>
								Hold up! Your closet is currently sunbathing. <br />
								Click that 'Add' button to bring the fashion party!
							</div>
						</div>
					</div>
				) : (
					<RandomCloset
						randomItemsArr={randomItemsArr}
						handleSideBarClose={() => setSidebarOpen(false)}
					/>
				)}

				<div className="w-full px-6">
					<Gallery
						selectedCategory={selectedCategory}
						dbTagStyles={dbTagStyles}
						newCloth={newCloth}
						onNewClothHandled={() => setNewCloth(null)}
						handleSideBarClose={() => setSidebarOpen(false)}
					/>
				</div>
			</main>

			{/* Overlay when sidebar open on mobile */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black opacity-30 sm:hidden z-[100]"
					onClick={() => setSidebarOpen(false)}
				></div>
			)}
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
