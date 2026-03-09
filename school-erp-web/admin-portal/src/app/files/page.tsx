"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { FileService } from "@/lib/api";
import { FolderOpen, Trash2, FileText, Image, FileSpreadsheet, File } from "lucide-react";

interface FileItem { id: string; name: string; fileType: string; fileSize: number; category: string; uploadedBy: string; uploadedAt: string; }

const categories = ["ALL", "STUDENT_DOC", "CERTIFICATE", "CIRCULAR", "ASSIGNMENT", "OTHER"];

export default function FilesPage() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setFiles(await FileService.getAll());
            } catch {}
            finally { setLoading(false); }
        };
        load();
    }, []);

    const filtered = selectedCategory === "ALL" ? files : files.filter(f => f.category === selectedCategory);

    const handleDelete = async (id: string) => {
        try { await FileService.delete(id); setFiles(files.filter(f => f.id !== id)); } catch { alert("Failed"); }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case "PDF": return <FileText className="w-5 h-5 text-red-500" />;
            case "IMAGE": return <Image className="w-5 h-5 text-blue-500" />;
            case "EXCEL": return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
            default: return <File className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-background">

            <main className="flex-1 overflow-y-auto p-6">
                <div className="max-w-5xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Documents & Files</h2>
                        <p className="text-muted-foreground mt-1">Manage student documents, certificates, circulars, and assignments.</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {categories.map(c => (
                            <button key={c} onClick={() => setSelectedCategory(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                {c === "ALL" ? "All Files" : c.replace("_", " ")}
                            </button>
                        ))}
                    </div>

                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 border-b border-border">
                                <tr>
                                    <th className="p-4 font-semibold text-muted-foreground">File</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Type</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Size</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Category</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Uploaded</th>
                                    <th className="p-4 font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground"><FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />No files found.</td></tr>
                                ) : filtered.map(f => (
                                    <tr key={f.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                        <td className="p-4"><div className="flex items-center gap-2">{getFileIcon(f.fileType)} <span className="font-medium">{f.name}</span></div></td>
                                        <td className="p-4 font-mono text-xs">{f.fileType}</td>
                                        <td className="p-4 text-muted-foreground">{formatSize(f.fileSize)}</td>
                                        <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{f.category.replace("_", " ")}</span></td>
                                        <td className="p-4 text-muted-foreground">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString() : "—"}</td>
                                        <td className="p-4"><button onClick={() => handleDelete(f.id)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
