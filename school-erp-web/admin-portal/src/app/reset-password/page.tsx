"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8090/api/v1";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const strength = (() => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        return score;
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
    const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"][strength];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
        if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API}/auth/reset-password-by-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.message || "Reset failed. The link may have expired.");
            }

            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center py-8 space-y-3">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-red-400" />
                </div>
                <p className="font-semibold text-gray-800">Invalid Link</p>
                <p className="text-sm text-gray-500">This reset link is invalid or has expired. Please contact your Platform Admin for a new link.</p>
                <button onClick={() => router.push("/login")} className="mt-2 text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                </button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center py-6 space-y-4">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                    <p className="text-xl font-bold text-gray-900">Password Updated!</p>
                    <p className="text-sm text-gray-500 mt-1">You can now log in with your new password.</p>
                </div>
                <p className="text-xs text-gray-400">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header */}
            <div className="text-center mb-2">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
                    <Lock className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Set New Password</h1>
                <p className="text-sm text-gray-500 mt-1">Create a strong password for your account</p>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
                    {error}
                </div>
            )}

            {/* New Password field */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                    <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                    <div className="space-y-1">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                            ))}
                        </div>
                        <p className={`text-xs font-medium ${["", "text-red-500", "text-amber-500", "text-blue-500", "text-emerald-600"][strength]}`}>
                            {strengthLabel}
                        </p>
                    </div>
                )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                    <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Re-enter new password"
                        className={`w-full px-4 py-3 pr-12 bg-gray-50 border rounded-xl text-sm outline-none focus:ring-2 transition-all ${
                            confirmPassword && newPassword !== confirmPassword
                                ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
                                : confirmPassword && newPassword === confirmPassword
                                ? "border-emerald-300 focus:ring-emerald-500/20 focus:border-emerald-400"
                                : "border-gray-200 focus:ring-blue-500/20 focus:border-blue-500"
                        }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                    <p className="text-xs text-emerald-600">✓ Passwords match</p>
                )}
            </div>

            <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : "Update Password"}
            </button>

            <p className="text-xs text-gray-400 text-center">
                This link was generated by your school's Platform Admin
            </p>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
            {/* Phone-like card */}
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Top accent bar */}
                <div className="h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
                <div className="p-7">
                    <Suspense fallback={
                        <div className="py-10 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm text-gray-400">Loading...</p>
                        </div>
                    }>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
                {/* Bottom brand */}
                <div className="px-7 pb-5 text-center">
                    <p className="text-xs text-gray-300">Powered by <span className="text-gray-400 font-medium">Lmno Campus</span></p>
                </div>
            </div>
        </div>
    );
}
