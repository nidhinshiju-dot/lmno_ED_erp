import { useState, useEffect } from "react";
import { ExamService, ClassService, ClassSubjectTeacherService } from "@/lib/api";
import { ArrowLeft, Save, Calendar as CalendarIcon, Clock, Trash2 } from "lucide-react";

export default function ExamTimetableBuilder({ onClose }: { onClose: () => void }) {
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [exams, setExams] = useState<any[]>([]);
    const [timetables, setTimetables] = useState<any[]>([]);
    const [classSubjects, setClassSubjects] = useState<any[]>([]);
    
    // Form State for Admin defining Exam + Timetable
    const [newSchedule, setNewSchedule] = useState({ 
        title: "", subjectTeacher: "", examType: "MIDTERM", 
        date: "", startTime: "", endTime: "" 
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        ClassService.getAll().then(setClasses).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedClassId) {
            setExams([]);
            setTimetables([]);
            return;
        }

        const loadClassDetails = async () => {
            setLoading(true);
            try {
                // Fetch the subjects/teachers mapped to this class, plus existing exams and timetables
                // NOTE: Using a generic fetch for class-subject-teachers if not exposed well in stub, but assuming it exists
                const [clsExams, clsTimetables, clsSubjects] = await Promise.all([
                    ExamService.getByClass(selectedClassId),
                    ExamService.getTimetableByClass(selectedClassId),
                    ClassSubjectTeacherService.getByClass(selectedClassId).catch(() => [])
                ]);
                setExams(clsExams);
                setTimetables(clsTimetables);
                setClassSubjects(Array.isArray(clsSubjects) ? clsSubjects : []);
            } catch (error) {
                console.error("Failed to load class timetables", error);
            } finally {
                setLoading(false);
            }
        };
        loadClassDetails();
    }, [selectedClassId]);

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const [subjectId, teacherId] = newSchedule.subjectTeacher.split("|");
            
            // 1. Admin Creates the Exam Record
            const createdExam = await ExamService.create({
                title: newSchedule.title,
                classId: selectedClassId,
                subjectId: subjectId,
                teacherId: teacherId,
                examDate: newSchedule.date + "T00:00:00Z",
                examType: newSchedule.examType,
                status: "SCHEDULED"
            });

            // 2. Admin Locks the Timetable
            await ExamService.schedule({
                classId: selectedClassId,
                examId: createdExam.id,
                date: newSchedule.date + "T00:00:00Z",
                startTime: newSchedule.startTime + ":00", 
                endTime: newSchedule.endTime + ":00"
            });
            
            alert("Exam Created & Scheduled Successfully!");
            
            // Refresh
            const [refreshExams, refreshTT] = await Promise.all([
                ExamService.getByClass(selectedClassId),
                ExamService.getTimetableByClass(selectedClassId)
            ]);
            setExams(refreshExams);
            setTimetables(refreshTT);
            setNewSchedule({ title: "", subjectTeacher: "", examType: "MIDTERM", date: "", startTime: "", endTime: "" });
        } catch (error) {
            console.error("Failed to create/schedule exam", error);
            alert("Failed to schedule exam. Check console.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (ttId: string, examId: string) => {
        if (!confirm("Are you sure you want to completely cancel and remove this exam?")) return;
        try {
            await ExamService.deleteTimetable(ttId);
            if (examId) {
                await ExamService.delete(examId).catch(() => console.log("Exam might already be deleted or restricted"));
            }
            
            // Refresh
            const [refreshExams, refreshTT] = await Promise.all([
                ExamService.getByClass(selectedClassId),
                ExamService.getTimetableByClass(selectedClassId)
            ]);
            setExams(refreshExams);
            setTimetables(refreshTT);
        } catch (error) {
            alert("Delete failed.");
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
                        <h2 className="font-bold text-lg">Exam Timetable Builder</h2>
                        <p className="text-xs text-muted-foreground">Schedule formal examinations for classes</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Panel - Class Selection & Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white border rounded-xl shadow-sm p-5">
                            <label className="text-sm font-bold text-gray-700 block mb-2">1. Select Class</label>
                            <select 
                                value={selectedClassId} 
                                onChange={(e) => setSelectedClassId(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Choose a class...</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.branch ? `(${c.branch})` : ''} {c.roomNumber ? `- Div ${c.roomNumber}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedClassId && (
                            <div className="bg-white border rounded-xl shadow-sm p-5">
                                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-indigo-500" /> 
                                    2. Create & Schedule Exam
                                </h3>
                                
                                <form onSubmit={handleSchedule} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Exam Title</label>
                                        <input required type="text" placeholder="e.g. Term 1 Finals" value={newSchedule.title} onChange={e => setNewSchedule({...newSchedule, title: e.target.value})} className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase">Subject</label>
                                        <select required value={newSchedule.subjectTeacher} onChange={e => setNewSchedule({...newSchedule, subjectTeacher: e.target.value})} className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                                            <option value="">Select subject via mapped teacher...</option>
                                            {classSubjects.map(cs => (
                                                <option key={cs.id} value={`${cs.subjectId}|${cs.teacherId}`}>
                                                    {cs.subjectName} (Teacher: {cs.teacherName})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                                            <select required value={newSchedule.examType} onChange={e => setNewSchedule({...newSchedule, examType: e.target.value})} className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                                                <option value="SUDDEN_TEST">Sudden Test</option>
                                                <option value="UNIT_TEST">Unit Test</option>
                                                <option value="MIDTERM">Midterm</option>
                                                <option value="FINAL">Final</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Exam Date</label>
                                            <input required type="date" value={newSchedule.date} onChange={e => setNewSchedule({...newSchedule, date: e.target.value})} className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Start Time</label>
                                            <input required type="time" value={newSchedule.startTime} onChange={e => setNewSchedule({...newSchedule, startTime: e.target.value})} className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">End Time</label>
                                            <input required type="time" value={newSchedule.endTime} onChange={e => setNewSchedule({...newSchedule, endTime: e.target.value})} className="w-full mt-1 bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                                        </div>
                                    </div>
                                    <button disabled={saving} type="submit" className="w-full mt-2 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 shadow-sm disabled:opacity-50">
                                        <Save className="w-4 h-4" /> {saving ? "Saving..." : "Create & Deploy Exam"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Timetable View */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="px-6 py-4 border-b bg-gray-50/50 flex items-center justify-between">
                                <h3 className="font-bold flex items-center gap-2">
                                    <CalendarIcon className="w-5 h-5 text-indigo-500" /> 
                                    Class Timetable
                                </h3>
                            </div>
                            
                            <div className="p-6 flex-1 overflow-y-auto">
                                {!selectedClassId ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <CalendarIcon className="w-12 h-12 mb-4 opacity-20" />
                                        <p>Select a class on the left to view or build its timetable.</p>
                                    </div>
                                ) : loading ? (
                                    <p className="text-center text-gray-500 mt-10">Loading timetable...</p>
                                ) : timetables.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-10">
                                        <p>No exams scheduled for this class yet.</p>
                                        <p className="text-sm mt-2">Use the scheduling form to start building.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {timetables.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(tt => {
                                            const exam = exams.find(e => e.id === tt.examId);
                                            return (
                                                <div key={tt.id} className="flex items-center gap-4 p-4 border rounded-lg hover:border-indigo-200 transition-colors bg-white group shadow-sm">
                                                    <div className="bg-indigo-50 text-indigo-700 rounded-lg p-3 text-center flex-shrink-0 min-w-20 border border-indigo-100">
                                                        <p className="text-xs font-bold uppercase">{new Date(tt.date).toLocaleDateString('en-US', { month: 'short' })}</p>
                                                        <p className="text-xl font-black">{new Date(tt.date).getDate()}</p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-lg">{exam?.title || "Deleted Exam"}</h4>
                                                        <div className="flex items-center gap-2 mt-1 text-sm font-medium text-gray-500">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {tt.startTime.substring(0,5)} - {tt.endTime.substring(0,5)}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button title="Cancel Exam" onClick={() => handleDelete(tt.id, tt.examId)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
