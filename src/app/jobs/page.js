// src/app/jobs/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";

export default function SingleJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ✅ Debug: Check if id exists
    console.log("Params:", params);
    console.log("Job ID:", id);
    
    if (!id) {
      console.log("No ID found, waiting for params...");
      return;
    }

    const fetchJob = async () => {
      try {
        setLoading(true);
        console.log("Fetching job with ID:", id);
        
        const jobRef = doc(db, "jobs", id);
        const jobDoc = await getDoc(jobRef);

        if (!jobDoc.exists()) {
          setError("Job Not Found");
          setLoading(false);
          return;
        }

        const jobData = { id: jobDoc.id, ...jobDoc.data() };
        console.log("Job found:", jobData.title, "Status:", jobData.status);

        if (jobData.status !== "active") {
          setError("Job Not Available Yet");
          setLoading(false);
          return;
        }

        setJob(jobData);

        // ✅ Update views count
        try {
          await updateDoc(jobRef, {
            views: increment(1)
          });
          console.log("✅ Views incremented for:", jobData.title);
        } catch (updateErr) {
          console.error("Views update error:", updateErr.message);
        }

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, params]);

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
          <Link href="/jobs" className="text-cyan-600 hover:underline">
            ← Browse All Jobs
          </Link>
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
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 text-lg"
        >
          ← Back to Jobs
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-5xl font-bold">H</div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{job.title}</h1>
                <p className="text-xl opacity-90 mb-3">Hiring Pakistan</p>
                <div className="flex flex-wrap gap-3">
                  <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">{job.location || "Karachi"}</span>
                  <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">{job.type || "Full Time"}</span>
                  <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm font-bold">{job.salary || "Negotiable"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div><p className="text-gray-500 text-sm mb-1">Salary</p><p className="text-2xl font-bold text-green-600">{job.salary || "Negotiable"}</p></div>
              <div><p className="text-gray-500 text-sm mb-1">Experience</p><p className="text-2xl font-semibold">{job.experience || "Not specified"}</p></div>
              <div><p className="text-gray-500 text-sm mb-1">Posted</p><p className="text-2xl font-semibold">{postedDate}</p></div>
            </div>

            <div className="prose max-w-none text-gray-700 leading-relaxed text-base">
              <h2 className="text-2xl font-bold mb-4">Job Description</h2>
              <div className="whitespace-pre-wrap">{job.description || "No detailed description available yet."}</div>
            </div>

            <div className="mt-10 text-center">
              <Link href={`/apply/${job.id}`} className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300">
                Apply Now — It's Free!
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}