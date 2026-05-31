// src/app/jobs/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import { 
  Briefcase, Building2, MapPin, DollarSign, Clock, 
  Calendar, Users, GraduationCap, AlertCircle 
} from "lucide-react";

export default function SingleJobPage() {
  const router = useRouter();
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

        const jobData = { id: jobDoc.id, ...jobDoc.data() };

        if (jobData.status !== "active") {
          setError("Job Not Available Yet");
          setLoading(false);
          return;
        }

        setJob(jobData);

        // Update views
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-3">{error || "Job Not Found"}</h1>
          <Link href="/jobs" className="text-cyan-600 hover:underline">← Browse All Jobs</Link>
        </div>
      </div>
    );
  }

  const postedDate = job.createdAt
    ? new Date(job.createdAt.toDate ? job.createdAt.toDate() : job.createdAt.seconds * 1000).toLocaleDateString()
    : "Recent";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 text-lg">
          ← Back to Jobs
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center p-2">
                <Image 
                  src="/logo.png" 
                  alt="Hiring Pakistan" 
                  width={60} 
                  height={60} 
                  className="rounded-lg object-contain"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{job.title}</h1>
                <p className="text-xl opacity-90 mb-3 flex items-center gap-1">
                  <Building2 className="h-5 w-5" /> Hiring Pakistan
                </p>
                <div className="flex flex-wrap gap-3">
                  {job.location && <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">{job.location}</span>}
                  {job.type && <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">{job.type}</span>}
                  {job.shift && job.shift !== "Morning" && <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">Shift: {job.shift}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1 flex items-center gap-1"><DollarSign className="h-4 w-4" /> Salary</p>
                <p className="text-xl font-bold text-green-600">{job.salary || "Negotiable"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1 flex items-center gap-1"><Clock className="h-4 w-4" /> Experience</p>
                <p className="text-xl font-semibold">{job.experience || "Not specified"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1 flex items-center gap-1"><GraduationCap className="h-4 w-4" /> Qualification</p>
                <p className="text-xl font-semibold">{job.qualification || "Not specified"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-gray-500 text-sm mb-1 flex items-center gap-1"><Calendar className="h-4 w-4" /> Posted</p>
                <p className="text-xl font-semibold">{postedDate}</p>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {job.description || "No detailed description available yet."}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Benefits</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                  {job.benefits}
                </div>
              </div>
            )}

            {/* Additional Info */}
            {(job.vacancies || job.contact) && (
              <div className="bg-blue-50 p-4 rounded-xl mb-8">
                <h3 className="font-semibold text-blue-800 mb-2">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {job.vacancies && <p><strong>Vacancies:</strong> {job.vacancies}</p>}
                  {job.contact && <p><strong>Contact:</strong> {job.contact}</p>}
                  {job.shift && <p><strong>Shift:</strong> {job.shift}</p>}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="mt-10 text-center">
              <Link
                href={`/apply/${job.id}`}
                className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Apply Now — It's Free!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}