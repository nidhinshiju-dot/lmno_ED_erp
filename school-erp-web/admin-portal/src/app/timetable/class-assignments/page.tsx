"use client";

import { useState, useEffect } from "react";
import { ClassService, SubjectService, StaffService, ClassSubjectTeacherService } from "@/lib/api";
import { Plus, Trash2, Users, Pencil, X } from "lucide-react";

interface SchoolClass { id: string; name: string; }
interface Subject { id: string; name: string; code: string; }
interface Staff { id: string; name: string; role: string; }
interface Assignment { id: string; classId: string; className: string; subjectId: string; subjectName: string; teacherId: string; teacherName: string; periodsPerWeek: number; priority: number; }

export default function ClassAssignmentsPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [newAssignment, setNewAssignment] = useState({ subjectId: "", teacherId: "", periodsPerWeek: 2, priority: 0 });

    useEffect(() => {
        const load = async () => {
            try {
                const [cls, sub, stf] = await Promise.all([ClassService.getAll(), SubjectService.getAll(), StaffService.getAll()]);
                setClasses(cls); setSubjects(sub); setStaff(stf);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedClass) { setAssignments([]); return; }
        ClassSubjectTeacherService.getByClass(selectedClass).then(setAssignments).catch(console.error);
    }, [selectedClass]);

    const reloadAssignments = async () => {
        if (!selectedClass) return;
        const updated = await ClassSubjectTeacherService.getByClass(selectedClass);
        setAssignments(updated);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        try {
            await ClassSubjectTeacherService.create({ ...newAssignment, classId: selectedClass });
            await reloadAssignments();
            setShowForm(false);
            setNewAssignment({ subjectId: "", teacherId: "", periodsPerWeek: 2, priority: 0 });
        } catch { alert("Failed to create assignment."); }
    };

    const handleOpenEdit = (a: Assignment) => {
        setEditingAssignment(a);
        setNewAssignment({ subjectId: a.subjectId, teacherId: a.teacherId, periodsPerWeek: a.periodsPerWeek, priority: a.priority });
        setShowForm(true);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAssignment) return;
        try {
            await ClassSubjectTeacherService.update(editingAssignment.id, { ...newAssignment, classId: selectedClass });
            await reloadAssignments();
            setShowForm(false);
            setEditingAssignment(null);
            setNewAssignment({ subjectId: "", teacherId: "", periodsPerWeek: 2, priority: 0 });
        } catch { alert("Failed to update assignment."); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this assignment?")) return;
        try {
            await ClassSubjectTeacherService.delete(id);
            setAssignments(assignments.filter(a => a.id !== id));
        } catch { alert("Failed to delete assignment."); }
    };

    // Show ALL staff — the backend enforces subject-teacher pairing, no need to pre-filter
    const teachers = staff;

    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Class Assignments</h2>
                        <p className="text-muted-foreground mt-1">Assign subjects and teachers to classes with weekly period count.</p>
                    </div>
                    {selectedClass && (
                        <button onClick={() => { setEditingAssignment(null); setNewAssignment({ subjectId: "", teacherId: "", periodsPerWeek: 2, priority: 0 }); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4" /> Add Assignment
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium whitespace-nowrap">Select Class:</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="flex-1 max-w-xs bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Choose a class...</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                {!selectedClass ? (
                    <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>Select a class to view and manage subject-teacher assignments.</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                                {assignments.length} Assignment{assignments.length !== 1 ? "s" : ""} — {classes.find(c => c.id === selectedClass)?.name}
                            </p>
                        </div>
                        <table className="w-full text-sm">
                            <thead><tr className="bg-muted/50 text-left">
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Subject</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Teacher</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Periods/Week</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Priority</th>
                                <th className="px-4 py-3"></th>
                            </tr></thead>
                            <tbody className="divide-y divide-border">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3"><span className="font-medium">{a.subjectName}</span></td>
                                        <td className="px-4 py-3 text-muted-foreground">{a.teacherName || "—"}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">{a.periodsPerWeek}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-muted-foreground">{a.priority}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleOpenEdit(a)} className="text-muted-foreground hover:text-blue-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete(a.id)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {assignments.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No assignments yet. Click &quot;Add Assignment&quot; to start.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Assignment Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">{editingAssignment ? "Edit" : "Add"} Subject-Teacher Assignment</h3>
                            <button onClick={() => { setShowForm(false); setEditingAssignment(null); }}><X className="w-4 h-4 text-muted-foreground" /></button>
                        </div>
                        <form onSubmit={editingAssignment ? handleEdit : handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject</label>
                                <select required value={newAssignment.subjectId} onChange={e => setNewAssignment({ ...newAssignment, subjectId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select subject...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Teacher</label>
                                <select required value={newAssignment.teacherId} onChange={e => setNewAssignment({ ...newAssignment, teacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select teacher...</option>
                                    {teachers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Periods / Week</label>
                                    <input type="number" min={1} max={20} required value={newAssignment.periodsPerWeek} onChange={e => setNewAssignment({ ...newAssignment, periodsPerWeek: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Priority (lower = higher)</label>
                                    <input type="number" min={0} value={newAssignment.priority} onChange={e => setNewAssignment({ ...newAssignment, priority: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => { setShowForm(false); setEditingAssignment(null); }} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">{editingAssignment ? "Save Changes" : "Assign"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
