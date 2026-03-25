"use client";

import { useState } from "react";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

export default function StudentTutorPage() {
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
        { role: 'assistant', content: 'Hi there! 🎓 I am your AI Personal Tutor. I can help you study, explain concepts from your courses, or create practice quizzes. What would you like to learn today?' }
    ]);
    const [input, setInput] = useState("");
    const [subject, setSubject] = useState("General");
    const [isLoading, setIsLoading] = useState(false);

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
                    "X-Tenant-Id": "tenant-1"
                },
                body: JSON.stringify({
                    query: userMsg,
                    userRole: "STUDENT",
                    subject: subject
                })
            });

            if (!response.ok) {
                throw new Error("Failed to communicate with AI Tutor");
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
        <div className="p-6 h-[calc(100vh-64px)] flex flex-col max-w-5xl mx-auto w-full">
            <div className="mb-6 flex justify-between items-end">
                 <div>
                     <h1 className="text-2xl font-bold flex items-center gap-2 text-primary">
                         <Sparkles className="w-6 h-6 text-yellow-500" />
                         Personal AI Tutor
                     </h1>
                     <p className="text-muted-foreground text-sm mt-1">Stuck on a problem? Ask me to explain it to you!</p>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-sm font-medium text-slate-600">Subject:</span>
                     <select 
                         value={subject} 
                         onChange={(e) => setSubject(e.target.value)}
                         className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                     >
                         <option value="General">General Questions</option>
                         <option value="Physics">Physics</option>
                         <option value="Mathematics">Mathematics</option>
                         <option value="English">English</option>
                         <option value="Computer Science">Computer Science</option>
                         <option value="Chemistry">Chemistry</option>
                     </select>
                 </div>
            </div>

            <div className="flex-1 bg-white border border-border rounded-xl flex flex-col overflow-hidden shadow-sm relative">
                
                {/* Chat History */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 absolute inset-x-0 top-0 bottom-[85px]">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'assistant' && (
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 border border-yellow-200">
                                    <Bot className="w-5 h-5 text-yellow-600" />
                                </div>
                            )}
                            
                            <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none whitespace-pre-wrap'
                            }`}>
                                {msg.content}
                            </div>

                            {msg.role === 'user' && (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-200">
                                    <User className="w-5 h-5 text-blue-600" />
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4 justify-start">
                             <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 border border-yellow-200">
                                <Bot className="w-5 h-5 text-yellow-600" />
                            </div>
                            <div className="bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-2 shadow-sm">
                                <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-border">
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
                            placeholder="Ask a question about your lessons..."
                            className="flex-1 max-h-32 min-h-[52px] resize-none border border-input rounded-xl p-3.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-shadow bg-background"
                            rows={1}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl h-[52px] px-6 flex items-center justify-center transition-colors shadow-sm"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
