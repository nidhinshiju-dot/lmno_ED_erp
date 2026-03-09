"use client";

import { useState, useEffect } from "react";
import { RoomService, SubjectService } from "@/lib/api";
import { Plus, Trash2, Building2, FlaskConical } from "lucide-react";

interface RoomType { id: string; typeName: string; }
interface Room { id: string; roomName: string; roomTypeId: string; capacity: number; building: string; floor: string; isActive: boolean; }
interface Requirement { id: string; subjectId: string; roomTypeId: string; isRequired: boolean; }
interface Subject { id: string; name: string; code: string; }

export default function RoomsPage() {
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"rooms" | "types" | "requirements">("rooms");
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [showTypeForm, setShowTypeForm] = useState(false);
    const [showReqForm, setShowReqForm] = useState(false);
    const [newRoom, setNewRoom] = useState({ roomName: "", roomTypeId: "", capacity: 40, building: "", floor: "" });
    const [newType, setNewType] = useState({ typeName: "" });
    const [newReq, setNewReq] = useState({ subjectId: "", roomTypeId: "", isRequired: true });

    useEffect(() => {
        const load = async () => {
            try {
                const [rt, r, req, sub] = await Promise.all([
                    RoomService.getRoomTypes(), RoomService.getAll(),
                    RoomService.getRequirements(), SubjectService.getAll()
                ]);
                setRoomTypes(rt); setRooms(r); setRequirements(req); setSubjects(sub);
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
        const created = await RoomService.createRequirement(newReq);
        setRequirements([...requirements, created]);
        setShowReqForm(false);
        setNewReq({ subjectId: "", roomTypeId: "", isRequired: true });
    };

    const handleDeleteReq = async (id: string) => {
        await RoomService.deleteRequirement(id);
        setRequirements(requirements.filter(r => r.id !== id));
    };

    const getTypeName = (id: string) => roomTypes.find(t => t.id === id)?.typeName || id;
    const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name || id;

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
                    {(["rooms", "types", "requirements"] as const).map(t => (
                        <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${tab === t ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                            {t === "requirements" ? "Room Requirements" : t === "types" ? "Room Types" : "Rooms"}
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

                {/* Requirements Tab */}
                {tab === "requirements" && (
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
                                            <td className="px-4 py-3 text-right"><button onClick={() => handleDeleteReq(r.id)} className="text-destructive hover:opacity-70"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                    {requirements.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">No room requirements set.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
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
                        <h3 className="text-lg font-bold mb-4">Add Room Requirement</h3>
                        <form onSubmit={handleCreateReq} className="space-y-3">
                            <div><label className="text-sm font-medium mb-1 block">Subject</label>
                                <select required value={newReq.subjectId} onChange={e => setNewReq({ ...newReq, subjectId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select subject...</option>
                                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div><label className="text-sm font-medium mb-1 block">Required Room Type</label>
                                <select required value={newReq.roomTypeId} onChange={e => setNewReq({ ...newReq, roomTypeId: e.target.value })} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="">Select type...</option>
                                    {roomTypes.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowReqForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-blue-600 rounded-lg">Save</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
