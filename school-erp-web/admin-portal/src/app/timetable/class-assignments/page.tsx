"use client";

import { useState, useEffect } from "react";
import { ClassService, SubjectService, StaffService, ClassSubjectTeacherService, WorkingDayService, PeriodBlockService } from "@/lib/api";
import { Plus, Trash2, Users, Pencil, X } from "lucide-react";

interface SchoolClass { id: string; name: string; branch?: string; roomNumber?: string; }
interface Subject { id: string; name: string; code: string; }
interface Staff { id: string; name: string; role: string; department: string; subjects?: string[]; }
interface Assignment { id: string; classId: string; className: string; subjectId: string; subjectName: string; teacherId: string; teacherName: string; periodsPerWeek: number; priority: number; isLab: boolean; consecutiveBlocks: number; }
interface WorkingDay { id: string; dayName: string; isActive: boolean; }
interface PeriodBlock { id: string; name: string; blockType: string; }

export default function ClassAssignmentsPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [workingDays, setWorkingDays] = useState<WorkingDay[]>([]);
    const [periodBlocks, setPeriodBlocks] = useState<PeriodBlock[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
    const [newAssignment, setNewAssignment] = useState({ subjectId: "", teacherId: "", teacherIds: [] as string[], periodsPerWeek: 2, priority: 0, isLab: false, consecutiveBlocks: 1 });

    useEffect(() => {
        const load = async () => {
            try {
                const [cls, sub, stf, wdays, pbs] = await Promise.all([
                    ClassService.getAll(), SubjectService.getAll(), StaffService.getAll(),
                    WorkingDayService.getAll(),
                    PeriodBlockService.getAll()
                ]);
                setClasses(cls); setSubjects(sub); setStaff(stf);
                setWorkingDays(wdays || []);
                setPeriodBlocks(pbs || []);
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
            if (newAssignment.isLab && newAssignment.teacherIds && newAssignment.teacherIds.length > 0) {
                // Create multiple assignments for the Lab batch
                for (const tId of newAssignment.teacherIds) {
                    await ClassSubjectTeacherService.create({ ...newAssignment, teacherId: tId, classId: selectedClass });
                }
            } else {
                await ClassSubjectTeacherService.create({ ...newAssignment, classId: selectedClass });
            }
            await reloadAssignments();
            setShowForm(false);
            setNewAssignment({ subjectId: "", teacherId: "", teacherIds: [], periodsPerWeek: 2, priority: 0, isLab: false, consecutiveBlocks: 1 });
        } catch (error) { 
            console.error(error);
            alert("Failed to create assignment."); 
        }
    };

    const handleOpenEdit = (a: Assignment) => {
        setEditingAssignment(a);
        setNewAssignment({ subjectId: a.subjectId, teacherId: a.teacherId, teacherIds: [], periodsPerWeek: a.periodsPerWeek, priority: a.priority, isLab: a.isLab || false, consecutiveBlocks: a.consecutiveBlocks || 1 });
        setShowForm(true);
    };

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAssignment) return;
        try {
            if (newAssignment.isLab && newAssignment.teacherIds && newAssignment.teacherIds.length > 0) {
                // Determine the first teacher to update the existing record
                await ClassSubjectTeacherService.update(editingAssignment.id, { ...newAssignment, teacherId: newAssignment.teacherIds[0], classId: selectedClass });
                // Create the remainder as new records
                for (let i = 1; i < newAssignment.teacherIds.length; i++) {
                    await ClassSubjectTeacherService.create({ ...newAssignment, teacherId: newAssignment.teacherIds[i], classId: selectedClass });
                }
            } else {
                await ClassSubjectTeacherService.update(editingAssignment.id, { ...newAssignment, classId: selectedClass });
            }
            await reloadAssignments();
            setShowForm(false);
            setEditingAssignment(null);
            setNewAssignment({ subjectId: "", teacherId: "", teacherIds: [], periodsPerWeek: 2, priority: 0, isLab: false, consecutiveBlocks: 1 });
        } catch (error) { 
            console.error(error);
            alert("Failed to update assignment."); 
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this assignment?")) return;
        try {
            await ClassSubjectTeacherService.delete(id);
            setAssignments(assignments.filter(a => a.id !== id));
        } catch { alert("Failed to delete assignment."); }
    };

    // Filter staff based on Department ensuring only 'Teaching' staff appear.
    // Also explicitly filter teachers who have the selected subject in their profile.
    const teachers = staff.filter(s => {
        if (s.department !== "Teaching") return false;
        if (!newAssignment.subjectId) return true; // If no subject selected yet, show all teachers
        return s.subjects && s.subjects.includes(newAssignment.subjectId);
    });

    const activeWorkingDaysCount = workingDays.filter(d => d.isActive).length;
    const academicPeriodsCount = periodBlocks.filter(b => b.blockType === "PERIOD").length;
    const maxCapacity = activeWorkingDaysCount * academicPeriodsCount;
    
    // Total periods calculated from uniquely grouping by subject so labs with multiple teachers aren't double counted
    const uniqueAssignmentsMap = new Map();
    assignments.forEach(a => {
        if (!uniqueAssignmentsMap.has(a.subjectId)) {
            uniqueAssignmentsMap.set(a.subjectId, a.periodsPerWeek);
        }
    });
    const scheduledPeriods = Array.from(uniqueAssignmentsMap.values()).reduce((sum, periods) => sum + periods, 0);

    const remainingPeriods = maxCapacity - scheduledPeriods;
    const isOverbooked = remainingPeriods < 0;

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
                        <button onClick={() => { setEditingAssignment(null); setNewAssignment({ subjectId: "", teacherId: "", teacherIds: [], periodsPerWeek: 2, priority: 0, isLab: false, consecutiveBlocks: 1 }); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
                            <Plus className="w-4 h-4" /> Add Assignment
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium whitespace-nowrap">Select Class:</label>
                    <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="flex-1 max-w-xs bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Choose a class...</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} {c.branch ? `(${c.branch})` : ''} {c.roomNumber ? `- Div ${c.roomNumber}` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                {maxCapacity === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl shadow-sm text-sm font-medium flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div>
                            <p className="font-bold text-amber-900">Missing Timetable Configuration</p>
                            <p className="mt-0.5">You must define Working Days and Period Blocks before assigning classes. Go to the Timetable Configuration module to set up your school&apos;s weekly schedule.</p>
                        </div>
                    </div>
                ) : selectedClass && (
                    <div className={`p-4 rounded-xl shadow-sm text-sm flex items-center justify-between border ${isOverbooked ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                        <div className="flex items-center gap-3">
                            <span className="text-xl">{isOverbooked ? '⚠️' : '📊'}</span>
                            <div>
                                <p className={`font-bold ${isOverbooked ? 'text-red-900' : 'text-blue-900'}`}>{isOverbooked ? 'Timetable Overbooked' : 'Timetable Capacity'}</p>
                                <p className="mt-0.5 opacity-90">Based on {activeWorkingDaysCount} active days and {academicPeriodsCount} periods per day.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 font-bold text-base text-right">
                            <div className="flex flex-col">
                                <span className={isOverbooked ? "text-red-600" : "text-emerald-600"}>{scheduledPeriods}</span>
                                <span className="text-xs uppercase tracking-wide opacity-70">Scheduled</span>
                            </div>
                            <div className="text-2xl font-light opacity-50">/</div>
                            <div className="flex flex-col">
                                <span>{maxCapacity}</span>
                                <span className="text-xs uppercase tracking-wide opacity-70">Total Capacity</span>
                            </div>
                            <div className="text-2xl font-light opacity-50 ml-2 border-l border-current pl-4">
                                <span className={isOverbooked ? "text-red-600 font-bold" : ""}>{remainingPeriods}</span>
                                <span className="text-xs uppercase tracking-wide opacity-70 block">Slots Remaining</span>
                            </div>
                        </div>
                    </div>
                )}

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
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">Teacher</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Periods/Week</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Priority</th>
                                <th className="px-4 py-3"></th>
                            </tr></thead>
                            <tbody className="divide-y divide-border">
                                {assignments.map(a => (
                                    <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3"><span className="font-medium">{a.subjectName}</span></td>
                                        <td className="px-4 py-3">
                                            {a.isLab ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                                    Lab ({a.consecutiveBlocks} blocks)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    Lecture
                                                </span>
                                            )}
                                        </td>
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
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30 mb-2">
                                <div>
                                    <label className="text-sm font-medium select-none">Is this a Lab Batch?</label>
                                    <p className="text-xs text-muted-foreground">Labs can be scheduled across multiple blocks & teachers.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={newAssignment.isLab} onChange={e => setNewAssignment({ ...newAssignment, isLab: e.target.checked, consecutiveBlocks: e.target.checked ? 2 : 1, teacherIds: [], teacherId: "" })} />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block">Subject</label>
                                <select required value={newAssignment.subjectId} onChange={e => setNewAssignment({ ...newAssignment, subjectId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select subject...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                </select>
                            </div>
                            
                            {newAssignment.isLab ? (
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Teachers <span className="text-xs text-muted-foreground font-normal">(Select multiple for batch rotations)</span></label>
                                    <div className="bg-muted border border-border rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                                        {teachers.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">Select a subject first...</p>
                                        ) : (
                                            teachers.map(t => (
                                                <label key={t.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-border text-primary focus:ring-primary"
                                                        checked={newAssignment.teacherIds.includes(t.id)}
                                                        onChange={() => {
                                                            const ids = newAssignment.teacherIds.includes(t.id) 
                                                                ? newAssignment.teacherIds.filter(id => id !== t.id)
                                                                : [...newAssignment.teacherIds, t.id];
                                                            setNewAssignment({ ...newAssignment, teacherIds: ids });
                                                        }}
                                                    />
                                                    {t.name}
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Teacher <span className="text-xs text-muted-foreground font-normal">(Filtered by Subject capability)</span></label>
                                    <select required disabled={!newAssignment.subjectId} value={newAssignment.teacherId} onChange={e => setNewAssignment({ ...newAssignment, teacherId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50">
                                        <option value="">{newAssignment.subjectId ? "Select qualified teacher..." : "Select a subject first..."}</option>
                                        {teachers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium mb-1 block">Periods / Week</label>
                                    <input type="number" min={1} max={40} required value={newAssignment.periodsPerWeek} onChange={e => setNewAssignment({ ...newAssignment, periodsPerWeek: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1 block text-muted-foreground">Consecutive Blocks</label>
                                    <input type="number" min={1} max={10} disabled={!newAssignment.isLab} required value={newAssignment.consecutiveBlocks} onChange={e => setNewAssignment({ ...newAssignment, consecutiveBlocks: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50" />
                                </div>
                                <div className="col-span-2">
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
