"use client";

import { useState, useRef, useEffect } from "react";
import { AssistantService } from "@/lib/api";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    action?: string;
}

export default function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: "assistant", content: "Hi! I'm your ERP assistant. Try commands like:\n• \"Register a new student\"\n• \"Show students\"\n• \"Assign class teacher\"" }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setLoading(true);

        try {
            const res = await AssistantService.chat(userMsg);
            const assistantMsg: ChatMessage = { role: "assistant", content: res.message, action: res.action };
            setMessages(prev => [...prev, assistantMsg]);

            // Handle actionable responses
            if (res.action === "OPEN_STUDENT_REGISTRATION") {
                setTimeout(() => router.push("/students"), 1000);
            } else if (res.action === "OPEN_TEACHER_ASSIGNMENT") {
                setTimeout(() => router.push("/assign-teacher"), 1000);
            } else if (res.action === "NAVIGATE_FEES") {
                setTimeout(() => router.push("/fees"), 1000);
            }
        } catch {
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I couldn't process that request. Please ensure the backend is running." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
            >
                <MessageCircle className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold text-sm">ERP Assistant</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:opacity-80 transition-opacity">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Bot className="w-4 h-4" />
                            </div>
                        )}
                        <div className={`max-w-[75%] px-3 py-2 rounded-xl text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                            {msg.content}
                        </div>
                        {msg.role === "user" && (
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="w-4 h-4" />
                            </div>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex gap-2 items-center">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-muted px-3 py-2 rounded-xl text-sm text-muted-foreground">Thinking...</div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command..."
                    className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                    onClick={handleSend}
                    disabled={loading || !input.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
