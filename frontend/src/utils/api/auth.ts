import { backendUrl } from "@utils/api/apiClient";

export type User = {
    id: string;
    email: string;
    username: string;
};

export type SignupPayload = {
    email: string;
    username: string;
    password: string;
};

export type SignupResponse = {
    access_token: string;
    user: User;
};

export type LoginPayload = {
    email: string;
    password: string;
}

export type LoginResponse = {
    access_token: string;
    user: User;
}

type RefreshResponse = {
    access_token: string;
    user: User;
}

export const signup = async (payload: SignupPayload): Promise<SignupResponse> => {
    const res = await fetch(`${backendUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include", // important for refresh_token cookie
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Signup failed");
    }

    return data;
};

export const login = async ({ email, password }: LoginPayload): Promise<LoginResponse> => {
    const res = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // important for refresh_token cookie
    });

    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
    }

    const data: LoginResponse = await res.json();
    return data;
};

export const refreshAccessToken = async (): Promise<{ access_token: string; user: User }> => {
    const res = await fetch(`${backendUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include"
    });

    if (!res.ok) {
        // remove any stale refresh token
        document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        const data = await res.json().catch(() => ({}));
        const message = (data && typeof data === "object" && "error" in data) ? data.error : "Refresh token failed";
        console.log('message from refresh token api:', message);
        throw new Error(message);
    }

    const data: RefreshResponse = await res.json();
    return data;
};

export const logout = async (): Promise<{ message: string }> => {
    const res = await fetch(`${backendUrl}/auth/logout`, {
        method: "POST",
        credentials: "include"
    });

    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Logout failed")
    }

    const data: { message: string } = await res.json();
    return data;
}