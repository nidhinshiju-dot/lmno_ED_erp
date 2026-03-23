"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, BookOpen, LogOut, Heart, User, GraduationCap } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

const parentMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/parent" },
    { icon: Users, label: "My Children", href: "/parent/children" },
    { icon: BookOpen, label: "Academics", href: "/parent/academics" },
    { icon: Heart, label: "Wellbeing", href: "/parent/wellbeing" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        } else if (user && user.role !== "PARENT") {
            router.push("/dashboard");
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || (user && user.role !== "PARENT")) {
        return <div className="flex items-center justify-center h-screen text-slate-500">Checking access...</div>;
    }

    const isActive = (href: string) => {
        if (href === "/parent") return pathname === "/parent";
        return pathname.startsWith(href);
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-zinc-950 overflow-hidden">
            <aside className="w-64 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col fixed inset-y-0 z-40">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">Lmno Campus</p>
                            <p className="text-[10px] text-violet-600 font-semibold tracking-wide uppercase truncate">Parent Portal</p>
                        </div>
                    </div>
                </div>

                <div className="px-4 py-4 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-900/20 rounded-xl px-3 py-3">
                        <div className="w-9 h-9 rounded-full bg-violet-200 dark:bg-violet-800 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-violet-700 dark:text-violet-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate">{user?.name || "Parent"}</p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-5 px-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-3">My Portal</p>
                    {parentMenu.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active
                                    ? "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? "text-violet-600 dark:text-violet-400" : "text-slate-400 dark:text-zinc-500"}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-zinc-800 shrink-0">
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5 text-red-500" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col ml-64 overflow-hidden relative">
                {children}
            </main>
        </div>
    );
}
