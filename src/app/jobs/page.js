// src/app/jobs/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Building2, Calendar, Eye } from "lucide-react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // ✅ Only fetch active jobs (admin approved)
      const jobsQuery = query(collection(db, "jobs"), where("status", "==", "active"));
      const snapshot = await getDocs(jobsQuery);
      
      const jobsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      // Sort manually in JavaScript
      jobsList.sort((a, b) => b.createdAt - a.createdAt);
      
      setJobs(jobsList);
      
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    if (!date) return "Recently";
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Browse Jobs</h1>
          <p className="text-gray-500">Find your dream job from top companies in Pakistan</p>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-cyan-600">{jobs.length}</span> jobs
          </p>
        </div>

        {/* Jobs Grid */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No jobs found</h3>
            <p className="text-gray-500">Please check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-800 hover:text-cyan-600">
                      <Link href={`/jobs/${job.id}`}>{job.title || "No Title"}</Link>
                    </h3>
                    {/* ✅ Company Name - Show "Hiring Pakistan" instead of actual company name */}
                    <p className="text-gray-600 flex items-center gap-1 mt-1">
                      <Building2 className="h-4 w-4" /> Hiring Pakistan
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {job.location || "Pakistan"}
                    </span>
                    <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs">{job.type || "Full Time"}</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> {job.salary || "Negotiable"}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description?.substring(0, 100) || "No description"}...</p>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {getTimeAgo(job.createdAt)}
                    </span>
                    <Link href={`/jobs/${job.id}`} className="bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
                      View Details <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}