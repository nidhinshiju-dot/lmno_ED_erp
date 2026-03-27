"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function PreferencesPage() {
  const params = useParams();
  const tutorId = params.id as string;
  const router = useRouter();
  
  const [prefs, setPrefs] = useState<any>({
    explanationStyle: 'BALANCED',
    answerLength: 'MODERATE',
    preferExamples: true,
    preferFormulas: true,
    preferTheory: true,
    goalType: 'GENERAL_MASTERY'
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tutorId) return;
    apiClient.get(`/lms/api/v1/ai-tutors/${tutorId}/preferences`)
      .then(res => setPrefs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [tutorId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put(`/lms/api/v1/ai-tutors/${tutorId}/preferences`, prefs);
      alert('Preferences saved natively.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading preferences...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-4 block">
        ← Back to Tutors
      </button>
      <h1 className="text-2xl font-bold mb-6">Tutor Behavior Configuration</h1>
      
      <form onSubmit={handleSave} className="bg-white border rounded shadow-sm p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Explanation Style</label>
          <select 
            value={prefs.explanationStyle} 
            onChange={(e) => setPrefs({...prefs, explanationStyle: e.target.value})}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border"
          >
            <option value="BRIEF">Brief & Direct</option>
            <option value="BALANCED">Balanced</option>
            <option value="DETAILED">Detailed Breakdown</option>
            <option value="SOCRATIC">Socratic Questioning</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Answer Length</label>
          <select 
            value={prefs.answerLength} 
            onChange={(e) => setPrefs({...prefs, answerLength: e.target.value})}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border"
          >
            <option value="SHORT">Short</option>
            <option value="MODERATE">Moderate</option>
            <option value="LONG">Extensive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Core Focus Goal</label>
          <select 
            value={prefs.goalType} 
            onChange={(e) => setPrefs({...prefs, goalType: e.target.value})}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 bg-gray-50 border"
          >
            <option value="GENERAL_MASTERY">General Concept Mastery</option>
            <option value="EXAM_PREP">Exam Preparation strictly</option>
            <option value="QUICK_HELP">Homework Quick Help</option>
          </select>
        </div>

        <div className="space-y-3 pt-4 border-t">
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              checked={prefs.preferExamples} 
              onChange={(e) => setPrefs({...prefs, preferExamples: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded" 
            />
            <span className="text-gray-700">Utilize contextual examples frequently</span>
          </label>
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              checked={prefs.preferFormulas} 
              onChange={(e) => setPrefs({...prefs, preferFormulas: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded" 
            />
            <span className="text-gray-700">Display formulas natively</span>
          </label>
          <label className="flex items-center space-x-3">
            <input 
              type="checkbox" 
              checked={prefs.preferTheory} 
              onChange={(e) => setPrefs({...prefs, preferTheory: e.target.checked})}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded" 
            />
            <span className="text-gray-700">Explain underlying theory before answering</span>
          </label>
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Updating Matrix...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
