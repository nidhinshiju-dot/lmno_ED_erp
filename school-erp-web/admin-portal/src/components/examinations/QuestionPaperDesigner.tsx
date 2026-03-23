import { useState, useEffect } from "react";
import { QuestionPaperService } from "@/lib/api";
import { ArrowLeft, Save, Send, Plus, Trash2 } from "lucide-react";

interface Question {
    text: string;
    marks: number;
    type: "SHORT_ANSWER" | "LONG_ANSWER" | "MULTIPLE_CHOICE";
    options?: string[]; // For multiple choice
}

export default function QuestionPaperDesigner({ examId, teacherId, subjectName, onClose }: { examId: string, teacherId: string, subjectName: string, onClose: () => void }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [saving, setSaving] = useState(false);
    
    // Existing paper tracking
    const [paperId, setPaperId] = useState<string | null>(null);
    const [status, setStatus] = useState("DRAFT");

    useEffect(() => {
        // Soft load if pre-existing
        QuestionPaperService.getByExam(examId)
            .then(data => {
                if (data && data.length > 0) {
                    const paper = data[0];
                    setPaperId(paper.id);
                    setStatus(paper.status);
                    if (paper.contentData) {
                        try {
                            setQuestions(JSON.parse(paper.contentData));
                        } catch (e) {
                            console.error("Failed to parse paper data");
                        }
                    }
                }
            })
            .catch(() => {}); // ignore 404s
    }, [examId]);

    const addQuestion = () => {
        setQuestions([...questions, { text: "", marks: 5, type: "SHORT_ANSWER" }]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const handleSave = async (submitForReview: boolean = false) => {
        if (questions.length === 0) {
            alert("Cannot save an empty question paper.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                examId,
                teacherId,
                contentData: JSON.stringify(questions),
                status: submitForReview ? "SUBMITTED" : "DRAFT"
            };

            await QuestionPaperService.save(payload);
            alert(submitForReview ? "Question paper submitted to admin for verification!" : "Draft saved successfully.");
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save question paper.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Header Toolbar */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg">Design Question Paper</h2>
                        <p className="text-xs text-muted-foreground">Subject: {subjectName} • Status: {status}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => handleSave(false)} 
                        disabled={saving || status === 'APPROVED'}
                        className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button 
                        onClick={() => handleSave(true)} 
                        disabled={saving || status === 'APPROVED' || status === 'SUBMITTED'}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" /> Submit for Verification
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-y-auto p-8 relative">
                <div className="max-w-3xl mx-auto space-y-6">
                    {questions.map((q, idx) => (
                        <div key={idx} className="bg-white border rounded-xl p-6 shadow-sm group">
                            <div className="flex justify-between items-start mb-4">
                                <span className="font-mono text-sm text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">Q{idx + 1}</span>
                                <button onClick={() => removeQuestion(idx)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <textarea 
                                autoFocus
                                value={q.text}
                                onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                                placeholder="Type your question here..."
                                className="w-full text-lg focus:outline-none resize-none border-b border-dashed border-gray-300 pb-2 focus:border-indigo-400 placeholder:text-gray-300 mb-4"
                                rows={2}
                            />
                            
                            <div className="flex gap-4 items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-gray-500">FORMAT</label>
                                    <select 
                                        className="text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400"
                                        value={q.type}
                                        onChange={(e) => updateQuestion(idx, 'type', e.target.value)}
                                    >
                                        <option value="SHORT_ANSWER">Short Answer (Lines)</option>
                                        <option value="LONG_ANSWER">Long Answer (Block)</option>
                                        <option value="MULTIPLE_CHOICE">Multiple Choice (MCQ)</option>
                                    </select>
                                </div>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs font-semibold text-gray-500">MARKS</label>
                                    <input 
                                        type="number" 
                                        min="1" max="100"
                                        className="w-16 text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400"
                                        value={q.marks}
                                        onChange={(e) => updateQuestion(idx, 'marks', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>
                            
                            {/* Preview render based on type */}
                            {q.type === 'SHORT_ANSWER' && <div className="mt-4 border-b-2 border-gray-100 h-8 w-full block ml-4"></div>}
                            {q.type === 'LONG_ANSWER' && <div className="mt-4 border border-gray-100 bg-gray-50 rounded-lg h-24 w-full block"></div>}
                        </div>
                    ))}

                    <button 
                        onClick={addQuestion}
                        className="w-full py-4 border-2 border-dashed border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 font-medium bg-white shadow-sm"
                    >
                        <Plus className="w-5 h-5" /> Add Question Block
                    </button>
                    
                    {questions.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            Start designing your paper by adding the first question block above.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
