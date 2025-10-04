// utils/apiClient.ts
export const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || "";

class ApiClient {
    private token: string | null = null;
    private onUnauthorized: (() => void) | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    setOnUnauthorized(callback: () => void | null) {
        this.onUnauthorized = callback;
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

    private async handleResponse(res: Response, stepName: string) {
        if (!res.ok) {
            if (res.status === 401 && this.onUnauthorized) {
                this.onUnauthorized();
                return Promise.reject(new Error("Unauthorized"));
            }
            const msg = await res.text();
            throw new Error(`${stepName} failed: ${msg}`);
        }
        return res.json();
    }

    async get(path: string) {
        console.log(' === header in frontend for path === ', path, this.getHeaders());
        const res = await fetch(`${backendUrl}${path}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token}`,
            },
            credentials: "include",
        });

        // return res.json();
        return this.handleResponse(res, `GET ${path}`);
    }

    async post(path: string, body: any) {
        const res = await fetch(`${backendUrl}${path}`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify(body),
            credentials: "include",
        });

        return this.handleResponse(res, `POST ${path}`);
    }

    async put(path: string, body: any) {
        const res = await fetch(`${backendUrl}${path}`, {
            method: "PUT",
            headers: this.getHeaders(),
            body: JSON.stringify(body),
            credentials: "include",
        });

        return this.handleResponse(res, `PUT ${path}`);
    }
    async delete(path: string) {
        const res = await fetch(`${backendUrl}${path}`, {
            method: "DELETE",
            headers: this.getHeaders(),
            credentials: "include",
        });

        return this.handleResponse(res, `DELETE ${path}`);
    }

}

export const apiClient = new ApiClient();