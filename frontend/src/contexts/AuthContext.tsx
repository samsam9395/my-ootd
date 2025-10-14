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
import { useRouter } from "next/navigation";
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
				return refreshPromiseRef.current;
			}

			refreshPromiseRef.current = (async () => {
				try {
					const timeoutPromise = new Promise(
						(_, reject) =>
							setTimeout(() => reject(new Error("Refresh timeout")), 12000) // If refresh takes more than 12s, abort
					);

					const data = (await Promise.race([
						refreshAccessToken(),
						timeoutPromise,
					])) as Awaited<ReturnType<typeof refreshAccessToken>>;

					// ✅ Set token IMMEDIATELY on apiClient (synchronous)
					apiClient.setToken(data.access_token);

					// Then update React state (async)
					setAccessToken(data.access_token);
					setUser(data.user);
				} catch (err) {
					apiClient.setToken(null); // ✅ Clear token immediately too
					setAccessToken(null);
					setUser(null);
					if (!["/login", "/signup"].includes(window.location.pathname)) {
						router.push("/login");
					}
				} finally {
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
		// Add safety timeout in case rehydrate never completes
		const safetyTimeout = setTimeout(() => {
			if (!hasCheckedRefresh) {
				setHasCheckedRefresh(true);
			}
		}, 12000);

		rehydrate().catch((err) => {
			// Ensure loader is removed even if rehydrate fails catastrophically
			setHasCheckedRefresh(true);
		});

		return () => clearTimeout(safetyTimeout);
	}, [rehydrate]);

	useEffect(() => {
		// Set the global 401 handler once
		apiClient.setOnUnauthorized(async (url: string) => {
			await rehydrate(url);
		});

		return () => {
			// Clean up on unmount
			apiClient.setOnUnauthorized(async (url: string) => Promise.resolve());
		};
	}, [rehydrate]);

	// Sync token with apiClient whenever it changes
	useEffect(() => {
		apiClient.setToken(accessToken);
	}, [accessToken]);

	return (
		<AuthContext.Provider
			value={{ user, setUser, accessToken, setAccessToken }}
		>
			{!hasCheckedRefresh && <FullPageLoader />} {children}
		</AuthContext.Provider>
	);
};
