// src/app/company/dashboard/page.js
// UPDATED WITH LUCIDE REACT ICONS

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

// Import Lucide Icons
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
  Loader2
} from "lucide-react";

export default function CompanyDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyData, setCompanyData] = useState({ credits: 0, plan: 'Basic' });
  const [recentApps, setRecentApps] = useState([]);
  
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    totalViews: 0
  });

  const prevAppCountRef = useRef(0);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          setCompanyData(companySnap.data());
        } else {
          await setDoc(companyRef, {
            credits: 5,
            plan: 'Basic',
            createdAt: new Date(),
            email: user.email,
            companyName: user.displayName || 'Company Name',
            updatedAt: new Date()
          });
          setCompanyData({ credits: 5, plan: 'Basic' });
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

        setJobs(jobList);

        let totalViews = 0;
        jobList.forEach(job => {
          totalViews += job.views || 0;
        });

        setStats(prev => ({
          ...prev,
          activeJobs: jobList.length,
          totalViews: totalViews
        }));

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
            toast.success("📬 New application received!", {
              duration: 5000,
              position: "top-right",
              style: {
                borderRadius: '10px',
                background: '#10B981',
                color: '#fff',
                padding: '16px',
              },
            });
          }
          prevAppCountRef.current = currentCount;

          setStats((prev) => ({
            ...prev,
            totalApplications: currentCount,
            pending: companyApps.filter((app) => app.status === "pending").length,
            reviewed: companyApps.filter((app) => app.status === "reviewed").length,
            shortlisted: companyApps.filter((app) => app.status === "shortlisted").length,
          }));

          const sorted = companyApps.sort((a, b) => 
            new Date(b.appliedAt?.toDate?.() || 0) - new Date(a.appliedAt?.toDate?.() || 0)
          ).slice(0, 5);
          
          Promise.all(sorted.map(async (app) => {
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
          <button
            onClick={() => window.location.reload()}
            className="bg-cyan-600 text-white px-10 py-4 rounded-xl hover:bg-cyan-700 transition font-medium text-lg shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header with Credits */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 bg-white rounded-2xl shadow-lg p-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-8 w-8 text-cyan-600" />
              <h1 className="text-4xl font-bold text-gray-800">Company Dashboard</h1>
            </div>
            <p className="text-gray-500">Welcome back, {auth.currentUser?.email}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Credits Display */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-3 rounded-xl shadow-md">
              <div className="text-sm opacity-90 flex items-center gap-1">
                <Coins className="h-4 w-4" />
                Available Credits
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{companyData?.credits || 0}</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Plan: {companyData?.plan || 'Basic'}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleAddCredits}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <CreditCard className="h-5 w-5" />
              Add Credits
            </button>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg p-5 text-white">
            <Briefcase className="h-8 w-8 mb-2 opacity-90" />
            <h3 className="text-3xl font-bold">{stats.activeJobs}</h3>
            <p className="text-sm text-blue-100">Active Jobs</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-lg p-5 text-white">
            <Users className="h-8 w-8 mb-2 opacity-90" />
            <h3 className="text-3xl font-bold">{stats.totalApplications}</h3>
            <p className="text-sm text-green-100">Total Applications</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-lg p-5 text-white">
            <Clock className="h-8 w-8 mb-2 opacity-90" />
            <h3 className="text-3xl font-bold">{stats.pending}</h3>
            <p className="text-sm text-yellow-100">Pending Review</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg p-5 text-white">
            <Eye className="h-8 w-8 mb-2 opacity-90" />
            <h3 className="text-3xl font-bold">{stats.reviewed}</h3>
            <p className="text-sm text-indigo-100">Reviewed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-5 text-white">
            <Star className="h-8 w-8 mb-2 opacity-90" />
            <h3 className="text-3xl font-bold">{stats.shortlisted}</h3>
            <p className="text-sm text-purple-100">Shortlisted</p>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl shadow-lg p-5 text-white">
            <TrendingUp className="h-8 w-8 mb-2 opacity-90" />
            <h3 className="text-3xl font-bold">{stats.totalViews}</h3>
            <p className="text-sm text-pink-100">Total Views</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Link
            href="/company/post-job"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
          >
            <PlusCircle className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Post New Job</h3>
            <p className="text-xs opacity-90">Create a job listing</p>
          </Link>
          
          <Link
            href="/company/funds"
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
          >
            <CreditCard className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Buy Credits</h3>
            <p className="text-xs opacity-90">View CVs & upgrade plan</p>
          </Link>
          
          <Link
            href="/company/complaints"
            className="bg-gradient-to-r from-red-500 to-red-700 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
          >
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Complaints</h3>
            <p className="text-xs opacity-90">Report an issue</p>
          </Link>
          
          <Link
            href="/company/settings"
            className="bg-gradient-to-r from-gray-600 to-gray-800 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center"
          >
            <Settings className="h-8 w-8 mx-auto mb-2" />
            <h3 className="font-bold">Settings</h3>
            <p className="text-xs opacity-90">Profile & preferences</p>
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-6 w-6 text-cyan-600" />
            <h2 className="text-2xl font-bold text-gray-800">Recent Applications</h2>
          </div>
          {recentApps.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentApps.map(app => (
                <div key={app.id} className="flex justify-between items-center border-b pb-3 hover:bg-gray-50 p-3 rounded-lg transition">
                  <div>
                    <p className="font-semibold text-gray-800 flex items-center gap-2">
                      {app.name}
                      {app.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                      {app.status === 'reviewed' && <Eye className="h-4 w-4 text-blue-500" />}
                      {app.status === 'shortlisted' && <Star className="h-4 w-4 text-green-500" />}
                    </p>
                    <p className="text-sm text-gray-500">for {app.jobTitle}</p>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                      app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <Link
                    href={`/company/applicants/${app.id}`}
                    className="bg-blue-100 text-blue-600 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition flex items-center gap-1"
                  >
                    View <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Posted Jobs */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-7 w-7 text-gray-700" />
              <h2 className="text-3xl font-bold text-gray-800">My Posted Jobs</h2>
            </div>
            <Link
              href="/company/jobs"
              className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
              <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 mb-4">
                You haven't posted any jobs yet.
              </p>
              <Link
                href="/company/post-job"
                className="inline-block bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl hover:from-cyan-700 hover:to-blue-800 transition shadow-lg flex items-center gap-2 mx-auto w-fit"
              >
                <PlusCircle className="h-5 w-5" />
                Post Your First Job
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {jobs.slice(0, 6).map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-800 truncate flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-cyan-600" />
                        {job.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status === 'active' ? (
                          <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                        ) : (
                          <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Closed</span>
                        )}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2 font-medium flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {job.companyName}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location || "Karachi"}
                      </span>
                      <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.type || "Full Time"}
                      </span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {job.salary || "Negotiable"}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {job.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {job.applicantsCount || 0} applicants
                      </span>
                    </div>

                    <p className="text-gray-600 mb-5 line-clamp-2 text-sm">
                      {job.description?.substring(0, 120) || "No description"}...
                    </p>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/company/edit-job/${job.id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                      
                      <Link
                        href={`/jobs/${job.id}`}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Link>
                      
                      <Link
                        href={`/company/applicants/${job.id}`}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <Users className="h-4 w-4" />
                        Applicants
                      </Link>
                    </div>

                    <p className="text-xs text-gray-400 mt-4 text-right flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3" />
                      Posted: {job.createdAt ? new Date(job.createdAt.toDate?.() || job.createdAt).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : "Recent"}
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