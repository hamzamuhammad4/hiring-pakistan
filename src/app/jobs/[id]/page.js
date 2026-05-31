"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Clock, Calendar, GraduationCap, Building2 } from "lucide-react";

export default function SingleJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      console.warn("No job ID found in URL");
      setError("Invalid Job Link");
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setError("Job Not Found");
          setLoading(false);
          return;
        }

        const jobData = { id: jobSnap.id, ...jobSnap.data() };

        if (jobData.status !== "active") {
          setError("Job Not Available Yet");
          setLoading(false);
          return;
        }

        setJob(jobData);
        await updateDoc(jobRef, { views: increment(1) });
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
          <Link href="/jobs" className="text-cyan-600 hover:underline inline-block">← Browse All Jobs</Link>
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
        <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 font-medium mb-4 text-sm sm:text-base">
          ← Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with Logo */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-5 py-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center shadow-md overflow-hidden">
                <Image src="/logo.png" alt="Hiring Pakistan" width={40} height={40} className="object-contain p-1" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{job.title}</h1>
                <p className="text-cyan-100 text-sm sm:text-base flex items-center gap-1 mt-1">
                  <Building2 className="h-3 w-3 sm:h-4 sm:w-4" /> Hiring Pakistan
                </p>
              </div>
            </div>
          </div>

          {/* Job Info Grid */}
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

            <div className="mt-6 text-center">
              <Link href={`/apply/${job.id}`} className="inline-block bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-base sm:text-lg px-8 py-3 rounded-xl shadow-md transition hover:scale-105">
                Apply Now — Free!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}