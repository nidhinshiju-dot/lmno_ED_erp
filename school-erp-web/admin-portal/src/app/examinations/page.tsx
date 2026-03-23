"use client";

import { useState, useEffect } from "react";
import { ExamService, ClassService, SubjectService } from "@/lib/api";
import { Plus, CheckCircle, FileText, Calendar, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AdminExaminationsPage() {
    const { user } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        classId: "",
        subjectId: "",
        examDate: "",
        totalMarks: 100
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [examsData, classesData, subjectsData] = await Promise.all([
                ExamService.getAll(),
                ClassService.getAll(),
                SubjectService.getAll()
            ]);
            setExams(examsData);
            setClasses(classesData);
            setSubjects(subjectsData);
        } catch (error) {
            console.error("Failed to load exams", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExam = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ExamService.create({
                ...formData,
                status: "SCHEDULED"
            });
            setIsCreateModalOpen(false);
            setFormData({ name: "", classId: "", subjectId: "", examDate: "", totalMarks: 100 });
            loadData();
        } catch (error) {
            alert("Failed to create exam");
        }
    };

    const handlePublishResults = async (examId: string) => {
        if (!confirm("Are you sure you want to publish results? This will calculate class ranks and make results visible to students and parents.")) return;
        
        try {
            await ExamService.publishResults(examId);
            const updatedExams = exams.map(e => e.id === examId ? { ...e, status: "RESULTS_PUBLISHED" } : e);
            setExams(updatedExams);
            alert("Results published successfully!");
        } catch (error) {
            alert("Failed to publish results. Please ensure teachers have submitted marks first.");
        }
    };

    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || id;
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "SCHEDULED":
                return <span className="px-2 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-md text-xs font-bold">SCHEDULED</span>;
            case "COMPLETED":
                return <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold">GRADING</span>;
            case "RESULTS_PUBLISHED":
                return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold">PUBLISHED</span>;
            default:
                return <span className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-6 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800">Examinations & Academics</h1>
                        <p className="text-sm text-slate-500 mt-1">Schedule exams and publish finalized results to students.</p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" /> Create Exam
                    </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p>
                        <strong>Workflow:</strong> 1) Admin schedules an Exam here. 2) The Subject Teacher logs in and inputs marks. 3) Admin clicks "Publish Results" here to calculate ranks and push scorecards to parent/student portals.
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Exam Name</th>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Max Marks</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Loading exams...</td></tr>
                                ) : exams.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="font-semibold text-slate-700">No Exams Scheduled</p>
                                            <p className="text-sm mt-1">Click "Create Exam" to schedule the first one.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    exams.map(exam => (
                                        <tr key={exam.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={exam.status} /></td>
                                            <td className="px-6 py-4 font-bold text-slate-800">{exam.name}</td>
                                            <td className="px-6 py-4">{getClassName(exam.classId)}</td>
                                            <td className="px-6 py-4">{getSubjectName(exam.subjectId)}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {exam.examDate ? new Date(exam.examDate).toLocaleDateString("en-IN") : "TBA"}
                                            </td>
                                            <td className="px-6 py-4 font-mono">{exam.totalMarks}</td>
                                            <td className="px-6 py-4 text-right">
                                                {exam.status !== "RESULTS_PUBLISHED" && (
                                                    <button
                                                        onClick={() => handlePublishResults(exam.id)}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" /> Publish Results
                                                    </button>
                                                )}
                                                {exam.status === "RESULTS_PUBLISHED" && (
                                                    <span className="text-xs text-slate-400 font-medium">Published</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Create Exam Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-slate-800">Schedule Exam</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
                        </div>
                        <form onSubmit={handleCreateExam} className="p-6 space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Exam Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    placeholder="e.g. Term 1 Mathematics"
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Target Class</label>
                                    <select
                                        required
                                        value={formData.classId}
                                        onChange={e => setFormData({...formData, classId: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                    >
                                        <option value="">Select Class...</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Subject</label>
                                    <select
                                        required
                                        value={formData.subjectId}
                                        onChange={e => setFormData({...formData, subjectId: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                    >
                                        <option value="">Select Subject...</option>
                                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.examDate}
                                        onChange={e => setFormData({...formData, examDate: e.target.value})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-slate-700 mb-1">Max Marks</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={formData.totalMarks}
                                        onChange={e => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition">Cancel</button>
                                <button type="submit" className="px-5 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm">Schedule Exam</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
