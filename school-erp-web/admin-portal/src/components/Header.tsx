"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, Check, X, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "./AuthProvider";

interface NotifItem { id: string; title: string; message: string; type: string; read: boolean; createdAt: string; }

export default function Header({ title = "Dashboard" }: { title?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { user, logout } = useAuth();
    
    const [notifications, setNotifications] = useState<NotifItem[]>([
        { id: "1", title: "New Student Registered", message: "Aarav Sharma has been enrolled in Class 10A.", type: "STUDENT", read: false, createdAt: new Date().toISOString() },
        { id: "2", title: "Exam Results Published", message: "Mid-term results for Class 9 are now available.", type: "EXAM", read: false, createdAt: new Date().toISOString() },
        { id: "3", title: "Fee Payment Received", message: "₹12,000 received from Priya Patel.", type: "FEE", read: true, createdAt: new Date().toISOString() },
    ]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAsRead = (id: string) => setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    const markAllRead = () => setNotifications(notifications.map(n => ({ ...n, read: true })));

    const typeConfig: Record<string, { label: string; cls: string }> = {
        STUDENT:      { label: "Student",      cls: "bg-[#EFF6FF] text-[#2563EB]" },
        EXAM:         { label: "Exam",         cls: "bg-[#F5F3FF] text-[#7C3AED]" },
        FEE:          { label: "Fee",          cls: "bg-[#F0FDF4] text-[#16A34A]" },
        ANNOUNCEMENT: { label: "Announcement", cls: "bg-[#FFF7ED] text-[#EA580C]" },
        ATTENDANCE:   { label: "Attendance",   cls: "bg-[#FEF2F2] text-[#DC2626]" },
    };

    return (
        <header className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-40 flex items-center justify-between px-6">
            {/* Left: Page title + Search */}
            <div className="flex items-center gap-6">
                <h1 className="text-lg font-semibold text-[#0F172A]">{title}</h1>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                        type="text"
                        placeholder="Search students, staff, classes..."
                        className="w-72 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg pl-9 pr-4 py-2 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all"
                    />
                </div>
            </div>

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-2" ref={dropdownRef}>
                {/* Notification bell */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all"
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-[#2563EB] rounded-full text-[9px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {isOpen && (
                        <div className="absolute right-0 top-11 w-96 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-sm text-[#0F172A]">Notifications</h3>
                                    {unreadCount > 0 && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB]">{unreadCount} new</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button onClick={markAllRead} className="text-xs text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 font-medium">
                                            <Check className="w-3 h-3" /> Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="text-[#94A3B8] hover:text-[#475569]">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto divide-y divide-[#E2E8F0]">
                                {notifications.length === 0 ? (
                                    <p className="text-center text-[#94A3B8] py-8 text-sm">No notifications yet</p>
                                ) : notifications.map(n => {
                                    const cfg = typeConfig[n.type] || { label: n.type, cls: "bg-[#F1F5F9] text-[#475569]" };
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => markAsRead(n.id)}
                                            className={`w-full text-left px-4 py-3.5 hover:bg-[#F8FAFC] transition-colors ${!n.read ? "bg-[#EFF6FF]/40" : ""}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1.5">
                                                {!n.read && <span className="w-2 h-2 bg-[#2563EB] rounded-full flex-shrink-0" />}
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cfg.cls}`}>{cfg.label}</span>
                                            </div>
                                            <p className={`text-sm ${!n.read ? "font-semibold text-[#0F172A]" : "text-[#475569]"}`}>{n.title}</p>
                                            <p className="text-xs text-[#94A3B8] mt-0.5 line-clamp-2">{n.message}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* User avatar */}
                <div className="relative" ref={profileRef}>
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[#F1F5F9] transition-all group"
                    >
                        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white uppercase">
                            {user?.name?.charAt(0) || "A"}
                        </div>
                        <div className="hidden md:block text-left">
                            <span className="text-sm font-medium text-[#0F172A] block leading-none">{user?.name || "Admin"}</span>
                        </div>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#475569] transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
                    </button>
                    
                    {isProfileOpen && (
                        <div className="absolute right-0 top-11 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-50 overflow-hidden py-1">
                            <div className="px-4 py-2 border-b border-[#E2E8F0] mb-1">
                                <p className="text-sm font-semibold text-[#0F172A] truncate">{user?.name || "Admin User"}</p>
                                <p className="text-xs text-[#64748B] truncate">{user?.email || "admin@school.in"}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    setIsProfileOpen(false);
                                    logout();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
