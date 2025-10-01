import { ClothItem, ClothRecommendationSet, UpdateClothPayload } from "@/types";
import { apiClient, backendUrl } from "@utils/api/apiClient";





export const getPageClothesByType = async (
    selectedCategory: string,
    limit: number,
    offset: number
) => {
    const res = await apiClient.get(`/clothes?type=${selectedCategory}&limit=${limit}&offset=${offset}`);
    return res;
}

export const getStyleTags = async () => {
    return apiClient.get("/clothes/style-tags"); // automatically sends bearer token if set
}

export const addStyleTags = async (names: string[]) => {
    // const res = await fetch(`${backendUrl}/style-tags`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ names }),
    // });
    // return handleApiResponse(res, "Saving style tags");
    const data = await apiClient.post("/clothes/style-tags", { names });
    return data;
};


export const addCloth = async (payload: {
    name: string;
    type: string;
    category: string;
    colour: string;
    image_url: string;
}) => {

    console.log('payload for adding cloth', payload);
    // const res = await fetch(`${backendUrl}/clothes`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    // });
    // return handleApiResponse(res, "Saving cloth");
    const data = await apiClient.post("/clothes", payload);
    return data;
};

export const addClothStylesRelation = async (
    clothStylesPayload: { cloth_id: number; style_id: number }[]
) => {
    // const res = await fetch(`${backendUrl}/cloth_styles`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(clothStylesPayload),
    // });
    // return handleApiResponse(res, "Saving cloth styles");
    console.log("clothStylesPayload:", clothStylesPayload);
    const data = await apiClient.post("/clothes/cloth_styles", clothStylesPayload);
    return data;
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
    const res = await fetch(`${backendUrl}/recommendations/ai`, {
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


export const updateCloth = async (updatePayload: { clothId: number; payload: UpdateClothPayload }) => {
    const data = await apiClient.put(`/clothes/${updatePayload.clothId}`, updatePayload.payload);
    return data;
}

export const deleteCloth = async (clothId: number) => {
    // const res = await fetch(`${backendUrl}/delete_cloth/${clothId}`, {
    //     method: "DELETE",
    // });
    // return handleApiResponse(res, "Deleting cloth");
    const data = await apiClient.delete(`/clothes/${clothId}`);
    return data;
}