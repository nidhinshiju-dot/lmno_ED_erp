"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QuestionPaperService, ExamService, StaffService } from "@/lib/api";
import { Printer, ArrowLeft, CheckCircle, LayoutTemplate } from "lucide-react";

export default function AdminPrintCenterPage() {
    const params = useParams();
    const router = useRouter();
    const paperId = params.paperId as string;

    const [paper, setPaper] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [teacher, setTeacher] = useState<any>(null);
    
    // Default Template 1
    const [templateId, setTemplateId] = useState<number>(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const pData = await QuestionPaperService.getById(paperId);
                setPaper(pData);
                if (pData.printTemplateId) {
                    setTemplateId(pData.printTemplateId);
                }

                if (pData.examId) {
                    const eData = await ExamService.getById(pData.examId);
                    setExam(eData);
                }
                if (pData.teacherId) {
                    const allStaff = await StaffService.getAll();
                    setTeacher(allStaff.find((s: any) => s.id === pData.teacherId));
                }
            } catch (err) {
                console.error("Failed to load paper for printing", err);
            } finally {
                setLoading(false);
            }
        };
        if (paperId) load();
    }, [paperId]);

    const handlePrint = () => {
        window.print();
    };

    const handleApprove = async () => {
        try {
            await QuestionPaperService.updateStatus(paperId, "APPROVED", templateId);
            alert("Template saved and Paper Approved!");
            // Update local state to reflect approved status
            setPaper({ ...paper, status: "APPROVED", printTemplateId: templateId });
        } catch (err) {
            alert("Failed to approve paper.");
        }
    };

    if (loading) return <div className="p-12 text-center text-muted-foreground">Loading Print Engine...</div>;
    if (!paper) return <div className="p-12 text-center text-red-500">Error: Question Paper not found.</div>;

    let questions = [];
    try {
        questions = JSON.parse(paper.contentData);
    } catch {
        // Leave empty
    }

    const schoolName = "LMNO International Academy"; // Configurable in the future
    const totalMarks = questions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0);

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-100 print:bg-white print:h-auto print:overflow-visible">
            
            {/* NO-PRINT: Admin Toolbar Controls */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10 print:hidden shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <Printer className="w-5 h-5 text-indigo-500" />
                            Print Center & Template Engine
                        </h2>
                        <p className="text-xs text-muted-foreground">Adjust templates before finalizing print for {exam?.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 mr-4">
                        <LayoutTemplate className="w-4 h-4 text-gray-500 ml-2" />
                        <span className="text-sm font-medium text-gray-600">Template Style:</span>
                        <select 
                            value={templateId} 
                            onChange={(e) => setTemplateId(Number(e.target.value))}
                            className="bg-white border border-gray-300 rounded text-sm px-2 py-1 focus:ring-1 focus:ring-indigo-500 outline-none"
                        >
                            <option value={1}>Modern Center Aligned</option>
                            <option value={2}>Classic Underlined</option>
                            <option value={3}>Minimalist Corporate</option>
                            <option value={4}>Boxed Heavy Borders</option>
                        </select>
                    </div>

                    {paper.status !== 'APPROVED' && (
                        <button onClick={handleApprove} className="px-4 py-2 border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                            <CheckCircle className="w-4 h-4" /> Approve & Save Template
                        </button>
                    )}
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                        <Printer className="w-4 h-4" /> Print PDF (A4)
                    </button>
                </div>
            </div>

            {/* PRINT CANVAS (A4 Sized Frame in UI, Full fluid in print mode) */}
            <div className="flex-1 overflow-y-auto p-8 print:p-0 flex justify-center bg-gray-100 print:bg-white">
                <div className="bg-white w-[210mm] min-h-[297mm] shadow-[0_0_15px_rgba(0,0,0,0.1)] print:shadow-none bg-white p-[20mm] print:p-0 print:m-0 mx-auto relative overflow-hidden flex flex-col">
                    
                    {/* Render Selected Header Template */}

                    {/* TEMPLATE 1: Modern Center Aligned */}
                    {templateId === 1 && (
                        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6 w-full shrink-0">
                            <h1 className="text-3xl font-black uppercase tracking-wider text-gray-900 mb-1">{schoolName}</h1>
                            <p className="text-sm text-gray-600 font-medium mb-4 tracking-widest uppercase">{exam?.examType?.replace("_", " ")} EXAMINATIONS</p>
                            
                            <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                                <div className="text-left">
                                    <p className="font-bold text-gray-800 text-lg">{exam?.title}</p>
                                    <p className="text-xs text-gray-500 mt-1 uppercase">Date: {new Date(exam?.examDate || Date.now()).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded">Time: 2 Hours</p>
                                    <p className="font-bold text-indigo-700 mt-2">Max Marks: {totalMarks}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TEMPLATE 2: Classic Underlined */}
                    {templateId === 2 && (
                        <div className="mb-8 w-full shrink-0 font-serif">
                            <h1 className="text-4xl font-bold italic text-center text-gray-800 mb-3">{schoolName}</h1>
                            <div className="border-b-4 border-double border-gray-800 w-full mb-4"></div>
                            <div className="flex justify-between text-sm font-bold pb-2 border-b border-gray-400">
                                <div>CLASS: <span className="uppercase">{exam?.title}</span></div>
                                <div>MARKS: {totalMarks}</div>
                            </div>
                            <div className="flex justify-between text-sm italic mt-2">
                                <div>Date: {new Date(exam?.examDate || Date.now()).toLocaleDateString()}</div>
                                <div>{exam?.examType?.replace("_", " ")}</div>
                            </div>
                        </div>
                    )}

                    {/* TEMPLATE 3: Minimalist Corporate */}
                    {templateId === 3 && (
                        <div className="mb-10 w-full shrink-0 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-light text-gray-900 tracking-tight">{schoolName}</h1>
                                <p className="text-sm text-gray-500 font-medium mt-1 uppercase">{exam?.title}</p>
                            </div>
                            <div className="text-right border-l-2 border-gray-200 pl-4">
                                <p className="text-xs font-bold text-gray-400 tracking-widest mb-1">E X A M R E C O R D</p>
                                <p className="text-sm font-medium">Marks: {totalMarks}</p>
                                <p className="text-sm text-gray-500">{new Date(exam?.examDate || Date.now()).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}

                    {/* TEMPLATE 4: Boxed Heavy Borders */}
                    {templateId === 4 && (
                        <div className="mb-8 w-full shrink-0 border-4 border-gray-900 p-4 bg-gray-50/50 relative">
                            <div className="absolute top-0 right-0 bg-gray-900 text-white text-xs font-bold px-3 py-1 uppercase">{exam?.examType?.replace("_", " ")}</div>
                            <h1 className="text-2xl font-black text-center text-gray-900 uppercase tracking-widest">{schoolName}</h1>
                            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-900 pt-4">
                                <div>
                                    <p className="text-xs font-bold uppercase text-gray-500">Subject / Title</p>
                                    <p className="font-bold text-gray-900">{exam?.title}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold uppercase text-gray-500">Maximum Marks</p>
                                    <p className="font-bold text-gray-900">{totalMarks}</p>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Question Rendering */}
                    <div className="flex-1 space-y-6">
                        {questions.map((q: any, idx: number) => (
                            <div key={idx} className="flex gap-4 break-inside-avoid">
                                <span className={`font-bold shrink-0 ${templateId === 2 ? 'font-serif' : ''}`}>Q{idx+1}.</span>
                                <div className="flex-1">
                                    <p className={`text-base text-gray-900 leading-relaxed ${templateId === 3 ? 'font-light text-gray-800' : ''}`}>{q.text}</p>
                                    
                                    {/* Whitespace for written answers (only rendered on print logically) */}
                                    {q.type === 'SHORT_ANSWER' && <div className="mt-6 mb-2 border-b border-dashed border-gray-300 w-3/4"></div>}
                                    {q.type === 'LONG_ANSWER' && (
                                        <div className="space-y-6 mt-6 mb-4">
                                            <div className="border-b border-gray-300 w-full"></div>
                                            <div className="border-b border-gray-300 w-full"></div>
                                            <div className="border-b border-gray-300 w-full"></div>
                                        </div>
                                    )}
                                </div>
                                <div className="font-mono text-sm font-bold text-gray-500 shrink-0">
                                    [{q.marks}]
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Print Footer */}
                    <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 font-medium shrink-0 print:break-inside-avoid">
                        *** END OF EXAMINATION PAPER *** <br/>
                        <span className="mt-1 inline-block">Ref: {paperId.split("-")[0]} - Printed via LMNO ERP</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
