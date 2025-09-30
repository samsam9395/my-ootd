// utils/apiClient.ts

export const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || "";

class ApiClient {
    private token: string | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    async get(path: string) {
        const res = await fetch(`${backendUrl}${path}`, {
            method: "GET",
            headers: this.getHeaders(),
            credentials: "include",
        });
        return res.json();
    }

    async post(path: string, body: any) {
        const res = await fetch(`${backendUrl}${path}`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(body),
            credentials: "include",
        });
        return res.json();
    }

    private getHeaders(): Record<string, string> {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }
        return headers;
    }
}

export const apiClient = new ApiClient();