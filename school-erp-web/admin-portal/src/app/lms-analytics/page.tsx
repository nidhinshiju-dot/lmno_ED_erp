"use client";
import { useState, useEffect } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

export default function LmsAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
      return;
    }

    apiClient.get('/lms/api/v1/admin/lms/analytics/summary')
      .then(res => setData(res.data))
      .catch(err => console.error("Access blocked or unauthorized:", err))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return <div className="p-10 text-red-600">Checking authorization boundaries...</div>;
  }

  if (loading) return <div className="p-10 font-medium">Fetching global LMS telemetry...</div>;
  if (!data) return <div className="p-10 text-red-600">You must possess Global Admin capabilities to view LMS aggregates.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">LMS Operational Analytics (Tenant: {data.tenantId})</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center">
          <span className="text-gray-500 font-semibold mb-2">Total AI Tutors</span>
          <span className="text-4xl font-extrabold text-blue-600">{data.totalTutors}</span>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center">
          <span className="text-gray-500 font-semibold mb-2">Active AI Tutors</span>
          <span className="text-4xl font-extrabold text-green-600">{data.activeTutors}</span>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center">
          <span className="text-gray-500 font-semibold mb-2">Total AI Sessions</span>
          <span className="text-4xl font-extrabold text-purple-600">{data.totalSessions}</span>
        </div>
        <div className="bg-white p-6 rounded-lg border shadow-sm flex flex-col items-center">
          <span className="text-gray-500 font-semibold mb-2">Syllabi Uploaded</span>
          <span className="text-4xl font-extrabold text-orange-600">{data.totalSyllabi}</span>
        </div>
      </div>
    </div>
  );
}
