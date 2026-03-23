import { useState, useEffect } from "react";
import { ExamService, StudentService } from "@/lib/api";
import { ArrowLeft, Save, HelpCircle } from "lucide-react";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    rollNumber: string;
    classId?: string;
}

interface MarkRecord {
    id?: string;
    studentId: string;
    examId: string;
    normalizedScore: number;
    grade?: string;
}

export default function MarksEntryGrid({ examId, examTitle, classId, onClose }: { examId: string, examTitle: string, classId: string, onClose: () => void }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [marks, setMarks] = useState<Record<string, MarkRecord>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                // Ideally this gets students by classId in a real mapping, 
                // falling back to getAll() + filter for the mock environment
                const allStudents = await StudentService.getAll();
                // If backend does not support classId filtering yet, we might get all 
                // but let's assume we can filter by the exam's assigned class
                const classStudents = allStudents.filter((s: Student) => s.classId === classId || !s.classId); // Or adapt to real API filter
                
                const existingMarks = await ExamService.getMarksByExam(examId);
                
                const marksMap: Record<string, MarkRecord> = {};
                existingMarks.forEach((m: MarkRecord) => {
                    marksMap[m.studentId] = m;
                });
                
                // Initialize default marks for all students if empty
                classStudents.forEach((student: Student) => {
                    if (!marksMap[student.id]) {
                        marksMap[student.id] = {
                            studentId: student.id,
                            examId: examId,
                            normalizedScore: 0,
                            grade: ""
                        };
                    }
                });

                setStudents(classStudents);
                setMarks(marksMap);
            } catch (error) {
                console.error("Failed to load generic student marks grid", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [examId, classId]);

    const calculateGrade = (score: number) => {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    };

    const handleScoreChange = (studentId: string, rawValue: string) => {
        const score = parseFloat(rawValue);
        if (isNaN(score) || score < 0 || score > 100) return; // Basic validation
        
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                normalizedScore: score,
                grade: calculateGrade(score)
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Need to save each individually or add a bulk endpoint; using individual saves for now
            const savePromises = Object.values(marks).map(m => ExamService.recordMark(m as unknown as Record<string, unknown>));
            await Promise.all(savePromises);
            alert("All marks saved successfully.");
            onClose();
        } catch (error) {
            console.error("Failed to save marks", error);
            alert("Error saving some or all marks. Check the console.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="font-bold text-lg">Record Marks</h2>
                        <p className="text-xs text-muted-foreground">{examTitle}</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave} 
                    disabled={saving || loading}
                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> {saving ? "Saving Grid..." : "Save All Marks"}
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="text-sm">
                            <p className="font-bold mb-1">Standardized Mark Entry</p>
                            <p>To support AI-driven insights, please normalize all scores to a <strong>100-point scale</strong> (Percentages) regardless of the paper's actual max mark limit.</p>
                        </div>
                    </div>

                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Roll No</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Name</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Normalized Score (0-100)</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading roster...</td></tr>
                                ) : students.length === 0 ? (
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400">No students found matching this class.</td></tr>
                                ) : (
                                    students.map((student) => {
                                        const record = marks[student.id];
                                        return (
                                            <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                                                <td className="p-4 font-mono text-sm text-gray-500">{student.rollNumber || "—"}</td>
                                                <td className="p-4 font-medium">{student.firstName} {student.lastName}</td>
                                                <td className="p-4">
                                                    <div className="relative">
                                                        <input 
                                                            type="number" 
                                                            min="0" max="100"
                                                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-gray-300"
                                                            value={record?.normalizedScore || ""}
                                                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium select-none pointer-events-none">%</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm border
                                                        ${record?.grade?.startsWith('A') ? 'bg-green-50 text-green-700 border-green-200' : 
                                                          record?.grade?.startsWith('B') ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                                          record?.grade?.startsWith('C') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                                          record?.grade === 'F' ? 'bg-red-50 text-red-700 border-red-200' : 
                                                          'bg-gray-50 text-gray-500 border-gray-200'}
                                                    `}>
                                                        {record?.grade || "—"}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
