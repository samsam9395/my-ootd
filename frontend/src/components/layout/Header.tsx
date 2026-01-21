"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { logout } from "@/utils/api/auth";
import { useRouter, usePathname } from "next/navigation"; // 1. 引入 usePathname
import Link from "next/link";
import { LogOut, Shirt } from "lucide-react"; // 建議加一點 icon 增加質感

export default function Header() {
	const { user, setUser, setAccessToken } = useAuth(); // 確保妳有取 user，這樣可以判斷是否已登入
	const { showAlert } = useAlert();
	const router = useRouter();
	const pathname = usePathname(); // 2. 取得當前路徑

	// ==========================================
	// 🚫 HIDE HEADER ON AUTH PAGES
	// ==========================================
	const hideOnRoutes = ["/login", "/signup"];
	if (hideOnRoutes.includes(pathname)) {
		return null;
	}

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
		// Style Upgrade: 改成純黑背景 + 白色透明度線條
		<header className="bg-[#050505] border-b border-white/10 text-white h-16 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
			<nav className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
				{/* Logo Area */}
				<Link href="/closet" className="flex items-center gap-2 group">
					<span className="font-serif font-bold text-xl tracking-widest group-hover:text-white/80 transition-colors">
						MY OOTD
					</span>
				</Link>

				{/* Navigation Links */}
				<ul className="flex items-center gap-8">
					{/* <li>
						<Link
							href="/closet"
							className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${pathname === "/closet" ? "text-white" : "text-white/50 hover:text-white"}`}
						>
							<Shirt size={16} />
							Closet
						</Link>
					</li> */}

					{/* Logout Button */}
					<li>
						<button
							type="button"
							onClick={handleLogout}
							className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
						>
							<LogOut size={16} />
							Logout
						</button>
					</li>
				</ul>
			</nav>
		</header>
	);
}
