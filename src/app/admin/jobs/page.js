// src/app/admin/jobs/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, where, orderBy 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { 
  Briefcase, Search, CheckCircle, XCircle, 
  Eye, Trash2, Clock, Building2, MapPin,
  Filter, ExternalLink, AlertTriangle, RefreshCw, Edit, Calendar,
  ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function AdminJobs() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let jobsList = [];
      try {
        const jobsSnap = await getDocs(query(collection(db, "jobs"), orderBy("createdAt", "desc")));
        jobsList = jobsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
      } catch (err) {
        console.log("Jobs collection not found:", err.message);
        jobsList = [];
      }
      
      setJobs(jobsList);
      
      setStats({
        total: jobsList.length,
        pending: jobsList.filter(j => j.status === 'pending').length,
        approved: jobsList.filter(j => j.status === 'active' || j.status === 'approved').length,
        rejected: jobsList.filter(j => j.status === 'rejected').length
      });
      
      // Reset to first page when data changes
      setCurrentPage(1);
      
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date and time function
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  const handleApprove = async (jobId) => {
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: 'admin'
      });
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: 'active' } : job
        )
      );
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
      
      toast.success("✅ Job approved successfully! It will now appear on the website.");
      
    } catch (err) {
      console.error("Error approving job:", err);
      toast.error("Failed to approve job");
    }
  };

  const handleReject = async (jobId) => {
    const reason = prompt("Please enter reason for rejection:");
    if (!reason) return;
    
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: 'admin'
      });
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, status: 'rejected', rejectionReason: reason } : job
        )
      );
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      toast.success("❌ Job rejected");
    } catch (err) {
      console.error("Error rejecting job:", err);
      toast.error("Failed to reject job");
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      const deletedJob = jobs.find(j => j.id === jobId);
      if (deletedJob) {
        if (deletedJob.status === 'pending') {
          setStats(prev => ({ ...prev, pending: prev.pending - 1, total: prev.total - 1 }));
        } else if (deletedJob.status === 'active') {
          setStats(prev => ({ ...prev, approved: prev.approved - 1, total: prev.total - 1 }));
        } else if (deletedJob.status === 'rejected') {
          setStats(prev => ({ ...prev, rejected: prev.rejected - 1, total: prev.total - 1 }));
        }
      }
      
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  const handleEdit = (jobId) => {
    router.push(`/admin/jobs/edit/${jobId}`);
  };

  // Helper function to format salary with PKR currency
  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    
    if (typeof salary === 'string' && salary.includes('PKR')) {
      return salary;
    }
    
    if (typeof salary === 'number') {
      return `PKR ${salary.toLocaleString()}`;
    }
    
    let salaryStr = String(salary);
    salaryStr = salaryStr.replace(/[$£€]/g, '');
    return `PKR ${salaryStr.trim()}`;
  };

  // Filter jobs by status and search
  const filteredJobs = jobs.filter(job => {
    if (filter === 'pending' && job.status !== 'pending') return false;
    if (filter === 'approved' && job.status !== 'active' && job.status !== 'approved') return false;
    if (filter === 'rejected' && job.status !== 'rejected') return false;
    
    if (searchTerm) {
      return job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             job.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  // Go to page
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock };
      case 'active':
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', icon: CheckCircle };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status || 'Unknown', icon: Briefcase };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Jobs</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={fetchJobs}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Tip: Jobs will appear here when companies post them.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Jobs Approval</h1>
        <p className="text-gray-500 mt-1">Approve or reject job postings from companies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Jobs</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-200">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-sm text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
          <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          <p className="text-sm text-green-600">Approved</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
          <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
          <p className="text-sm text-red-600">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  filter === f 
                    ? 'bg-cyan-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchJobs}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Jobs List - Sorted by newest first */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No jobs found</p>
          <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedJobs.map((job) => {
              const StatusBadge = getStatusBadge(job.status);
              const StatusIcon = StatusBadge.icon;
              
              return (
                <div key={job.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-cyan-100 p-2 rounded-xl">
                          <Briefcase className="h-6 w-6 text-cyan-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                          <p className="text-gray-600 flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4" />
                            {job.companyName}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-3">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MapPin className="h-4 w-4" />
                              {job.location || 'Karachi'}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              {formatSalary(job.salary)}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              {formatDateTime(job.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${StatusBadge.bg} ${StatusBadge.text}`}>
                        <StatusIcon className="h-4 w-4" />
                        {StatusBadge.label}
                      </span>

                      {job.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(job.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(job.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(job.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </button>
                        <Link
                          href={`/admin/jobs/preview/${job.id}`}
                          target="_blank"
                          className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View Job
                        </Link>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {job.rejectionReason && (
                    <div className="mt-4 bg-red-50 p-3 rounded-lg">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {job.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 px-2 py-4 bg-white rounded-lg">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
              </div>
              <div className="flex gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition ${
                          currentPage === pageNum
                            ? 'bg-cyan-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg flex items-center gap-1 transition ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}