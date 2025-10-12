export interface StyleTag {
    id: string;
    name: string;
}

export type ClothRecommendationSet = {
    style_phrase?: string;
    style_flair?: string;
    items: ClothItem[];
};

export type ClothStyle = {
    id: number;
    name: string;
};

export type ClothItem = {
    id: number;
    name: string;
    type: string;
    colour: string;
    image_url: string;
    category: string;
    styles: ClothStyle[];
};

export type AddUpdateClothPayload = {
    id?: number;
    name: string;
    type: string;
    colour: string;
    styles?: ({ id: string; name: string } | { name: string })[];
    image_url?: string; // optional
}