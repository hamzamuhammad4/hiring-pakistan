// src/app/company/jobs/page.js
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, query, where, getDocs, orderBy, 
  deleteDoc, doc, updateDoc 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { 
  Briefcase, MapPin, DollarSign, Calendar, 
  Building2, Eye, Edit, Trash2, Users, 
  Clock, ChevronLeft, CheckCircle, XCircle
} from "lucide-react";

export default function CompanyJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        const jobsQuery = query(
          collection(db, "jobs"),
          where("companyId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(jobsQuery);
        const jobsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));

        setJobs(jobsList);
      } catch (err) {
        console.error(err);
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [router]);

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(jobs.filter(job => job.id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      toast.error("Failed to delete job");
    }
  };

  const handleStatusToggle = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: newStatus,
        updatedAt: new Date()
      });
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      toast.success(`Job ${newStatus === 'active' ? 'activated' : 'closed'}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary.replace(/\$/g, 'PKR');
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

  const filteredJobs = jobs.filter(job => {
    if (filter === 'active') return job.status === 'active';
    if (filter === 'pending') return job.status === 'pending';
    if (filter === 'closed') return job.status === 'closed';
    return true;
  });

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.status === 'active').length,
    pending: jobs.filter(j => j.status === 'pending').length,
    closed: jobs.filter(j => j.status === 'closed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <Link href="/company/dashboard" className="text-cyan-600 hover:underline flex items-center gap-1 mb-4">
            <ChevronLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">My Jobs</h1>
          <p className="text-gray-500 mt-1">Manage all your job postings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-sm text-blue-600">Total Jobs</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-sm text-green-600">Active</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-sm text-yellow-600">Pending</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-700">{stats.closed}</p>
            <p className="text-sm text-gray-600">Closed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600'}`}>All ({stats.total})</button>
            <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-lg transition ${filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Active ({stats.active})</button>
            <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg transition ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Pending ({stats.pending})</button>
            <button onClick={() => setFilter('closed')} className={`px-4 py-2 rounded-lg transition ${filter === 'closed' ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Closed ({stats.closed})</button>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No jobs found</p>
            <Link href="/company/post-job" className="mt-4 inline-block bg-cyan-600 text-white px-6 py-2 rounded-lg">
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="bg-cyan-100 p-2 rounded-xl">
                        <Briefcase className="h-6 w-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">
                          <Building2 className="h-4 w-4" /> {job.companyName}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{job.location || "Pakistan"}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{job.type || "Full Time"}</span>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{formatSalary(job.salary) || "Negotiable"}</span>
                          <span className="text-xs text-gray-500">Posted: {getTimeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      job.status === 'active' ? 'bg-green-100 text-green-700' :
                      job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {job.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {job.status || 'pending'}
                    </span>
                    
                    <div className="flex gap-2 mt-2">
                      <Link href={`/company/edit-job/${job.id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <Link href={`/jobs/${job.id}`} target="_blank" className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Link>
                      <Link href={`/company/applicants/${job.id}`} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Applicants
                      </Link>
                      <button onClick={() => handleDelete(job.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
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