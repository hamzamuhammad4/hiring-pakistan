// src/app/admin/jobs/preview/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Clock, Calendar, GraduationCap, Building2, ArrowLeft } from "lucide-react";

export default function AdminJobPreviewPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobDoc = await getDoc(jobRef);

        if (!jobDoc.exists()) {
          setError("Job Not Found");
          setLoading(false);
          return;
        }

        setJob({ id: jobDoc.id, ...jobDoc.data() });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-3">{error || "Job Not Found"}</h1>
          <Link href="/admin/jobs" className="text-cyan-600 hover:underline">← Back to Jobs</Link>
        </div>
      </div>
    );
  }

  const postedDate = job.createdAt?.toDate
    ? job.createdAt.toDate().toLocaleDateString("en-PK")
    : job.createdAt?.seconds
    ? new Date(job.createdAt.seconds * 1000).toLocaleDateString("en-PK")
    : "Recent";

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link href="/admin/jobs" className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </Link>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            job.status === 'active' ? 'bg-green-100 text-green-700' :
            job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Status: {job.status || 'pending'}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                <Image src="/logo.png" alt="Hiring Pakistan" width={40} height={40} className="object-contain p-1" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{job.title}</h1>
                <p className="text-cyan-100 text-sm sm:text-base flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" /> {job.companyName}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500 text-xs mb-1">📍 Location</p><p className="font-medium text-sm">{job.location || "Pakistan"}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500 text-xs mb-1">💼 Job Type</p><p className="font-medium text-sm">{job.type || "Full Time"}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500 text-xs mb-1">💰 Salary</p><p className="font-medium text-green-600 text-sm">{job.salary || "Negotiable"}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500 text-xs mb-1">⏳ Experience</p><p className="font-medium text-sm">{job.experience || "Not specified"}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500 text-xs mb-1">🎓 Qualification</p><p className="font-medium text-sm">{job.qualification || "Not specified"}</p></div>
              <div className="bg-gray-50 p-3 rounded-lg"><p className="text-gray-500 text-xs mb-1">📅 Posted</p><p className="font-medium text-sm">{postedDate}</p></div>
            </div>

            {job.description && <div className="mb-5"><h2 className="text-lg font-bold mb-2">Job Description</h2><p className="text-gray-600 text-sm whitespace-pre-wrap">{job.description}</p></div>}
            {job.requirements && <div className="mb-5"><h2 className="text-lg font-bold mb-2">Requirements</h2><p className="text-gray-600 text-sm whitespace-pre-wrap">{job.requirements}</p></div>}
            {job.benefits && <div className="mb-5"><h2 className="text-lg font-bold mb-2">Benefits</h2><p className="text-gray-600 text-sm whitespace-pre-wrap">{job.benefits}</p></div>}

            {job.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-yellow-800">⚠️ This job is <strong>pending approval</strong>. Review and then approve/reject from admin panel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}