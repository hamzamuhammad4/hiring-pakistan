// src/app/admin/subscriptions/page.js - 100% WORKING
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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  // Carousel functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(plans.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(plans.length / 3)) % Math.ceil(plans.length / 3));
  };

  const getVisiblePlans = () => {
    const start = currentSlide * 3;
    return plans.slice(start, start + 3);
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

  const visiblePlans = getVisiblePlans();
  const totalSlides = Math.ceil(plans.length / 3);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <p className="text-gray-500 text-sm">Manage pricing plans and credit packages</p>
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
            {totalSlides > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Slides */}
            <div className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePlans.map((plan) => (
                  <div key={plan.id} className={`bg-white rounded-xl shadow-lg overflow-hidden ${plan.popular ? 'border-2 border-cyan-500' : ''}`}>
                    {plan.popular && (
                      <div className="bg-cyan-500 text-white text-center py-1 text-sm">
                        ⭐ MOST POPULAR
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <p className="text-2xl font-bold text-cyan-600 mt-2">PKR {plan.price?.toLocaleString() || 0}</p>
                      <p className="text-sm text-gray-500">{plan.credits} credits</p>
                      
                      <div className="mt-4">
                        <span className={`px-2 py-1 rounded text-xs ${plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link href={`/admin/subscriptions/${plan.id}/edit`} className="flex-1 bg-blue-600 text-white text-center py-2 rounded text-sm">
                          Edit
                        </Link>
                        <button onClick={() => handleToggleStatus(plan.id, plan.status)} className={`flex-1 py-2 rounded text-sm ${plan.status === 'active' ? 'bg-gray-200' : 'bg-green-600 text-white'}`}>
                          {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => handleDelete(plan.id)} className="bg-red-600 text-white px-3 py-2 rounded text-sm">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            {totalSlides > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-lg"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Dots */}
          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-6 bg-cyan-600' : 'w-2 bg-gray-300'}`}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 flex justify-between">
            <div className="flex gap-4">
              <div><span className="text-xs text-gray-500">Total</span><p className="text-xl font-bold">{plans.length}</p></div>
              <div><span className="text-xs text-gray-500">Active</span><p className="text-xl font-bold text-green-600">{plans.filter(p => p.status === 'active').length}</p></div>
            </div>
            <button onClick={fetchPlans}><RefreshCw className="h-5 w-5 text-gray-500" /></button>
          </div>
        </>
      )}
    </div>
  );
}