"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { fetchWithAuth } from "@/lib/api";
import { User, ChevronRight, BookOpen, ClipboardCheck } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ParentChildrenPage() {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchWithAuth(`/parents/me/students`).catch(() => []);
                setChildren(Array.isArray(data) ? data : []);
            } catch { /* graceful */ }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div className="flex-1 h-full overflow-y-auto bg-slate-50 dark:bg-zinc-950 p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100">My Children</h1>
                    <p className="text-sm text-slate-500 mt-1">All students linked to your account.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
                    </div>
                ) : children.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center">
                        <User className="w-12 h-12 text-slate-200 dark:text-zinc-700 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-zinc-300 font-semibold">No children linked yet</p>
                        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">Ask your school administrator to link your children to your registered phone number.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {children.map((child: any) => (
                            <div key={child.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                                {/* Child header */}
                                <div className="h-14 bg-gradient-to-r from-violet-500 to-purple-600 relative">
                                    <span className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${child.status === "ACTIVE" ? "bg-white/90 text-emerald-700" : "bg-white/90 text-slate-600"}`}>
                                        {child.status || "ACTIVE"}
                                    </span>
                                </div>
                                <div className="px-5 pb-5 relative">
                                    <div className="absolute -top-7 left-5 ring-4 ring-white dark:ring-zinc-900 w-14 h-14 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center shadow-md overflow-hidden">
                                        {child.photoUrl ? <img src={child.photoUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-slate-400" />}
                                    </div>
                                    <div className="pt-9">
                                        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100">{child.name}</h3>
                                        <p className="text-xs font-mono text-slate-400 mt-0.5">{child.admissionNumber}</p>
                                    </div>
                                    {/* Quick links */}
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <Link href={`/parent/academics?student=${child.id}`} className="flex items-center gap-2 px-4 py-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-xl text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition text-sm font-semibold">
                                            <BookOpen className="w-4 h-4" /> Academics
                                        </Link>
                                        <Link href={`/parent/academics?student=${child.id}&tab=attendance`} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition text-sm font-semibold">
                                            <ClipboardCheck className="w-4 h-4" /> Attendance
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
