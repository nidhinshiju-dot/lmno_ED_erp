"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Users, BookOpen, AlertCircle, ChevronRight, User, GraduationCap, Heart } from "lucide-react";
import Link from "next/link";
import { fetchWithAuth } from "@/lib/api";

export default function ParentDashboard() {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch children linked to the parent (via phone number in the system)
                const data = await fetchWithAuth(`/parents/me/students`).catch(() => []);
                setChildren(Array.isArray(data) ? data : []);
            } catch (e) { /* graceful */ }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const firstName = user?.name?.split(" ")[0] || "Parent";

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-zinc-950 overflow-y-auto">
            <div className="p-6 md:p-8 max-w-6xl mx-auto w-full space-y-8">

                {/* Hero Greeting */}
                <div className="bg-gradient-to-br from-violet-500 to-purple-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -right-4 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                    <div className="relative">
                        <p className="text-violet-200 text-sm font-semibold uppercase tracking-wider mb-2">
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <h1 className="text-3xl font-extrabold">Welcome, {firstName}! 👨‍👩‍👧</h1>
                        <p className="text-violet-100 mt-2 text-sm max-w-lg">
                            Monitor your child's attendance, academic progress, and school activities.
                        </p>
                    </div>
                </div>

                {/* Quick Nav */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/parent/children" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-violet-300 hover:shadow-md transition-all duration-200 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                            <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Children</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">View Profiles</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                    </Link>
                    <Link href="/parent/academics" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-sky-300 hover:shadow-md transition-all duration-200 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academics</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">Results & Reports</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                    </Link>
                    <Link href="/parent/wellbeing" className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm hover:border-rose-300 hover:shadow-md transition-all duration-200 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                            <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Wellbeing</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">Health & Activity</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 transition-colors" />
                    </Link>
                </div>

                {/* Children Quick View */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6">
                    <h2 className="text-base font-bold text-slate-800 dark:text-zinc-100 mb-5 flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-500" /> My Children
                    </h2>
                    {loading ? (
                        <div className="py-8 text-center text-sm text-slate-400">Loading...</div>
                    ) : children.length === 0 ? (
                        <div className="py-10 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                            <User className="w-10 h-10 text-slate-200 dark:text-zinc-700 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-500">No children linked to your account yet.</p>
                            <p className="text-xs text-slate-400 mt-1">Contact your school admin to link your children.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {children.map((child: any) => (
                                <Link
                                    key={child.id}
                                    href={`/parent/children/${child.id}`}
                                    className="group flex items-center gap-4 p-4 border border-slate-200 dark:border-zinc-800 rounded-xl hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 cursor-pointer transition-all"
                                >
                                    <div className="w-12 h-12 bg-violet-100 dark:bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                                        {child.photoUrl ? <img src={child.photoUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-violet-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate group-hover:text-violet-700">{child.name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{child.admissionNumber}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${child.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                        {child.status || "ACTIVE"}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notice */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">How to reach us</p>
                        <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 leading-relaxed">
                            For any data discrepancies, classroom issues or admin queries, please contact your school's admin directly. This portal is a read-only view of your child's school records.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
