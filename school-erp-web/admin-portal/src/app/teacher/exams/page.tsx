"use client";

import { useState, useEffect } from "react";
import { ExamService, ClassService, SubjectService } from "@/lib/api";
import { FileText, ChevronRight, AlertCircle, Edit } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

export default function TeacherExamsPage() {
    const { user, isAuthenticated } = useAuth();
    const [exams, setExams] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            loadData();
        }
    }, [isAuthenticated, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [examsData, classesData, subjectsData] = await Promise.all([
                ExamService.getByTeacher(user!.id),
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

    const getClassName = (id: string) => classes.find(c => c.id === id)?.name || id;
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case "SCHEDULED":
                return <span className="px-2 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-md text-xs font-bold w-fit">SCHEDULED</span>;
            case "COMPLETED":
                return <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-xs font-bold w-fit">GRADING</span>;
            case "RESULTS_PUBLISHED":
                return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold w-fit">PUBLISHED</span>;
            default:
                return <span className="px-2 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-bold w-fit">{status}</span>;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-y-auto p-6 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-800">My Required Grading</h1>
                    <p className="text-sm text-slate-500 mt-1">Exams assigned to your classes and subjects.</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-sm text-blue-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                    <p>Enter and save marks for your students. Once you are done, the admin will verify and publish the final results.</p>
                </div>

                {loading ? (
                    <div className="py-12 text-center text-slate-500">Loading your assigned exams...</div>
                ) : exams.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="font-bold text-slate-800">No Exams Found</h3>
                        <p className="text-sm text-slate-500 mt-1">There are no exams scheduled for your assigned subjects.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {exams.map(exam => (
                            <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <StatusBadge status={exam.status} />
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-1">{exam.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mb-4">
                                    {getClassName(exam.classId)} • {getSubjectName(exam.subjectId)}
                                </p>
                                <div className="mt-auto space-y-3">
                                    <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                                        <span className="text-slate-400">Date</span>
                                        <span className="font-medium text-slate-700">{exam.examDate ? new Date(exam.examDate).toLocaleDateString("en-IN") : "TBA"}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Max Marks</span>
                                        <span className="font-medium text-slate-700">{exam.totalMarks}</span>
                                    </div>
                                </div>
                                <Link 
                                    href={`/teacher/exams/${exam.id}`}
                                    className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition group"
                                >
                                    {exam.status === "RESULTS_PUBLISHED" ? <FileText className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                                    {exam.status === "RESULTS_PUBLISHED" ? "View Results" : "Enter Marks"}
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
