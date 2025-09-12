import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

export async function GET() {
    try {
        // fetch all rows from clothes table
        const { data, error } = await supabase.from("clothes").select("*");

        if (error) {
            console.error("Supabase error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log("Server-side fetched data:", data); // check terminal
        return NextResponse.json(data);
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}