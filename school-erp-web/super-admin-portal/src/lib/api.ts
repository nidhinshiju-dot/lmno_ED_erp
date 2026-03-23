const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

async function fetchApi(endpoint: string, options: RequestInit = {}) {
    const defaultHeaders: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
        const token = localStorage.getItem("sa_erp_token");
        if (token) {
            defaultHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
}

export const SchoolService = {
    getAll: () => fetchApi("/schools"),
    create: (data: Record<string, unknown>) => fetchApi("/schools", { method: "POST", body: JSON.stringify(data) }),
    toggle: (id: string) => fetchApi(`/schools/${id}/toggle`, { method: "PATCH" }),
};

export const AuthProvisionService = {
    provision: (data: Record<string, unknown>) => fetchApi("/auth/provision", { method: "POST", body: JSON.stringify(data) }),
};

export const AuthService = {
    login: async (credentials: Record<string, string>) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) throw new Error("Invalid credentials");
        return response.json();
    }
};
