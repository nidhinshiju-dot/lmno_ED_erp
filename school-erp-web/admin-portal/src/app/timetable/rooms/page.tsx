"use client";

import { useState, useEffect } from "react";
import { RoomService, SubjectService } from "@/lib/api";
import { Plus, Trash2, Building2, FlaskConical, Download } from "lucide-react";
import { generateFlowPDF } from "@/lib/pdfGenerator";

interface RoomType { id: string; typeName: string; }
interface Room { id: string; roomName: string; roomTypeId: string; capacity: number; building: string; floor: string; isActive: boolean; }
interface Requirement { id: string; subjectId: string; roomTypeId: string; isRequired: boolean; }
interface LabGroup { id: string; name: string; roomIds: string[]; }
interface LabGroupReq { id: string; subjectId: string; labGroupId: string; }
interface Subject { id: string; name: string; code: string; }

export default function RoomsPage() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [labGroups, setLabGroups] = useState<LabGroup[]>([]);
    const [labGroupReqs, setLabGroupReqs] = useState<LabGroupReq[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"rooms" | "types" | "groups" | "requirements">("rooms");
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [showReqForm, setShowReqForm] = useState(false);
    const [newRoom, setNewRoom] = useState({ roomName: "", roomTypeId: "", capacity: 40, building: "", floor: "" });
    const [newType, setNewType] = useState({ typeName: "" });
    const [newGroup, setNewGroup] = useState<{name: string, roomIds: string[]}>({ name: "", roomIds: [] });
    const [reqType, setReqType] = useState<"type" | "group">("type");
    const [newReq, setNewReq] = useState({ subjectId: "", roomTypeId: "", isRequired: true });
    const [newGroupReq, setNewGroupReq] = useState({ subjectId: "", labGroupId: "" });

    useEffect(() => {
        const load = async () => {
            try {
                const [rt, r, req, sub, lg, lgr] = await Promise.all([
                    RoomService.getRoomTypes(), RoomService.getAll(),
                    RoomService.getRequirements(), SubjectService.getAll(),
                    RoomService.getLabGroups(), RoomService.getLabGroupRequirements()
                ]);
                setRoomTypes(rt); setRooms(r); setRequirements(req); setSubjects(sub);
                setLabGroups(lg); setLabGroupReqs(lgr);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, []);

    const handleCreateType = async (e: React.FormEvent) => {
        e.preventDefault();
        const created = await RoomService.createRoomType(newType);
        setRoomTypes([...roomTypes, created]);
        setShowTypeForm(false);
        setNewType({ typeName: "" });
    };

    const handleDeleteType = async (id: string) => {
        if (!confirm("Delete this room type?")) return;
        await RoomService.deleteRoomType(id);
        setRoomTypes(roomTypes.filter(t => t.id !== id));
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        const created = await RoomService.create(newRoom);
        setRooms([...rooms, created]);
        setShowRoomForm(false);
        setNewRoom({ roomName: "", roomTypeId: "", capacity: 40, building: "", floor: "" });
    };

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Delete this room?")) return;
        await RoomService.delete(id);
        setRooms(rooms.filter(r => r.id !== id));
    };

    const handleCreateReq = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reqType === "type") {
            const created = await RoomService.createRequirement(newReq);
            setRequirements([...requirements, created]);
        } else {
            const created = await RoomService.createLabGroupRequirement(newGroupReq);
            setLabGroupReqs([...labGroupReqs, created]);
        }
        setShowReqForm(false);
        setNewReq({ subjectId: "", roomTypeId: "", isRequired: true });
        setNewGroupReq({ subjectId: "", labGroupId: "" });
    };

    const handleDeleteReq = async (id: string, isGroup: boolean) => {
        if (isGroup) {
            await RoomService.deleteLabGroupRequirement(id);
            setLabGroupReqs(labGroupReqs.filter(r => r.id !== id));
        } else {
            await RoomService.deleteRequirement(id);
            setRequirements(requirements.filter(r => r.id !== id));
        }
    };

    const handleCreateLabGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        const created = await RoomService.createLabGroup(newGroup);
        setLabGroups([...labGroups, created]);
        setShowGroupForm(false);
        setNewGroup({ name: "", roomIds: [] });
    };

    const handleDeleteLabGroup = async (id: string) => {
        if (!confirm("Delete this Lab Group?")) return;
        await RoomService.deleteLabGroup(id);
        setLabGroups(labGroups.filter(g => g.id !== id));
    };

    const getTypeName = (id: string) => roomTypes.find(t => t.id === id)?.typeName || id;
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;
    const getRoomName = (id: string) => rooms.find(r => r.id === id)?.roomName || id;
    const getGroupName = (id: string) => labGroups.find(g => g.id === id)?.name || id;

    const downloadFlowGuide = () => {
        generateFlowPDF({
            featureName: "Room & Lab Configuration",
            description: "Room structures allow you to define physical spaces, cluster them into specific groups (like Batch Lab Rotations), and then require subjects to be scheduled inside them.",
            steps: [
                {
                    title: "Define the Room Types",
                    description: "Establish semantic categories that define what kind of infrastructure the room has.",
                    example: "Creating a type called 'Science Lab'."
                },
                {
                    title: "Create Physical Rooms",
                    description: "Register the actual physical rooms inside your school building.",
                    example: "Registering 'Physics Lab (Room 101)' and 'Chemistry Lab (Room 102)', assigning both to the 'Science Lab' type."
                },
                {
                    title: "Bundle Lab Groups (Optional for Batches)",
                    description: "If a subject requires multiple physical rooms to operate at the exact same time (like splitting a class in half), create a Lab Group and tick the necessary rooms.",
                    example: "Creating 'High School Science Labs' and ticking both 'Physics Lab' and 'Chemistry Lab'."
                },
                {
                    title: "Set Subject Requirements",
                    description: "Connect a Global Subject to a Room Type or a Lab Group. The timetable engine will force classes scheduled for this subject into those rooms.",
                    example: "Mapping the 'Science Practical' subject to the 'High School Science Labs' Lab Group so they are reserved concurrently."
                }
            ],
            proTip: "A Requirement based on a 'Specific Type' grabs exactly one available room of that type. A requirement based on a 'Lab Group' reserves ALL rooms in the group simultaneously."
        });
    };

    if (loading) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading...</div>;

    return (
        <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Room & Lab Management</h2>
                    <p className="text-muted-foreground mt-1">Manage classrooms, labs, and subject room requirements.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
                    {(["rooms", "types", "groups", "requirements"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            {t === "requirements" ? "Subject Req" : t === "types" ? "Room Types" : t === "groups" ? "Lab Groups" : "Rooms"}
                        </button>
                    ))}
                </div>

                {/* Rooms Tab */}
                {tab === "rooms" && (
                    <div className="bg-card border border-border rounded-xl shadow-sm">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2"><Building2 className="w-5 h-5 text-primary" /><h3 className="font-semibold text-lg">Rooms ({rooms.length})</h3></div>
                            <button onClick={() => setShowRoomForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"><Plus className="w-4 h-4" /> Add Room</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Room</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Type</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Capacity</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Building / Floor</th>
                                    <th className="px-4 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-border">
                                    {rooms.map(r => (
                                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{r.roomName}</td>
                                            <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5">{getTypeName(r.roomTypeId)}</span></td>
                                            <td className="px-4 py-3 text-muted-foreground">{r.capacity}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{r.building || "—"} {r.floor ? `/ Floor ${r.floor}` : ""}</td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteRoom(r.id)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                    {rooms.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No rooms added yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Room Types Tab */}
                {tab === "types" && (
                    <div className="bg-card border border-border rounded-xl shadow-sm">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Room Types</h3>
                            <button onClick={() => setShowTypeForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"><Plus className="w-4 h-4" /> Add Type</button>
                        </div>
                        <div className="p-4 flex flex-wrap gap-2">
                            {roomTypes.map(t => (
                                <div key={t.id} className="flex items-center gap-2 bg-muted border border-border rounded-full px-3 py-1.5 text-sm">
                                    <FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>{t.typeName}</span>
                                    <button onClick={() => handleDeleteType(t.id)} className="text-destructive hover:opacity-70 ml-1"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            ))}
                            {roomTypes.length === 0 && <p className="text-muted-foreground text-sm w-full text-center py-6">No room types defined.</p>}
                        </div>
                    </div>
                )}

                {/* Lab Groups Tab */}
                {tab === "groups" && (
                    <div className="bg-card border border-border rounded-xl shadow-sm">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Lab Groups</h3>
                            <button onClick={() => setShowGroupForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"><Plus className="w-4 h-4" /> Add Group</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Group Name</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Assigned Rooms</th>
                                    <th className="px-4 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-border">
                                    {labGroups.map(g => (
                                        <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-emerald-700">{g.name}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {g.roomIds.map(rid => <span key={rid} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">{getRoomName(rid)}</span>)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteLabGroup(g.id)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                    {labGroups.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">No lab groups defined.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Requirements Tab */}
                {tab === "requirements" && (
                    <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl shadow-sm">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Subject Room Requirements</h3>
                            <button onClick={() => setShowReqForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"><Plus className="w-4 h-4" /> Add Requirement</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Subject</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Requires Room Type</th>
                                    <th className="px-4 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-border">
                                    {requirements.map(r => (
                                        <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{getSubjectName(r.subjectId)}</td>
                                            <td className="px-4 py-3"><span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2 py-0.5">{getTypeName(r.roomTypeId)}</span></td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteReq(r.id, false)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                    {requirements.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">No standard room requirements.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="bg-card border border-border rounded-xl shadow-sm mt-6">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-emerald-800">Lab Group Requirements (Batch Rotation)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="bg-muted/50 text-left">
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Subject</th>
                                    <th className="px-4 py-3 font-semibold text-muted-foreground">Requires Lab Group</th>
                                    <th className="px-4 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-border">
                                    {labGroupReqs.map(r => (
                                        <tr key={r.id} className="hover:bg-emerald-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium">{getSubjectName(r.subjectId)}</td>
                                            <td className="px-4 py-3"><span className="text-xs bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium rounded-full px-2 py-0.5">{getGroupName(r.labGroupId)}</span></td>
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteReq(r.id, true)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                    {labGroupReqs.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">No lab group requirements set.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    </div>
                )}
                
                <div className="flex justify-end mt-4 pt-4 border-t border-border">
                    <button onClick={downloadFlowGuide} className="flex items-center gap-2 text-sm text-primary hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 transition-colors">
                        <Download className="w-4 h-4" /> Download UI Flow Guide (PDF)
                    </button>
                </div>
            </div>

            {/* Modals */}
            {showTypeForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Add Room Type</h3>
                        <form onSubmit={handleCreateType} className="space-y-3">
                            <input required value={newType.typeName} onChange={e => setNewType({ typeName: e.target.value })} placeholder="e.g. Physics Lab" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowTypeForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Add</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showGroupForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Add Lab Group</h3>
                        <form onSubmit={handleCreateLabGroup} className="space-y-4">
                            <div><label className="text-sm font-medium mb-1 block">Group Name</label><input required value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="e.g. Science Labs" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Select Rooms</label>
                                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                                    {rooms.map(r => (
                                        <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted p-1 rounded">
                                            <input type="checkbox" checked={newGroup.roomIds.includes(r.id)} onChange={e => {
                                                if (e.target.checked) setNewGroup({ ...newGroup, roomIds: [...newGroup.roomIds, r.id] });
                                                else setNewGroup({ ...newGroup, roomIds: newGroup.roomIds.filter(id => id !== r.id) });
                                            }} className="rounded border-border" />
                                            {r.roomName} <span className="text-muted-foreground text-[10px]">({getTypeName(r.roomTypeId)})</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowGroupForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button><button type="submit" disabled={newGroup.roomIds.length === 0} className="px-4 py-2 text-sm bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg disabled:opacity-50">Create Group</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showRoomForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Add Room</h3>
                        <form onSubmit={handleCreateRoom} className="space-y-3">
                            <div><label className="text-sm font-medium mb-1 block">Room Name</label><input required value={newRoom.roomName} onChange={e => setNewRoom({ ...newRoom, roomName: e.target.value })} placeholder="Room 101" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            <div><label className="text-sm font-medium mb-1 block">Type</label>
                                <select required value={newRoom.roomTypeId} onChange={e => setNewRoom({ ...newRoom, roomTypeId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select type...</option>
                                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="text-sm font-medium mb-1 block">Capacity</label><input type="number" value={newRoom.capacity} onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                <div><label className="text-sm font-medium mb-1 block">Building</label><input value={newRoom.building} onChange={e => setNewRoom({ ...newRoom, building: e.target.value })} placeholder="Block A" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                                <div><label className="text-sm font-medium mb-1 block">Floor</label><input value={newRoom.floor} onChange={e => setNewRoom({ ...newRoom, floor: e.target.value })} placeholder="1st" className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowRoomForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Add Room</button></div>
                        </form>
                    </div>
                </div>
            )}

            {showReqForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">Add Subject Requirement</h3>
                        </div>
                        
                        <div className="flex gap-2 mb-4 bg-muted p-1 rounded-lg">
                            <button onClick={() => setReqType("type")} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${reqType === "type" ? "bg-card shadow" : "text-muted-foreground"}`}>Specific Type</button>
                            <button onClick={() => setReqType("group")} className={`flex-1 py-1.5 text-sm font-medium rounded-md ${reqType === "group" ? "bg-card shadow text-emerald-700" : "text-muted-foreground"}`}>Lab Group</button>
                        </div>

                        <form onSubmit={handleCreateReq} className="space-y-4">
                            <div><label className="text-sm font-medium mb-1 block">Subject</label>
                                <select required value={reqType === "type" ? newReq.subjectId : newGroupReq.subjectId} onChange={e => {
                                    setNewReq({ ...newReq, subjectId: e.target.value });
                                    setNewGroupReq({ ...newGroupReq, subjectId: e.target.value });
                                }} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select subject...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            
                            {reqType === "type" ? (
                                <div><label className="text-sm font-medium mb-1 block">Required Room Type</label>
                                    <select required value={newReq.roomTypeId} onChange={e => setNewReq({ ...newReq, roomTypeId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select single type...</option>
                                        {roomTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">Schedules class into exactly ONE room of this type.</p>
                                </div>
                            ) : (
                                <div><label className="text-sm font-medium block mb-1 text-emerald-800">Required Lab Group</label>
                                    <select required value={newGroupReq.labGroupId} onChange={e => setNewGroupReq({ ...newGroupReq, labGroupId: e.target.value })} className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                        <option value="">Select lab group...</option>
                                        {labGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                    <p className="text-xs text-muted-foreground mt-1">Schedules class into ALL rooms in this group simultaneously.</p>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2 border-t border-border mt-2">
                                <button type="button" onClick={() => setShowReqForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
