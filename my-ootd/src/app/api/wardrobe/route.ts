import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

export async function GET(req: Request) {

    const { searchParams } = new URL(req.url);
    const selectedCategory = searchParams.get("type") || "all";


    let query = supabase
        .from("clothes")
        .select(`
    id,
    name,
    type,
    colour,
    category,
    image_url,
    clothes_styles (
      styles (
        id,
        name
      )
    )
  `);

    let testQuery = supabase.from("clothes").select("*");


    // Only filter if category is not "all"
    if (selectedCategory.toLowerCase() !== "all") {
        query = query.eq("category", selectedCategory.toLowerCase());
    }

    // Now await the query
    const { data, error } = await query;
    const { data: testData, error: testError } = await testQuery;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const payload = (data ?? []).map((row: any) => ({
        id: row.id,
        name: row.name,
        type: row.type,
        colour: row.colour,
        category: row.category,
        styles: (row.clothes_styles ?? [])
            .map((cs: any) => cs.styles?.name)
            .filter(Boolean),
        image_url: row.image_url,
    }));


    return NextResponse.json(payload)

}