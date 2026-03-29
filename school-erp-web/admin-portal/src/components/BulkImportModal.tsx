"use client";

import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { fetchWithAuth, ClassService } from "@/lib/api";
import {
    X, Upload, Download, FileSpreadsheet, CheckCircle2,
    XCircle, Loader2, AlertCircle, ChevronRight, RotateCcw, RefreshCw
} from "lucide-react";

interface BulkImportModalProps {
    classes: { id: string; name: string; branch: string | null; roomNumber?: string }[];
    onClose: () => void;
    onImportSuccess: () => void;
}

interface PreviewRow {
    fullName: string;
    dob: string;
    parentContact: string;
    guardianName: string;
    guardianRelation: string;
    admissionNumber: string;
    errors: string[];
    isValid: boolean;
}

type Step = "upload" | "preview" | "success";

// ── Validation Helpers ────────────────────────────────────────────────────────
function parseDate(raw: string): string | null {
    if (!raw) return null;
    const parts = raw.toString().trim().split(/[-\/\.]/);
    if (parts.length === 3) {
        const [d, m, y] = parts;
        if (y.length === 4) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
    return null;
}

function validateRow(row: Record<string, string>): PreviewRow {
    const fullName = (row["Full Name"] || row["Name"] || "").trim();
    const dobRaw = (row["Date of Birth"] || row["DOB"] || "").toString().trim();
    const parentContact = (row["Parent Contact"] || row["Contact"] || "").toString().trim();
    const guardianName = (row["Guardian Name"] || row["Parent Name"] || "").trim();
    const guardianRelation = (row["Relationship"] || row["Relation"] || "").trim();
    const admissionNumber = (row["Admission Number"] || row["Admission No"] || "").trim();

    const errors: string[] = [];
    if (!fullName) errors.push("Full Name is required");
    const dob = parseDate(dobRaw);
    if (!dob) errors.push("Invalid DOB (use dd-mm-yyyy)");
    if (!/^\d{7,15}$/.test(parentContact)) errors.push("Contact must be 7-15 digits");

    return { fullName, dob: dob || dobRaw, parentContact, guardianName, guardianRelation, admissionNumber, errors, isValid: errors.length === 0 };
}

// ── Template Download (server-side CSV) ──────────────────────────────────────────
async function downloadTemplate() {
    const token = localStorage.getItem("erp_token");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api/v1";

    try {
        const res = await fetch(`${API_BASE_URL}/students/template`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) {
            throw new Error(`Server returned ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        console.info(`[template-download] ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);

        // Use the universally reliable SheetJS library (already in the project stack)
        // to parse and securely save the workbook, bypassing Chromium's blob-isolation rules.
        const wb = XLSX.read(arrayBuffer, { type: "array" });
        XLSX.writeFile(wb, "students_template.xlsx");
        
        console.info(`[template-download] Successfully invoked XLSX.writeFile`);
    } catch (err: any) {
        console.error("[template-download] Failed:", err);
        alert(`Template download failed: ${err?.message || "Unknown error"}. Check that core-service is running.`);
    }
}

export function BulkImportModal({ classes: initialClasses, onClose, onImportSuccess }: BulkImportModalProps) {
    const [step, setStep] = useState<Step>("upload");
    const [selectedClass, setSelectedClass] = useState("");
    const [academicYear, setAcademicYear] = useState("2025-2026");
    const [rows, setRows] = useState<PreviewRow[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState("");
    const [importing, setImporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importResult, setImportResult] = useState({ success: 0, failed: 0, errors: [] as string[] });
    const fileRef = useRef<HTMLInputElement>(null);
    const [classes, setClasses] = useState(initialClasses);
    const [refreshingClasses, setRefreshingClasses] = useState(false);

    const refreshClasses = async () => {
        setRefreshingClasses(true);
        try {
            const fresh = await ClassService.getAll();
            const sorted = [...(fresh || [])].sort((a, b) => {
                if (a.gradeLevel !== b.gradeLevel) return (a.gradeLevel || 0) - (b.gradeLevel || 0);
                return a.name.localeCompare(b.name);
            });
            setClasses(sorted);
        } catch {
            // silently fail — user sees empty dropdown
        } finally {
            setRefreshingClasses(false);
        }
    };

    const parseFile = (file: File) => {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const jsonRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
            const parsed = jsonRows.map(validateRow);
            setRows(parsed);
            setStep("preview");
        };
        reader.readAsArrayBuffer(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".csv"))) {
            parseFile(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) parseFile(file);
    };

    const generateAdmNo = () => {
        const d = new Date();
        const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
        return `ADM-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    };

    const handleImport = async () => {
        if (!selectedClass) { alert("Please select a Class & Division."); return; }
        const validRows = rows.filter(r => r.isValid);
        if (!validRows.length) return;

        setImporting(true);
        setProgress(0);
        let success = 0, failed = 0;
        const errors: string[] = [];

        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];
            const payload = {
                name: row.fullName,
                dob: row.dob,
                parentContact: row.parentContact,
                guardianName: row.guardianName,
                guardianRelation: row.guardianRelation,
                classId: selectedClass,
                admissionNumber: row.admissionNumber || generateAdmNo(),
                countryCode: "+91",
            };
            try {
                await fetchWithAuth("/students", { method: "POST", body: JSON.stringify(payload) });
                success++;
            } catch (e: any) {
                failed++;
                // Surface the full backend error message so the admin can diagnose the issue
                const msg = e?.message && e.message !== "Failed"
                    ? e.message
                    : "Unknown error — check that the class exists and the tenant is fully provisioned";
                errors.push(`Row ${i + 1} (${row.fullName}): ${msg}`);
            }
            setProgress(Math.round(((i + 1) / validRows.length) * 100));
        }

        setImportResult({ success, failed, errors });
        setImporting(false);
        setStep("success");
        if (success > 0) onImportSuccess();
    };

    const downloadErrorReport = () => {
        const ws = XLSX.utils.aoa_to_sheet([["Error"], ...importResult.errors.map(e => [e])]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Errors");
        XLSX.writeFile(wb, "import_errors.xlsx");
    };

    const validCount = rows.filter(r => r.isValid).length;
    const invalidCount = rows.length - validCount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-card w-full max-w-3xl border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Bulk Import Students</h3>
                            <p className="text-xs text-muted-foreground">
                                {step === "upload" && "Upload an Excel file to register multiple students at once"}
                                {step === "preview" && `${rows.length} rows detected — ${validCount} valid, ${invalidCount} invalid`}
                                {step === "success" && "Import complete"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Step indicators */}
                        {["upload", "preview", "success"].map((s, i) => (
                            <div key={s} className="flex items-center gap-1">
                                <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${step === s ? "bg-primary text-white" : (["preview", "success"].indexOf(step) > i ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}`}>
                                    {["upload", "preview", "success"].indexOf(step) > i ? "✓" : i + 1}
                                </div>
                                {i < 2 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                            </div>
                        ))}
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground ml-2">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">

                    {/* ── STEP 1: UPLOAD ── */}
                    {step === "upload" && (
                        <div className="space-y-5">

                            {/* ── No classes warning (post-provisioning guard) ── */}
                            {classes.length === 0 && (
                                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-amber-900">No classes found</p>
                                        <p className="text-xs text-amber-800 mt-0.5">
                                            Bulk import requires at least one class to exist first. After school provisioning, create classes before importing students.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={refreshClasses}
                                        disabled={refreshingClasses}
                                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-60"
                                    >
                                        {refreshingClasses ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                        Retry
                                    </button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Class & Division *</label>
                                    <select
                                        value={selectedClass}
                                        onChange={e => setSelectedClass(e.target.value)}
                                        disabled={classes.length === 0}
                                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{classes.length === 0 ? "No classes available — create classes first" : "Select Class & Division"}</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}{c.branch ? ` (${c.branch})` : ""}{c.roomNumber ? ` — Div ${c.roomNumber}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium mb-1.5 block">Academic Year *</label>
                                    <select
                                        value={academicYear}
                                        onChange={e => setAcademicYear(e.target.value)}
                                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="2025-2026">2025-2026</option>
                                        <option value="2024-2025">2024-2025</option>
                                        <option value="2026-2027">2026-2027</option>
                                    </select>
                                </div>
                            </div>

                            {/* Drag & Drop Zone */}
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
                            >
                                <input ref={fileRef} type="file" accept=".xlsx,.csv" onChange={handleFileChange} className="hidden" />
                                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="font-semibold text-sm">Drag &amp; drop your Excel or CSV file here</p>
                                <p className="text-muted-foreground text-xs mt-1">or click to browse — supports .xlsx and .csv</p>
                            </div>

                            {/* Template Download */}
                            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <FileSpreadsheet className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-900">Need the template?</p>
                                    <p className="text-xs text-blue-600">Download the official XLSX template format — opens directly in Excel.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => downloadTemplate()}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
                                >
                                    <Download className="w-3.5 h-3.5" /> Download Template
                                </button>
                            </div>

                            {/* Format hint */}
                            <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
                                <p className="font-semibold text-foreground mb-2">Expected Excel Columns:</p>
                                <div className="grid grid-cols-3 gap-1">
                                    {["Full Name *", "Date of Birth *", "Parent Contact *", "Guardian Name", "Relationship", "Admission Number"].map(col => (
                                        <span key={col} className="bg-white border border-border rounded px-2 py-1 font-mono">{col}</span>
                                    ))}
                                </div>
                                <p className="mt-2">Date format: <strong>dd-mm-yyyy</strong> &nbsp;|&nbsp; Contact: numbers only &nbsp;|&nbsp; Admission No: auto-generated if blank</p>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: PREVIEW ── */}
                    {step === "preview" && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-700">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {validCount} Valid
                                    </div>
                                    {invalidCount > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                                            <XCircle className="w-3.5 h-3.5" /> {invalidCount} Invalid
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => { setStep("upload"); setRows([]); setFileName(""); }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    <RotateCcw className="w-3 h-3" /> Replace File
                                </button>
                            </div>

                            <div className="border border-border rounded-xl overflow-hidden">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/60 border-b border-border">
                                        <tr>
                                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Full Name</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">DOB</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Contact</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Guardian</th>
                                            <th className="px-3 py-2.5 text-left font-semibold text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {rows.map((row, i) => (
                                            <tr key={i} className={row.isValid ? "bg-white" : "bg-red-50/50"}>
                                                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                                                <td className="px-3 py-2 font-medium">{row.fullName || <span className="text-red-400 italic">—</span>}</td>
                                                <td className="px-3 py-2">{row.dob || "—"}</td>
                                                <td className="px-3 py-2">{row.parentContact || "—"}</td>
                                                <td className="px-3 py-2">{row.guardianName || <span className="text-muted-foreground italic">—</span>}</td>
                                                <td className="px-3 py-2">
                                                    {row.isValid ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Valid</span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-red-500 font-semibold" title={row.errors.join(", ")}>
                                                            <XCircle className="w-3.5 h-3.5" /> {row.errors[0]}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {invalidCount > 0 && (
                                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span>{invalidCount} row(s) have errors and will be skipped. Fix the file and re-upload to import them, or click <strong>Import Valid Students</strong> to proceed with {validCount} valid row(s) only.</span>
                                </div>
                            )}

                            {/* Progress bar */}
                            {importing && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Importing students...</span><span>{progress}%</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 3: SUCCESS ── */}
                    {step === "success" && (
                        <div className="flex flex-col items-center text-center py-8 space-y-5">
                            <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold text-emerald-600">{importResult.success} Students Imported</h4>
                                {importResult.failed > 0 && (
                                    <p className="text-sm text-red-500 mt-1">{importResult.failed} rows failed to import</p>
                                )}
                            </div>
                            {importResult.failed > 0 && (
                                <button
                                    onClick={downloadErrorReport}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download Error Report
                                </button>
                            )}
                            <p className="text-sm text-muted-foreground">The Students list has been refreshed with your imported records.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-muted/20">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                        {step === "success" ? "Close" : "Cancel"}
                    </button>

                    {step === "upload" && (
                        <p className="text-xs text-muted-foreground">Upload a file to continue</p>
                    )}

                    {step === "preview" && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setStep("upload"); setRows([]); setFileName(""); }}
                                className="px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                            >
                                Fix File
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={importing || validCount === 0}
                                className="px-5 py-2 text-sm font-medium bg-primary text-white hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {importing ? `Importing... ${progress}%` : `Import ${validCount} Valid Students`}
                            </button>
                        </div>
                    )}

                    {step === "success" && (
                        <button
                            onClick={() => { setStep("upload"); setRows([]); setFileName(""); }}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Import More
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
