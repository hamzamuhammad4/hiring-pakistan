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
        // Get company credits
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
            toast.error("You don't have permission");
            router.push("/company/dashboard");
            return;
          }
        } else {
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
            };
          });
          setApplications(appList);
          setLoading(false);
        }, (error) => {
          if (error.code === 'failed-precondition') {
            const fallbackQuery = query(collection(db, "applications"), where("jobId", "==", jobId));
            const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
              const appList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(),
              }));
              appList.sort((a, b) => b.createdAt - a.createdAt);
              setApplications(appList);
              setLoading(false);
            });
            return fallbackUnsubscribe;
          }
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [jobId, router]);

  const updateStatus = async (appId, newStatus) => {
    try {
      await updateDoc(doc(db, "applications", appId), { 
        status: newStatus,
        updatedAt: new Date()
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // ✅ CV VIEW WITH CREDIT DEDUCTION
  const handleViewCV = async (application) => {
    const cvUrl = application.cvUrl || application.cv;
    
    if (!cvUrl) {
      toast.error("No CV uploaded");
      return;
    }

    // ✅ CHECK CREDITS
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
      
      // ✅ DEDUCT 1 CREDIT
      await updateDoc(companyRef, {
        credits: increment(-1)
      });
      
      setCompanyCredits(prev => prev - 1);
      toast.success(`1 credit deducted. Remaining credits: ${companyCredits - 1}`);
      
      // Open CV in new tab
      window.open(cvUrl, '_blank');
      
    } catch (err) {
      console.error("Error viewing CV:", err);
      toast.error("Failed to view CV");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <Link href="/company/dashboard" className="text-cyan-600 hover:underline">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Applicants for: {jobTitle}</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Total: {applications.length} applications
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${companyCredits < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              Credits: {companyCredits}
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              Plan: {companyPlan}
            </span>
          </div>
          
          {companyCredits < 5 && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm text-yellow-800">⚠️ Low on credits! Buy more to view CVs.</span>
              <Link href="/company/funds" className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700">
                Buy Credits
              </Link>
            </div>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500">No applications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{app.fullName || app.name}</h3>
                    <p className="text-gray-600 mt-1">{app.email}</p>
                    <p className="text-gray-500 text-sm mt-1">{app.phone && `📞 ${app.phone}`}</p>
                    {app.coverLetter && (
                      <p className="mt-3 text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                        <strong>Cover Letter:</strong> {app.coverLetter}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 min-w-[180px]">
                    <select
                      value={app.status || "pending"}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="pending">⏳ Pending</option>
                      <option value="reviewed">👀 Reviewed</option>
                      <option value="shortlisted">⭐ Shortlisted</option>
                      <option value="rejected">❌ Rejected</option>
                    </select>

                    {/* ✅ CV Button with Credit Check */}
                    <button
                      onClick={() => handleViewCV(app)}
                      disabled={companyCredits < 1}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        companyCredits < 1 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <span>📄</span>
                      View CV {companyCredits >= 1 ? '(1 credit)' : '(No credits)'}
                    </button>

                    <span className={`inline-block px-2 py-1 rounded-full text-xs text-center ${getStatusBadge(app.status)}`}>
                      {app.status || "pending"}
                    </span>
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