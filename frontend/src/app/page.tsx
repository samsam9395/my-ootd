"use client";

import { redirect } from "next/navigation";

export default function HomePage() {
	console.log("should redirect to login");
	redirect("/login");
}
