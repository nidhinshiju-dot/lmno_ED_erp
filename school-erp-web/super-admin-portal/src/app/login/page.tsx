"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { AuthService } from "@/lib/api";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("superadmin1@schoolerp.app");
    const [password, setPassword] = useState("SuperAdmin@2026");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await AuthService.login({ email, password });
            
            // Validate the role
            if (response.user.role !== "SUPER_ADMIN") {
                throw new Error("Unauthorized access. Super Admin only.");
            }

            login(response.token, response.user);
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[hsl(var(--background))]">
            {/* Left side - Branding */}
            <div className="flex-1 bg-[hsl(var(--primary))] text-white p-12 flex flex-col justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Platform Admin</span>
                </div>
                
                <div className="max-w-md">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        Command Center for SaaS Operations
                    </h1>
                    <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
                        Securely manage school tenants, analyze platform utilization, and oversee worldwide operations from a single pane of glass.
                    </p>
                </div>
                
                <div className="text-sm text-primary-foreground/60">
                    &copy; 2026 Lmno Corp. All rights reserved.
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
                <div className="w-full max-w-sm space-y-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
                        <p className="text-gray-500 mt-2 text-sm">Sign in to your super admin account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Work Email</label>
                                <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    placeholder="admin@schoolerp.app"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="relative">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-sm font-medium text-gray-700">Password</label>
                                </div>
                                <div className="absolute inset-y-0 left-0 top-6 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Access Secure System"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
