import type { Metadata } from "next";
import { Saira, Roboto } from "next/font/google";
import "./globals.css";
import { AlertProvider, useAlert } from "@/contexts/AlertContext";
import { Alert } from "@/components/common/Alert";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import { LoaderProvider } from "@/contexts/FullLoaderContext";
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
					<LoaderProvider>
						<AuthProvider>
							<Alert />
							<Header />
							{children}
						</AuthProvider>
					</LoaderProvider>
				</AlertProvider>
			</body>
		</html>
	);
}
