"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ChatAssistant from "@/components/ChatAssistant";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/login";

    if (isLoginPage) {
        return <main className="min-h-screen bg-[#F8FAFC]">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-6 overflow-auto bg-[#F8FAFC]">
                    {children}
                </main>
            </div>
            <ChatAssistant />
        </div>
    );
}
