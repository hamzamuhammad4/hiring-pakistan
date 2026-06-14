// src/app/pricing/PricingClient.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Star, CreditCard } from "lucide-react";

export default function PricingClient() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const q = query(collection(db, "subscriptions"), where("status", "==", "active"), where("type", "==", "plan"));
        const snapshot = await getDocs(q);
        const plansList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlans(plansList);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleGetStarted = (plan) => {
    if (isLoggedIn) {
      // ✅ If logged in, go to payment page
      router.push("/company/funds");
    } else {
      // ✅ If not logged in, go to signup page
      router.push("/company/signup");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-gray-600">Choose the plan that works best for your business</p>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pricing plans available. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${plan.popular ? 'border-2 border-cyan-500 relative' : ''}`}>
                {plan.popular && (
                  <div className="bg-cyan-500 text-white text-center py-2 text-sm font-bold flex items-center justify-center gap-2">
                    <Star className="h-4 w-4" /> MOST POPULAR
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-4xl font-bold text-cyan-600 mb-2">Rs {plan.price?.toLocaleString()}</p>
                  <p className="text-gray-500 mb-6">{plan.credits} credits</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="h-5 w-5 text-green-500" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleGetStarted(plan)}
                    className="w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl font-semibold transition"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optional: Show login status message */}
        {isLoggedIn && (
          <div className="text-center mt-8 text-sm text-gray-500">
            You are logged in. Clicking Get Started will take you to the payment page.
          </div>
        )}
      </div>
    </div>
  );
}