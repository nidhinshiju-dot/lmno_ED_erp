"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, BookOpen, LogOut, GraduationCap, FileText } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";

const teacherMenu = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/teacher" },
    { icon: CalendarDays, label: "My Schedule", href: "/teacher/schedule" },
    { icon: Users, label: "My Class (Homeroom)", href: "/teacher/my-class" },
    { icon: BookOpen, label: "My Subjects", href: "/teacher/subjects" },
    { icon: FileText, label: "Exams & Grading", href: "/teacher/exams" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        } else if (user && user.role !== "TEACHER") {
            router.push("/dashboard");
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || (user && user.role !== "TEACHER")) {
        return <div className="flex items-center justify-center h-screen text-slate-500">Checking access...</div>;
    }

    const isActive = (href: string) => {
        if (href === "/teacher") return pathname === "/teacher";
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
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{user?.name || "Teacher"}</p>
                            <p className="text-[10px] text-indigo-600 font-semibold tracking-wide uppercase truncate">Teacher Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Main Menu</p>
                    {teacherMenu.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                                    active
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`} />
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
