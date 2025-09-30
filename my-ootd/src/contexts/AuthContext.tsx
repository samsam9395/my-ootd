"use client";
import {
	createContext,
	useContext,
	useState,
	Dispatch,
	SetStateAction,
	useEffect,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { refreshAccessToken } from "@/utils/api/auth";

type AuthContextType = {
	user: { id: string; email: string; username: string } | null;
	setUser: Dispatch<
		SetStateAction<{ id: string; email: string; username: string } | null>
	>;
	accessToken: string | null;
	setAccessToken: Dispatch<SetStateAction<string | null>>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
	const [user, setUser] = useState<AuthContextType["user"]>(null);
	const [accessToken, setAccessToken] =
		useState<AuthContextType["accessToken"]>(null);
	const [hasCheckedRefresh, setHasCheckedRefresh] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	console.log("pathname:", pathname);
	useEffect(() => {
		if (hasCheckedRefresh) return;
		async function rehydrate() {
			const hasCookie = document.cookie.includes("refresh_token");
			if (!hasCookie) {
				setHasCheckedRefresh(true);
				return; // don't call refresh API
			}

			try {
				const data = await refreshAccessToken();
				setAccessToken(data.access_token);
				setUser(data.user);
			} catch (err) {
				console.error("Refresh failed", err);
				setAccessToken(null);
				setUser(null);
				if (!["/login", "/signup"].includes(pathname)) {
					router.push("/login");
				}
			} finally {
				setHasCheckedRefresh(true);
			}
		}

		rehydrate();
	}, [pathname, hasCheckedRefresh, router]);
	if (!hasCheckedRefresh) return null; // or show a loading spinner
	return (
		<AuthContext.Provider
			value={{ user, setUser, accessToken, setAccessToken }}
		>
			{children}
		</AuthContext.Provider>
	);
};
