import { UpdateClothPayload } from "@/types";
import { apiClient } from "@utils/api/apiClient";


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
    const data = await apiClient.post("/clothes/style-tags", { names });
    return data;
};

export const getRandomClothes = async () => {
    const data = await apiClient.get("/clothes/random");
    return data
}

export const addCloth = async (payload: {
    name: string;
    type: string;
    category: string;
    colour: string;
    image_url: string;
}) => {

    const data = await apiClient.post("/clothes", payload);
    return data;
};

export const addClothStylesRelation = async (
    clothStylesPayload: { cloth_id: number; style_id: number }[]
) => {
    const data = await apiClient.post("/clothes/cloth_styles", clothStylesPayload);
    return data;
};


export async function fetchRecommendations(itemId: number) {
    const data = await apiClient.post("/recommendations/ai", { item_id: itemId });
    return data;
}


export const updateCloth = async (updatePayload: { clothId: number; payload: UpdateClothPayload }) => {
    const data = await apiClient.put(`/clothes/${updatePayload.clothId}`, updatePayload.payload);
    return data;
}

export const updateClothImage = async (clothId: number, imageUrl: string) => {
    const data = await apiClient.put(`/clothes/${clothId}/image`, { image_url: imageUrl })
    console.log('update cloth image res:', data);
    return data
}

export const deleteCloth = async (clothId: number) => {
    const data = await apiClient.delete(`/clothes/${clothId}`);
    return data;
}