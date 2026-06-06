// src/app/admin/subscriptions/page.js - NO LIBRARY VERSION
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, getDocs, doc, deleteDoc, updateDoc,
  query, orderBy 
} from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { 
  Plus, Edit, Trash2, CheckCircle, XCircle,
  Star, CreditCard, AlertTriangle, RefreshCw,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const plansSnap = await getDocs(query(collection(db, "subscriptions"), orderBy("price", "asc")));
      const plansList = plansSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPlans(plansList);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (planId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateDoc(doc(db, "subscriptions", planId), {
        status: newStatus,
        updatedAt: new Date()
      });
      setPlans(plans.map(p => p.id === planId ? { ...p, status: newStatus } : p));
      toast.success(`Plan ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deleteDoc(doc(db, "subscriptions", planId));
      setPlans(plans.filter(p => p.id !== planId));
      toast.success("Plan deleted successfully");
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  // Carousel logic - NO EXTERNAL LIBRARY
  const PLANS_PER_PAGE = 3;
  const totalPages = Math.ceil(plans.length / PLANS_PER_PAGE);
  const startIndex = currentPage * PLANS_PER_PAGE;
  const visiblePlans = plans.slice(startIndex, startIndex + PLANS_PER_PAGE);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500">{error}</p>
        <button onClick={fetchPlans} className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded">Retry</button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">📋 Subscription Plans</h1>
          <p className="text-gray-500 text-sm">Manage pricing plans and credit packages</p>
          <p className="text-xs text-cyan-600 mt-1">✅ {plans.length} plans found</p>
        </div>
        <Link href="/admin/subscriptions/add" className="bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p>No plans yet. Create your first plan.</p>
        </div>
      ) : (
        <>
          {/* Carousel Container */}
          <div className="relative">
            {/* Left Arrow */}
            {totalPages > 1 && currentPage > 0 && (
              <button
                onClick={prevPage}
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Cards Grid */}
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePlans.map((plan) => (
                  <div key={plan.id} className={`bg-white rounded-xl shadow-lg overflow-hidden ${plan.popular ? 'border-2 border-cyan-500' : 'border border-gray-200'}`}>
                    {plan.popular && (
                      <div className="bg-cyan-500 text-white text-center py-1 text-sm font-semibold flex items-center justify-center gap-1">
                        <Star className="h-3 w-3" /> MOST POPULAR
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-xl font-bold">{plan.name || 'Plan'}</h3>
                      <p className="text-2xl font-bold text-cyan-600 mt-2">PKR {plan.price?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{plan.credits || 0} credits</p>
                      
                      <div className="mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {plan.status === 'active' ? '● Active' : '○ Inactive'}
                        </span>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul className="mt-4 space-y-1">
                          {plan.features.slice(0, 2).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="flex gap-2 mt-5">
                        <Link href={`/admin/subscriptions/${plan.id}/edit`} className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm">
                          Edit
                        </Link>
                        <button onClick={() => handleToggleStatus(plan.id, plan.status)} className={`flex-1 py-2 rounded-lg text-sm ${plan.status === 'active' ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white'}`}>
                          {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(plan.id)} className="bg-red-600 text-white px-3 py-2 rounded-lg">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            {totalPages > 1 && currentPage < totalPages - 1 && (
              <button
                onClick={nextPage}
                className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Pagination Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(idx)}
                  className={`h-2 rounded-full transition-all ${currentPage === idx ? 'w-6 bg-cyan-600' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 flex justify-between items-center">
            <div className="flex gap-4">
              <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold">{plans.length}</p></div>
              <div><p className="text-xs text-gray-500">Active</p><p className="text-xl font-bold text-green-600">{plans.filter(p => p.status === 'active').length}</p></div>
            </div>
            <button onClick={fetchPlans}><RefreshCw className="h-5 w-5 text-gray-500" /></button>
          </div>
        </>
      )}
    </div>
  );
}