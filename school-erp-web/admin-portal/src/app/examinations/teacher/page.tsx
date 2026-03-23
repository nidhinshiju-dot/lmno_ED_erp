"use client";

import { useState, useEffect } from "react";
import { TeacherAssignmentService, ExamService, QuestionPaperService } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { BookOpen, FileText, Plus, CheckCircle, Clock, Edit3 } from "lucide-react";
import QuestionPaperDesigner from "@/components/examinations/QuestionPaperDesigner";
import MarksEntryGrid from "@/components/examinations/MarksEntryGrid";

export default function TeacherExaminationsPage() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [papers, setPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Designer State
    const [designerContext, setDesignerContext] = useState<{ examId: string, subjectName: string } | null>(null);
    const [gradingContext, setGradingContext] = useState<{ examId: string, examTitle: string, classId: string } | null>(null);

    useEffect(() => {
        if (user?.id) {
            loadDashboard();
        }
    }, [user?.id]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [assignData, examData, paperData] = await Promise.all([
                TeacherAssignmentService.getMyAssignments(user!.id),
                ExamService.getByTeacher(user!.id).catch(() => []),
                QuestionPaperService.getByTeacher(user!.id).catch(() => [])
            ]);
            setAssignments(assignData);
            setExams(examData);
            setPapers(paperData);
        } catch (error) {
            console.error("Failed to load teacher examinations data:", error);
        } finally {
            setLoading(false);
        }
    };



    if (designerContext) {
        return (
            <QuestionPaperDesigner 
                examId={designerContext.examId} 
                teacherId={user!.id}
                subjectName={designerContext.subjectName}
                onClose={() => { setDesignerContext(null); loadDashboard(); }} 
            />
        );
    }

    if (gradingContext) {
        return (
            <MarksEntryGrid 
                examId={gradingContext.examId}
                examTitle={gradingContext.examTitle}
                classId={gradingContext.classId}
                onClose={() => { setGradingContext(null); loadDashboard(); }}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">My Examinations</h1>
                            <p className="text-muted-foreground">View scheduled tests, draft question papers, and record marks.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Exams List */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                Upcoming Tests & Exams
                            </h3>
                            {loading ? (
                                <p className="text-muted-foreground">Loading...</p>
                            ) : exams.length === 0 ? (
                                <div className="p-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                                    <p className="text-muted-foreground">You haven't scheduled any tests yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {exams.map(exam => {
                                        const cls = assignments.find(a => a.classId === exam.classId);
                                        const hasPaper = papers.some(p => p.examId === exam.id);
                                        return (
                                            <div key={exam.id} className="p-4 border border-border rounded-lg bg-background hover:border-blue-200 transition-colors flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-blue-900">{exam.title}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {cls ? cls.className : "Unknown Class"} • {new Date(exam.examDate).toLocaleDateString()}
                                                    </p>
                                                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-gray-100 rounded text-gray-700 font-mono">
                                                        {exam.examType.replace("_", " ")}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {!hasPaper ? (
                                                        <button 
                                                            onClick={() => setDesignerContext({ examId: exam.id, subjectName: cls?.subjectName || "Subject" })}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-sm font-medium transition-colors"
                                                        >
                                                            Design Paper
                                                        </button>
                                                    ) : (
                                                        <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded text-sm font-medium flex items-center gap-1 border border-green-200">
                                                            <CheckCircle className="w-4 h-4" /> Paper Drafted
                                                        </span>
                                                    )}
                                                    <button 
                                                        onClick={() => setGradingContext({ examId: exam.id, examTitle: exam.title, classId: exam.classId })}
                                                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded text-sm font-medium transition-colors flex items-center gap-1"
                                                    >
                                                        <Edit3 className="w-4 h-4" /> Marks
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Recent Drafts Tracker */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Paper Verification Status
                            </h3>
                            {loading ? (
                                <p className="text-muted-foreground">Loading...</p>
                            ) : papers.length === 0 ? (
                                <p className="text-muted-foreground">No question papers drafted yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {papers.map(paper => {
                                        const exam = exams.find(e => e.id === paper.examId);
                                        return (
                                            <div key={paper.id} className="p-4 border border-border rounded-lg bg-background flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium">{exam ? exam.title : "Unknown Exam"}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">Status Tracking</p>
                                                </div>
                                                <div>
                                                    {paper.status === 'APPROVED' && <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">APPROVED</span>}
                                                    {paper.status === 'SUBMITTED' && <span className="text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-yellow-200"><Clock className="w-3 h-3"/> PENDING ADMIN</span>}
                                                    {paper.status === 'DRAFT' && <span className="text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-bold border border-gray-200">DRAFT STAGE</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
