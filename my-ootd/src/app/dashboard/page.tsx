"use client";
import Wardrobe from "./Wardrobe";

export default function DashboardPage() {
	return (
		<div className="flex h-screen">
			{/* Left sidebar */}
			<aside className="w-48 shrink-0 p-6 ">
				<h2 className="font-bold text-xl mb-4">Categories</h2>
				<ul className="space-y-2">
					<li>
						<button className="hover:underline">Tops</button>
					</li>
					<li>
						<button className="hover:underline">Pants</button>
					</li>
					<li>
						<button className="hover:underline">Shoes</button>
					</li>
					<li>
						<button className="hover:underline">Accessories</button>
					</li>
				</ul>
			</aside>

			{/* Right wardrobe */}
			<main className="flex-1 flex items-start justify-center bg-white pt-24 overflow-hidden">
				<div className="max-w-[24rem] w-full">
					<Wardrobe />
				</div>
			</main>
		</div>
	);
}
