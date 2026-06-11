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
  Plus, Edit, Trash2, CheckCircle, 
  Star, CreditCard, AlertTriangle, RefreshCw,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "subscriptions"), orderBy("price", "asc"));
      const snapshot = await getDocs(q);
      const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  // Carousel logic
  const itemsPerPage = 3;
  const totalSlides = Math.ceil(plans.length / itemsPerPage);
  const startIndex = currentIndex * itemsPerPage;
  const visiblePlans = plans.slice(startIndex, startIndex + itemsPerPage);

  const nextSlide = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>
          <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0891b2', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading plans...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', margin: '24px' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#eab308', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={fetchPlans} style={{ marginTop: '16px', backgroundColor: '#0891b2', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Subscription Plans</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Manage pricing plans and credit packages</p>
          <p style={{ fontSize: '12px', color: '#16a34a', marginTop: '4px' }}> {plans.length} plan(s) found</p>
        </div>
        <Link href="/admin/subscriptions/add" style={{ backgroundColor: '#0891b2', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus style={{ width: '16px', height: '16px' }} /> Add New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '64px', textAlign: 'center' }}>
          <CreditCard style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
          <p>No subscription plans yet</p>
          <Link href="/admin/subscriptions/add" style={{ display: 'inline-block', marginTop: '16px', backgroundColor: '#0891b2', color: 'white', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>Create First Plan</Link>
        </div>
      ) : (
        <>
          {/* CAROUSEL CONTAINER */}
          <div style={{ position: 'relative' }}>
            {/* Left Arrow */}
            {totalSlides > 1 && currentIndex > 0 && (
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <ChevronLeft style={{ width: '20px', height: '20px', color: '#374151' }} />
              </button>
            )}

            {/* Carousel Items */}
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {visiblePlans.map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      border: plan.popular ? '2px solid #0891b2' : '1px solid #e5e7eb'
                    }}
                  >
                    {plan.popular && (
                      <div style={{ backgroundColor: '#0891b2', color: 'white', textAlign: 'center', padding: '6px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Star style={{ width: '12px', height: '12px' }} /> MOST POPULAR
                      </div>
                    )}
                    
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{plan.name || 'Plan'}</h3>
                          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0891b2', margin: '8px 0 4px 0' }}>
                            PKR {plan.price?.toLocaleString() || 0}
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>{plan.credits || 0} credits</p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          backgroundColor: plan.status === 'active' ? '#dcfce7' : '#f3f4f6',
                          color: plan.status === 'active' ? '#166534' : '#6b7280'
                        }}>
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul style={{ marginTop: '12px', marginBottom: '16px', paddingLeft: '20px' }}>
                          {plan.features.slice(0, 2).map((feature, idx) => (
                            <li key={idx} style={{ fontSize: '13px', color: '#4b5563', marginBottom: '4px' }}>
                              <CheckCircle style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px', color: '#22c55e' }} />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <Link
                          href={`/admin/subscriptions/${plan.id}/edit`}
                          style={{
                            flex: 1,
                            backgroundColor: '#2563eb',
                            color: 'white',
                            padding: '8px',
                            borderRadius: '6px',
                            textAlign: 'center',
                            fontSize: '13px',
                            textDecoration: 'none'
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(plan.id, plan.status)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: plan.status === 'active' ? '#e5e7eb' : '#22c55e',
                            color: plan.status === 'active' ? '#374151' : 'white'
                          }}
                        >
                          {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Arrow */}
            {totalSlides > 1 && currentIndex < totalSlides - 1 && (
              <button
                onClick={nextSlide}
                style={{
                  position: 'absolute',
                  right: '-20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronRight style={{ width: '20px', height: '20px', color: '#374151' }} />
              </button>
            )}
          </div>

          {/* Pagination Dots */}
          {totalSlides > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: '8px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: currentIndex === idx ? '#0891b2' : '#d1d5db',
                    width: currentIndex === idx ? '32px' : '8px'
                  }}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div style={{ marginTop: '24px', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div><p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total</p><p style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>{plans.length}</p></div>
              <div><p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Active</p><p style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>{plans.filter(p => p.status === 'active').length}</p></div>
            </div>
            <button onClick={fetchPlans} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><RefreshCw style={{ width: '18px', height: '18px', color: '#6b7280' }} /></button>
          </div>
        </>
      )}
    </div>
  );
}