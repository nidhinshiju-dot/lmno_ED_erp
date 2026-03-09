"use client";

import { useState } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

export default function AiAssistantPage() {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
        { role: 'assistant', content: 'Hello! I am your AI Operational Assistant. I can help you analyze school data, identify students at risk, and generate attendance and fee insights.' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            // Note: In a real app we'd fetch the auth token and role from context.
            // Using a mock API call to lms-service for the prototype.
            const response = await fetch("http://localhost:8082/api/v1/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Mock tenant info that Auth-service would normally provide
                    "X-Tenant-Id": "tenant-1"
                },
                body: JSON.stringify({
                    query: userMsg,
                    userRole: "ADMIN" // Adjusting to STUDENT/TEACHER based on portal later
                })
            });

            if (!response.ok) {
                throw new Error("Failed to communicate with AI Service");
            }

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response || "No response generated." }]);

        } catch (error: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">AI Operational Assistant</h1>
                <p className="text-gray-500 text-sm mt-1">Ask questions about operations, fees, and student analytics.</p>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden shadow-sm relative">
                
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 absolute inset-x-0 top-0 bottom-[85px]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-blue-600" />
                                </div>
                            )}
                            
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm whitespace-pre-wrap'
                            }`}>
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-gray-600" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                             <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-3 items-center">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Message the AI Assistant..."
                            className="flex-1 max-h-32 min-h-[52px] resize-none border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl h-[52px] px-6 flex items-center justify-center transition-colors shadow-sm"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
