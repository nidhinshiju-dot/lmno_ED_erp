"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { TeacherService } from "@/lib/api";
import { Search, GraduationCap } from "lucide-react";

interface StudentItem { id: string; name: string; admissionNumber: string; dob: string | null; parentContact: string | null; }

export default function TeacherStudentsPage() {
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const staffId = "demo-staff-id";

    useEffect(() => {
        const load = async () => {
            try {
                const data = await TeacherService.getMyStudents(staffId);
                setStudents(data);
            } catch { console.error("Failed"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">My Students</h2>
                            <p className="text-muted-foreground mt-1">Students in your classes.</p>
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">{filtered.length} students</div>
                    </div>

                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text" placeholder="Search by name or ID..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full bg-card border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground">Admission ID</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Student Name</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Date of Birth</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Parent Contact</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No students found.</td></tr>
                                ) : filtered.map(student => (
                                    <tr key={student.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-mono text-xs">{student.admissionNumber}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-primary" />
                                                <span className="font-medium">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">{student.dob || "N/A"}</td>
                                        <td className="p-4 text-muted-foreground">{student.parentContact || "N/A"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
