"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { BookOpen, ShieldCheck } from "lucide-react";
import TeacherAcademics from "@/components/academics/TeacherAcademics";
import AdminAcademics from "@/components/academics/AdminAcademics";

export default function AcademicsReportsPage() {
    const { user } = useAuth();
    const isAdmin = user?.email?.includes("admin");
    const [activeTab, setActiveTab] = useState<"teacher" | "admin">(isAdmin ? "admin" : "teacher");

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Academics & Reports</h2>
                <p className="text-muted-foreground mt-2">Manage lesson plans, syllabi, and academic verifications.</p>
            </div>

            {/* Tabs for Teacher vs Admin view */}
            <div className="flex bg-muted p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab("teacher")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === "teacher" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                    }`}
                >
                    <BookOpen className="w-4 h-4" />
                    My Academics (Teacher)
                </button>
                <button
                    onClick={() => setActiveTab("admin")}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-medium transition-all ${
                        activeTab === "admin" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:bg-white/50"
                    }`}
                >
                    <ShieldCheck className="w-4 h-4" />
                    Verification Dashboard (Admin)
                </button>
            </div>

            <div className="mt-6">
                {activeTab === "teacher" ? <TeacherAcademics /> : <AdminAcademics />}
            </div>
        </div>
    );
}
