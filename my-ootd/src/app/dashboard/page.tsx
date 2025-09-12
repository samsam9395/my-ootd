"use client";
import { useState } from "react";
import Wardrobe from "./Wardrobe";
import Gallery from "./Gallery";

export default function DashboardPage() {
	const [selectedCategory, setSelectedCategory] = useState("all");
	return (
		<div className="flex h-screen">
			{/* Left sidebar */}
			<aside className="w-48 shrink-0 p-6 ">
				<h2 className="font-bold text-xl mb-4">Categories</h2>
				<ul className="space-y-2">
					<li>
						<button
							className="hover:underline"
							onClick={() => setSelectedCategory("all")}
						>
							All
						</button>
					</li>
					<li>
						<button
							className="hover:underline"
							onClick={() => setSelectedCategory("top")}
						>
							Tops
						</button>
					</li>
					<li>
						<button
							className="hover:underline"
							onClick={() => setSelectedCategory("bottom")}
						>
							Bottoms
						</button>
					</li>
					<li>
						<button
							className="hover:underline"
							onClick={() => setSelectedCategory("shoes")}
						>
							Shoes
						</button>
					</li>
					<li>
						<button
							className="hover:underline"
							onClick={() => setSelectedCategory("accessory")}
						>
							Accessories
						</button>
					</li>
				</ul>
			</aside>

			{/* Right wardrobe */}
			<main className="flex-1 flex flex-col pt-24 overflow-y-auto bg-white">
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
