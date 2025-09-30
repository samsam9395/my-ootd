"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { logout } from "@/utils/api/auth";
import { useRouter } from "next/navigation";

export default function Header() {
	const { setUser, setAccessToken } = useAuth();
	const { showAlert } = useAlert();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			setUser(null);
			setAccessToken(null);
			await logout();
			showAlert("Logged out successfully", "success");
			router.push("/login");
		} catch (error: any) {
			console.error(error);
			showAlert(`Error: ${error.message || "logout failed"}`, "error");
		}
	};

	return (
		<header className="bg-gray-800 text-white p-3">
			<nav className="mx-auto flex items-center justify-between">
				<div className="flex items-center gap-2">
					<h1 className="font-bold text-xl">My OOTD</h1>
				</div>
				<ul className="flex gap-4">
					<li>
						<a href="/closet">Closet</a>
					</li>
					<li>
						<button
							type="button"
							onClick={handleLogout}
							className="text-left w-full"
						>
							Logout
						</button>
					</li>
				</ul>
			</nav>
		</header>
	);
}
