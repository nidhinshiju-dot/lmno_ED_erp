"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ExamService, QuestionPaperService, StaffService } from "@/lib/api";
import { CheckCircle, Clock, Eye, Printer, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import ExamTimetableBuilder from "@/components/examinations/ExamTimetableBuilder";

export default function AdminExaminationsPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    
    const [pendingPapers, setPendingPapers] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isTimetableOpen, setIsTimetableOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            loadDashboard();
        } else if (!isAuthenticated && user === null) {
            // Optional: redirect to login if strictly evaluating auth state
        }
    }, [isAuthenticated, user]);

    const loadDashboard = async () => {
        setLoading(true);
        try {
            const [papersData, examsData, staffData] = await Promise.all([
                QuestionPaperService.getPending(),
                ExamService.getAll(),
                StaffService.getAll()
            ]);
            setPendingPapers(papersData);
            setExams(examsData);
            setStaff(staffData);
        } catch (error) {
            console.error("Failed to load admin exam data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprovePaper = async (paperId: string) => {
        try {
            await QuestionPaperService.updateStatus(paperId, "APPROVED");
            loadDashboard();
        } catch (e) {
            alert("Failed to approve paper.");
        }
    };

    if (isTimetableOpen) {
        return <ExamTimetableBuilder onClose={() => setIsTimetableOpen(false)} />;
    }

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Examinations Control Center</h1>
                            <p className="text-muted-foreground">Verify question papers, build timetables, and print exam templates.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Question Paper Verification */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Action Required: Question Papers
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">The following papers were submitted by teachers and require your approval and printing.</p>
                            
                            {loading ? (
                                <p className="text-muted-foreground">Loading...</p>
                            ) : pendingPapers.length === 0 ? (
                                <div className="p-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                                    <p className="text-muted-foreground">No pending question papers.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingPapers.map(paper => {
                                        const exam = exams.find(e => e.id === paper.examId);
                                        const teacher = staff.find(s => s.id === paper.teacherId);
                                        return (
                                            <div key={paper.id} className="p-4 border border-border rounded-lg bg-background hover:border-amber-200 transition-colors flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-amber-900">{exam?.title || "Unknown Exam"}</h4>
                                                    <p className="text-sm text-muted-foreground mt-1">Submitted by: <span className="font-medium">{teacher?.name || "Unknown"}</span></p>
                                                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-amber-50 border border-amber-200 rounded text-amber-700 font-bold">
                                                        NEEDS REVIEW
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button 
                                                        onClick={() => router.push(`/examinations/admin/print/${paper.id}`)}
                                                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <Printer className="w-4 h-4" /> Print Engine
                                                    </button>
                                                    <button 
                                                        onClick={() => handleApprovePaper(paper.id)}
                                                        className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" /> Approve
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Exam Timetable Hub */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-indigo-500" />
                                Exam Timetables
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">View and schedule exams for different classes.</p>
                            
                            <div className="p-8 text-center bg-indigo-50/50 rounded-lg border border-dashed border-indigo-200">
                                <Calendar className="w-8 h-8 text-indigo-300 mx-auto mb-3" />
                                <h4 className="font-medium text-indigo-900">Timetable Builder</h4>
                                <p className="text-sm text-indigo-600/80 mt-1 mb-4">Select a class to manage its formal examination schedule.</p>
                                <button onClick={() => setIsTimetableOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm font-medium hover:bg-indigo-700 transition">
                                    Exam Timetable Builder
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
