// src/app/admin/payments/page.js
"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, increment 
} from "firebase/firestore";
import toast from 'react-hot-toast';
import { 
  CreditCard, TrendingUp, DollarSign, 
  Calendar, AlertTriangle, CheckCircle,
  XCircle, Eye, Clock, Building2, Upload,
  RefreshCw, Filter, Star
} from "lucide-react";
import Link from "next/link";

const adminEmails = ["firebasehiringpakistan@gmail.com", "hamzaayyub125@gmail.com"];

export default function AdminPayments() {
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    completedCount: 0,
    pendingCount: 0
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && adminEmails.includes(user.email)) {
        setIsAdmin(true);
        fetchPaymentRequests();
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPaymentRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let requestsList = [];
      try {
        const requestsSnap = await getDocs(query(collection(db, "payment_requests"), orderBy("createdAt", "desc")));
        requestsList = requestsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          approvedAt: doc.data().approvedAt?.toDate?.() || null
        }));
      } catch (err) {
        requestsList = [];
      }
      
      setPaymentRequests(requestsList);
      
      const pendingAmount = requestsList.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0);
      const completedAmount = requestsList.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0);
      
      setStats({
        totalRevenue: completedAmount,
        pendingAmount: pendingAmount,
        completedCount: requestsList.filter(r => r.status === 'approved').length,
        pendingCount: requestsList.filter(r => r.status === 'pending').length
      });
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, amount, companyId, creditsToAdd, planName) => {
    if (!confirm(`✅ Approve payment of PKR ${amount.toLocaleString()}?\n\n${creditsToAdd} credits will be added.`)) return;
    
    try {
      await updateDoc(doc(db, "payment_requests", requestId), {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 'admin',
        notes: 'Payment verified'
      });
      
      const companyRef = doc(db, "companies", companyId);
      const updateData = {
        credits: increment(creditsToAdd),
        lastPayment: new Date()
      };
      if (planName) {
        updateData.plan = planName;
        updateData.planUpdatedAt = new Date();
      }
      await updateDoc(companyRef, updateData);
      
      toast.success(`✅ Approved! ${creditsToAdd} credits added.`);
      fetchPaymentRequests();
      
    } catch (err) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt("Reason for rejection:");
    if (!reason) return;
    
    try {
      await updateDoc(doc(db, "payment_requests", requestId), {
        status: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: 'admin',
        rejectionReason: reason
      });
      
      toast.success("❌ Rejected");
      fetchPaymentRequests();
      
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  const filteredRequests = paymentRequests.filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'approved') return r.status === 'approved';
    if (filter === 'rejected') return r.status === 'rejected';
    return true;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending', icon: Clock };
      case 'approved':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved', icon: CheckCircle };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status, icon: AlertTriangle };
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-500">Admin access only</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">💰 Payment Requests</h1>
        <p className="text-gray-500 mt-1">Verify and approve manual payment requests from companies</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-3 rounded-xl"><DollarSign className="h-6 w-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-green-700">PKR {stats.totalRevenue.toLocaleString()}</p><p className="text-green-600">Total Revenue</p></div>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-3 rounded-xl"><Clock className="h-6 w-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-yellow-700">PKR {stats.pendingAmount.toLocaleString()}</p><p className="text-yellow-600">Pending Amount</p></div>
          </div>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-xl"><CheckCircle className="h-6 w-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-blue-700">{stats.completedCount}</p><p className="text-blue-600">Completed</p></div>
          </div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-3 rounded-xl"><Clock className="h-6 w-6 text-white" /></div>
            <div><p className="text-2xl font-bold text-orange-700">{stats.pendingCount}</p><p className="text-orange-600">Pending</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg capitalize transition ${filter === f ? 'bg-cyan-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f}
            </button>
          ))}
          <button onClick={fetchPaymentRequests} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center gap-2 ml-auto">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {paymentRequests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">No payment requests yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const StatusBadge = getStatusBadge(request.status);
            const StatusIcon = StatusBadge.icon;
            
            return (
              <div key={request.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl"><Building2 className="h-6 w-6 text-blue-600" /></div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{request.companyName || 'Unknown Company'}</h3>
                        <p className="text-sm text-gray-500">{request.companyEmail}</p>
                        
                        {/* ✅ Colored Badges - Properly Aligned */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {/* Payment Method Badge */}
                          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                            <CreditCard className="h-3 w-3" />
                            {request.paymentMethodName || request.paymentMethod}
                          </span>
                          
                          {/* Date Badge */}
                          <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs">
                            <Calendar className="h-3 w-3" />
                            {request.createdAt?.toLocaleString('en-PK', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                          
                          {/* Plan Badge */}
                          {request.planName && (
                            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                              <Star className="h-3 w-3" />
                              {request.planName} Plan
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${StatusBadge.bg} ${StatusBadge.text}`}>
                      <StatusIcon className="h-4 w-4" /> {StatusBadge.label}
                    </span>
                    <p className="text-2xl font-bold text-green-600">PKR {request.amount?.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{request.creditsToAdd} credits</p>
                  </div>
                </div>

                {request.screenshotUrl && (
                  <div className="mt-4">
                    <button onClick={() => window.open(request.screenshotUrl, '_blank')} className="bg-cyan-50 text-cyan-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-cyan-100">
                      <Upload className="h-4 w-4" /> View Screenshot
                    </button>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="mt-4 flex gap-3 pt-4 border-t">
                    <button onClick={() => handleApprove(request.id, request.amount, request.companyId, request.creditsToAdd, request.planName)} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" /> Approve & Add Credits
                    </button>
                    <button onClick={() => handleReject(request.id)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                )}

                {request.rejectionReason && (
                  <div className="mt-3 bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-700"><strong>Rejection:</strong> {request.rejectionReason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}