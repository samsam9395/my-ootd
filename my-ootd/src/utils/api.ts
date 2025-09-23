import { ClothItem, ClothRecommendationSet } from "@/types";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const handleApiResponse = async (res: Response, stepName: string) => {
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${stepName} failed: ${msg}`);
    }
    return res.json();
};

export const getPageClothesByType = async (
    selectedCategory: string,
    limit: number,
    offset: number
) => {
    const res = await fetch(
        `/api/wardrobe?type=${selectedCategory}&limit=${limit}&offset=${offset}`
    );
    return handleApiResponse(res, "Fetching clothes");
}

export const addStyleTags = async (names: string[]) => {
    const res = await fetch(`${backendUrl}/add_style_tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ names }),
    });
    return handleApiResponse(res, "Saving style tags");
};

export const addCloth = async (payload: {
    name: string;
    type: string;
    category: string;
    colour: string;
    image_url: string;
}) => {
    const res = await fetch(`${backendUrl}/add_cloth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleApiResponse(res, "Saving cloth");
};

export const addClothStylesRelation = async (
    clothStylesPayload: { cloth_id: number; style_id: number }[]
) => {
    const res = await fetch(`${backendUrl}/add_cloth_styles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clothStylesPayload),
    });
    return handleApiResponse(res, "Saving cloth styles");
};

function normalizeRecommendations(recs: any): ClothRecommendationSet | null {
    if (!recs || recs.length === 0) return null;

    return {
        _style_phrase: recs._style_phrase,
        items: Object.entries(recs)
            .filter(([key]) => key !== "_style_phrase")
            .map(([category, item]) => {
                const clothItem = item as ClothItem; // assert type here
                return {
                    category,
                    item: {
                        ...clothItem,
                        styles: (clothItem.styles || []).map((s: any) => s.styles),
                    },
                };
            })
            .filter(({ item }) => item && item.id),
    };
}

export async function fetchRecommendations(itemId: number) {
    const res = await fetch(`${backendUrl}/recommend_ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
    });
    if (!res.ok) {
        console.error("Failed to fetch recommendations");
        return null;
    }
    const data = await res.json();
    return normalizeRecommendations(data);
}

export const fetchMoreData = async (selectedCategory: string, page: number) => {

    const limit = 3;
    const offset = page * limit;

    const res = await fetch(
        `/api/wardrobe?type=${selectedCategory}&limit=${limit}&offset=${offset}`
    );
    const data = await res.json();

    return data;
};