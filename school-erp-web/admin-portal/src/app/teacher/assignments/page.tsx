"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { CourseService } from "@/lib/api";
import { Plus, ClipboardCheck } from "lucide-react";

interface CourseItem { id: string; title: string; code: string; }
interface AssignmentItem { id: string; title: string; description: string; dueDate: string; maxScore: number; }

export default function TeacherAssignmentsPage() {
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAssignment, setNewAssignment] = useState({ title: "", description: "", dueDate: "", maxScore: 100 });

    useEffect(() => {
        const load = async () => {
            try {
                const data = await CourseService.getAll();
                setCourses(data);
            } catch { console.error("Failed"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    useEffect(() => {
        if (!selectedCourse) return;
        const loadAssignments = async () => {
            try {
                const data = await CourseService.getLessons(selectedCourse); // reuse as assignments endpoint
                setAssignments(data || []);
            } catch { setAssignments([]); }
        };
        loadAssignments();
    }, [selectedCourse]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        // In production, POST to /assignments
        const newItem: AssignmentItem = {
            id: `a-${Date.now()}`,
            ...newAssignment,
        };
        setAssignments([...assignments, newItem]);
        setIsModalOpen(false);
        setNewAssignment({ title: "", description: "", dueDate: "", maxScore: 100 });
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Manage Assignments" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
                            <p className="text-muted-foreground mt-1">Create and manage assignments for your courses.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                            <Plus className="w-4 h-4" /> Create Assignment
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium">Course:</label>
                        <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} className="p-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary">
                            <option value="">Select a course...</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.code})</option>)}
                        </select>
                    </div>

                    {loading ? (
                        <p className="text-center text-muted-foreground py-8">Loading...</p>
                    ) : !selectedCourse ? (
                        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
                            <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-40" />
                            Select a course to view and manage its assignments.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.length === 0 ? (
                                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
                                    No assignments for this course yet. Click &quot;Create Assignment&quot; to add one.
                                </div>
                            ) : assignments.map(a => (
                                <div key={a.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                    <div>
                                        <h4 className="font-bold">{a.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-primary">Due: {a.dueDate || "N/A"}</p>
                                        <p className="text-xs text-muted-foreground">Max Score: {a.maxScore}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-xl shadow-xl p-6">
                        <h3 className="text-xl font-bold mb-4">Create Assignment</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="text-sm font-medium mb-1 block">Title *</label>
                                <input required type="text" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Homework - Chapter 5" />
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" rows={3} placeholder="Instructions for the assignment..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Due Date</label>
                                    <input type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Max Score</label>
                                    <input type="number" value={newAssignment.maxScore} onChange={e => setNewAssignment({...newAssignment, maxScore: parseInt(e.target.value)})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
