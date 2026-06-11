// src/app/admin/complaints/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy 
} from "firebase/firestore";
import toast from 'react-hot-toast';
import { 
  AlertTriangle, Search, CheckCircle, XCircle,
  Eye, Trash2, Clock, Building2, RefreshCw, Image as ImageIcon, FileText, X, Calendar
} from "lucide-react";
import Link from "next/link";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ✅ Format date and time function
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

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let complaintsList = [];
      try {
        const complaintsSnap = await getDocs(query(collection(db, "complaints"), orderBy("createdAt", "desc")));
        complaintsList = complaintsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
      } catch (err) {
        complaintsList = [];
      }
      
      setComplaints(complaintsList);
      
      setStats({
        total: complaintsList.length,
        pending: complaintsList.filter(c => c.status === 'pending').length,
        resolved: complaintsList.filter(c => c.status === 'resolved').length
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await updateDoc(doc(db, "complaints", selectedComplaint.id), {
        status: 'resolved',
        adminResponse: response,
        resolvedAt: new Date(),
        resolvedBy: 'admin'
      });
      
      toast.success("Complaint resolved successfully!");
      setShowModal(false);
      setSelectedComplaint(null);
      setResponse("");
      fetchComplaints();
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      await deleteDoc(doc(db, "complaints", complaintId));
      toast.success("Complaint deleted");
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const openModal = (complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.adminResponse || "");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedComplaint(null);
    setResponse("");
  };

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'resolved') return c.status === 'resolved';
    return true;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getAttachmentUrl = (complaint) => {
    return complaint.attachment || complaint.attachmentUrl || complaint.image || complaint.screenshot || null;
  };

  const isImage = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={fetchComplaints} className="bg-cyan-600 text-white px-6 py-2 rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Complaints Resolution</h1>
        <p className="text-gray-500 mt-1">Manage and resolve company complaints</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-gray-500">Total Complaints</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 text-center border border-yellow-200">
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
          <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
          <p className="text-green-600">Resolved</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All ({stats.total})</button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg transition ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Pending ({stats.pending})</button>
          <button onClick={() => setFilter('resolved')} className={`px-4 py-2 rounded-lg transition ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Resolved ({stats.resolved})</button>
          <button onClick={fetchComplaints} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 ml-auto flex items-center gap-2 transition"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No complaints yet</p>
          <p className="text-sm text-gray-400 mt-2">Complaints will appear here when users submit them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${complaint.status === 'pending' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                      <AlertTriangle className={`h-5 w-5 ${complaint.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{complaint.title}</h3>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4" />
                        {complaint.companyEmail}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority || 'medium'}
                        </span>
                        {/* ✅ Date and Time with Grey Background Highlight */}
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          {formatDateTime(complaint.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(complaint)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Modal */}
      {showModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Complaint Details</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-bold text-lg">{selectedComplaint.title}</h3>
                <p className="text-sm text-gray-500">From: {selectedComplaint.companyEmail}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority || 'medium'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {formatDateTime(selectedComplaint.createdAt)}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium mb-2">Description:</p>
                <p className="text-gray-700">{selectedComplaint.description}</p>
              </div>
              
              {/* Show Attached Image */}
              {getAttachmentUrl(selectedComplaint) && (
                <div className="border rounded-lg p-4">
                  <p className="font-medium mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Attached File:
                  </p>
                  {isImage(getAttachmentUrl(selectedComplaint)) ? (
                    <div>
                      <img 
                        src={getAttachmentUrl(selectedComplaint)} 
                        alt="Attachment" 
                        className="max-h-48 rounded-lg cursor-pointer hover:opacity-80 transition"
                        onClick={() => {
                          setSelectedImage(getAttachmentUrl(selectedComplaint));
                          setShowImageModal(true);
                        }}
                      />
                      <button
                        onClick={() => {
                          setSelectedImage(getAttachmentUrl(selectedComplaint));
                          setShowImageModal(true);
                        }}
                        className="mt-2 text-cyan-600 text-sm hover:underline"
                      >
                        View Full Image →
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <FileText className="h-8 w-8 text-gray-500" />
                      <a 
                        href={getAttachmentUrl(selectedComplaint)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-600 hover:underline break-all text-sm"
                      >
                        {getAttachmentUrl(selectedComplaint).split('/').pop()}
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              {selectedComplaint.adminResponse && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">Previous Response:</p>
                  <p className="text-green-700">{selectedComplaint.adminResponse}</p>
                </div>
              )}
              
              {selectedComplaint.status !== 'resolved' && (
                <div>
                  <label className="block font-medium mb-2">Your Response</label>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows="4"
                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    placeholder="Write your response here..."
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleResolve}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
                    >
                      {submitting ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div> : <CheckCircle className="h-4 w-4" />}
                      {submitting ? "Resolving..." : "Mark as Resolved"}
                    </button>
                    <button onClick={closeModal} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Fullscreen Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
            >
              ✕ Close
            </button>
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}