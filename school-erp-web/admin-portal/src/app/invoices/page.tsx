"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { InvoiceService } from "@/lib/api";
import { CreditCard, FileText } from "lucide-react";
import Link from "next/link";

interface Invoice {
    id: string;
    studentId: string;
    feeStructureId: string;
    totalAmount: number;
    status: "PENDING" | "PAID" | "OVERDUE";
    issuedDate: string;
    paidDate?: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    // Payment Modal State
    const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
    const [paymentData, setPaymentData] = useState({
        amount: "", paymentMethod: "ONLINE", transactionRef: ""
    });

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        try {
            const data = await InvoiceService.getAll();
            setInvoices(data);
        } catch (error) {
            console.error("Failed to load invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeInvoice) return;

        try {
            await InvoiceService.recordPayment(activeInvoice.id, {
                ...paymentData,
                amount: parseFloat(paymentData.amount)
            });
            setActiveInvoice(null);
            setPaymentData({ amount: "", paymentMethod: "ONLINE", transactionRef: "" });
            loadInvoices();
        } catch (error) {
            console.error("Failed to record payment:", error);
            alert("Error processing payment");
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "PAID": return "bg-green-50 text-green-700 border-green-200";
            case "OVERDUE": return "bg-red-50 text-red-700 border-red-200";
            default: return "bg-yellow-50 text-yellow-700 border-yellow-200";
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">


            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Track student invoices and record manual payments.</p>
                        <Link href="/fees" className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors shadow-sm">
                            <FileText className="w-4 h-4" />
                            Fee Structures
                        </Link>
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Invoice ID</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Student ID</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Amount</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Issued Date</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground">Status</th>
                                        <th className="p-4 font-semibold text-sm text-muted-foreground text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                Loading invoices...
                                            </td>
                                        </tr>
                                    ) : invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                No invoices found.
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((inv) => (
                                            <tr key={inv.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                <td className="p-4 font-mono text-xs text-muted-foreground truncate max-w-[120px]">
                                                    {inv.id}
                                                </td>
                                                <td className="p-4 font-medium">{inv.studentId}</td>
                                                <td className="p-4 font-medium">₹{inv.totalAmount.toFixed(2)}</td>
                                                <td className="p-4 text-muted-foreground">
                                                    {new Date(inv.issuedDate).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(inv.status)}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {inv.status === "PENDING" && (
                                                        <button 
                                                            onClick={() => {
                                                                setActiveInvoice(inv);
                                                                setPaymentData(p => ({...p, amount: inv.totalAmount.toString()}));
                                                            }}
                                                            className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
                                                            title="Record Payment"
                                                        >
                                                            <CreditCard className="w-4 h-4" />
                                                            <span className="sr-only">Pay</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>

            {/* Payment Modal */}
            {activeInvoice && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-card rounded-xl shadow-lg w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-blue-50/50">
                            <h2 className="text-lg font-bold text-blue-900">Record Payment</h2>
                            <button onClick={() => setActiveInvoice(null)} className="text-muted-foreground hover:text-foreground">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                            <div className="bg-muted rounded-lg p-3 text-sm flex justify-between border border-border">
                                <span className="text-muted-foreground">Invoice Balance</span>
                                <span className="font-bold">₹{activeInvoice.totalAmount.toFixed(2)}</span>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Amount (₹)</label>
                                <input required type="number" step="0.01" max={activeInvoice.totalAmount} className="w-full p-2 border border-border rounded-lg bg-background" value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Payment Method</label>
                                <select className="w-full p-2 border border-border rounded-lg bg-background" value={paymentData.paymentMethod} onChange={e => setPaymentData({...paymentData, paymentMethod: e.target.value})}>
                                    <option value="ONLINE">Online Transfer</option>
                                    <option value="CASH">Cash</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Transaction Ref (Optional)</label>
                                <input type="text" className="w-full p-2 border border-border rounded-lg bg-background" value={paymentData.transactionRef} onChange={e => setPaymentData({...paymentData, transactionRef: e.target.value})} placeholder="e.g. TXN-123456" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setActiveInvoice(null)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                    Confirm Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
