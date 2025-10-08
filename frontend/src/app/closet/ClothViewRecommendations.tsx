import Loader from "@/components/common/loader";
import { ClothRecommendationSet } from "@/types";
import Image from "next/image";

type ClothViewRecommendationsProps = {
	isLoadingRecs: boolean;
	recommendations: ClothRecommendationSet | null;
	hasTriedAISuggestions: boolean;
	onFetchRecommendations: () => Promise<void>;
};

function ClothViewRecommendations({
	isLoadingRecs,
	recommendations,
	hasTriedAISuggestions,
	onFetchRecommendations,
}: ClothViewRecommendationsProps) {
	{
		/* Recommendations + Button */
	}
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
						Curating your chic look… This takes a moment!
					</div>
					<Loader />
				</div>
			)}

			{/* Recommendations */}
			{recommendations && !isLoadingRecs && (
				<div className="flex flex-col gap-4 mt-6">
					<div className="border border-gray-200 rounded-lg p-2 flex flex-col gap-2">
						{recommendations._style_phrase && (
							<div className="text-gray-700 italic text-md mb-2">
								Recommend theme: {recommendations._style_phrase}
							</div>
						)}
						{recommendations.items
							.filter(({ item }) => item && item.id)
							.map(({ category, item }) => (
								<div key={item.id} className="flex flex-row items-center gap-2">
									<Image
										width={112}
										height={112}
										src={item.image_url}
										alt={item.name}
										className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-lg"
									/>
									<div className="flex flex-col text-sm">
										<span className="font-semibold">{item.name}</span>
										<span className="text-gray-500">{category}</span>
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
