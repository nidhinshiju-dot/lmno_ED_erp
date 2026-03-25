"use client";

import { useState, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, X, MessageSquareText } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";

const formatSchoolName = (tenantId?: string) => {
    if (!tenantId) return "your school";
    if (tenantId.toLowerCase() === "sunrise") return "Sunrise Public School";
    if (tenantId.toLowerCase() === "tella") return "Tella Academy";
    if (tenantId.toUpperCase() === "TENANT_001") return "Lmno Campus";
    
    // Fallback: title case and replace underscores with spaces
    const formatted = tenantId.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    return formatted;
};

import { SchoolConfigService } from "@/lib/api";

export default function AdminCopilot() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [schoolName, setSchoolName] = useState("");

    useEffect(() => {
        SchoolConfigService.getSettings()
            .then(res => {
                if (res && res.schoolName) {
                    setSchoolName(res.schoolName);
                }
            })
            .catch(() => {});
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://api-gateway-249177610154.asia-south1.run.app/api/v1"}/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Tenant-Id": "sunrise" // Use valid tenant ID from seed
                },
                body: JSON.stringify({
                    query: userMsg,
                    userRole: "ADMIN"
                })
            });

            if (!response.ok) {
                throw new Error("Failed to communicate with AI Assistant");
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response || "No response generated." }]);

        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Oops: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[700px] bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                
                {/* Chat History / Empty State */}
                <div className="flex-1 overflow-y-auto p-4 bg-white relative flex flex-col">
                    {messages.length === 0 && input.trim() === "" ? (
                        <div className="flex-1 flex flex-col items-center justify-end pb-4 text-center px-2 max-w-sm mx-auto animate-in fade-in zoom-in duration-300">
                            <div className="w-14 h-14 rounded-full border border-blue-100 flex items-center justify-center mb-6 bg-blue-50 shadow-sm text-primary shrink-0">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <h2 className="text-[15px] font-semibold text-gray-800 mb-1">
                                I am Elsa, your personalized AI assistant for {schoolName || formatSchoolName(user?.tenantId)}.
                            </h2>
                            <p className="text-sm text-gray-500 mb-4">You can ask:</p>
                            
                            <div className="flex flex-wrap justify-center gap-2 w-full">
                                {[
                                    "Analyze recent attendance trends",
                                    "Check for students with pending fees",
                                    "Improve my announcement draft"
                                ].map((suggestion, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => setInput(suggestion)}
                                        className="px-3 py-1.5 border border-gray-200 rounded-full text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 flex-1">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200 mt-1">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                    )}
                                    
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                                    }`}>
                                        {msg.content}
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 mt-1">
                                            <User className="w-4 h-4 text-slate-600" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200 mt-1">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="bg-slate-50 border border-slate-100 text-slate-800 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 shadow-sm">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-sm text-slate-500">Thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white flex-shrink-0 pb-6 w-full">
                    <div className="relative bg-gray-100 rounded-3xl flex items-end shadow-sm">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Message Elsa..."
                            className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none border-0 outline-none p-3.5 pl-5 text-[15px] text-gray-900 placeholder-gray-500"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full w-9 h-9 flex justify-center items-center m-2 flex-shrink-0 transition-colors shadow-sm"
                        >
                            <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
                        </button>
                    </div>
                    <div className="text-center mt-3 text-xs text-gray-400">
                        Elsa can make mistakes. Verify important metrics.
                    </div>
                </div>

        </div>
    );
}
