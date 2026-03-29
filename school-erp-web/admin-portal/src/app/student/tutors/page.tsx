"use client";

"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';

export default function TutorsPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiClient.get('/lms/api/v1/ai-tutors')
      .then(res => setTutors(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My AI Tutors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutors.map(tutor => (
          <div key={tutor.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 flex flex-col items-start hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">{tutor.name}</h2>
            <span className={`px-2 py-1 rounded text-xs font-medium mb-4 ${tutor.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {tutor.status}
            </span>
            <div className="flex gap-4 mt-auto">
              <button 
                onClick={() => router.push(`/student/tutors/${tutor.id}/insights`)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View Insights
              </button>
              <button 
                onClick={() => router.push(`/student/tutors/${tutor.id}/exam-plan`)}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Exam Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
