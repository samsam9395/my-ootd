import Loader from "@/components/common/loader";
import { ClothItem, ClothRecommendationSet } from "@/types";
import Image from "next/image";

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
		<div className="flex-1 flex flex-col gap-4 w-full max-w-3xl mx-auto md:overflow-y-auto mt-4 md:mt-0">
			{/* Generate button */}
			{!recommendations && !isLoadingRecs && (
				<button
					className="bg-black text-white py-2 px-4 rounded transition cursor-pointer"
					onClick={onFetchRecommendations}
				>
					Generate AI Suggestions
				</button>
			)}

			{/* Loader */}
			{isLoadingRecs && (
				<div className="flex w-full flex-col items-center mt-6">
					<div className="text-gray-700 italic text-md mb-2">
						Curating your chic look......This takes a moment!
					</div>
					<Loader />
				</div>
			)}

			{/* Recommendations */}
			{recommendations && !isLoadingRecs && (
				<div className="flex flex-col gap-4 mt-4">
					<div className="border border-gray-200 rounded-lg p-4 px-6 xl:p-2 xl:px-2 flex flex-col gap-4">
						<div className="space-y-1 text-sm mb-2">
							<h3 className=" text-lg mb-2">
								Suggested items for: <br />
								<span className="font-bold italic">"{item.name}"</span>
							</h3>
							{recommendations?.style_phrase && (
								<div className="grid grid-cols-[70px_auto] gap-1 ">
									<div className="text-gray-700 font-semibold ">Theme:</div>
									<span className="font-normal italic text-gray-600">
										{recommendations.style_phrase}
									</span>
								</div>
							)}
							{recommendations?.style_flair && (
								<div className="grid grid-cols-[70px_auto] gap-1">
									<div className="text-gray-700 font-semibold">The Edit:</div>
									<span className="font-normal italic text-gray-600">
										{recommendations.style_flair}
									</span>
								</div>
							)}
						</div>
						{recommendations.items.map((item: ClothItem) => (
							<div key={item.id} className="flex flex-row items-center gap-2 ">
								<div className="w-32 flex-shrink-0 md:w-36 aspect-square rounded-lg">
									<div className="relative w-full h-full">
										<Image
											fill
											src={item?.image_url}
											alt={item?.name}
											className="object-cover rounded-lg"
											sizes="(max-width: 768px) 128px, 144px"
										/>
									</div>
								</div>

								<div className="flex flex-col text-sm min-w-0">
									<span className="font-semibold">{item?.name}</span>
									<span className="text-gray-500 ">{item?.category}</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* No recommendations */}
			{hasTriedAISuggestions && !recommendations && !isLoadingRecs && (
				<div className="text-gray-500 text-sm p-2">No recommendations yet</div>
			)}
		</div>
	);
}

export default ClothViewRecommendations;
