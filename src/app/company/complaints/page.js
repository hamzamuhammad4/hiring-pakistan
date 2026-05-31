// src/app/company/complaints/page.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, addDoc, query, where, getDocs, 
  doc, updateDoc, deleteDoc, orderBy, onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { 
  AlertTriangle, Plus, Eye, CheckCircle, XCircle,
  Clock, MessageSquare, Send, Trash2
} from "lucide-react";

export default function CompanyComplaints() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "technical",
    description: "",
    priority: "medium"
  });

  const categories = [
    { id: 'technical', label: '🛠️ Technical Issue' },
    { id: 'billing', label: '💰 Billing/Payment' },
    { id: 'job', label: '📋 Job Related' },
    { id: 'applicant', label: '👥 Applicant Related' },
    { id: 'account', label: '🔐 Account Issue' },
    { id: 'other', label: '❓ Other' }
  ];

  const priorities = [
    { id: 'low', label: '🟢 Low' },
    { id: 'medium', label: '🟡 Medium' },
    { id: 'high', label: '🔴 High' },
    { id: 'urgent', label: '⚡ Urgent' }
  ];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      // Real-time complaints listener
      const q = query(
        collection(db, "complaints"),
        where("companyId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const complaintsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          resolvedAt: doc.data().resolvedAt?.toDate?.() || null
        }));
        setComplaints(complaintsList);
        setLoading(false);
      });

      return () => unsubscribe();
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error("Please fill title and description");
      return;
    }

    setSubmitting(true);
    
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "complaints"), {
        companyId: user.uid,
        companyEmail: user.email,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Complaint submitted successfully!");
      setShowForm(false);
      setFormData({ title: "", category: "technical", description: "", priority: "medium" });
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'resolved') {
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved', icon: CheckCircle };
    }
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
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
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-2">Complaints & Support</h1>
          <p className="text-gray-600">Submit and track your complaints</p>
        </div>

        {/* New Complaint Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> New Complaint
          </button>
        )}

        {/* Complaint Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Submit New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    {priorities.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border rounded-lg px-4 py-2"
                  required
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg disabled:bg-gray-400"
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Complaints List */}
        <h2 className="text-xl font-bold mb-4">Your Complaints</h2>
        
        {complaints.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No complaints yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => {
              const StatusBadge = getStatusBadge(complaint.status);
              const StatusIcon = StatusBadge.icon;
              
              return (
                <div key={complaint.id} className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{complaint.title}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority}
                        </span>
                        <span className="text-xs text-gray-500">{complaint.createdAt?.toLocaleString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${StatusBadge.bg} ${StatusBadge.text}`}>
                      <StatusIcon className="h-4 w-4" /> {StatusBadge.label}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mt-3">{complaint.description}</p>
                  
                  {complaint.adminResponse && (
                    <div className="mt-4 bg-green-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Admin Response:</p>
                      <p className="text-sm text-green-700">{complaint.adminResponse}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}