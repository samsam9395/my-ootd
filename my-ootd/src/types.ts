export interface StyleTag {
    id: string;
    name: string;
}

export type ClothRecommendationSet = {
    _style_phrase: string;
    items: { category: string; item: ClothItem }[];
};

export type ClothItem = {
    id: number;
    name: string;
    type: string;
    colour: string;
    image_url: string;
    category: string;
    styles: string[];
};
