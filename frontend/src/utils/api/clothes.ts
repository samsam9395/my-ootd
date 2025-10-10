
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

export const getRandomClothes = async () => {
    const data = await apiClient.get("/clothes/random");
    return data
}




export async function fetchRecommendations(itemId: number) {
    const data = await apiClient.post("/recommendations/ai", { item_id: itemId });
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

export const addUpdateCloth = async (payload: any) => {
    const data = await apiClient.post("/clothes/embedded", payload);
    return data;
}