// src/app/admin/complaints/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy 
} from "firebase/firestore";
import toast from 'react-hot-toast';
import { 
  AlertTriangle, Search, CheckCircle, XCircle,
  Eye, Trash2, Clock, MessageSquare, Send,
  Flag, Filter, Building2, RefreshCw
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
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  
  const textareaRef = useRef(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Focus textarea when modal opens
  useEffect(() => {
    if (showModal && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [showModal]);

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
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || null
        }));
      } catch (err) {
        console.log("Complaints collection not found:", err.message);
        complaintsList = [];
      }
      
      setComplaints(complaintsList);
      
      setStats({
        total: complaintsList.length,
        pending: complaintsList.filter(c => c.status === 'pending').length,
        resolved: complaintsList.filter(c => c.status === 'resolved').length
      });
      
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (complaintId, adminResponse) => {
    if (!adminResponse.trim()) {
      toast.error("Please enter a response");
      return;
    }
    
    setSubmitting(true);
    
    try {
      await updateDoc(doc(db, "complaints", complaintId), {
        status: 'resolved',
        adminResponse: adminResponse,
        resolvedAt: new Date(),
        resolvedBy: 'admin'
      });
      
      setComplaints(complaints.map(c => 
        c.id === complaintId ? { ...c, status: 'resolved', adminResponse } : c
      ));
      
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        resolved: prev.resolved + 1
      }));
      
      toast.success("Complaint resolved successfully!");
      setShowModal(false);
      setResponse("");
      setSelectedComplaint(null);
      
    } catch (err) {
      console.error("Error resolving complaint:", err);
      toast.error("Failed to resolve complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (complaintId) => {
    if (!confirm("Delete this complaint?")) return;
    
    try {
      await deleteDoc(doc(db, "complaints", complaintId));
      setComplaints(complaints.filter(c => c.id !== complaintId));
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

  const getCategoryIcon = (category) => {
    const icons = {
      technical: '🛠️',
      billing: '💰',
      job: '📋',
      applicant: '👥',
      account: '🔐',
      other: '❓'
    };
    return icons[category] || '⚠️';
  };

  const ComplaintModal = () => {
    if (!selectedComplaint) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Complaint Details</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <h3 className="font-bold text-lg">{selectedComplaint.title}</h3>
              <p className="text-sm text-gray-500">
                From: {selectedComplaint.companyEmail || selectedComplaint.companyId} • {selectedComplaint.createdAt?.toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedComplaint.priority)}`}>
                {selectedComplaint.priority || 'medium'}
              </span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                {getCategoryIcon(selectedComplaint.category)} {selectedComplaint.category}
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Description:</p>
              <p className="text-gray-700">{selectedComplaint.description}</p>
            </div>
            
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
                  ref={textareaRef}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows="4"
                  className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  placeholder="Write your response here..."
                  disabled={submitting}
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleResolve(selectedComplaint.id, response)}
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {submitting ? "Resolving..." : "Mark as Resolved"}
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Complaints</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={fetchComplaints} className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700">
          <RefreshCw className="h-4 w-4 inline mr-2" /> Retry
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-gray-500">Total Complaints</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-yellow-600">Pending</p>
        </div>
        <div className="bg-green-50 rounded-xl p-6 text-center">
          <p className="text-3xl font-bold text-green-700">{stats.resolved}</p>
          <p className="text-green-600">Resolved</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg transition ${filter === 'all' ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            All ({stats.total})
          </button>
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg transition ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Pending ({stats.pending})
          </button>
          <button onClick={() => setFilter('resolved')} className={`px-4 py-2 rounded-lg transition ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
            Resolved ({stats.resolved})
          </button>
          <button onClick={fetchComplaints} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2 ml-auto">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No complaints yet</p>
          <p className="text-sm text-gray-400 mt-2">Complaints will appear here when companies submit them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl ${complaint.status === 'resolved' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {complaint.status === 'resolved' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{complaint.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {complaint.companyEmail || complaint.companyId?.slice(-8) || 'Unknown'}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority || 'medium'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {complaint.createdAt?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(complaint)}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" /> View
                  </button>
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ComplaintModal />}
    </div>
  );
}