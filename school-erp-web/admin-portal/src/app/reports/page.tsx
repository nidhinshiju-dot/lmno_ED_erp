"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { BarChart3, Download, FileText } from "lucide-react";

type ReportType = "attendance" | "exam" | "student" | "";

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<ReportType>("");

    const reports = [
        { type: "attendance" as ReportType, icon: BarChart3, title: "Attendance Report", desc: "Daily, weekly, monthly attendance summaries by class/section.", color: "bg-blue-50 text-blue-600 border-blue-200" },
        { type: "exam" as ReportType, icon: FileText, title: "Exam Results Report", desc: "Student-wise marks, grades, rankings, and class performance.", color: "bg-purple-50 text-purple-600 border-purple-200" },
        { type: "student" as ReportType, icon: BarChart3, title: "Student Report", desc: "Individual student performance, attendance, and fee summary.", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
            <Header title="Reports" />
            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Reports & Analytics</h2>
                        <p className="text-muted-foreground mt-1">Generate and export reports for attendance, exams, and students.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {reports.map(r => (
                            <button key={r.type} onClick={() => setSelectedReport(r.type)} className={`p-6 rounded-xl border text-left transition-all hover:shadow-md ${selectedReport === r.type ? "ring-2 ring-primary" : ""} ${r.color}`}>
                                <r.icon className="w-8 h-8 mb-3" />
                                <h3 className="font-bold mb-1">{r.title}</h3>
                                <p className="text-xs opacity-70">{r.desc}</p>
                            </button>
                        ))}
                    </div>

                    {selectedReport && (
                        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                            <h3 className="font-bold text-lg">
                                {selectedReport === "attendance" && "Attendance Report"}
                                {selectedReport === "exam" && "Exam Results Report"}
                                {selectedReport === "student" && "Student Report"}
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {selectedReport === "attendance" && (
                                    <>
                                        <div><label className="text-sm font-medium mb-1 block">Period</label>
                                            <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                                <option>Daily</option><option>Weekly</option><option>Monthly</option>
                                            </select>
                                        </div>
                                        <div><label className="text-sm font-medium mb-1 block">From Date</label>
                                            <input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                        <div><label className="text-sm font-medium mb-1 block">To Date</label>
                                            <input type="date" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                        </div>
                                    </>
                                )}
                                {selectedReport === "exam" && (
                                    <>
                                        <div><label className="text-sm font-medium mb-1 block">Exam</label>
                                            <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                                <option>All Exams</option><option>Mid-Term</option><option>Final</option>
                                            </select>
                                        </div>
                                        <div><label className="text-sm font-medium mb-1 block">Class</label>
                                            <select className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                                <option>All Classes</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {selectedReport === "student" && (
                                    <div className="col-span-2"><label className="text-sm font-medium mb-1 block">Student Name / ID</label>
                                        <input type="text" placeholder="Search student..." className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                                    <BarChart3 className="w-4 h-4" /> Generate Report
                                </button>
                                <button className="border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium text-sm">
                                    <Download className="w-4 h-4" /> Export PDF
                                </button>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-8 text-center text-muted-foreground text-sm">
                                <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                                Select parameters and click &quot;Generate Report&quot; to view results.
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
