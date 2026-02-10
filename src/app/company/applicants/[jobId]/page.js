// src/app/company/applicants/[jobId]/page.js   ← YE PURA REPLACE KAR DE (Final Polish)

"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ApplicantsPage() {
  const router = useRouter();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("Loading...");

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/company/login");
      return;
    }

    const fetchJobTitle = async () => {
      const jobRef = doc(db, "jobs", jobId);
      const jobSnap = await getDoc(jobRef);
      if (jobSnap.exists()) {
        setJobTitle(jobSnap.data().title);
      }
    };

    fetchJobTitle();

    // Real-time listener
    const q = query(
      collection(db, "applications"),
      where("jobId", "==", jobId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt descending (newest first)
      appList.sort((a, b) => {
        const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
        return dateB - dateA;
      });

      setApplications(appList);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [jobId, router]);

  const updateStatus = async (appId, newStatus) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { status: newStatus });
      alert(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewed: "bg-blue-100 text-blue-800",
      shortlisted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading applicants...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold text-gray-800">
              Applicants for: {jobTitle}
            </h1>
            <p className="text-gray-600 mt-2">Total: {applications.length} applications</p>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">No applications yet</p>
            <p className="text-gray-400 mt-4">Applications will appear here when candidates apply.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{app.fullName}</h3>
                    <p className="text-gray-600 mt-1">{app.email} • {app.phone}</p>
                    <p className="text-gray-600">{app.city}</p>
                    {app.coverLetter && (
                      <p className="text-gray-600 mt-3 line-clamp-3">
                        <strong>Cover Letter:</strong> {app.coverLetter}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <select
                      value={app.status || "pending"}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white min-w-[140px]"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                    </select>

                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(app.status)}`}>
                      {app.status || "pending"}
                    </span>

                    <p className="text-sm text-gray-500">
                      Applied: {app.createdAt ? new Date(app.createdAt.toDate()).toLocaleString() : "Recent"}
                    </p>
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