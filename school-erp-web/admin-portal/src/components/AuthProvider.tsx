"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check local storage for existing session
        const storedToken = localStorage.getItem("erp_token");
        const storedUser = localStorage.getItem("erp_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        } else if (pathname !== "/login") {
            router.push("/login");
        }
    }, [pathname, router]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("erp_token", newToken);
        localStorage.setItem("erp_user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        router.push("/"); // Redirect to dashboard
    };

    const logout = () => {
        localStorage.removeItem("erp_token");
        localStorage.removeItem("erp_user");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {token || pathname === "/login" ? children : null}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
