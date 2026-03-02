// src/app/company/funds/page.js
// Buy Credits & Plan Management Page

"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';

// Plans Data
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    credits: 5,
    popular: false,
    features: [
      'Post up to 3 jobs',
      '5 CV views',
      'Basic support',
      'Job listing for 30 days'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 500,
    credits: 50,
    popular: true,
    features: [
      'Post up to 10 jobs',
      '50 CV views',
      'Priority support',
      'Job featured for 3 days',
      'Job listing for 60 days',
      'Email notifications'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    credits: 200,
    popular: false,
    features: [
      'Unlimited job posts',
      '200 CV views',
      '24/7 priority support',
      'Job featured for 7 days',
      'Job listing for 90 days',
      'SMS notifications',
      'Analytics dashboard'
    ]
  }
];

// Add-on credits (if user just wants to add credits without changing plan)
const CREDIT_PACKS = [
  { id: 'small', credits: 10, price: 100, label: 'Small Pack' },
  { id: 'medium', credits: 25, price: 225, label: 'Medium Pack', popular: true },
  { id: 'large', credits: 50, price: 400, label: 'Large Pack' },
  { id: 'xlarge', credits: 100, price: 750, label: 'Extra Large Pack' },
];

export default function FundsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [companyData, setCompanyData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: select, 2: payment, 3: success

  useEffect(() => {
    // Check authentication
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
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
        } else {
          // Create company document if not exists
          await setDoc(companyRef, {
            credits: 5,
            plan: 'Basic',
            email: user.email,
            createdAt: new Date()
          });
          setCompanyData({ credits: 5, plan: 'Basic' });
        }
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setSelectedPack(null);
    setShowPaymentModal(true);
    setPaymentStep(1);
  };

  // Handle credit pack selection
  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    setSelectedPlan(null);
    setShowPaymentModal(true);
    setPaymentStep(1);
  };

  // Process payment
  const processPayment = async () => {
    setProcessing(true);
    
    try {
      // Calculate amount and credits
      let amount = 0;
      let creditsToAdd = 0;
      let newPlan = companyData?.plan || 'Basic';
      
      if (selectedPlan) {
        amount = selectedPlan.price;
        creditsToAdd = selectedPlan.credits;
        newPlan = selectedPlan.name;
      } else if (selectedPack) {
        amount = selectedPack.price;
        creditsToAdd = selectedPack.credits;
      }

      // SIMULATE PAYMENT (In production, integrate actual payment gateway)
      // For demo, we'll just simulate a successful payment
      
      // Show processing
      toast.loading('Processing payment...', { id: 'payment' });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update Firestore
      const user = auth.currentUser;
      const companyRef = doc(db, "companies", user.uid);
      
      const updateData = {
        credits: increment(creditsToAdd),
        lastPayment: new Date(),
        totalSpent: increment(amount)
      };
      
      if (selectedPlan) {
        updateData.plan = selectedPlan.name;
        updateData.planUpdatedAt = new Date();
      }
      
      await updateDoc(companyRef, updateData);

      // Update local state
      setCompanyData(prev => ({
        ...prev,
        credits: (prev?.credits || 0) + creditsToAdd,
        plan: selectedPlan ? selectedPlan.name : prev?.plan,
        lastPayment: new Date()
      }));

      // Show success
      toast.success('Payment successful! Credits added.', { id: 'payment' });
      
      // Move to success step
      setPaymentStep(3);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStep(1);
        setSelectedPlan(null);
        setSelectedPack(null);
      }, 3000);

    } catch (error) {
      console.error("Payment error:", error);
      toast.error('Payment failed. Please try again.', { id: 'payment' });
    } finally {
      setProcessing(false);
    }
  };

  // Payment Modal Component
  const PaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 relative">
        
        {/* Close button */}
        <button 
          onClick={() => setShowPaymentModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {paymentStep === 1 && (
          <>
            <h3 className="text-2xl font-bold mb-6">Confirm Purchase</h3>
            
            {selectedPlan && (
              <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-blue-600 mb-1">Selected Plan</p>
                <p className="text-xl font-bold">{selectedPlan.name}</p>
                <p className="text-gray-600">{selectedPlan.credits} credits</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">₹{selectedPlan.price}</p>
              </div>
            )}

            {selectedPack && (
              <div className="bg-purple-50 p-4 rounded-xl mb-6">
                <p className="text-sm text-purple-600 mb-1">{selectedPack.label}</p>
                <p className="text-xl font-bold">{selectedPack.credits} credits</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">₹{selectedPack.price}</p>
              </div>
            )}

            {/* Payment Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>💳 Credit/Debit Card</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="easypaisa"
                    checked={paymentMethod === 'easypaisa'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>📱 Easypaisa</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="jazzcash"
                    checked={paymentMethod === 'jazzcash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>📱 JazzCash</span>
                </label>
              </div>
            </div>

            <button
              onClick={() => setPaymentStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition"
            >
              Continue to Payment
            </button>
          </>
        )}

        {paymentStep === 2 && (
          <>
            <h3 className="text-2xl font-bold mb-6">Payment Details</h3>
            
            {paymentMethod === 'card' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9012 3456"
                    className="w-full border rounded-lg px-4 py-3"
                    disabled={processing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      className="w-full border rounded-lg px-4 py-3"
                      disabled={processing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVV</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      className="w-full border rounded-lg px-4 py-3"
                      disabled={processing}
                    />
                  </div>
                </div>
              </div>
            )}

            {(paymentMethod === 'easypaisa' || paymentMethod === 'jazzcash') && (
              <div className="text-center mb-6">
                <p className="mb-4">You will receive a payment request on your mobile</p>
                <div>
                  <label className="block text-sm font-medium mb-2">Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="03XX XXXXXXX"
                    className="w-full border rounded-lg px-4 py-3"
                    disabled={processing}
                  />
                </div>
              </div>
            )}

            <button
              onClick={processPayment}
              disabled={processing}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition disabled:bg-gray-400 mb-3"
            >
              {processing ? 'Processing...' : `Pay ₹${selectedPlan?.price || selectedPack?.price}`}
            </button>

            <button
              onClick={() => setPaymentStep(1)}
              className="w-full text-gray-500 hover:text-gray-700"
              disabled={processing}
            >
              Back
            </button>
          </>
        )}

        {paymentStep === 3 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-4">
              {selectedPlan ? selectedPlan.credits : selectedPack?.credits} credits added to your account.
            </p>
            <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading...</p>
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
              <h1 className="text-4xl font-bold text-gray-800 mb-2">💰 Buy Credits</h1>
              <p className="text-gray-600">Purchase credits to view candidate CVs and upgrade your plan</p>
            </div>
            
            {/* Current Balance */}
            <div className="mt-4 md:mt-0 bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl">
              <p className="text-sm opacity-90 mb-1">Your Current Balance</p>
              <p className="text-3xl font-bold">{companyData?.credits || 0} Credits</p>
              <p className="text-sm opacity-90 mt-1">Plan: {companyData?.plan || 'Basic'}</p>
            </div>
          </div>
        </div>

        {/* Pricing Plans */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
                plan.popular ? 'border-cyan-500 scale-105' : 'border-gray-100'
              }`}
            >
              {plan.popular && (
                <div className="bg-cyan-500 text-white text-center py-2 text-sm font-bold">
                  MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  {plan.price > 0 && <span className="text-gray-500">/one-time</span>}
                </div>
                <p className="text-3xl font-bold text-cyan-600 mb-4">{plan.credits} Credits</p>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={plan.name === companyData?.plan && plan.price === 0}
                  className={`w-full py-3 rounded-xl font-bold transition ${
                    plan.name === companyData?.plan && plan.price === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {plan.name === companyData?.plan && plan.price === 0 
                    ? 'Current Plan' 
                    : 'Select Plan'
                  }
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packs (Add-ons) */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">⚡ Quick Credit Packs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CREDIT_PACKS.map((pack) => (
            <div 
              key={pack.id}
              className={`bg-white rounded-xl shadow-md p-6 border-2 transition hover:shadow-lg ${
                pack.popular ? 'border-purple-500' : 'border-gray-100'
              }`}
            >
              {pack.popular && (
                <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full mb-2 inline-block">
                  Best Value
                </span>
              )}
              <h3 className="text-xl font-bold mb-2">{pack.label}</h3>
              <p className="text-3xl font-bold text-purple-600 mb-2">{pack.credits} Credits</p>
              <p className="text-gray-500 mb-4">₹{pack.price}</p>
              <button
                onClick={() => handlePackSelect(pack)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Transaction History Placeholder */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
          <p className="text-gray-500 text-center py-4">
            No transactions yet. Your payment history will appear here.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">❓ Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <p className="font-semibold mb-2">How do credits work?</p>
              <p className="text-gray-600 text-sm">Each time you view a candidate's CV, 1 credit is deducted from your account.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Do credits expire?</p>
              <p className="text-gray-600 text-sm">No, purchased credits never expire. You can use them anytime.</p>
            </div>
            <div>
              <p className="font-semibold mb-2">Can I upgrade my plan later?</p>
              <p className="text-gray-600 text-sm">Yes, you can upgrade anytime. The new plan benefits will apply immediately.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && <PaymentModal />}
    </div>
  );
}