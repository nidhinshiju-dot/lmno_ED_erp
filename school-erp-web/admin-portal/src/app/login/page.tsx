"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BookOpen, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { AuthService } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await AuthService.login({ email, password });
            
            let userRole = "ADMIN";
            let userId = "user-1";
            try {
                const base64Url = response.token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const payload = JSON.parse(jsonPayload);
                if (payload.role) userRole = payload.role;
                if (payload.sub) userId = payload.sub; 
            } catch (e) {
                console.error("Failed to parse JWT payload", e);
            }

            login(response.token, {
                id: userId,
                email: email,
                name: "Lmno User",
                tenantId: "TENANT_001",
                role: userRole
            });
        } catch (err: any) {
            setError(err.message || "Invalid email or password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#EFF6FF] via-[#F8FAFC] to-[#F0F9FF]" />
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-8">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-[#2563EB] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <BookOpen className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#0F172A]">Welcome back</h1>
                        <p className="text-sm text-[#475569] mt-1.5 text-center">Sign in to your Lmno Campus Admin Dashboard</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-5 flex items-start gap-3 p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
                            <span className="text-[#DC2626] flex-shrink-0 mt-0.5">⚠</span>
                            <p className="text-sm text-[#DC2626]">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                                <input
                                    type="email" required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@school.edu"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-[#0F172A]">Password</label>
                                <a href="#" className="text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                                <input
                                    type="password" required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isLoading}
                            className="w-full mt-2 flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white font-medium py-2.5 rounded-lg transition-all duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>Sign in <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center">
                        <p className="text-xs text-[#94A3B8]">
                            Lmno Campus &bull; Admin Dashboard
                        </p>
                    </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-5 text-xs text-[#94A3B8]">
                    <span>🔒 Secure Login</span>
                    <span>•</span>
                    <span>256-bit SSL</span>
                    <span>•</span>
                    <span>GDPR Compliant</span>
                </div>
            </div>
        </div>
    );
}
