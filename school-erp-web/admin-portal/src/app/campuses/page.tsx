"use client";

import Header from "@/components/Header";
import { Building2, Plus, Search, MapPin, MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { SchoolManagementService } from "@/lib/api";

type Campus = {
    id: string;
    campusName: string;
    address: string;
    contactPerson: string;
    contactPhone: string;
    active: boolean;
};

export default function CampusesPage() {
    const [campuses, setCampuses] = useState<Campus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        campusName: "",
        address: "",
        contactPerson: "",
        contactPhone: ""
    });

    useEffect(() => {
        loadCampuses();
    }, []);

    const loadCampuses = async () => {
        try {
            const data = await SchoolManagementService.getCampuses();
            setCampuses(data);
        } catch (error) {
            console.error("Failed to load campuses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await SchoolManagementService.createCampus(formData);
            setIsAdding(false);
            setFormData({ campusName: "", address: "", contactPerson: "", contactPhone: "" });
            loadCampuses();
        } catch (error) {
            console.error("Failed to create campus", error);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Campuses</h2>
                            <p className="text-muted-foreground mt-1">Manage multiple school branches and facilities.</p>
                        </div>
                        <button 
                            onClick={() => setIsAdding(true)}
                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Campus
                        </button>
                    </div>

                    {isAdding && (
                        <div className="bg-card border border-border rounded-xl shadow-sm p-6 mb-6 animate-in slide-in-from-top-4">
                            <h3 className="text-lg font-bold mb-4">New Campus Details</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Campus Name</label>
                                        <input required type="text" value={formData.campusName} onChange={(e) => setFormData({...formData, campusName: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="e.g. North Wing Building" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Physical Address</label>
                                        <input required type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="123 Example St." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Contact Person</label>
                                        <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Branch Manager Name" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium">Contact Phone</label>
                                        <input type="text" value={formData.contactPhone} onChange={(e) => setFormData({...formData, contactPhone: e.target.value})} className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" placeholder="+1234567890" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Save Campus</button>
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <p className="text-sm text-muted-foreground">Loading campuses...</p>
                        ) : campuses.length === 0 ? (
                            <p className="text-sm text-muted-foreground col-span-full">No campuses found. Click "Add Campus" to create one.</p>
                        ) : (
                            campuses.map(campus => (
                                <div key={campus.id} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-4 hover:border-gray-500 transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{campus.campusName}</h3>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                            <MapPin className="w-4 h-4" /> {campus.address}
                                        </p>
                                    </div>
                                    {campus.contactPerson && (
                                        <div className="pt-4 border-t border-border flex flex-col gap-1">
                                            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Contact</p>
                                            <p className="text-sm font-medium">{campus.contactPerson}</p>
                                            <p className="text-sm text-muted-foreground">{campus.contactPhone}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
