// src/app/company/applicants/[jobId]/page.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, query, where, getDocs, doc, getDoc, 
  updateDoc, onSnapshot, orderBy, increment 
} from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

export default function ApplicantsPage() {
  const router = useRouter();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("Loading...");
  const [companyCredits, setCompanyCredits] = useState(0);
  const [companyPlan, setCompanyPlan] = useState("Basic");

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        // Get company credits and plan
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          setCompanyCredits(companySnap.data().credits || 0);
          setCompanyPlan(companySnap.data().plan || "Basic");
        }

        // Fetch job title
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          setJobTitle(jobSnap.data().title);
          
          // Check if this job belongs to current user
          if (jobSnap.data().companyId !== user.uid) {
            toast.error("You don't have permission to view this job's applications");
            router.push("/company/dashboard");
            return;
          }
        } else {
          toast.error("Job not found");
          router.push("/company/dashboard");
          return;
        }

        // Real-time listener for applications
        const q = query(
          collection(db, "applications"),
          where("jobId", "==", jobId),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const appList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              appliedAt: data.appliedAt?.toDate ? data.appliedAt.toDate() : new Date(),
            };
          });

          setApplications(appList);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching applications:", error);
          
          // If orderBy fails, try without orderBy
          if (error.code === 'failed-precondition') {
            const fallbackQuery = query(
              collection(db, "applications"),
              where("jobId", "==", jobId)
            );
            
            const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
              const appList = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                };
              });
              
              appList.sort((a, b) => b.createdAt - a.createdAt);
              setApplications(appList);
              setLoading(false);
            });
            
            return fallbackUnsubscribe;
          }
          
          setLoading(false);
          toast.error("Failed to load applications");
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
        toast.error("Something went wrong");
      }
    });

    return () => unsubscribeAuth();
  }, [jobId, router]);

  const updateStatus = async (appId, newStatus) => {
    try {
      const appRef = doc(db, "applications", appId);
      await updateDoc(appRef, { 
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    }
  };

  const handleViewCV = async (application) => {
    // Check if CV exists
    const cvUrl = application.cvUrl || application.cv;
    
    if (!cvUrl) {
      toast.error("No CV uploaded");
      return;
    }

    // Check credits
    if (companyCredits < 1) {
      toast.error((t) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold">⚠️ Insufficient Credits!</span>
          </div>
          <p className="text-sm">You need at least 1 credit to view this CV.</p>
          <p className="text-xs opacity-80">Current credits: {companyCredits}</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/company/funds");
            }}
            className="mt-2 bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Buy Credits Now →
          </button>
        </div>
      ), { duration: 8000 });
      return;
    }

    try {
      const user = auth.currentUser;
      const companyRef = doc(db, "companies", user.uid);
      
      // Deduct 1 credit
      await updateDoc(companyRef, {
        credits: increment(-1)
      });
      
      setCompanyCredits(prev => prev - 1);
      toast.success(`1 credit deducted. Remaining credits: ${companyCredits - 1}`);
      
      // ✅ Open CV from VPS storage (direct URL)
      window.open(cvUrl, '_blank');
      
    } catch (err) {
      console.error("Error viewing CV:", err);
      toast.error("Failed to view CV. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      reviewed: "bg-blue-100 text-blue-800 border-blue-200",
      shortlisted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Credits */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-gray-800">
                Applicants for: {jobTitle}
              </h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Total: {applications.length} applications
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  Credits: {companyCredits}
                </span>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                  Plan: {companyPlan}
                </span>
              </p>
            </div>
            
            {companyCredits < 1 && applications.length > 0 && (
              <Link
                href="/company/funds"
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg flex items-center gap-2"
              >
                ⚠️ Insufficient Credits - Add Funds
              </Link>
            )}
          </div>
          
          {/* Low Credits Warning */}
          {companyCredits > 0 && companyCredits < 5 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span className="text-sm text-yellow-800">Low credits! You have only {companyCredits} credits left.</span>
              </div>
              <Link href="/company/funds" className="text-yellow-700 text-sm font-medium hover:underline">
                Add Credits →
              </Link>
            </div>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-20 text-center">
            <div className="text-8xl mb-6">📭</div>
            <p className="text-3xl text-gray-600 font-medium mb-3">No applications yet</p>
            <p className="text-gray-400 text-lg">Applications will appear here when candidates apply.</p>
            <p className="text-gray-400 mt-2">Share your job link to get applications!</p>
            
            <div className="mt-8 bg-gray-50 p-4 rounded-xl inline-block">
              <code className="text-sm text-gray-600">
                {typeof window !== 'undefined' && `${window.location.origin}/jobs/${jobId}`}
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`);
                  toast.success('Job link copied!');
                }}
                className="ml-3 text-cyan-600 hover:text-cyan-800"
              >
                📋 Copy
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={app.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Left side - Applicant Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {app.fullName?.charAt(0) || app.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {app.fullName || app.name || 'Unknown'}
                          </h3>
                          <div className="flex flex-wrap gap-3 mt-2 text-sm">
                            <span className="text-gray-600 flex items-center gap-1">
                              📧 {app.email || 'No email'}
                            </span>
                            <span className="text-gray-600 flex items-center gap-1">
                              📞 {app.phone || app.mobile || 'No phone'}
                            </span>
                            <span className="text-gray-600 flex items-center gap-1">
                              📍 {app.city || app.location || 'N/A'}
                            </span>
                          </div>
                          
                          {app.experience && (
                            <p className="text-gray-600 mt-2 text-sm">
                              <span className="font-medium">Experience:</span> {app.experience}
                            </p>
                          )}
                          
                          {app.skills && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {app.skills.split(',').map((skill, idx) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                  {skill.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {app.coverLetter && (
                            <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">📝 Cover Letter:</span> {app.coverLetter}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="lg:w-72 flex flex-col gap-3">
                      {/* Status Badge */}
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(app.status)}`}>
                        Status: {app.status || 'pending'}
                      </span>

                      {/* Applied Date */}
                      <p className="text-xs text-gray-400">
                        Applied: {app.createdAt ? new Date(app.createdAt).toLocaleString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'Recent'}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-2">
                        {/* Status Dropdown */}
                        <select
                          value={app.status || "pending"}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white text-sm"
                        >
                          <option value="pending">⏳ Pending</option>
                          <option value="reviewed">👀 Reviewed</option>
                          <option value="shortlisted">⭐ Shortlisted</option>
                          <option value="rejected">❌ Rejected</option>
                        </select>

                        {/* CV Button - VPS Storage Se Direct Open */}
                        {(app.cvUrl || app.cv) && (
                          <button
                            onClick={() => handleViewCV(app)}
                            disabled={companyCredits < 1}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                              companyCredits < 1 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700 text-white'
                            }`}
                          >
                            <span>📄</span>
                            View CV {companyCredits >= 1 ? '(1 credit)' : '(Insufficient credits)'}
                          </button>
                        )}

                        {/* Contact Button */}
                        {app.email && (
                          <a
                            href={`mailto:${app.email}`}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition"
                          >
                            <span>✉️</span>
                            Contact
                          </a>
                        )}
                      </div>
                    </div>
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