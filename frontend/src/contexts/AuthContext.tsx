"use client";
import {
	createContext,
	useContext,
	useState,
	Dispatch,
	SetStateAction,
	useEffect,
	useCallback,
	useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { refreshAccessToken } from "@/utils/api/auth";
import { apiClient } from "@/utils/api/apiClient";
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

	// Track refresh promise for queuing multiple 401s
	const refreshPromiseRef = useRef<Promise<void> | null>(null);

	const rehydrate = useCallback(
		async (triggerUrl?: string) => {
			if (refreshPromiseRef.current) {
				console.log(
					`[QUEUE] Refresh already in progress, ${triggerUrl} waiting...`
				);
				return refreshPromiseRef.current;
			}

			console.log(`[REFRESH] Triggered by: ${triggerUrl}`);

			refreshPromiseRef.current = (async () => {
				try {
					const data = await refreshAccessToken();
					console.log(
						"[REFRESH] Got new token:",
						data.access_token.slice(0, 10) + "..."
					);

					// ✅ Set token IMMEDIATELY on apiClient (synchronous)
					apiClient.setToken(data.access_token);
					console.log("[REFRESH] Token set on apiClient");

					// Then update React state (async)
					setAccessToken(data.access_token);
					setUser(data.user);
				} catch (err) {
					console.error("[REFRESH] Failed!", err);
					apiClient.setToken(null); // ✅ Clear token immediately too
					setAccessToken(null);
					setUser(null);
					if (!["/login", "/signup"].includes(window.location.pathname)) {
						router.push("/login");
					}
				} finally {
					console.log("[REFRESH] Done, clearing promise");
					refreshPromiseRef.current = null;
					setHasCheckedRefresh(true);
				}
			})();

			return refreshPromiseRef.current;
		},
		[router]
	);
	// Initial hydration on mount
	useEffect(() => {
		rehydrate();
	}, []);

	useEffect(() => {
		// Set the global 401 handler once
		apiClient.setOnUnauthorized(async (url: string) => {
			console.log("setting unauthorized to:", url);
			await rehydrate(url);
		});

		return () => {
			// Clean up on unmount
			apiClient.setOnUnauthorized(async (url: string) => Promise.resolve());
		};
	}, []);

	// Sync token with apiClient whenever it changes
	useEffect(() => {
		console.log("apiClient token synced from state:", accessToken);
		apiClient.setToken(accessToken);
	}, [accessToken]);
	console.log("hasCheckedRefresh:", hasCheckedRefresh);

	return (
		<AuthContext.Provider
			value={{ user, setUser, accessToken, setAccessToken }}
		>
			{!hasCheckedRefresh && <FullPageLoader />} {children}
		</AuthContext.Provider>
	);
};
