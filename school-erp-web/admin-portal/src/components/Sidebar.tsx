"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GraduationCap, Calendar, BookOpen, Settings, IndianRupee, ClipboardCheck, BookMarked, CheckSquare, FileText, Megaphone, BarChart3, FolderOpen, Building2, Receipt, ChevronRight } from "lucide-react";

const menuGroups = [
    {
        label: "Overview",
        items: [
            { icon: LayoutDashboard, label: "Dashboard", href: "/" },
        ]
    },
    {
        label: "Academic",
        items: [
            { icon: GraduationCap,   label: "Students",           href: "/students" },
            { icon: BookOpen,        label: "Courses & LMS",      href: "/courses" },
            { icon: BookMarked,      label: "Subjects",           href: "/subjects" },
            { icon: CheckSquare,     label: "Attendance",         href: "/attendance" },
            { icon: FileText,        label: "Examinations",       href: "/exams" },
            { icon: Calendar,        label: "Timetable",          href: "/timetable" },
        ]
    },
    {
        label: "Administration",
        items: [
            { icon: Users,           label: "Staff Directory",    href: "/staff" },
            { icon: ClipboardCheck,  label: "Teacher Assignment", href: "/assign-teacher" },
            { icon: Building2,       label: "Campuses",           href: "/campuses" },
            { icon: Calendar,        label: "Academic Calendar",  href: "/calendar" },
        ]
    },
    {
        label: "Finance",
        items: [
            { icon: IndianRupee,     label: "Fee Structures",     href: "/fees" },
            { icon: Receipt,         label: "Invoices",           href: "/invoices" },
        ]
    },
    {
        label: "Communication",
        items: [
            { icon: Megaphone,       label: "Announcements",      href: "/announcements" },
            { icon: FolderOpen,      label: "Files & Docs",       href: "/files" },
        ]
    },
    {
        label: "Reporting",
        items: [
            { icon: BarChart3,       label: "Reports",            href: "/reports" },
        ]
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 h-screen bg-white border-r border-[#E2E8F0] flex flex-col fixed left-0 top-0 z-50">
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-[#E2E8F0] flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-sm">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0F172A] leading-none">School ERP</p>
                        <p className="text-[10px] text-[#475569] mt-0.5">Admin Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {menuGroups.map((group) => (
                    <div key={group.label} className="mb-5">
                        <p className="px-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1.5">
                            {group.label}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                                                active
                                                    ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                                                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#475569]"}`} />
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {active && <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Bottom: Settings + User */}
            <div className="border-t border-[#E2E8F0] flex-shrink-0">
                <div className="px-3 py-2">
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                            isActive("/settings")
                                ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                                : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                        }`}
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Link>
                </div>
                <div className="px-4 py-3 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0F172A] truncate">Admin User</p>
                            <p className="text-xs text-[#475569] truncate">admin@school.app</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
