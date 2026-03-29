"use client";

"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function InsightsPage() {
  const params = useParams();
  const tutorId = params.id as string;
  const router = useRouter();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/lms/api/v1/ai-tutors/${tutorId}/insights`);
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/lms/api/v1/ai-tutors/${tutorId}/refresh-insights`);
      setInsights(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tutorId) fetchInsights();
  }, [tutorId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-800 mb-2 block">
            ← Back to Tutors
          </button>
          <h1 className="text-2xl font-bold">AI Tutor Insights</h1>
        </div>
        <button 
          onClick={refreshInsights}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh AI Data'}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : insights.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-10 text-center text-gray-500">
          No insights currently available. Click refresh to analyze recent activity.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map(i => (
            <div key={i.id} className="bg-white border rounded shadow-sm p-4 relative overflow-hidden">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{i.insightType.replace('_', ' ')}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{(i.confidence * 100).toFixed(0)}% Conf</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{i.topicLabel}</h3>
              <p className="text-gray-600 mb-4 text-sm font-medium">Score Impact: {i.score}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
