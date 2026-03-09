"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { StaffService, ClassService } from "@/lib/api";
import { Users, BookOpen, Save } from "lucide-react";

interface StaffMember { id: string; name: string; department: string; designation: string; }
interface SchoolClass { id: string; name: string; gradeLevel: number; classTeacherId?: string | null; }

export default function TeacherAssignmentPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [staffData, classData] = await Promise.all([
                    StaffService.getAll(),
                    ClassService.getAll(),
                ]);
                setStaff(staffData);
                setClasses(classData);
            } catch {
                console.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAssign = async () => {
        if (!selectedClassId || !selectedStaffId) {
            alert("Please select both a class and a teacher.");
            return;
        }
        setSaving(true);
        setSuccessMsg("");
        try {
            const updated = await ClassService.assignTeacher(selectedClassId, selectedStaffId);
            setClasses(classes.map(c => c.id === selectedClassId ? updated : c));
            const teacher = staff.find(t => t.id === selectedStaffId);
            const cls = classes.find(c => c.id === selectedClassId);
            setSuccessMsg(`${teacher?.name} assigned as class teacher for ${cls?.name}`);
        } catch {
            alert("Failed to assign class teacher.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">


            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-muted-foreground">Assign a teacher as class teacher for a specific class.</p>

                    {/* Assignment Form Card */}
                    <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-bold">New Assignment</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Teacher</label>
                                <select
                                    value={selectedStaffId}
                                    onChange={e => setSelectedStaffId(e.target.value)}
                                    className="w-full p-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Choose a teacher...</option>
                                    {staff.filter(s => s.department === "Teaching").map(s => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Class</label>
                                <select
                                    value={selectedClassId}
                                    onChange={e => setSelectedClassId(e.target.value)}
                                    className="w-full p-2.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Choose a class...</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleAssign}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? "Saving..." : "Assign Teacher"}
                            </button>
                            {successMsg && <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>}
                        </div>
                    </div>

                    {/* Current Assignments Table */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border">
                            <h3 className="text-md font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4" /> Current Assignments
                            </h3>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="p-4 font-semibold text-sm text-muted-foreground">Class</th>
                                    <th className="p-4 font-semibold text-sm text-muted-foreground">Class Teacher</th>
                                    <th className="p-4 font-semibold text-sm text-muted-foreground">Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                ) : classes.length === 0 ? (
                                    <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No classes found.</td></tr>
                                ) : (
                                    classes.map(cls => {
                                        const teacher = staff.find(t => t.id === cls.classTeacherId);
                                        return (
                                        <tr key={cls.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                            <td className="p-4 font-medium">{cls.name}</td>
                                            <td className="p-4">
                                                {teacher ? (
                                                    <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">{teacher.name}</span>
                                                ) : (
                                                    <span className="text-sm text-muted-foreground italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground">{teacher?.department || "—"}</td>
                                        </tr>
                                    )})
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
