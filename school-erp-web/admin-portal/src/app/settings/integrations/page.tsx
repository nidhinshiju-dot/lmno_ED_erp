"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { MessageSquare, Save, Settings2, Link2, KeySquare, ShieldCheck } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export default function IntegrationsSettingsPage() {
    const [config, setConfig] = useState({
        phoneNumberId: "",
        businessAccountId: "",
        accessToken: "",
        webhookToken: "school_erp_token",
        enabled: true
    });
    
    const [saving, setSaving] = useState(false);
    const [testState, setTestState] = useState<"idle" | "testing" | "success" | "error">("idle");
    const [testMessage, setTestMessage] = useState("");

    // Load existing config on mount
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const data = await fetchWithAuth("/whatsapp/config");
                if (data && data.phoneNumberId) {
                    setConfig({
                        phoneNumberId: data.phoneNumberId || "",
                        businessAccountId: data.businessAccountId || "",
                        accessToken: data.accessToken || "",
                        webhookToken: data.webhookToken || "school_erp_token",
                        enabled: data.enabled !== false // defaults to true if undefined
                    });
                }
            } catch (error) {
                console.error("Failed to fetch WhatsApp config:", error);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetchWithAuth("/whatsapp/config", {
                method: "POST",
                body: JSON.stringify(config)
            });
            alert("✅ WhatsApp Configuration securely saved to Vault.");
        } catch (error: any) {
            alert(`❌ Failed to save config: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTestState("testing");
        setTestMessage("");
        
        if (!config.phoneNumberId || !config.accessToken) {
            setTestState("error");
            setTestMessage("Phone ID and Access Token are required for pinging.");
            return;
        }

        try {
            const res = await fetchWithAuth("/whatsapp/config/test", {
                method: "POST",
                body: JSON.stringify({
                    phoneNumberId: config.phoneNumberId,
                    accessToken: config.accessToken
                })
            });
            
            if (res.status === "success") {
                setTestState("success");
            } else {
                setTestState("error");
                setTestMessage(res.message || "Unknown error");
            }
        } catch (error: any) {
            setTestState("error");
            setTestMessage(error.message || "Network request failed");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
            <Header />

            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    <div>
                        <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
                            <Settings2 className="w-8 h-8 text-blue-600" />
                            System Integrations
                        </h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Connect your ERP securely to 3rd-party enterprise APIs.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-4 border-b border-slate-200 dark:border-zinc-800 pb-6 mb-8">
                            <div className="w-14 h-14 bg-[#25D366]/10 rounded-2xl flex items-center justify-center shrink-0">
                                <MessageSquare className="w-8 h-8 text-[#25D366]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#25D366] to-teal-500 bg-clip-text text-transparent">Meta WhatsApp Cloud</h3>
                                <p className="text-sm text-slate-500 font-medium">Official API routing node for automated credential delivery and notifications.</p>
                            </div>
                            
                            <div className="ml-auto flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-600 dark:text-zinc-400">Node Status</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={config.enabled} onChange={e => setConfig({...config, enabled: e.target.checked})} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#25D366]"></div>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-锌-300 mb-2">
                                        <Link2 className="w-4 h-4" /> Phone Number ID
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 1029384756"
                                        value={config.phoneNumberId}
                                        onChange={e => setConfig({...config, phoneNumberId: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-[#25D366] transition-all"
                                    />
                                </div>
                                
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                                        <KeySquare className="w-4 h-4" /> System Access Token (Persistent)
                                    </label>
                                    <input 
                                        type="password" 
                                        placeholder="EAAGxxxxxxxxxxxx"
                                        value={config.accessToken}
                                        onChange={e => setConfig({...config, accessToken: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-[#25D366] transition-all"
                                    />
                                    <p className="text-xs text-slate-400 mt-2">Ensure this token has `whatsapp_business_messaging` permissions granted in the Meta App Dashboard.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                                        <Link2 className="w-4 h-4" /> Business Account ID
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 893472983"
                                        value={config.businessAccountId}
                                        onChange={e => setConfig({...config, businessAccountId: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-700 rounded-xl px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-[#25D366] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-zinc-300 mb-2">
                                        <ShieldCheck className="w-4 h-4" /> Webhook Verify Token
                                    </label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={config.webhookToken}
                                            readOnly
                                            className="w-full bg-slate-100 dark:bg-zinc-800 border-none text-slate-500 rounded-xl px-4 py-3 font-mono text-sm"
                                        />
                                        <button className="px-4 py-3 bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-sm font-bold">Copy</button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2">Paste this string into Meta's Webhook Configuration page to link the callback URL.</p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <button 
                                    onClick={handleTestConnection}
                                    disabled={testState === "testing" || !config.phoneNumberId || !config.accessToken}
                                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border ${testState === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : testState === 'error' ? 'bg-red-50 text-red-700 border-red-300' : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:bg-slate-50 disabled:opacity-50'}`}
                                >
                                    {testState === "testing" ? "Pinging Graph API..." : testState === "success" ? "✅ Connection Verified" : testState === "error" ? "❌ Authentication Failed" : "Test Remote Connection"}
                                </button>
                                {testState === "error" && testMessage && (
                                    <span className="text-xs text-red-500 font-semibold">{testMessage}</span>
                                )}
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {saving ? "Securing Keys..." : <><Save className="w-4 h-4" /> Save Configuration</>}
                            </button>
                        </div>

                    </div>
                    
                </div>
            </main>
        </div>
    );
}
