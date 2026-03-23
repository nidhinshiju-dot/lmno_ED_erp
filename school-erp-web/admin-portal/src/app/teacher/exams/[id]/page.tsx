"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { ExamService, StudentManagementService } from "@/lib/api";
import { Save, ArrowLeft, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function TeacherExamGradingPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;
    
    const [exam, setExam] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [results, setResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [examId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch exam details to know classId and maxMarks
            const examData = await ExamService.getById(examId);
            setExam(examData);

            // Fetch students for that class
            const studentsData = await StudentManagementService.getByClass(examData.classId);
            setStudents(studentsData);

            // Fetch existing results for that exam
            const existingResults = await ExamService.getResults(examId);
            const resultsMap: Record<string, any> = {};
            existingResults.forEach((r: any) => {
                resultsMap[r.studentId] = r;
            });
            setResults(resultsMap);
            
        } catch (error) {
            console.error("Failed to load grading details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarksChange = (studentId: string, value: string) => {
        const numValue = parseInt(value);
        if (isNaN(numValue) && value !== "") return;
        
        let validMarks = numValue;
        if (numValue > exam.totalMarks) validMarks = exam.totalMarks;
        if (numValue < 0) validMarks = 0;

        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                examId: examId,
                studentId: studentId,
                marksObtained: value === "" ? "" : validMarks
            }
        }));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                examId: examId,
                studentId: studentId,
                remarks: remarks
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Convert resultsMap to an array of non-empty results
            const payload = Object.values(results).filter(r => r.marksObtained !== "" && r.marksObtained !== undefined);
            
            // Auto-calculate grades based on percentage before saving
            payload.forEach(r => {
                const pct = (r.marksObtained / exam.totalMarks) * 100;
                if (pct >= 90) r.grade = "A+";
                else if (pct >= 80) r.grade = "A";
                else if (pct >= 70) r.grade = "B+";
                else if (pct >= 60) r.grade = "B";
                else if (pct >= 50) r.grade = "C";
                else if (pct >= 40) r.grade = "D";
                else r.grade = "F";
            });

            await ExamService.saveResults(examId, payload);
            alert("Marks saved successfully!");
        } catch (error) {
            alert("Failed to save marks.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading grading sheet...</div>;
    }

    if (!exam) return <div className="p-8">Exam not found.</div>;

    const isPublished = exam.status === "RESULTS_PUBLISHED";

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/teacher/exams")} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{exam.name}</h1>
                        <p className="text-xs text-slate-500 mt-0.5">Maximum Marks: <span className="font-mono font-bold text-slate-700">{exam.totalMarks}</span></p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isPublished && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold">
                            <CheckCircle className="w-4 h-4" /> Results Published (Read-Only)
                        </div>
                    )}
                    {!isPublished && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Marks"}
                        </button>
                    )}
                </div>
            </header>

            {/* Main scrollable area */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    
                    {!isPublished && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                            <p>Grades (A, B, C...) will be automatically calculated out of {exam.totalMarks} based on standard school configuration upon saving. Do not leave blank for absent students; input 0.</p>
                        </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 w-16">#</th>
                                        <th className="px-6 py-4">Student Name</th>
                                        <th className="px-6 py-4 w-32">Adm. No</th>
                                        <th className="px-6 py-4 w-40">Marks Obtained</th>
                                        <th className="px-6 py-4">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {students.map((student, idx) => {
                                        const r = results[student.id] || {};
                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{idx + 1}</td>
                                                <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                                                <td className="px-6 py-4 font-mono text-slate-500">{student.admissionNumber}</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        value={r.marksObtained !== undefined ? r.marksObtained : ""}
                                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                        disabled={isPublished}
                                                        placeholder={`/ ${exam.totalMarks}`}
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100 font-mono font-bold"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={r.remarks || ""}
                                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                        disabled={isPublished}
                                                        placeholder="Optional remarks..."
                                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:bg-slate-100"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
