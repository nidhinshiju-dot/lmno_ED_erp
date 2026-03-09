"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { FeeService } from "@/lib/api";
import { Plus, ReceiptText } from "lucide-react";
import Link from "next/link";

interface FeeStructure {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    academicYear: string;
    classId: string;
    description: string;
}

export default function FeesPage() {
    const [fees, setFees] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "", amount: "", dueDate: "", academicYear: "2025-2026", classId: "", description: ""
    });

    useEffect(() => {
        loadFees();
    }, []);

    const loadFees = async () => {
        setLoading(true);
        try {
            const data = await FeeService.getAll();
            setFees(data);
        } catch (error) {
            console.error("Failed to load fees:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await FeeService.create({
                ...formData,
                amount: parseFloat(formData.amount)
            });
            setIsModalOpen(false);
            setFormData({ name: "", amount: "", dueDate: "", academicYear: "2025-2026", classId: "", description: "" });
            loadFees();
        } catch (error) {
            console.error("Failed to create fee structure:", error);
            alert("Error creating fee structure");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">


            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Manage school fee structures and track collections.</p>
                        <div className="space-x-4">
                            <Link href="/invoices" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm">
                                <ReceiptText className="w-4 h-4" />
                                View Invoices
                            </Link>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Fee Structure
                            </button>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="p-4 font-semibold text-sm text-muted-foreground w-1/3">Fee Name</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Amount</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Due Date</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Class</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Academic Year</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                Loading fees...
                                            </td>
                                        </tr>
                                    ) : fees.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                No fee structures found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        fees.map((fee) => (
                                            <tr key={fee.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium">{fee.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-xs">{fee.description}</div>
                                                </td>
                                                <td className="p-4 font-medium">₹{fee.amount.toFixed(2)}</td>
                                                <td className="p-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                                        {fee.classId}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-muted-foreground">{fee.academicYear}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-card rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                            <h2 className="text-lg font-bold">New Fee Structure</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleCreateFee} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Fee Name</label>
                                <input required type="text" className="w-full p-2 border border-border rounded-lg bg-background" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Tuition Q1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount (₹)</label>
                                    <input required type="number" step="0.01" className="w-full p-2 border border-border rounded-lg bg-background" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <input required type="date" className="w-full p-2 border border-border rounded-lg bg-background" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Class ID</label>
                                    <input required type="text" className="w-full p-2 border border-border rounded-lg bg-background" value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})} placeholder="e.g. class-10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Academic Year</label>
                                    <input required type="text" className="w-full p-2 border border-border rounded-lg bg-background" value={formData.academicYear} onChange={e => setFormData({...formData, academicYear: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea className="w-full p-2 border border-border rounded-lg bg-background resize-none" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional details..." />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                                    Create Structure
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
