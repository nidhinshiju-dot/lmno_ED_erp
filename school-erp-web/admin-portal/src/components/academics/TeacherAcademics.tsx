"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { TeacherAssignmentService, LessonPlanService, SyllabusService } from "@/lib/api";
import { BookOpen, FileText, Upload, Download, Loader2, Copy } from "lucide-react";

export default function TeacherAcademics() {
    const { user } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [lessonPlans, setLessonPlans] = useState<any[]>([]);
    const [syllabi, setSyllabi] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [uploading, setUploading] = useState<{ id: string, type: 'lesson' | 'syllabus' } | null>(null);

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            try {
                // To fetch the assignments via userId
                const assignmentsData = await TeacherAssignmentService.getMyAssignments(user.id);
                setAssignments(assignmentsData);
                
                // If the user has a staff profile associated, get their uploaded docs
                const firstAssignment = assignmentsData[0];
                if (firstAssignment && firstAssignment.teacherId) {
                    const [lp, syl] = await Promise.all([
                        LessonPlanService.getByTeacher(firstAssignment.teacherId),
                        SyllabusService.getByTeacher(firstAssignment.teacherId)
                    ]);
                    setLessonPlans(lp);
                    setSyllabi(syl);
                }
            } catch (err) {
                console.error("Failed to load teacher academics data", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleUpload = async (assignment: any, type: 'lesson' | 'syllabus') => {
        // Prompt for title
        const title = prompt(`Enter a title for this new ${type === 'lesson' ? 'Lesson Plan' : 'Syllabus'}:\ne.g., "Term 1 Syllabus"`);
        if (!title) return;

        setUploading({ id: assignment.id, type });
        try {
            const payload = {
                teacherId: assignment.teacherId,
                classSubjectTeacherId: assignment.id,
                title: title,
                contentUrl: "pending-upload.pdf",
                status: "PENDING"
            };

            if (type === 'lesson') {
                const res = await LessonPlanService.create(payload);
                setLessonPlans([...lessonPlans, res]);
            } else {
                const res = await SyllabusService.create(payload);
                setSyllabi([...syllabi, res]);
            }
        } catch (err) {
            alert("Failed to upload document");
        } finally {
            setUploading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Assignments & Uploads */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 overflow-hidden">
                    <h3 className="text-xl font-bold mb-4">My Assigned Classes</h3>
                    {assignments.length === 0 ? (
                        <p className="text-muted-foreground">You are not assigned to any classes currently.</p>
                    ) : (
                        <div className="space-y-4">
                            {assignments.map(a => (
                                <div key={a.id} className="border border-border p-4 rounded-lg hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-lg">{a.className}</h4>
                                            <p className="text-muted-foreground text-sm">{a.subjectName} • {a.periodsPerWeek} periods/week</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleUpload(a, 'lesson')}
                                            disabled={uploading?.id === a.id}
                                            className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors border border-blue-200"
                                        >
                                            {uploading?.id === a.id && uploading?.type === 'lesson' ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                                            Upload Lesson Plan
                                        </button>
                                        <button 
                                            onClick={() => handleUpload(a, 'syllabus')}
                                            disabled={uploading?.id === a.id}
                                            className="flex-1 flex justify-center items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-sm font-medium transition-colors border border-purple-200"
                                        >
                                            {uploading?.id === a.id && uploading?.type === 'syllabus' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                            Upload Syllabus
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Uploads Tracker */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 overflow-hidden">
                    <h3 className="text-xl font-bold mb-4">My Uploads Tracker</h3>
                    <div className="space-y-6">
                        {/* Lesson Plans */}
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" /> Lesson Plans ({lessonPlans.length})
                            </h4>
                            {lessonPlans.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No lesson plans uploaded yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {lessonPlans.map(lp => (
                                        <li key={lp.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-muted/30">
                                            <div>
                                                <p className="font-medium text-sm">{lp.title}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${lp.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {lp.status}
                                                </span>
                                            </div>
                                            <button className="text-muted-foreground hover:text-primary transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Syllabi */}
                        <div>
                            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" /> Syllabi ({syllabi.length})
                            </h4>
                            {syllabi.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No syllabi uploaded yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {syllabi.map(syl => (
                                        <li key={syl.id} className="flex justify-between items-center p-3 border border-border rounded-md bg-muted/30">
                                            <div>
                                                <p className="font-medium text-sm">{syl.title}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${syl.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {syl.status}
                                                </span>
                                            </div>
                                            <button className="text-muted-foreground hover:text-primary transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
