// src/app/company/dashboard/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, query, where, getDocs, orderBy, deleteDoc, doc, 
  onSnapshot, getDoc, setDoc, increment 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

import {
  LayoutDashboard,
  Briefcase,
  Users,
  Clock,
  Eye,
  Star,
  TrendingUp,
  PlusCircle,
  CreditCard,
  AlertTriangle,
  Settings,
  LogOut,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  ChevronRight,
  Coins,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  RefreshCw,
  Phone
} from "lucide-react";

export default function CompanyDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyData, setCompanyData] = useState({ credits: 0, plan: 'Basic' });
  const [recentApps, setRecentApps] = useState([]);
  const [rejectedApps, setRejectedApps] = useState([]); // ✅ NEW: Rejected applications
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  
  const [stats, setStats] = useState({
    activeJobs: 0,
    pendingJobs: 0,
    totalApplications: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,  // ✅ NEW: Rejected count
    totalViews: 0
  });

  const prevAppCountRef = useRef(0);

  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary.replace(/\$/g, 'PKR');
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      if (!user.emailVerified) {
        setEmailVerified(false);
        setLoading(false);
        toast.error((t) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-yellow-600" />
              <span className="font-semibold">Email Not Verified!</span>
            </div>
            <p className="text-sm">Please verify your email address to access the dashboard.</p>
            <button
              onClick={async () => {
                setSendingVerification(true);
                try {
                  await user.sendEmailVerification();
                  toast.success('Verification email sent!');
                } catch (err) {
                  toast.error('Failed to send verification email.');
                } finally {
                  setSendingVerification(false);
                  toast.dismiss(t.id);
                }
              }}
              disabled={sendingVerification}
              className="mt-2 bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        ), { duration: 10000 });
        return;
      }
      
      setEmailVerified(true);

      try {
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          setCompanyData(companySnap.data());
        } else {
          await setDoc(companyRef, {
            credits: 0,
            plan: 'Basic',
            createdAt: new Date(),
            email: user.email,
            companyName: user.displayName || 'Company Name',
            updatedAt: new Date()
          });
          setCompanyData({ credits: 0, plan: 'Basic' });
        }

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

        const activeJobsList = jobList.filter(job => job.status === "active");
        const pendingJobsList = jobList.filter(job => job.status === "pending");

        setJobs(activeJobsList);
        setPendingJobs(pendingJobsList);

        let totalViews = 0;
        jobList.forEach(job => {
          totalViews += job.views || 0;
        });

        setStats(prev => ({
          ...prev,
          activeJobs: activeJobsList.length,
          pendingJobs: pendingJobsList.length,
          totalViews: totalViews
        }));

        // ✅ Real-time applications listener
        const unsubscribeApps = onSnapshot(collection(db, "applications"), (snapshot) => {
          const allApps = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const companyApps = allApps.filter((app) =>
            jobList.some((job) => job.id === app.jobId)
          );

          const currentCount = companyApps.length;

          if (currentCount > prevAppCountRef.current && prevAppCountRef.current > 0) {
            toast.success("📬 New application received!");
          }
          prevAppCountRef.current = currentCount;

          // ✅ Update stats with rejected count
          setStats((prev) => ({
            ...prev,
            totalApplications: currentCount,
            pending: companyApps.filter((app) => app.status === "pending").length,
            reviewed: companyApps.filter((app) => app.status === "reviewed").length,
            shortlisted: companyApps.filter((app) => app.status === "shortlisted").length,
            rejected: companyApps.filter((app) => app.status === "rejected" || app.cvStatus === "rejected").length,
          }));

          // Recent applications (pending/shortlisted/reviewed)
          const recent = companyApps.filter(app => 
            app.status === "pending" || app.status === "reviewed" || app.status === "shortlisted"
          ).sort((a, b) => 
            new Date(b.appliedAt?.toDate?.() || 0) - new Date(a.appliedAt?.toDate?.() || 0)
          ).slice(0, 5);
          
          // ✅ Rejected applications
          const rejected = companyApps.filter(app => 
            app.status === "rejected" || app.cvStatus === "rejected"
          ).sort((a, b) => 
            new Date(b.appliedAt?.toDate?.() || 0) - new Date(a.appliedAt?.toDate?.() || 0)
          ).slice(0, 5);
          
          Promise.all(recent.map(async (app) => {
            try {
              const jobDoc = await getDoc(doc(db, "jobs", app.jobId));
              return {
                ...app,
                jobTitle: jobDoc.exists() ? jobDoc.data().title : 'Unknown Job'
              };
            } catch (err) {
              return { ...app, jobTitle: 'Unknown Job' };
            }
          })).then(setRecentApps);
          
          Promise.all(rejected.map(async (app) => {
            try {
              const jobDoc = await getDoc(doc(db, "jobs", app.jobId));
              return {
                ...app,
                jobTitle: jobDoc.exists() ? jobDoc.data().title : 'Unknown Job'
              };
            } catch (err) {
              return { ...app, jobTitle: 'Unknown Job' };
            }
          })).then(setRejectedApps);
        });

        return () => unsubscribeApps();
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/company/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
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
      toast.success("✅ Job deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete job");
    }
  };

  const handleAddCredits = () => {
    router.push("/company/funds");
  };

  if (!emailVerified && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 mb-4">Please verify your email address to access the company dashboard.</p>
          <button
            onClick={async () => {
              setSendingVerification(true);
              try {
                await auth.currentUser?.sendEmailVerification();
                toast.success('Verification email sent!');
              } catch (err) {
                toast.error('Failed to send verification email.');
              } finally {
                setSendingVerification(false);
              }
            }}
            disabled={sendingVerification}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-xl transition"
          >
            {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
          </button>
          <button onClick={handleLogout} className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-cyan-600 mx-auto mb-4" />
          <p className="text-xl text-gray-700 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-lg">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-lg text-gray-600 mb-8">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-cyan-600 text-white px-10 py-4 rounded-xl hover:bg-cyan-700 transition">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white rounded-2xl shadow-lg p-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-8 w-8 text-cyan-600" />
              <h1 className="text-4xl font-bold text-gray-800">
                {companyData?.companyName || "Company"} Dashboard
              </h1>
            </div>
            <p className="text-gray-500">Welcome back, {auth.currentUser?.email}</p>
            {auth.currentUser?.emailVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full mt-1">
                <CheckCircle className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-3 rounded-xl shadow-md">
              <div className="text-sm opacity-90 flex items-center gap-1">
                <Coins className="h-4 w-4" /> Available Credits
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{companyData?.credits || 0}</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm">Plan: {companyData?.plan || 'Basic'}</span>
              </div>
            </div>
            <button onClick={handleAddCredits} className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Add Credits
            </button>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2">
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-4 text-white">
            <Briefcase className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.activeJobs}</h3>
            <p className="text-xs text-blue-100">Active Jobs</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl shadow-lg p-4 text-white">
            <Clock className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.pendingJobs}</h3>
            <p className="text-xs text-orange-100">Pending Approval</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-4 text-white">
            <Users className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.totalApplications}</h3>
            <p className="text-xs text-green-100">Applications</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-lg p-4 text-white">
            <Clock className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.pending}</h3>
            <p className="text-xs text-yellow-100">Pending Review</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg p-4 text-white">
            <Eye className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.reviewed}</h3>
            <p className="text-xs text-indigo-100">Reviewed</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-4 text-white">
            <Star className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.shortlisted}</h3>
            <p className="text-xs text-purple-100">Shortlisted</p>
          </div>
          {/* ✅ NEW: Rejected Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-lg p-4 text-white">
            <XCircle className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.rejected}</h3>
            <p className="text-xs text-red-100">Rejected</p>
          </div>
          <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl shadow-lg p-4 text-white">
            <TrendingUp className="h-7 w-7 mb-2 opacity-90" />
            <h3 className="text-2xl font-bold">{stats.totalViews}</h3>
            <p className="text-xs text-pink-100">Total Views</p>
          </div>
        </div>

        {/* Pending Jobs Section */}
        {pendingJobs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-6 w-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-800">Pending Approval</h2>
            </div>
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-4 mb-4">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {pendingJobs.length} job(s) waiting for admin approval. Once approved, they will appear on the website.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-orange-500 overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{job.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
                      </div>
                      <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 mb-3">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          <MapPin className="h-3 w-3" /> {job.location}
                        </span>
                      )}
                      {job.type && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          <Briefcase className="h-3 w-3" /> {job.type}
                        </span>
                      )}
                      {job.salary && (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          {formatSalary(job.salary)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Posted: {job.createdAt?.toDate?.()?.toLocaleDateString() || "Recent"}
                    </p>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex gap-4">
                      <Link href={`/company/edit-job/${job.id}`} className="text-blue-600 text-sm hover:text-blue-800 transition flex items-center gap-1">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <button onClick={() => handleDelete(job.id)} className="text-red-600 text-sm hover:text-red-800 transition flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ NEW: Rejected Applications Section */}
        {rejectedApps.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-800">Rejected Applications</h2>
              <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">{rejectedApps.length} total</span>
            </div>
            <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-800 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Applications that have been rejected. You can review them here.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rejectedApps.map((app) => (
                <div key={app.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-red-500 overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{app.name || "Candidate"}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">Applied for: {app.jobTitle}</p>
                      </div>
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Rejected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3 mb-3">
                      {app.email && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          <Mail className="h-3 w-3" /> {app.email}
                        </span>
                      )}
                      {app.phone && (
                        <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium">
                          <Phone className="h-3 w-3" /> {app.phone}
                        </span>
                      )}
                    </div>
                    {app.cvRejectionReason && (
                      <div className="mt-2 bg-red-50 p-2 rounded-lg">
                        <p className="text-xs text-red-700">
                          <strong>Rejection Reason:</strong> {app.cvRejectionReason}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Applied: {app.appliedAt?.toDate?.()?.toLocaleDateString() || "Recent"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link href="/company/post-job" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
            <PlusCircle className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Post New Job</h3>
            <p className="text-xs opacity-90">Create a job listing</p>
          </Link>
          <Link href="/company/funds" className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
            <CreditCard className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Buy Credits</h3>
            <p className="text-xs opacity-90">View CVs & upgrade plan</p>
          </Link>
          <Link href="/company/complaints" className="bg-gradient-to-r from-red-500 to-red-700 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Complaints</h3>
            <p className="text-xs opacity-90">Report an issue</p>
          </Link>
          <Link href="/company/settings" className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Settings</h3>
            <p className="text-xs opacity-90">Profile & preferences</p>
          </Link>
        </div>

        {/* Active Jobs */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-gray-700" />
              <h2 className="text-3xl font-bold text-gray-800">Active Jobs</h2>
            </div>
            <Link href="/company/jobs" className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-1">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-4">No active jobs yet.</p>
              <Link href="/company/post-job" className="inline-block bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl hover:from-cyan-700 hover:to-blue-800 transition shadow-lg flex items-center gap-2 mx-auto w-fit">
                <PlusCircle className="h-5 w-5" /> Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map((job) => (
                <div key={job.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 truncate flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-cyan-600" /> {job.title}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 font-medium flex items-center gap-1">
                      <Building2 className="h-4 w-4" /> {job.companyName}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location || "Pakistan"}
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs">{job.type || "Full Time"}</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                        {formatSalary(job.salary) || "Negotiable"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {job.applicantsCount || 0} applicants</span>
                    </div>
                    <p className="text-gray-600 mb-5 line-clamp-2 text-sm">{job.description?.substring(0, 120) || "No description"}...</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/company/edit-job/${job.id}`} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1">
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                      <button onClick={() => handleDelete(job.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                      <Link href={`/jobs/${job.id}`} className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1">
                        <ExternalLink className="h-4 w-4" /> View
                      </Link>
                      <Link href={`/company/applicants/${job.id}`} className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" /> Applicants
                      </Link>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 text-right flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3" />
                      Posted: {job.createdAt ? new Date(job.createdAt.toDate?.() || job.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent"}
                    </p>
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