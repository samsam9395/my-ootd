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
import { apiClient } from "@/utils/api/apiClient";
import { useAlert } from "./AlertContext";
import FullPageLoader from "@/components/common/fullPageLoader";

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
	const { showAlert } = useAlert();

	useEffect(() => {
		// Set the global 401 handler once
		apiClient.setOnUnauthorized(() => {
			showAlert("Session expired. Please log in again.");
			router.push("/login");
		});

		return () => {
			// Clean up on unmount
			apiClient.setOnUnauthorized(() => {});
		};
	}, [router]);

	// Sync token with apiClient whenever it changes
	useEffect(() => {
		console.log("apiClient token set:", accessToken);
		apiClient.setToken(accessToken);
	}, [accessToken]);
	console.log("hasCheckedRefresh:", hasCheckedRefresh);

	useEffect(() => {
		let cancelled = false;

		async function rehydrate() {
			try {
				const data = await refreshAccessToken(); // backend will return 401 if no cookie
				if (!cancelled) {
					setAccessToken(data.access_token);
					setUser(data.user);
				}
			} catch (err: any) {
				console.log("No refresh token / refresh failed", err);
				if (!cancelled) {
					setAccessToken(null);
					setUser(null);
					if (!["/login", "/signup"].includes(pathname)) {
						router.push("/login");
					}
				}
			} finally {
				if (!cancelled) setHasCheckedRefresh(true);
			}
		}

		rehydrate();
		return () => {
			cancelled = true;
		};
	}, [pathname, router]);

	// if (!hasCheckedRefresh) return null; // or show a loading spinner
	return (
		<AuthContext.Provider
			value={{ user, setUser, accessToken, setAccessToken }}
		>
			{!hasCheckedRefresh && <FullPageLoader />} {children}
		</AuthContext.Provider>
	);
};
