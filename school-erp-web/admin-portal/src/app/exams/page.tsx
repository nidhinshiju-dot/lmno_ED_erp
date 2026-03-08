"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { ExamService, ClassService, SubjectService } from "@/lib/api";
import { Plus, FileText } from "lucide-react";

interface ExamItem { id: string; name: string; classId: string; subjectId: string; examDate: string; maxMarks: number; status: string; }
interface ClassItem { id: string; name: string; }
interface SubjectItem { id: string; name: string; code: string; }

export default function ExamsPage() {
    const [exams, setExams] = useState<ExamItem[]>([]);
    const [classes, setClasses] = useState<ClassItem[]>([]);
    const [subjects, setSubjects] = useState<SubjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newExam, setNewExam] = useState({ name: "", classId: "", subjectId: "", examDate: "", maxMarks: 100, status: "SCHEDULED" });

    useEffect(() => {
        const load = async () => {
            try {
                const [examData, clsData, subData] = await Promise.all([ExamService.getAll(), ClassService.getAll(), SubjectService.getAll()]);
                setExams(examData);
                setClasses(clsData);
                setSubjects(subData);
            } catch { console.error("Failed"); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || "—";
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || "—";

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            SCHEDULED: "bg-blue-100 text-blue-700",
            COMPLETED: "bg-emerald-100 text-emerald-700",
            RESULTS_PUBLISHED: "bg-purple-100 text-purple-700",
        };
        return <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[status] || "bg-gray-100 text-gray-600"}`}>{status.replace("_", " ")}</span>;
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const created = await ExamService.create(newExam);
            setExams([...exams, created]);
            setIsModalOpen(false);
            setNewExam({ name: "", classId: "", subjectId: "", examDate: "", maxMarks: 100, status: "SCHEDULED" });
        } catch { alert("Failed to create exam"); }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Examination Management" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Examinations</h2>
                            <p className="text-muted-foreground mt-1">Schedule exams, enter marks, and publish results.</p>
                        </div>
                        <button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                            <Plus className="w-4 h-4" /> Schedule Exam
                        </button>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground">Exam Name</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Class</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Subject</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Date</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Max Marks</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                ) : exams.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />No exams scheduled yet.</td></tr>
                                ) : exams.map(exam => (
                                    <tr key={exam.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-4 font-medium">{exam.name}</td>
                                        <td className="p-4 text-muted-foreground">{getClassName(exam.classId)}</td>
                                        <td className="p-4 text-muted-foreground">{getSubjectName(exam.subjectId)}</td>
                                        <td className="p-4">{exam.examDate || "TBD"}</td>
                                        <td className="p-4 font-mono">{exam.maxMarks}</td>
                                        <td className="p-4">{getStatusBadge(exam.status)}</td>
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
                        <h3 className="text-xl font-bold mb-4">Schedule Exam</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div><label className="text-sm font-medium mb-1 block">Exam Name *</label>
                                <input required type="text" value={newExam.name} onChange={e => setNewExam({...newExam, name: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Mid-Term Exam" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Class *</label>
                                    <select required value={newExam.classId} onChange={e => setNewExam({...newExam, classId: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Subject *</label>
                                    <select required value={newExam.subjectId} onChange={e => setNewExam({...newExam, subjectId: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm font-medium mb-1 block">Date</label>
                                    <input type="date" value={newExam.examDate} onChange={e => setNewExam({...newExam, examDate: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div><label className="text-sm font-medium mb-1 block">Max Marks</label>
                                    <input type="number" value={newExam.maxMarks} onChange={e => setNewExam({...newExam, maxMarks: parseInt(e.target.value)})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
