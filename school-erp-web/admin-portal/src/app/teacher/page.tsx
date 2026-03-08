"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { TeacherService, CourseService } from "@/lib/api";
import { Users, BookOpen, ClipboardCheck, GraduationCap } from "lucide-react";
import Link from "next/link";

interface SectionItem { id: string; name: string; schoolClass: { name: string }; }
interface CourseItem { id: string; title: string; code: string; }

export default function TeacherDashboard() {
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [loading, setLoading] = useState(true);

    // For demo, use a hardcoded staffId — in production read from JWT/auth context
    const staffId = "demo-staff-id";

    useEffect(() => {
        const load = async () => {
            try {
                const [secData, courseData] = await Promise.all([
                    TeacherService.getMySections(staffId),
                    CourseService.getAll(),
                ]);
                setSections(secData);
                setCourses(courseData);
            } catch { console.error("Failed to load teacher data"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Teacher Dashboard" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Welcome, Teacher 👋</h2>
                        <p className="text-muted-foreground mt-1">Here&apos;s your class overview and quick actions.</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center"><Users className="w-6 h-6" /></div>
                            <div>
                                <p className="text-2xl font-bold">{sections.length}</p>
                                <p className="text-sm text-muted-foreground">My Sections</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>
                            <div>
                                <p className="text-2xl font-bold">{courses.length}</p>
                                <p className="text-sm text-muted-foreground">My Courses</p>
                            </div>
                        </div>
                        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center"><ClipboardCheck className="w-6 h-6" /></div>
                            <div>
                                <p className="text-2xl font-bold">—</p>
                                <p className="text-sm text-muted-foreground">Pending Grading</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/teacher/my-students" className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                <div>
                                    <h3 className="font-bold">My Students</h3>
                                    <p className="text-sm text-muted-foreground">View students in your class sections.</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/teacher/assignments" className="bg-card border border-border rounded-xl p-6 hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <ClipboardCheck className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                                <div>
                                    <h3 className="font-bold">Assignments</h3>
                                    <p className="text-sm text-muted-foreground">Create and manage course assignments.</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* My Sections Table */}
                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : (
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-border">
                                <h3 className="font-semibold">My Sections (Class Teacher)</h3>
                            </div>
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="p-4 font-semibold text-muted-foreground">Section</th>
                                        <th className="p-4 font-semibold text-muted-foreground">Class</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.length === 0 ? (
                                        <tr><td colSpan={2} className="p-6 text-center text-muted-foreground">No sections assigned yet.</td></tr>
                                    ) : sections.map(s => (
                                        <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">{s.name}</td>
                                            <td className="p-4">{s.schoolClass?.name || "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
