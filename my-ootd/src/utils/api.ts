const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export const handleApiResponse = async (res: Response, stepName: string) => {
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`${stepName} failed: ${msg}`);
    }
    return res.json();
};

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