// src/app/company/applicants/[jobId]/page.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, query, where, doc, getDoc, 
  updateDoc, onSnapshot, increment 
} from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Eye, Mail, Phone, MapPin, CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from "lucide-react";

export default function ApplicantsPage() {
  const router = useRouter();
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [companyCredits, setCompanyCredits] = useState(0);
  const [companyPlan, setCompanyPlan] = useState("Basic");
  const [viewingCV, setViewingCV] = useState(null);

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

        // Get job title
        const jobRef = doc(db, "jobs", jobId);
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          setJobTitle(jobSnap.data().title);
        }

        // Real-time applications listener
        const q = query(collection(db, "applications"), where("jobId", "==", jobId));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const appList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          }));
          appList.sort((a, b) => b.createdAt - a.createdAt);
          setApplications(appList);
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

  // CV View with credit deduction
  const handleViewCV = async (application) => {
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
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="font-semibold">Insufficient Credits!</span>
          </div>
          <p className="text-sm">You need at least 1 credit to view this CV.</p>
          <p className="text-xs opacity-80">Current credits: {companyCredits}</p>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/company/funds");
            }}
            className="mt-2 bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyan-700"
          >
            Buy Credits Now →
          </button>
        </div>
      ), { duration: 8000 });
      return;
    }

    setViewingCV(application.id);
    
    try {
      const user = auth.currentUser;
      const companyRef = doc(db, "companies", user.uid);
      
      // Deduct 1 credit
      await updateDoc(companyRef, {
        credits: increment(-1)
      });
      
      setCompanyCredits(prev => prev - 1);
      toast.success(`1 credit deducted. Remaining credits: ${companyCredits - 1}`);
      window.open(cvUrl, '_blank');
      
    } catch (err) {
      console.error("Error viewing CV:", err);
      toast.error("Failed to view CV. Please try again.");
    } finally {
      setViewingCV(null);
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
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              companyCredits === 0 ? 'bg-red-100 text-red-800' : 
              companyCredits < 5 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-green-100 text-green-800'
            }`}>
              Credits: {companyCredits}
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              Plan: {companyPlan}
            </span>
          </div>
          
          {/* ✅ Only show warning when credits = 0 */}
          {companyCredits === 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-800 font-medium">No credits available! Buy credits to view CVs.</span>
              </div>
              <Link href="/company/funds" className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700">
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
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {app.fullName?.charAt(0) || app.name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{app.fullName || app.name}</h3>
                        {/* ✅ Email, Phone, City - REMOVED */}
                        {/* Only Cover Letter shows now */}
                        {app.coverLetter && (
                          <p className="mt-2 text-gray-600 text-sm bg-gray-50 p-2 rounded">
                            <strong>Cover Letter:</strong> {app.coverLetter}
                          </p>
                        )}
                        {app.experience && (
                          <p className="mt-2 text-gray-600 text-sm">
                            <strong>Experience:</strong> {app.experience}
                          </p>
                        )}
                        {app.skills && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.skills.split(',').map((skill, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[160px]">
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

                    {/* CV Button */}
                    <button
                      onClick={() => handleViewCV(app)}
                      disabled={companyCredits < 1 || viewingCV === app.id}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        companyCredits < 1 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      {viewingCV === app.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      {viewingCV === app.id ? 'Opening...' : (companyCredits >= 1 ? `View CV (1 credit)` : 'No Credits')}
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