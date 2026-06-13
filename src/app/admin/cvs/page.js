// src/app/admin/cvs/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc, getDoc,
  query, where, orderBy 
} from "firebase/firestore";
import toast from 'react-hot-toast';
import { 
  FileText, Search, CheckCircle, XCircle, 
  Eye, Trash2, Clock, User, Mail, Phone, MapPin,
  Download, Filter, Briefcase, Calendar,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function AdminCVs() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const appsSnap = await getDocs(collection(db, "applications"));
      const appsList = await Promise.all(appsSnap.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let jobTitle = 'Unknown Job';
        let jobExists = false;
        
        try {
          if (data.jobId) {
            const jobDoc = await getDoc(doc(db, "jobs", data.jobId));
            if (jobDoc.exists()) {
              const jobData = jobDoc.data();
              jobTitle = jobData.title || 'Unknown Job';
              jobExists = true;
            } else {
              jobTitle = 'Job Not Found (Deleted)';
            }
          } else {
            jobTitle = 'No Job ID Specified';
          }
        } catch (err) {
          console.error(`Error fetching job for ${data.jobId}:`, err);
          jobTitle = 'Error Loading Job';
        }
        
        return {
          id: docSnap.id,
          ...data,
          jobTitle,
          jobExists,
          appliedAt: data.appliedAt?.toDate?.() || data.createdAt?.toDate?.() || new Date()
        };
      }));
      
      appsList.sort((a, b) => b.appliedAt - a.appliedAt);
      setApplications(appsList);
      
      setStats({
        total: appsList.length,
        pending: appsList.filter(a => a.cvStatus === 'pending' || !a.cvStatus).length,
        approved: appsList.filter(a => a.cvStatus === 'approved').length,
        rejected: appsList.filter(a => a.cvStatus === 'rejected').length
      });
      
      // Reset to first page when data changes
      setCurrentPage(1);
      
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
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

  const handleApprove = async (appId) => {
    try {
      await updateDoc(doc(db, "applications", appId), {
        cvStatus: 'approved',
        cvApprovedAt: new Date(),
        cvApprovedBy: 'admin'
      });
      
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, cvStatus: 'approved' } : app
      ));
      
      toast.success("CV approved successfully!");
    } catch (error) {
      console.error("Error approving CV:", error);
      toast.error("Failed to approve CV");
    }
  };

  const handleReject = async (appId) => {
    const reason = prompt("Please enter reason for CV rejection:");
    if (!reason) return;
    
    try {
      await updateDoc(doc(db, "applications", appId), {
        cvStatus: 'rejected',
        cvRejectionReason: reason,
        cvRejectedAt: new Date()
      });
      
      setApplications(applications.map(app => 
        app.id === appId ? { ...app, cvStatus: 'rejected', cvRejectionReason: reason } : app
      ));
      
      toast.success("CV rejected");
    } catch (error) {
      console.error("Error rejecting CV:", error);
      toast.error("Failed to reject CV");
    }
  };

  const handleDelete = async (appId) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    
    try {
      await deleteDoc(doc(db, "applications", appId));
      setApplications(applications.filter(app => app.id !== appId));
      toast.success("Application deleted successfully");
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error("Failed to delete");
    }
  };

  const viewCV = (cvUrl) => {
    if (cvUrl) {
      window.open(cvUrl, '_blank');
    } else {
      toast.error("No CV uploaded");
    }
  };

  // Filter applications by status and search
  const filteredApps = applications.filter(app => {
    if (filter === 'pending' && app.cvStatus === 'approved') return false;
    if (filter === 'pending' && app.cvStatus === 'rejected') return false;
    if (filter === 'approved' && app.cvStatus !== 'approved') return false;
    if (filter === 'rejected' && app.cvStatus !== 'rejected') return false;
    
    if (searchTerm) {
      return app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             app.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

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
    if (!status || status === 'pending') {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock };
    } else if (status === 'approved') {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', icon: CheckCircle };
    } else {
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle };
    }
  };

  const ViewModal = ({ app, onClose }) => {
    if (!app) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Application Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{app.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="h-4 w-4 text-cyan-600" />
                <p className="text-gray-600">{app.jobTitle}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4" /> 
                <span>{app.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" /> 
                <span>{app.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4" /> 
                <span>{app.city || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" /> 
                <span>Applied: {formatDateTime(app.appliedAt)}</span>
              </div>
            </div>
            
            {app.coverLetter && (
              <div>
                <p className="font-medium text-gray-700 mb-2">Cover Letter:</p>
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">{app.coverLetter}</p>
              </div>
            )}
            
            {app.cvUrl && (
              <button
                onClick={() => viewCV(app.cvUrl)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <Download className="h-4 w-4" /> Download CV
              </button>
            )}
            
            {app.cvRejectionReason && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-700"><strong>Rejection Reason:</strong> {app.cvRejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">CV Approval</h1>
        <p className="text-gray-500 mt-1">Review and approve candidate CVs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total CVs</p>
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

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition ${
                  filter === f ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CVs List with Pagination */}
      {filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">No applications found</h3>
          <p className="text-gray-400 mt-2">There are no CVs matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedApps.map((app) => {
              const StatusBadge = getStatusBadge(app.cvStatus);
              const StatusIcon = StatusBadge.icon;
              
              return (
                <div key={app.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="bg-purple-100 p-3 rounded-xl">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{app.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Briefcase className="h-4 w-4 text-cyan-600" />
                            <p className="text-gray-600">Applied for: <span className="font-medium">{app.jobTitle}</span></p>
                          </div>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <Mail className="h-4 w-4" /> {app.email}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              {formatDateTime(app.appliedAt)}
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

                      {(!app.cvStatus || app.cvStatus === 'pending') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowModal(true);
                          }}
                          className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center gap-1 transition"
                        >
                          <Eye className="h-4 w-4" /> Details
                        </button>
                        <button
                          onClick={() => viewCV(app.cvUrl)}
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 transition"
                        >
                          <Download className="h-4 w-4" /> CV
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 transition"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 px-2 py-4 bg-white rounded-lg">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredApps.length)} of {filteredApps.length} applications
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

      {/* Modal */}
      {showModal && <ViewModal app={selectedApp} onClose={() => setShowModal(false)} />}
    </div>
  );
}