"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function AdvancedPlanPage() {
  const params = useParams();
  const tutorId = params.id as string;
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tutorId) return;
    apiClient.post(`/lms/api/v1/ai-tutors/${tutorId}/advanced-study-plan`)
      .then(res => setPlan(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [tutorId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-4 block">
        ← Back to Tutors
      </button>

      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-indigo-900">Advanced Study Plan</h1>
        <p className="text-gray-600 mt-2">Drawn from deep AI memory patterns and personalized focus goals.</p>
        
        {plan && (
          <div className="mt-4 flex gap-4">
            <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded">
              Goal: {plan.focusGoal.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : !plan ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">Failed to compile advanced memory configurations.</div>
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Timeline Generation</h2>
          {plan.tailoredSchedule.map((item: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-32 mb-4 md:mb-0">
                <span className="inline-block bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">
                  {item.dayOffset}
                </span>
                <div className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-widest pl-1">
                  PRIORITY: <br />
                  <span className={item.priority === 'High' ? 'text-red-500' : 'text-green-500'}>{item.priority}</span>
                </div>
              </div>
              <div className="flex-grow pl-0 md:pl-6 border-l-0 md:border-l border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.topic}</h3>
                <p className="text-gray-600">{item.activity}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
