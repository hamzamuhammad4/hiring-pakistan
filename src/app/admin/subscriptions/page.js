// src/app/admin/subscriptions/page.js - WORKING CAROUSEL
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);

  // Responsive items per page
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else {
        setItemsPerPage(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let plansList = [];
      try {
        const plansSnap = await getDocs(query(collection(db, "subscriptions"), orderBy("price", "asc")));
        plansList = plansSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (err) {
        plansList = [];
      }
      
      setPlans(plansList);
      setCurrentIndex(0);
      
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
      setPlans(plans.map(p => 
        p.id === planId ? { ...p, status: newStatus } : p
      ));
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

  // Carousel navigation
  const totalPages = Math.ceil(plans.length / itemsPerPage);
  const startIndex = currentIndex * itemsPerPage;
  const visiblePlans = plans.slice(startIndex, startIndex + itemsPerPage);

  const nextSlide = () => {
    if (currentIndex < totalPages - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Plans</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={fetchPlans}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Subscription Plans</h1>
          <p className="text-gray-500 mt-1">Manage pricing plans and credit packages</p>
        </div>
        <Link
          href="/admin/subscriptions/add"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
          <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 mb-2">No subscription plans yet</p>
          <p className="text-gray-400 mb-6">Create your first plan using the button above</p>
          <Link
            href="/admin/subscriptions/add"
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" /> Create First Plan
          </Link>
        </div>
      ) : (
        <>
          {/* ✅ CAROUSEL CONTAINER */}
          <div className="relative">
            {/* Carousel Navigation - Left Arrow */}
            {currentIndex > 0 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all"
              >
                <ChevronLeft className="h-6 w-6 text-gray-700" />
              </button>
            )}

            {/* Carousel Items */}
            <div className="overflow-hidden px-2">
              <div 
                className="flex transition-transform duration-300 ease-in-out gap-6"
                style={{ transform: `translateX(0)` }}
              >
                {visiblePlans.map((plan) => (
                  <div 
                    key={plan.id} 
                    className="flex-shrink-0 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                    style={{ flex: `0 0 calc(${100 / itemsPerPage}% - ${(itemsPerPage - 1) * 24 / itemsPerPage}px)` }}
                  >
                    <div 
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl h-full ${
                        plan.popular ? 'border-2 border-cyan-500 relative' : ''
                      }`}
                    >
                      {plan.popular && (
                        <div className="bg-cyan-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2">
                          <Star className="h-4 w-4" /> MOST POPULAR
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                            <p className="text-2xl font-bold text-cyan-600 mt-2">
                              PKR {plan.price?.toLocaleString() || 0}
                            </p>
                            <p className="text-sm text-gray-500">{plan.credits} credits</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            plan.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {plan.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <ul className="space-y-2 mb-6">
                          {plan.features?.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="truncate">{feature}</span>
                            </li>
                          ))}
                          {plan.features?.length > 3 && (
                            <li className="text-xs text-gray-400 pl-6">
                              +{plan.features.length - 3} more
                            </li>
                          )}
                        </ul>

                        <div className="flex gap-2">
                          <Link
                            href={`/admin/subscriptions/${plan.id}/edit`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                          >
                            <Edit className="h-4 w-4" /> Edit
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(plan.id, plan.status)}
                            className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 ${
                              plan.status === 'active'
                                ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {plan.status === 'active' ? (
                              <><XCircle className="h-4 w-4" /> Deactivate</>
                            ) : (
                              <><CheckCircle className="h-4 w-4" /> Activate</>
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Navigation - Right Arrow */}
            {currentIndex < totalPages - 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg transition-all"
              >
                <ChevronRight className="h-6 w-6 text-gray-700" />
              </button>
            )}
          </div>

          {/* Pagination Dots */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === idx 
                      ? 'w-8 bg-cyan-600' 
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stats Summary */}
          <div className="mt-8 bg-gray-50 rounded-xl p-4 flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-6">
              <div>
                <span className="text-xs text-gray-500">Total Plans</span>
                <p className="text-2xl font-bold text-gray-800">{plans.length}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Active Plans</span>
                <p className="text-2xl font-bold text-green-600">
                  {plans.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Inactive Plans</span>
                <p className="text-2xl font-bold text-gray-500">
                  {plans.filter(p => p.status !== 'active').length}
                </p>
              </div>
            </div>
            <button 
              onClick={fetchPlans}
              className="text-gray-500 hover:text-cyan-600 transition"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}