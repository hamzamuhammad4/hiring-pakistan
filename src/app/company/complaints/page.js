// src/app/company/complaints/page.js
// Complete Complaints Management System

"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, addDoc, query, where, getDocs, 
  orderBy, doc, updateDoc, deleteDoc, onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'technical',
    description: '',
    priority: 'medium',
    attachment: null
  });

  // Categories
  const categories = [
    { id: 'technical', label: '🛠️ Technical Issue', color: 'blue' },
    { id: 'billing', label: '💰 Billing/Payment', color: 'green' },
    { id: 'job', label: '📋 Job Related', color: 'purple' },
    { id: 'applicant', label: '👥 Applicant Related', color: 'orange' },
    { id: 'account', label: '🔐 Account Issue', color: 'red' },
    { id: 'other', label: '❓ Other', color: 'gray' }
  ];

  // Priority Levels
  const priorities = [
    { id: 'low', label: '🟢 Low', color: 'green' },
    { id: 'medium', label: '🟡 Medium', color: 'yellow' },
    { id: 'high', label: '🔴 High', color: 'red' },
    { id: 'urgent', label: '⚡ Urgent', color: 'purple' }
  ];

  useEffect(() => {
    // Check authentication
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        // Get company data
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);
        if (companySnap.exists()) {
          setCompanyData(companySnap.data());
        }

        // Real-time complaints listener
        const q = query(
          collection(db, "complaints"),
          where("companyId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const complaintsList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : null,
            };
          });
          
          setComplaints(complaintsList);
          setLoading(false);
        }, (error) => {
          console.error("Error fetching complaints:", error);
          setLoading(false);
          toast.error("Failed to load complaints");
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("File too large. Max 5MB");
      return;
    }
    setFormData(prev => ({
      ...prev,
      attachment: file
    }));
  };

  // Submit new complaint
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    
    try {
      // Create complaint in Firestore
      const complaintData = {
        companyId: user.uid,
        companyEmail: user.email,
        companyName: companyData?.companyName || 'Unknown',
        title: formData.title,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        status: 'pending',
        attachments: formData.attachment ? formData.attachment.name : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        comments: [],
        resolvedAt: null
      };

      await addDoc(collection(db, "complaints"), complaintData);
      
      // Reset form
      setFormData({
        title: '',
        category: 'technical',
        description: '',
        priority: 'medium',
        attachment: null
      });
      
      setShowForm(false);
      toast.success("Complaint submitted successfully! We'll respond within 24 hours.");
      
    } catch (error) {
      console.error("Error submitting complaint:", error);
      toast.error("Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  // Add comment to complaint
  const handleAddComment = async (complaintId, comment) => {
    if (!comment.trim()) return;

    try {
      const complaintRef = doc(db, "complaints", complaintId);
      await updateDoc(complaintRef, {
        comments: [...(complaints.find(c => c.id === complaintId)?.comments || []), {
          text: comment,
          by: 'company',
          createdAt: new Date()
        }]
      });
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
      'resolved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  // Get category icon
  const getCategoryIcon = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.label.split(' ')[0] : '❓';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-green-600 bg-green-50',
      'medium': 'text-yellow-600 bg-yellow-50',
      'high': 'text-red-600 bg-red-50',
      'urgent': 'text-purple-600 bg-purple-50'
    };
    return colors[priority] || 'text-gray-600 bg-gray-50';
  };

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">⚠️ Complaints & Support</h1>
              <p className="text-gray-600">Report issues, get help, and track your requests</p>
            </div>
            
            {/* Stats */}
            <div className="mt-4 md:mt-0 flex gap-3">
              <div className="bg-yellow-100 px-4 py-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-yellow-800">
                  {complaints.filter(c => c.status === 'pending').length}
                </p>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="bg-blue-100 px-4 py-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-800">
                  {complaints.filter(c => c.status === 'in-progress').length}
                </p>
                <p className="text-xs text-blue-600">In Progress</p>
              </div>
              <div className="bg-green-100 px-4 py-3 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-800">
                  {complaints.filter(c => c.status === 'resolved').length}
                </p>
                <p className="text-xs text-green-600">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* New Complaint Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-8 bg-gradient-to-r from-red-500 to-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-red-600 hover:to-red-800 transition shadow-lg flex items-center gap-3"
          >
            <span className="text-2xl">⚠️</span>
            Submit New Complaint / Report Issue
          </button>
        )}

        {/* Complaint Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-red-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📝 Submit New Complaint</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Complaint Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief summary of the issue"
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500"
                  >
                    {priorities.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Please provide as much detail as possible..."
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attachment (Screenshot/File) - Max 5MB
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="w-full border rounded-lg px-4 py-3"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Supported: Images, PDF, DOC (Max 5MB)
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-lg transition disabled:bg-gray-400"
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-8 py-3 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Your Complaints History</h2>
        
        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
            <div className="text-8xl mb-6">📭</div>
            <p className="text-2xl text-gray-500 mb-4">No complaints yet</p>
            <p className="text-gray-400">Your complaint history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{getCategoryIcon(complaint.category)}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{complaint.title}</h3>
                        <p className="text-sm text-gray-500">
                          ID: #{complaint.id.slice(-6)} • {complaint.createdAt.toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(complaint.status)}`}>
                        {complaint.status || 'pending'}
                      </span>
                      
                      {/* Priority Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 bg-gray-50 p-4 rounded-lg">
                    {complaint.description}
                  </p>

                  {/* Category */}
                  <p className="text-sm text-gray-500 mb-4">
                    Category: {categories.find(c => c.id === complaint.category)?.label || complaint.category}
                  </p>

                  {/* Admin Response Section */}
                  {complaint.adminResponse && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-blue-800 mb-2">Admin Response:</p>
                      <p className="text-sm text-blue-700">{complaint.adminResponse}</p>
                      {complaint.resolvedAt && (
                        <p className="text-xs text-blue-500 mt-2">
                          Resolved on: {complaint.resolvedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Comments Section */}
                  {complaint.comments && complaint.comments.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-sm font-semibold mb-2">Comments:</p>
                      <div className="space-y-2">
                        {complaint.comments.map((comment, idx) => (
                          <div key={idx} className="bg-gray-50 p-3 rounded-lg text-sm">
                            <p>{comment.text}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {comment.by === 'admin' ? '👤 Admin' : '🏢 You'} • {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachment Link */}
                  {complaint.attachments && (
                    <div className="mt-4 text-sm">
                      <span className="text-gray-500">📎 Attachment: </span>
                      <button className="text-cyan-600 hover:underline">
                        {complaint.attachments}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}