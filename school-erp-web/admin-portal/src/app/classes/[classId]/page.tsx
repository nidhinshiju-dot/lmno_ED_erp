"use client";

import { useState, useEffect, use } from "react";
import { ClassService, SubjectService, StaffService, ClassSubjectService } from "@/lib/api";
import { Plus, BookOpen, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ClassSubjectItem { id: string; subjectName: string; subjectCode: string; subjectType: string; teacherName: string; periodsPerWeek: number; }
interface GlobalSubject { id: string; name: string; code: string; subjectType: string; }
interface StaffMember { id: string; name: string; department?: string; }
interface ClassDetails { id: string; name: string; gradeLevel: number; branch: string; }

export default function ClassSubjectsPage({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [assignedSubjects, setAssignedSubjects] = useState<ClassSubjectItem[]>([]);
    const [globalSubjects, setGlobalSubjects] = useState<GlobalSubject[]>([]);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newAssignment, setNewAssignment] = useState({
        classId: classId,
        subjectId: "",
        teacherId: "",
        periodsPerWeek: 5
    });

    useEffect(() => {
        const load = async () => {
            try {
                // We're simulating getting class details by fetching all and finding it, 
                // in a real app we'd have a getById method on ClassService
                const classesData = await ClassService.getAll();
                const cls = classesData.find((c: any) => c.id === classId);
                setClassDetails(cls);

                const [assignedData, globalData, staffData] = await Promise.all([
                    ClassSubjectService.getByClass(classId),
                    SubjectService.getAll(),
                    StaffService.getAll()
                ]);

                setAssignedSubjects(assignedData);
                setGlobalSubjects(globalData);
                setStaff(staffData);
            } catch {
                console.error("Failed to load class subjects");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [classId]);

    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ClassSubjectService.assignSubject(newAssignment);
            // Refresh assignments
            const updated = await ClassSubjectService.getByClass(classId);
            setAssignedSubjects(updated);
            setIsModalOpen(false);
            setNewAssignment({ classId, subjectId: "", teacherId: "", periodsPerWeek: 5 });
        } catch (err: any) {
            alert(err.message || "Failed to assign subject. It might already be assigned.");
        }
    };

    const handleUnassign = async (assignmentId: string, subjectName: string) => {
        if (!confirm(`Remove ${subjectName} from this class?`)) return;
        try {
            await ClassSubjectService.unassignSubject(assignmentId);
            setAssignedSubjects(prev => prev.filter(a => a.id !== assignmentId));
        } catch {
            alert("Failed to remove subject assignment.");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <Link href="/classes" className="p-2 hover:bg-muted rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">
                                Subjects for {classDetails ? classDetails.name : "..."}
                            </h2>
                            <p className="text-muted-foreground mt-1">Manage global subjects assigned to this specific class along with their teachers.</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="text-sm font-medium bg-muted px-4 py-2 rounded-lg">
                            Total Assigned: {assignedSubjects.length}
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                            <Plus className="w-4 h-4" /> Assign Subject
                        </button>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground">Code</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Subject Name</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Type</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Teacher</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-center">Periods / Wk</th>
                                    <th className="p-4 font-semibold text-muted-foreground text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading subjects...</td></tr>
                                ) : assignedSubjects.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />No subjects assigned to this class yet.</td></tr>
                                ) : assignedSubjects.map(s => (
                                    <tr key={s.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-mono text-xs font-bold text-primary">{s.subjectCode}</td>
                                        <td className="p-4 font-medium">{s.subjectName}</td>
                                        <td className="p-4 text-muted-foreground">
                                            <span className="px-2 py-1 bg-muted rounded-md text-xs">{s.subjectType || "CORE"}</span>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{s.teacherName || "—"}</td>
                                        <td className="p-4 text-center font-medium">{s.periodsPerWeek || 0}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleUnassign(s.id, s.subjectName)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove Assignment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Assign Subject</h3>
                        <form onSubmit={handleAssign} className="space-y-4">
                            <div><label className="text-sm font-medium mb-1 block">Global Subject *</label>
                                <select required value={newAssignment.subjectId} onChange={e => setNewAssignment({ ...newAssignment, subjectId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select a subject...</option>
                                    {globalSubjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div><label className="text-sm font-medium mb-1 block">Assigned Teacher</label>
                                <select value={newAssignment.teacherId} onChange={e => setNewAssignment({ ...newAssignment, teacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select teacher (Optional)...</option>
                                    {staff.filter((s: any) => s.department === "Teaching").map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div><label className="text-sm font-medium mb-1 block">Periods Per Week *</label>
                                <input required type="number" min="1" max="20" value={newAssignment.periodsPerWeek} onChange={e => setNewAssignment({ ...newAssignment, periodsPerWeek: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
