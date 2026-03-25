"use client";

import { useState } from "react";
import { Building2, ArrowLeft, Mail, Phone, MapPin, Globe, Loader2, CheckCircle2, ShieldAlert, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OnboardSchoolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);
  
  const [formData, setFormData] = useState({
    id: "", // tenant_id
    name: "",
    contactEmail: "",
    phone: "",
    address: "",
    website: "",
    includeDefaultSubjects: true,
  });

  const generateTenantId = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 15);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
        const updated = { ...prev, [name]: value };
        // Auto-generate tenant ID if name changes and ID hasn't been manually edited
        if (name === "name" && prev.id === generateTenantId(prev.name)) {
            updated.id = generateTenantId(value);
        }
        return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Pointing to the UAT API Gateway
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api-gateway-249177610154.asia-south1.run.app/api/v1";
      const response = await fetch(`${API_URL}/schools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to onboard school. Please check if the Tenant ID is unique.");
      }

      const data = await response.json();
      setTempPassword(data.tempPassword || "");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  if (success) {
      return (
          <div className="flex-1 flex flex-col h-full bg-background p-6 lg:p-10">
              <div className="max-w-2xl mx-auto w-full bg-card border border-border rounded-2xl p-10 text-center space-y-6 shadow-sm mt-10">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold">School Onboarded Successfully!</h2>
                  <p className="text-muted-foreground text-lg">
                      The multi-tenant database schema for <strong>{formData.name}</strong> has been provisioned.
                  </p>
                  
                  <div className="bg-muted p-6 rounded-xl text-left space-y-3 border border-border">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                          <ShieldAlert className="w-5 h-5 text-amber-500" /> Admin Credentials Generated
                      </h3>
                      <p className="text-sm text-muted-foreground">The initial administrator account has been created in the Auth Service.</p>
                      <div className="mt-4 space-y-2 font-mono text-sm bg-background p-4 rounded-lg border border-border">
                          <p><span className="text-muted-foreground">Login URL:</span> http://localhost:3000</p>
                          <p><span className="text-muted-foreground">Tenant ID:</span> {formData.id}</p>
                          <p><span className="text-muted-foreground">Email:</span> {formData.contactEmail}</p>
                          <div className="flex items-center gap-2">
                              <p><span className="text-muted-foreground">Password:</span> <span className="text-emerald-600 font-bold">{tempPassword}</span></p>
                              <button
                                  onClick={() => { navigator.clipboard.writeText(tempPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                                  className="p-1 hover:bg-muted rounded transition-colors"
                                  title="Copy password"
                              >
                                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                              </button>
                          </div>
                          <p className="text-xs text-amber-600 mt-2">⚠ Ask the admin to change this password after first login.</p>
                      </div>
                  </div>

                  <div className="pt-6">
                      <Link href="/schools" className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-colors inline-block">
                          View All Schools
                      </Link>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="flex-1 overflow-auto p-6 lg:p-10 pb-20 bg-background text-foreground">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4">
          <Link href="/schools" className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Onboard New School</h2>
            <p className="text-muted-foreground">Provision a new tenant environment and administrator account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm space-y-6">
            
          {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                  {error}
              </div>
          )}

          <div className="space-y-4">
             <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
                 <Building2 className="w-5 h-5 text-primary" /> School Details
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium">School Name *</label>
                    <input 
                        type="text" required name="name" value={formData.name} onChange={handleChange}
                        className="w-full bg-background border border-input rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="Sunrise Public School"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-foreground flex items-center justify-between">
                        <span>Tenant ID (Database Schema) *</span>
                        <span className="text-xs text-muted-foreground font-normal">Must be unique, letters/numbers only</span>
                    </label>
                    <input 
                        type="text" required name="id" value={formData.id} onChange={handleChange}
                        className="w-full bg-muted border border-border rounded-lg px-4 py-2.5 outline-none font-mono text-sm"
                        placeholder="sunriseschool"
                    />
                </div>
             </div>
          </div>

          <div className="space-y-4 pt-4">
             <div className="flex items-center gap-3 bg-blue-50/50 p-4 border border-blue-100 rounded-xl">
                 <input 
                    type="checkbox" 
                    id="includeDefaultSubjects" 
                    name="includeDefaultSubjects"
                    checked={formData.includeDefaultSubjects}
                    onChange={(e) => setFormData({...formData, includeDefaultSubjects: e.target.checked})}
                    className="w-5 h-5 rounded border-blue-300 text-primary focus:ring-primary"
                 />
                 <label htmlFor="includeDefaultSubjects" className="text-sm font-medium cursor-pointer">
                    Initialize with default Indian Curriculum subjects (Math, Science, English, etc.)
                 </label>
             </div>
          </div>

          <div className="space-y-4 pt-4">
             <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-border pb-2">
                 <Mail className="w-5 h-5 text-primary" /> Admin Contact
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium">Administrator Email *</label>
                    <input 
                        type="email" required name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                        className="w-full bg-background border border-input rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="admin@school.in"
                    />
                    <p className="text-xs text-muted-foreground mt-1">We will generate a temporary password for this email.</p>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1"><Phone className="w-4 h-4"/> Phone</label>
                    <input 
                        type="tel" name="phone" value={formData.phone} onChange={handleChange}
                        className="w-full bg-background border border-input rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="+91-9876543210"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium flex items-center gap-1"><Globe className="w-4 h-4"/> Website</label>
                    <input 
                        type="url" name="website" value={formData.website} onChange={handleChange}
                        className="w-full bg-background border border-input rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="https://www.school.in"
                    />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-sm font-medium flex items-center gap-1"><MapPin className="w-4 h-4"/> Address</label>
                    <input 
                        type="text" name="address" value={formData.address} onChange={handleChange}
                        className="w-full bg-background border border-input rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        placeholder="123 Education Lane, City"
                    />
                </div>
             </div>
          </div>

          <div className="pt-6 flex items-center justify-end gap-3">
              <Link href="/schools" className="px-5 py-2.5 text-muted-foreground hover:text-foreground font-medium transition-colors">
                  Cancel
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg shadow-sm hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-70"
              >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Provisioning...</> : "Provision Application"}
              </button>
          </div>

        </form>
      </div>
    </div>
  );
}
