"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatAssistant from "@/components/ChatAssistant";

const getPageTitle = (pathname: string) => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/students")) return "Student Management";
    if (pathname.startsWith("/classes")) return "Class Management";
    if (pathname.startsWith("/courses")) return "Courses & LMS";
    if (pathname.startsWith("/subjects")) return "Subject Management";
    if (pathname.startsWith("/attendance")) return "Attendance";
    if (pathname.startsWith("/exams")) return "Examination Management";
    if (pathname.startsWith("/timetable")) return "Timetable Management";
    if (pathname.startsWith("/staff")) return "Staff Directory";
    if (pathname.startsWith("/assign-teacher")) return "Class Teacher Assignment";
    if (pathname.startsWith("/campuses")) return "Campus Management";
    if (pathname.startsWith("/calendar")) return "Academic Calendar";
    if (pathname.startsWith("/fees")) return "Fee Management";
    if (pathname.startsWith("/invoices")) return "Invoices & Payments";
    if (pathname.startsWith("/announcements")) return "Announcements";
    if (pathname.startsWith("/notifications")) return "Push Notifications Manager";
    if (pathname.startsWith("/files")) return "File Management";
    if (pathname.startsWith("/reports")) return "Reports";
    if (pathname.startsWith("/teacher/my-students")) return "My Students";
    if (pathname.startsWith("/teacher/assignments")) return "Manage Assignments";
    if (pathname.startsWith("/teacher")) return "Teacher Dashboard";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Dashboard";
};

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (isLoginPage) {
        return <main className="min-h-screen bg-[#F8FAFC]">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar isOpen={isSidebarOpen} />
            <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
                <Header title={getPageTitle(pathname)} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 p-6 overflow-auto bg-[#F8FAFC]">
                    {children}
                </main>
            </div>
            <ChatAssistant />
        </div>
    );
}
