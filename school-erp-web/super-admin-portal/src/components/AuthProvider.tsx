"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
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
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setIsMounted(true);
        const storedToken = localStorage.getItem("sa_erp_token");
        const storedUser = localStorage.getItem("sa_erp_user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        } else if (pathname !== "/login") {
            router.push("/login");
        }
    }, [pathname, router]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem("sa_erp_token", newToken);
        localStorage.setItem("sa_erp_user", JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
        router.push("/");
    };

    const logout = () => {
        localStorage.removeItem("sa_erp_token");
        localStorage.removeItem("sa_erp_user");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    if (!isMounted) return null;

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
