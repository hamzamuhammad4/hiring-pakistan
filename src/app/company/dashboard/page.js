// src/app/company/dashboard/page.js
// 100% fixed version (no duplicate alert, real-time count update, toast ready)

"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast'; // ← Ye line add kar (toast ke liye)

export default function CompanyDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pending: 0,
  });

  // Previous application count track karne ke liye (duplicate alert rokne ke liye)
  const prevAppCountRef = useRef(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        // Fetch jobs
        const jobsQuery = query(
          collection(db, "jobs"),
          where("companyId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const jobsSnapshot = await getDocs(jobsQuery);
        const jobList = jobsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setJobs(jobList);

        // Initial stats
        setStats({
          activeJobs: jobList.length,
          totalApplications: 0,
          pending: 0,
        });

        // Real-time applications listener
        const unsubscribeApps = onSnapshot(collection(db, "applications"), (snapshot) => {
          const allApps = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Sirf is company ke jobs ki applications filter karo
          const companyApps = allApps.filter((app) =>
            jobList.some((job) => job.id === app.jobId)
          );

          const currentCount = companyApps.length;

          // Sirf tabhi toast dikhao jab sach mein nayi application aaye
          if (currentCount > prevAppCountRef.current) {
            toast.success("New application received!", {
              duration: 5000,
              position: "top-right",
              style: {
                borderRadius: '10px',
                background: '#10B981',
                color: '#fff',
                padding: '16px',
                fontSize: '16px',
              },
            });

            // Previous count update kar do taake next time duplicate na aaye
            prevAppCountRef.current = currentCount;
          }

          // Stats update
          setStats((prev) => ({
            ...prev,
            totalApplications: currentCount,
            pending: companyApps.filter((app) => app.status === "pending").length,
          }));
        });

        // Cleanup
        return () => {
          unsubscribeApps();
        };
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/company/login");
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter((job) => job.id !== jobId));
      setStats((prev) => ({
        ...prev,
        activeJobs: prev.activeJobs - 1,
      }));
      toast.success("Job deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete job");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-10 max-w-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-lg text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 text-white px-8 py-4 rounded-xl hover:bg-cyan-700 transition font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800">
            Company Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-4xl font-bold text-cyan-600 mb-2">{stats.activeJobs}</h3>
            <p className="text-gray-600 text-lg">Active Jobs</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-4xl font-bold text-cyan-600 mb-2">{stats.totalApplications}</h3>
            <p className="text-gray-600 text-lg">Total Applications</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h3 className="text-4xl font-bold text-cyan-600 mb-2">{stats.pending}</h3>
            <p className="text-gray-600 text-lg">Pending Reviews</p>
          </div>
        </div>

        {/* Post Job Button */}
        <div className="text-center mb-12">
          <Link
            href="/company/post-job"
            className="inline-block bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xl px-12 py-6 rounded-2xl shadow-xl transform hover:scale-105 transition-all"
          >
            Post a New Job
          </Link>
        </div>

        {/* My Posted Jobs */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">My Posted Jobs</h2>

          {jobs.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-10">
              You haven't posted any jobs yet. Start by posting one!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.companyName}</p>

                    <div className="flex flex-wrap gap-3 mb-4">
                      <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm">
                        {job.location || "Karachi"}
                      </span>
                      <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm">
                        {job.type || "Full Time"}
                      </span>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        {job.salary || "Negotiable"}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {job.description?.substring(0, 150) || "No description"}...
                    </p>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-gray-500">
                        Posted: {job.createdAt ? new Date(job.createdAt.toDate()).toLocaleDateString() : "Recent"}
                      </span>

                      <div className="flex gap-4">
                        <Link
                          href={`/company/edit-job/${job.id}`}
                          className="text-blue-600 hover:underline text-sm font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 hover:underline text-sm font-medium"
                        >
                          Delete
                        </button>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="text-cyan-600 hover:underline text-sm font-medium"
                        >
                          View Job
                        </Link>
                        <Link
                          href={`/company/applicants/${job.id}`}
                          className="text-green-600 hover:underline text-sm font-medium"
                        >
                          View Applicants
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}