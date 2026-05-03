// src/app/company/funds/page.js
"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { 
  CreditCard, Building2, Coins, Zap, CheckCircle,
  Upload, Banknote, Phone, Landmark, AlertCircle
} from "lucide-react";

// Payment Methods
const PAYMENT_METHODS = [
  { 
    id: 'easypaisa', 
    name: 'EasyPaisa', 
    icon: Phone,
    accountTitle: 'Hiring Pakistan',
    accountNumber: '03XXXXXXXXX',
    instructions: 'Send payment to above EasyPaisa number and upload screenshot'
  },
  { 
    id: 'jazzcash', 
    name: 'JazzCash', 
    icon: Phone,
    accountTitle: 'Hiring Pakistan',
    accountNumber: '03XXXXXXXXX',
    instructions: 'Send payment to above JazzCash number and upload screenshot'
  },
  { 
    id: 'bank', 
    name: 'Bank Transfer', 
    icon: Landmark,
    accountTitle: 'Hiring Pakistan (Pvt) Ltd',
    accountNumber: '1234-567890-01',
    bankName: 'Bank Alfalah',
    branchCode: '0123',
    instructions: 'Transfer amount to above bank account and upload screenshot'
  }
];

// Plans Data
const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    credits: 5,
    popular: false,
    features: ['Post up to 3 jobs', '5 CV views', 'Basic support']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 500,
    credits: 50,
    popular: true,
    features: ['Post up to 10 jobs', '50 CV views', 'Priority support', 'Job featured for 3 days']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    credits: 200,
    popular: false,
    features: ['Unlimited job posts', '200 CV views', '24/7 priority support', 'Job featured for 7 days']
  }
];

const CREDIT_PACKS = [
  { id: 'small', credits: 10, price: 100, label: 'Small Pack' },
  { id: 'medium', credits: 25, price: 225, label: 'Medium Pack', popular: true },
  { id: 'large', credits: 50, price: 400, label: 'Large Pack' },
  { id: 'xlarge', credits: 100, price: 750, label: 'Extra Large Pack' },
];

