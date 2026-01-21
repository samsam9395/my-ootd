import Loader from "@/components/common/loader";
import { ClothItem, ClothRecommendationSet } from "@/types";
import Image from "next/image";
import { Sparkles } from "lucide-react";

type ClothViewRecommendationsProps = {
	isLoadingRecs: boolean;
	item: ClothItem;
	recommendations: ClothRecommendationSet | null;
	hasTriedAISuggestions: boolean;
	onFetchRecommendations: () => Promise<void>;
};

function ClothViewRecommendations({
	isLoadingRecs,
	item,
	recommendations,
	hasTriedAISuggestions,
	onFetchRecommendations,
}: ClothViewRecommendationsProps) {
	return (
		<div className="flex-1 flex flex-col gap-8 w-full h-full pb-8">
			{/* Header: Clean & Minimal */}
			{!recommendations && !isLoadingRecs && (
				<div className="border-l-2 border-black pl-4 py-2">
					<h4 className="font-serif text-2xl italic text-gray-900">
						Stylist Suggestions
					</h4>
					<p className="text-xs font-mono text-gray-400 uppercase tracking-widest mt-2">
						AI Powered Curation
					</p>
				</div>
			)}

			{/* Generate button (Only show if no recs) */}
			{!recommendations && !isLoadingRecs && (
				<div className="flex-1 flex flex-col justify-center items-center py-16 border border-dashed border-gray-300 bg-gray-50/30">
					<p className="font-serif text-gray-500 italic text-lg mb-8">
						Unlock styling potential for this item
					</p>
					<button
						className="group flex items-center gap-3 bg-black text-white py-4 px-8 text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
						onClick={onFetchRecommendations}
					>
						<Sparkles size={16} />
						Generate Look
					</button>
				</div>
			)}

			{/* Loader */}
			{isLoadingRecs && (
				<div className="flex w-full flex-col items-center justify-center py-20">
					<Loader />
					<div className="text-gray-400 font-mono text-xs uppercase tracking-widest mt-6 animate-pulse">
						Analyzing Fashion Trends...
					</div>
				</div>
			)}

			{/* Recommendations Result - EDITORIAL STYLE */}
			{recommendations && !isLoadingRecs && (
				<div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
					{/* 1. The Vibe Section (No Box, Just Typography) */}
					<div className="px-2">
						{recommendations?.style_phrase && (
							<div className="mb-6">
								<span className="block text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">
									Current Mood
								</span>
								<h3 className="font-serif text-4xl italic text-black leading-tight border-l-4 border-black pl-6 py-2">
									"{recommendations.style_phrase}"
								</h3>
							</div>
						)}

						{recommendations?.style_flair && (
							<div className="pl-7">
								{" "}
								{/* Indent to align with text above */}
								<p className="text-sm text-gray-600 leading-relaxed font-light font-sans max-w-prose">
									{recommendations.style_flair}
								</p>
							</div>
						)}
					</div>

					{/* Divider */}
					<div className="h-[1px] w-full bg-gray-100"></div>

					{/* 2. Pair With Section (Clean List, No Pointer) */}
					<div className="space-y-6">
						<div className="flex items-center justify-between px-2">
							<span className="text-xs font-mono font-bold text-black uppercase tracking-widest">
								Curated Pairing
							</span>
							<span className="text-[10px] font-mono text-gray-400">
								{recommendations.items.length} ITEMS
							</span>
						</div>

						<div className="grid gap-6">
							{recommendations.items.map((recItem: ClothItem) => (
								<div
									key={recItem.id}
									// 🚫 這裡移除了 cursor-pointer 和 hover 背景
									className="flex flex-row items-start gap-5 p-2"
								>
									{/* Image: Slightly larger styling */}
									<div className="w-20 h-24 relative flex-shrink-0 bg-gray-50 border border-gray-100">
										<Image
											fill
											src={recItem?.image_url}
											alt={recItem?.name}
											className="object-contain p-2 mix-blend-multiply"
											sizes="80px"
										/>
									</div>

									{/* Text Info */}
									<div className="flex flex-col pt-1 min-w-0">
										<span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">
											{recItem?.category}
										</span>
										<span className="font-serif text-lg italic text-gray-900 leading-tight">
											{recItem?.name}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* No recommendations */}
			{hasTriedAISuggestions && !recommendations && !isLoadingRecs && (
				<div className="text-gray-400 font-mono text-xs uppercase text-center py-10 border-t border-b border-gray-50">
					No matching items found in closet.
				</div>
			)}
		</div>
	);
}

export default ClothViewRecommendations;
