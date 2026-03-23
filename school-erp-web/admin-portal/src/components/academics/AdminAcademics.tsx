"use client";

import { useState, useEffect } from "react";
import { LessonPlanService, SyllabusService } from "@/lib/api";
import { ShieldCheck, CheckCircle2, Loader2, BookOpen, FileText } from "lucide-react";

export default function AdminAcademics() {
    const [pendingPlans, setPendingPlans] = useState<any[]>([]);
    const [pendingSyllabi, setPendingSyllabi] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [lp, syl] = await Promise.all([
                    LessonPlanService.getPending(),
                    SyllabusService.getPending()
                ]);
                setPendingPlans(lp);
                setPendingSyllabi(syl);
            } catch (err) {
                console.error("Failed to load pending verifications", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleVerify = async (id: string, type: 'lesson' | 'syllabus') => {
        setVerifying(id);
        try {
            if (type === 'lesson') {
                await LessonPlanService.updateStatus(id, "VERIFIED");
                setPendingPlans(pendingPlans.filter(p => p.id !== id));
            } else {
                await SyllabusService.updateStatus(id, "VERIFIED");
                setPendingSyllabi(pendingSyllabi.filter(p => p.id !== id));
            }
        } catch (err) {
            alert("Failed to verify document.");
        } finally {
            setVerifying(null);
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Lesson Plan Verification */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Lesson Plans</h3>
                            <p className="text-sm text-muted-foreground">{pendingPlans.length} pending verification</p>
                        </div>
                    </div>

                    {pendingPlans.length === 0 ? (
                        <div className="text-center py-8">
                            <ShieldCheck className="w-12 h-12 mx-auto text-emerald-200 mb-3" />
                            <p className="text-muted-foreground">All lesson plans are verified!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingPlans.map(lp => (
                                <div key={lp.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
                                    <div>
                                        <p className="font-bold text-foreground">{lp.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Uploaded by Teacher ID: {lp.teacherId}</p>
                                    </div>
                                    <button
                                        onClick={() => handleVerify(lp.id, 'lesson')}
                                        disabled={verifying === lp.id}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        {verifying === lp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Verify Plan
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Syllabus Verification */}
                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Syllabi</h3>
                            <p className="text-sm text-muted-foreground">{pendingSyllabi.length} pending verification</p>
                        </div>
                    </div>

                    {pendingSyllabi.length === 0 ? (
                        <div className="text-center py-8">
                            <ShieldCheck className="w-12 h-12 mx-auto text-emerald-200 mb-3" />
                            <p className="text-muted-foreground">All syllabi are verified!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingSyllabi.map(syl => (
                                <div key={syl.id} className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-4 rounded-lg border border-border bg-muted/20">
                                    <div>
                                        <p className="font-bold text-foreground">{syl.title}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Uploaded by Teacher ID: {syl.teacherId}</p>
                                    </div>
                                    <button
                                        onClick={() => handleVerify(syl.id, 'syllabus')}
                                        disabled={verifying === syl.id}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        {verifying === syl.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                        Verify Syllabus
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
