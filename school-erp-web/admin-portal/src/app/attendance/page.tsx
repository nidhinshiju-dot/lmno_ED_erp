"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { SectionService, AttendanceService, StudentService } from "@/lib/api";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface SectionItem { id: string; name: string; }
interface StudentItem { id: string; name: string; admissionNumber: string; }
interface AttendanceRecord { id?: string; studentId: string; sectionId: string; date: string; status: string; }

export default function AttendancePage() {
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [students, setStudents] = useState<StudentItem[]>([]);
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [existingRecords, setExistingRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [secData, stuData] = await Promise.all([SectionService.getAll(), StudentService.getAll()]);
                setSections(secData);
                setStudents(stuData);
            } catch { console.error("Failed"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedSection || !selectedDate) return;
        const loadAttendance = async () => {
            try {
                const data = await AttendanceService.getBySection(selectedSection, selectedDate);
                setExistingRecords(data);
                const map: Record<string, string> = {};
                data.forEach((r: AttendanceRecord) => { map[r.studentId] = r.status; });
                setAttendance(map);
            } catch { setExistingRecords([]); setAttendance({}); }
        };
        loadAttendance();
    }, [selectedSection, selectedDate]);

    const toggleStatus = (studentId: string) => {
        const current = attendance[studentId] || "PRESENT";
        const next = current === "PRESENT" ? "ABSENT" : current === "ABSENT" ? "LATE" : "PRESENT";
        setAttendance({ ...attendance, [studentId]: next });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = students.map(s => ({
                studentId: s.id,
                sectionId: selectedSection,
                date: selectedDate,
                status: attendance[s.id] || "PRESENT",
            }));
            await AttendanceService.markAttendance(records);
            alert("Attendance saved!");
        } catch { alert("Failed to save"); }
        finally { setSaving(false); }
    };

    const getStatusIcon = (status: string) => {
        if (status === "PRESENT") return <CheckCircle className="w-5 h-5 text-emerald-500" />;
        if (status === "ABSENT") return <XCircle className="w-5 h-5 text-red-500" />;
        return <Clock className="w-5 h-5 text-yellow-500" />;
    };

    const getStatusColor = (status: string) => {
        if (status === "PRESENT") return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (status === "ABSENT") return "bg-red-50 text-red-700 border-red-200";
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Attendance" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
                        <p className="text-muted-foreground mt-1">Mark daily attendance for class sections.</p>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Section</label>
                            <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="p-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary">
                                <option value="">Select section...</option>
                                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Date</label>
                            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        {selectedSection && (
                            <button onClick={handleSave} disabled={saving} className="mt-6 bg-primary hover:bg-blue-600 disabled:opacity-50 text-primary-foreground px-6 py-2 rounded-lg font-medium text-sm transition-colors">
                                {saving ? "Saving..." : "Save Attendance"}
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : !selectedSection ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                            Select a section and date to mark attendance.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {students.map(student => {
                                const status = attendance[student.id] || "PRESENT";
                                return (
                                    <button key={student.id} onClick={() => toggleStatus(student.id)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${getStatusColor(status)}`}>
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(status)}
                                            <div className="text-left">
                                                <p className="font-semibold text-sm">{student.name}</p>
                                                <p className="text-xs opacity-70">{student.admissionNumber}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold uppercase">{status}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