export default function FundsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          setCompanyData(companySnap.data());
        } else {
          await setDoc(companyRef, {
            credits: 5,
            plan: 'Basic',
            email: user.email,
            createdAt: new Date()
          });
          setCompanyData({ credits: 5, plan: 'Basic' });
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handlePlanSelect = (plan) => {
    if (plan.price === 0) {
      // Free plan - just switch
      handleFreePlanSwitch(plan);
    } else {
      setSelectedPlan(plan);
      setSelectedPack(null);
      setShowPaymentModal(true);
      setPaymentStep(1);
    }
  };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    setSelectedPlan(null);
    setShowPaymentModal(true);
    setPaymentStep(1);
  };

  const handleFreePlanSwitch = async (plan) => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      const companyRef = doc(db, "companies", user.uid);
      await updateDoc(companyRef, {
        plan: plan.name,
        planUpdatedAt: new Date()
      });
      setCompanyData(prev => ({ ...prev, plan: plan.name }));
      toast.success(`Switched to ${plan.name} plan`);
    } catch (error) {
      toast.error("Failed to switch plan");
    } finally {
      setLoading(false);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max 5MB");
        return;
      }
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPaymentRequest = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    if (!screenshot) {
      toast.error("Please upload payment screenshot");
      return;
    }

    setSubmitting(true);
    
    try {
      const user = auth.currentUser;
      
      // Upload screenshot to Firebase Storage
      const timestamp = Date.now();
      const fileName = `payment_${user.uid}_${timestamp}_${screenshot.name}`;
      const storageRef = ref(storage, `payment_screenshots/${fileName}`);
      await uploadBytes(storageRef, screenshot);
      const screenshotUrl = await getDownloadURL(storageRef);

      // Calculate amount and credits
      let amount = 0;
      let creditsToAdd = 0;
      let planName = null;
      
      if (selectedPlan) {
        amount = selectedPlan.price;
        creditsToAdd = selectedPlan.credits;
        planName = selectedPlan.name;
      } else if (selectedPack) {
        amount = selectedPack.price;
        creditsToAdd = selectedPack.credits;
      }

      // Create payment request in Firestore
      await addDoc(collection(db, "payment_requests"), {
        companyId: user.uid,
        companyEmail: user.email,
        companyName: companyData?.companyName || 'Unknown',
        planName: planName,
        creditsToAdd: creditsToAdd,
        amount: amount,
        paymentMethod: selectedPaymentMethod.id,
        screenshotUrl: screenshotUrl,
        status: 'pending', // pending, approved, rejected
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: ''
      });

      toast.success("Payment request submitted! Admin will verify within 24 hours.");
      setShowPaymentModal(false);
      setSelectedPlan(null);
      setSelectedPack(null);
      setSelectedPaymentMethod(null);
      setScreenshot(null);
      setScreenshotPreview(null);
      
    } catch (error) {
      console.error("Error submitting payment:", error);
      toast.error("Failed to submit payment request");
    } finally {
      setSubmitting(false);
    }
  };

  const PaymentModal = () => {
    const selectedItem = selectedPlan || selectedPack;
    if (!selectedItem) return null;

    const method = PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod?.id);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Manual Payment</h2>
            <button 
              onClick={() => {
                setShowPaymentModal(false);
                setPaymentStep(1);
                setSelectedPaymentMethod(null);
                setScreenshot(null);
                setScreenshotPreview(null);
              }} 
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Step 1: Select Payment Method */}
            {paymentStep === 1 && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold mb-2">Payment Summary</p>
                  <p className="text-2xl font-bold text-blue-600">Rs {selectedItem.price}</p>
                  <p className="text-sm text-gray-600">{selectedItem.credits} credits</p>
                </div>

                <div>
                  <label className="block font-semibold mb-3">Select Payment Method</label>
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${
                          selectedPaymentMethod?.id === method.id 
                            ? 'border-cyan-500 bg-cyan-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethod?.id === method.id}
                          onChange={() => setSelectedPaymentMethod(method)}
                          className="mr-3"
                        />
                        <method.icon className="h-5 w-5 mr-2 text-gray-600" />
                        <span className="font-medium">{method.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setPaymentStep(2)}
                  disabled={!selectedPaymentMethod}
                  className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300"
                >
                  Continue
                </button>
              </>
            )}

            {/* Step 2: Show Account Details */}
            {paymentStep === 2 && method && (
              <>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="font-semibold text-yellow-800">Send payment to:</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Account Title:</strong> {method.accountTitle}</p>
                    <p><strong>Account Number:</strong> {method.accountNumber}</p>
                    {method.bankName && <p><strong>Bank:</strong> {method.bankName}</p>}
                    {method.branchCode && <p><strong>Branch Code:</strong> {method.branchCode}</p>}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-sm text-yellow-700">{method.instructions}</p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Upload Payment Screenshot</label>
                  <div className="border-2 border-dashed rounded-xl p-4 text-center">
                    {screenshotPreview ? (
                      <div>
                        <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto mb-2 rounded" />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshot(null);
                            setScreenshotPreview(null);
                          }}
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Click to upload screenshot</p>
                        <p className="text-xs text-gray-400">JPG, PNG, PDF (Max 5MB)</p>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleScreenshotChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitPaymentRequest}
                    disabled={!screenshot || submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300"
                  >
                    {submitting ? 'Submitting...' : 'Submit Payment Request'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Buy Credits</h1>
              <p className="text-gray-600">Purchase credits to view candidate CVs</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <p className="text-sm text-purple-600">Your Balance</p>
              <p className="text-2xl font-bold text-purple-700">{companyData?.credits || 0} Credits</p>
              <p className="text-xs text-purple-500">Plan: {companyData?.plan || 'Basic'}</p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div key={plan.id} className={`bg-white rounded-2xl shadow-lg p-6 ${plan.popular ? 'border-2 border-cyan-500 relative' : ''}`}>
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white px-3 py-1 rounded-full text-xs">
                  Most Popular
                </span>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-3xl font-bold text-cyan-600 mb-2">Rs {plan.price}</p>
              <p className="text-sm text-gray-500 mb-4">{plan.credits} credits</p>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" /> {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full py-2 rounded-lg font-semibold ${
                  plan.name === companyData?.plan
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'
                }`}
                disabled={plan.name === companyData?.plan}
              >
                {plan.name === companyData?.plan ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <h2 className="text-2xl font-bold mb-6">Quick Credit Packs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CREDIT_PACKS.map((pack) => (
            <div key={pack.id} className="bg-white rounded-xl shadow-md p-4 text-center">
              {pack.popular && <span className="text-xs text-purple-600 font-semibold">Best Value</span>}
              <p className="text-2xl font-bold text-purple-600">{pack.credits} Credits</p>
              <p className="text-gray-500 mb-3">Rs {pack.price}</p>
              <button
                onClick={() => handlePackSelect(pack)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg w-full hover:bg-purple-700"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-2xl p-6">
          <div className="flex gap-3">
            <div className="bg-blue-500 p-2 rounded-full h-10 w-10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">How it works?</p>
              <p className="text-sm text-gray-600 mt-1">
                1. Select a plan or credit pack<br />
                2. Choose payment method (EasyPaisa/JazzCash/Bank Transfer)<br />
                3. Send payment to our account<br />
                4. Upload screenshot of payment<br />
                5. Admin will verify within 24 hours<br />
                6. Credits will be added to your account
              </p>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && <PaymentModal />}
    </div>
  );
}