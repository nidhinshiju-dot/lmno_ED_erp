"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, GraduationCap, Calendar, BookOpen, Settings, IndianRupee, ClipboardCheck, BookMarked, CheckSquare, FileText, Megaphone, BarChart3, FolderOpen, Building2, Receipt, ChevronRight, Layers, Bell, Clock, UserCheck, DoorOpen, KeyRound, MessageSquare } from "lucide-react";

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
            { icon: GraduationCap, label: "Students", href: "/students" },
            { icon: Layers, label: "Classes", href: "/classes" },
            { icon: BookOpen, label: "Academics & Reports", href: "/academics" },
            { icon: BookMarked, label: "Subjects", href: "/subjects" },
            { icon: CheckSquare, label: "Attendance", href: "/attendance" },
            { icon: FileText, label: "Examinations", href: "/examinations" },
            {
                icon: Calendar, label: "Timetable", href: "/timetable", subItems: [
                    { icon: Clock, label: "Schedule Config", href: "/timetable/schedule-config" },
                    { icon: UserCheck, label: "Class Assignments", href: "/timetable/class-assignments" },
                    { icon: DoorOpen, label: "Rooms", href: "/timetable/rooms" },
                ]
            },
        ]
    },
    {
        label: "Administration",
        items: [
            { icon: KeyRound, label: "Credentials Hub", href: "/credentials" },
            { icon: Users, label: "Staff Directory", href: "/staff" },
            { icon: ClipboardCheck, label: "Teacher Assignment", href: "/assign-teacher" },
            { icon: Building2, label: "Campuses", href: "/campuses" },
            { icon: Calendar, label: "Academic Calendar", href: "/calendar" },
        ]
    },
    {
        label: "Finance",
        items: [
            { icon: IndianRupee, label: "Fee Structures", href: "/fees" },
            { icon: Receipt, label: "Invoices", href: "/invoices" },
        ]
    },
    {
        label: "Communication",
        items: [
            { icon: Megaphone, label: "Announcements", href: "/announcements" },
            { icon: Bell, label: "Push Notifications", href: "/notifications" },
            { icon: FolderOpen, label: "Files & Docs", href: "/files" },
        ]
    },
    {
        label: "Reporting",
        items: [
            { icon: BarChart3, label: "Reports", href: "/reports" },
        ]
    },
];

export default function Sidebar({ isOpen = true }: { isOpen?: boolean }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} h-screen bg-white border-r border-[#E2E8F0] flex flex-col fixed left-0 top-0 z-50 transition-all duration-300`}>
            {/* Logo */}
            <div className="h-16 flex items-center justify-center px-5 border-b border-[#E2E8F0] flex-shrink-0">
                <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 mx-auto">
                        <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0 transition-opacity duration-300">
                            <p className="text-sm font-bold text-[#0F172A] leading-none truncate">Lmno Campus</p>
                            <p className="text-[10px] text-[#475569] mt-0.5 truncate">Admin Portal</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                {menuGroups.map((group) => (
                    <div key={group.label} className="mb-5">
                        <p className={`px-3 text-[10px] font-semibold text-[#94A3B8] uppercase tracking-widest mb-1.5 ${!isOpen ? 'text-center' : ''}`}>
                            {isOpen ? group.label : "•••"}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.href);
                                const hasSubItems = (item as any).subItems;
                                const subActive = hasSubItems && (item as any).subItems.some((s: any) => pathname.startsWith(s.href));
                                return (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${active
                                                    ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                                                    : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                                                } ${!isOpen ? 'justify-center px-0' : ''}`}
                                            title={!isOpen ? item.label : undefined}
                                        >
                                            <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-[#475569]"}`} />
                                            {isOpen && (
                                                <>
                                                    <span className="flex-1 truncate">{item.label}</span>
                                                    {active && <ChevronRight className="w-3.5 h-3.5 text-[#2563EB]" />}
                                                </>
                                            )}
                                        </Link>
                                        {/* Sub-items (shown when parent is active) */}
                                        {isOpen && hasSubItems && (active || subActive) && (
                                            <ul className="ml-8 mt-0.5 space-y-0.5 border-l-2 border-[#EFF6FF] pl-2">
                                                {(item as any).subItems.map((sub: any) => {
                                                    const SubIcon = sub.icon;
                                                    const subIsActive = pathname.startsWith(sub.href);
                                                    return (
                                                        <li key={sub.label}>
                                                            <Link
                                                                href={sub.href}
                                                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${subIsActive
                                                                        ? "bg-[#DBEAFE] text-[#1D4ED8] font-medium"
                                                                        : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                                                                    }`}
                                                            >
                                                                <SubIcon className={`w-3.5 h-3.5 flex-shrink-0 ${subIsActive ? "text-[#1D4ED8]" : "text-[#94A3B8]"}`} />
                                                                <span className="truncate">{sub.label}</span>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Bottom: Settings & Copyright */}
            <div className="border-t border-[#E2E8F0] flex-shrink-0 p-3 space-y-2">
                <div>
                    <Link
                        href="/settings"
                        className={`flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${isActive("/settings")
                                ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                                : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                            } ${!isOpen ? 'justify-center px-0' : 'px-3'}`}
                        title={!isOpen ? "Settings" : undefined}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {isOpen && <span className="flex-1 truncate">Settings</span>}
                    </Link>
                    {isOpen && isActive("/settings") && (
                        <ul className="ml-8 mt-1 space-y-0.5 border-l-2 border-[#EFF6FF] pl-2">
                            <li>
                                <Link
                                    href="/settings/integrations"
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${pathname.startsWith("/settings/integrations")
                                            ? "bg-[#DBEAFE] text-[#1D4ED8] font-medium"
                                            : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                                        }`}
                                >
                                    <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${pathname.startsWith("/settings/integrations") ? "text-[#1D4ED8]" : "text-[#94A3B8]"}`} />
                                    <span className="truncate">Integrations</span>
                                </Link>
                            </li>
                        </ul>
                    )}
                </div>
                {isOpen && (
                    <div className="text-center pt-2">
                        <p className="text-[10px] text-[#94A3B8] font-medium">© 2026 Lmno Corp.</p>
                        <p className="text-[9px] text-[#CBD5E1]">All rights reserved.</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
