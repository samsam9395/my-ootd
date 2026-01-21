"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import RandomCloset from "./RandomCloset";
import Gallery from "./Gallery";
import AddClothForm from "./AddClothForm";
import { ClothItem, StyleTag } from "@/types";
import { getRandomClothes, getStyleTags } from "@/utils/api/clothes";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Plus } from "lucide-react";
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
		setSidebarOpen(false);
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
				setRandomItemsArr(data || []);
			} catch (error) {
				console.error("Error fetching random clothes:", error);
			} finally {
				setRandomIsLoading(false);
			}
		}
		fetchRandomItems();
	}, []);

	return (
		<div className="flex min-h-screen bg-white text-black font-sans lg:pt-0">
			<AddClothForm
				isOpen={isFormOpen}
				dbTagStyles={dbTagStyles}
				onClose={() => setIsFormOpen(false)}
				onAddCloth={(newCloth) => setNewCloth(newCloth)}
			/>

			{/* ----------------------------------------------------------------
               SIDEBAR
               Fix: Changed Desktop style from 'static' to 'sticky'.
               This allows z-30 to work, so the white background covers 
               any carousel items overflowing from the main content.
            ---------------------------------------------------------------- */}
			<aside
				className={`
                    fixed top-0 left-0 h-full bg-white border-r border-gray-100 
                    transition-transform duration-300 ease-in-out z-50
                    w-64 pt-24 pl-8 pr-6 shadow-2xl
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    
                    /* Desktop Styles */
                    lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:shadow-none lg:z-30 lg:pt-28 lg:pl-10
                `}
			>
				{/* Note: We wrap the content in a div that is essentially static 
                   within the sticky container to ensure stability.
                */}
				<div className="h-full overflow-y-auto hide-scrollbar">
					<h2 className="font-serif text-3xl font-bold mb-10 italic text-black">
						Categories
					</h2>
					<ul className="space-y-6 pb-10">
						{categories.map((cat) => (
							<li key={cat}>
								<button
									className={`
                                        group flex items-center w-full text-left transition-all duration-300 cursor-pointer
                                        ${selectedCategory === cat ? "opacity-100 translate-x-2" : "opacity-40 hover:opacity-100 hover:translate-x-2"}
                                    `}
									onClick={() => handleCategoryChange(cat)}
								>
									<span
										className={`
                                        text-xs font-mono font-bold uppercase tracking-[0.2em] relative
                                        after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:bg-black after:transition-all after:duration-300
                                        ${selectedCategory === cat ? "after:w-full" : "after:w-0 group-hover:after:w-full"}
                                    `}
									>
										{cat}
									</span>
								</button>
							</li>
						))}
					</ul>
				</div>
			</aside>

			{/* ----------------------------------------------------------------
               MAIN CONTENT AREA
            ---------------------------------------------------------------- */}
			<main className="flex-1 flex flex-col min-h-screen relative z-0">
				{/* MOBILE HEADER (Sticky) */}
				<div className="lg:hidden sticky top-0 bg-[#050505] text-white p-3 z-40 flex justify-between items-center border-b border-white/10 shadow-md">
					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="text-white p-1 hover:bg-white/10 transition-colors cursor-pointer"
					>
						<Menu size={20} />
					</button>
					<span className="text-white text-xs font-mono font-bold uppercase tracking-widest">
						{selectedCategory}
					</span>
				</div>

				{/* SCROLLABLE CONTENT WRAPPER */}
				<div className="flex-1 px-6 lg:px-12 py-8 lg:pt-28">
					{/* Header Section */}
					<div className="w-full flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
						<div>
							<h1 className="text-4xl lg:text-5xl font-serif font-medium italic mb-2">
								My Closet
							</h1>
							<p className="text-xs font-mono text-gray-400 uppercase tracking-widest">
								{randomItemsArr.length} items digitized
							</p>
						</div>

						{/* Add Item Button */}
						<button
							className="group flex items-center gap-3 bg-[#050505] text-white px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer"
							onClick={() => setIsFormOpen(true)}
						>
							<Plus size={14} />
							Add New Item
						</button>
					</div>

					{/* Random Picks Section */}
					<div className="w-full mb-10 relative">
						<div className="flex items-center gap-4 mb-6">
							<div className="h-[1px] w-8 bg-gray-300"></div>
							<p className="font-serif text-lg italic text-gray-800">
								Today's lucky picks
							</p>
						</div>

						{randomIsLoading ? (
							<div className="w-full h-40 flex items-center justify-center bg-gray-50 border border-gray-100">
								<Loader />
							</div>
						) : randomItemsArr.length === 0 ? (
							<div className="w-full py-16 flex flex-col items-center justify-center border border-dashed border-gray-300 bg-gray-50">
								<p className="font-serif text-xl mb-2 text-gray-900">
									Your closet is silent.
								</p>
								<p className="font-mono text-xs text-gray-500 uppercase tracking-wide mb-6">
									Start building your collection
								</p>
								<button
									onClick={() => setIsFormOpen(true)}
									className="text-xs font-bold underline decoration-1 underline-offset-4 hover:text-gray-600 cursor-pointer"
								>
									Upload First Item
								</button>
							</div>
						) : (
							<RandomCloset
								randomItemsArr={randomItemsArr}
								handleSideBarClose={() => setSidebarOpen(false)}
							/>
						)}
					</div>

					{/* Gallery Section */}
					<div className="w-full">
						<div className="flex items-center gap-4 mb-8">
							<div className="h-[1px] w-full bg-gray-200"></div>
							<span className="text-xs font-mono font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap">
								Collection / {selectedCategory}
							</span>
							<div className="h-[1px] w-full bg-gray-200"></div>
						</div>

						<Gallery
							selectedCategory={selectedCategory}
							dbTagStyles={dbTagStyles}
							newCloth={newCloth}
							onNewClothHandled={() => setNewCloth(null)}
							handleSideBarClose={() => setSidebarOpen(false)}
						/>
					</div>
				</div>
			</main>

			{/* Mobile Overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40 transition-opacity cursor-pointer"
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
				<div className="flex items-center justify-center h-screen bg-white">
					<Loader />
				</div>
			}
		>
			<ClosetContent />
		</Suspense>
	);
}
