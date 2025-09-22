import type { Metadata } from "next";
import { Saira, Roboto } from "next/font/google";
import "./globals.css";
import logo from "@/public/my-ootd-logo.png";
import { AlertProvider } from "@/contexts/AlertContext";
import { Alert } from "@/components/common/Alert";

const saira = Saira({
	subsets: ["latin"],
});

const roboto = Roboto({
	weight: "400",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "My OOTD",
	description: "Smart outfit planner",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={`${saira.className} h-full bg-white`}>
			<body className="h-full antialiased">
				<AlertProvider>
					<header className="bg-gray-800 text-white p-3">
						<nav className=" mx-auto flex items-center justify-between">
							<div className="flex items-center gap-2">
								<h1 className="font-bold text-xl">My OOTD</h1>
							</div>

							<ul className="flex gap-4 ">
								<li>
									<a href="/dashboard">Dashboard</a>
								</li>
								<li>
									<a href="/settings">Logout</a>
								</li>
							</ul>
						</nav>
					</header>
					<Alert />
					{children}
				</AlertProvider>
			</body>
		</html>
	);
}
