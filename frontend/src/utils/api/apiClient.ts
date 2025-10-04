// utils/apiClient.ts
export const backendUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` || "";
type OnUnauthorizedFn = () => Promise<void>;
class ApiClient {
    private token: string | null = null;
    private onUnauthorized: ((url: string) => Promise<void>) | null = null;

    setToken(token: string | null) {
        this.token = token;
    }

    setOnUnauthorized(callback: ((url: string) => Promise<void>) | null) {
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
    // Retry once on 401
    private async fetchWithRetry(
        url: string,
        options: RequestInit = {},
        retried = false
    ): Promise<Response> {
        const headers = { ...(options.headers || {}), ...this.getHeaders() };
        const res = await fetch(url, { ...options, headers, credentials: "include" });

        if (res.status === 401 && this.onUnauthorized && !retried) {
            console.warn(`[401] ${url} → triggering refresh`);
            await this.onUnauthorized(url); // pass URL
            return this.fetchWithRetry(url, options, true); // retry once
        }
        return res;
    }

    private async handleResponse(res: Response, stepName: string) {
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(`${stepName} failed: ${msg}`);
        }
        return res.json();
    }


    async get(path: string) {
        const res = await this.fetchWithRetry(`${backendUrl}${path}`, {
            method: "GET",
        });
        return this.handleResponse(res, `GET ${path}`);
    }

    async post(path: string, body: any) {
        const res = await this.fetchWithRetry(`${backendUrl}${path}`, {
            method: "POST",
            body: JSON.stringify(body),
        });
        return this.handleResponse(res, `POST ${path}`);
    }

    async put(path: string, body: any) {
        const res = await this.fetchWithRetry(`${backendUrl}${path}`, {
            method: "PUT",
            body: JSON.stringify(body),
        });
        return this.handleResponse(res, `PUT ${path}`);
    }

    async delete(path: string) {
        const res = await this.fetchWithRetry(`${backendUrl}${path}`, {
            method: "DELETE",
        });
        return this.handleResponse(res, `DELETE ${path}`);
    }



}

export const apiClient = new ApiClient();