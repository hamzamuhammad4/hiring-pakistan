// src/app/admin/subscriptions/page.js - INLINE STYLES VERSION
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
        <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#0891b2', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <AlertTriangle style={{ width: '48px', height: '48px', color: '#eab308', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280' }}>{error}</p>
        <button onClick={fetchPlans} style={{ marginTop: '16px', backgroundColor: '#0891b2', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>📋 Subscription Plans</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>Manage pricing plans and credit packages</p>
        </div>
        <Link href="/admin/subscriptions/add" style={{ backgroundColor: '#0891b2', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Plus style={{ width: '20px', height: '20px' }} /> Add New Plan
        </Link>
      </div>

      {plans.length === 0 ? (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '64px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <CreditCard style={{ width: '64px', height: '64px', color: '#d1d5db', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '18px', color: '#6b7280' }}>No subscription plans yet</p>
          <Link href="/admin/subscriptions/add" style={{ display: 'inline-block', marginTop: '16px', backgroundColor: '#0891b2', color: 'white', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none' }}>Create First Plan</Link>
        </div>
      ) : (
        <>
          {/* Carousel Container */}
          <div style={{ position: 'relative' }}>
            {/* Left Arrow */}
            {totalSlides > 1 && currentIndex > 0 && (
              <button
                onClick={prevSlide}
                style={{
                  position: 'absolute',
                  left: '-16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <ChevronLeft style={{ width: '20px', height: '20px' }} />
              </button>
            )}

            {/* Carousel Items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {visiblePlans.map((plan) => (
                  <div
                    key={plan.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s',
                      border: plan.popular ? '2px solid #0891b2' : '1px solid #e2e8f0',
                      position: 'relative'
                    }}
                  >
                    {plan.popular && (
                      <div style={{ backgroundColor: '#0891b2', color: 'white', textAlign: 'center', padding: '8px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Star style={{ width: '16px', height: '16px' }} /> MOST POPULAR
                      </div>
                    )}
                    
                    <div style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{plan.name}</h3>
                          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0891b2', marginTop: '8px', marginBottom: '4px' }}>
                            PKR {plan.price?.toLocaleString() || 0}
                          </p>
                          <p style={{ fontSize: '14px', color: '#6b7280' }}>{plan.credits} credits</p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          backgroundColor: plan.status === 'active' ? '#dcfce7' : '#f3f4f6',
                          color: plan.status === 'active' ? '#166534' : '#6b7280'
                        }}>
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {plan.features && plan.features.length > 0 && (
                        <ul style={{ marginTop: '16px', marginBottom: '24px', paddingLeft: 0, listStyle: 'none' }}>
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#4b5563', marginBottom: '8px' }}>
                              <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />
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
                            borderRadius: '8px',
                            textAlign: 'center',
                            fontSize: '14px',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit style={{ width: '16px', height: '16px' }} /> Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(plan.id, plan.status)}
                          style={{
                            flex: 1,
                            padding: '8px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            backgroundColor: plan.status === 'active' ? '#e5e7eb' : '#22c55e',
                            color: plan.status === 'active' ? '#4b5563' : 'white'
                          }}
                        >
                          {plan.status === 'active' ? <XCircle style={{ width: '16px', height: '16px' }} /> : <CheckCircle style={{ width: '16px', height: '16px' }} />}
                          {plan.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 style={{ width: '16px', height: '16px' }} />
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
                  right: '-16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 10,
                  backgroundColor: 'white',
                  borderRadius: '9999px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <ChevronRight style={{ width: '20px', height: '20px' }} />
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

          {/* Stats Summary */}
          <div style={{ marginTop: '32px', backgroundColor: '#f9fafb', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Total Plans</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{plans.length}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Active Plans</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>{plans.filter(p => p.status === 'active').length}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Inactive Plans</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280', margin: 0 }}>{plans.filter(p => p.status !== 'active').length}</p>
              </div>
            </div>
            <button onClick={fetchPlans} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
              <RefreshCw style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}