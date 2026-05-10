// src/app/company/funds/page.js
"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { 
  doc, getDoc, updateDoc, increment, addDoc, 
  collection, serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { 
  CreditCard, Building2, Coins, Zap, CheckCircle,
  Upload, Banknote, Phone, Landmark, AlertCircle,
  Copy, ExternalLink
} from "lucide-react";

// ✅ YOUR BANK DETAILS
const PAYMENT_METHODS = [
  { 
    id: 'ubl', 
    name: 'UBL Bank', 
    icon: Landmark,
    accountTitle: 'Faaiz Ahmed',
    accountNumber: '0523269421529',
    iban: 'PK14UNIL0109000269421529',
    instructions: 'Transfer amount to above UBL account and upload screenshot'
  },
  { 
    id: 'easypaisa', 
    name: 'EasyPaisa', 
    icon: Phone,
    accountTitle: 'Faaiz Ahmed',
    accountNumber: '03482350367',
    iban: 'PK33TMFB0000000045189036',
    instructions: 'Send payment to above EasyPaisa number and upload screenshot'
  },
  { 
    id: 'jazzcash', 
    name: 'JazzCash', 
    icon: Phone,
    accountTitle: 'Faaiz Ahmed',
    accountNumber: '03482350367',
    iban: 'PK32JCMA1302923482350367',
    instructions: 'Send payment to above JazzCash number and upload screenshot'
  },
  { 
    id: 'sadapay', 
    name: 'Sadapay', 
    icon: CreditCard,
    accountTitle: 'Faaiz Ahmed',
    accountNumber: '03482350367',
    iban: 'PK70SADA0000003482350367',
    instructions: 'Send payment to above Sadapay account and upload screenshot'
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
    features: ['📋 Post up to 3 jobs', '👁️ 5 CV views', '💬 Basic support']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 500,
    credits: 50,
    popular: true,
    features: ['📋 Post up to 10 jobs', '👁️ 50 CV views', '⚡ Priority support', '⭐ Job featured for 3 days']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1000,
    credits: 200,
    popular: false,
    features: ['📋 Unlimited job posts', '👁️ 200 CV views', '🕐 24/7 priority support', '⭐ Job featured for 7 days']
  }
];

const CREDIT_PACKS = [
  { id: 'small', credits: 10, price: 100, label: 'Small Pack', popular: false },
  { id: 'medium', credits: 25, price: 225, label: 'Medium Pack', popular: true },
  { id: 'large', credits: 50, price: 400, label: 'Large Pack', popular: false },
  { id: 'xlarge', credits: 100, price: 750, label: 'Extra Large Pack', popular: false },
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
  const [copiedField, setCopiedField] = useState(null);

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
          await updateDoc(companyRef, {
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
      handleFreePlanSwitch(plan);
    } else {
      setSelectedPlan(plan);
      setSelectedPack(null);
      setShowPaymentModal(true);
      setPaymentStep(1);
      setSelectedPaymentMethod(null);
      setScreenshot(null);
      setScreenshotPreview(null);
    }
  };

  const handlePackSelect = (pack) => {
    setSelectedPack(pack);
    setSelectedPlan(null);
    setShowPaymentModal(true);
    setPaymentStep(1);
    setSelectedPaymentMethod(null);
    setScreenshot(null);
    setScreenshotPreview(null);
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

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied!`);
    setTimeout(() => setCopiedField(null), 2000);
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
        paymentMethodName: selectedPaymentMethod.name,
        screenshotUrl: screenshotUrl,
        status: 'pending',
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
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-4 rounded-lg">
                  <p className="font-semibold mb-2">Payment Summary</p>
                  <p className="text-3xl font-bold">Rs {selectedItem.price.toLocaleString()}</p>
                  <p className="text-sm opacity-90">{selectedItem.credits} credits will be added</p>
                  {selectedPlan && <p className="text-sm opacity-90 mt-1">Plan: {selectedPlan.name}</p>}
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
                  className="w-full bg-cyan-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                  
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Account Title</p>
                      <p className="font-mono font-semibold">{method.accountTitle}</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Account Number</p>
                      <div className="flex justify-between items-center">
                        <p className="font-mono font-semibold">{method.accountNumber}</p>
                        <button 
                          onClick={() => copyToClipboard(method.accountNumber, 'Account Number')}
                          className="text-cyan-600 hover:text-cyan-800"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500">IBAN</p>
                      <div className="flex justify-between items-center">
                        <p className="font-mono text-sm">{method.iban}</p>
                        <button 
                          onClick={() => copyToClipboard(method.iban, 'IBAN')}
                          className="text-cyan-600 hover:text-cyan-800"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-yellow-200">
                    <p className="text-sm text-yellow-700">{method.instructions}</p>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-2">Upload Payment Screenshot</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-cyan-500 transition">
                    {screenshotPreview ? (
                      <div>
                        <img src={screenshotPreview} alt="Screenshot" className="max-h-48 mx-auto mb-2 rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setScreenshot(null);
                            setScreenshotPreview(null);
                          }}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Click to upload screenshot</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF (Max 5MB)</p>
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
                    onClick={() => {
                      setPaymentStep(1);
                      setSelectedPaymentMethod(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitPaymentRequest}
                    disabled={!screenshot || submitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Submitting...
                      </>
                    ) : (
                      <>Submit Payment Request</>
                    )}
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Buy Credits</h1>
              <p className="text-gray-600">Purchase credits to view candidate CVs</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 rounded-xl text-center">
              <p className="text-sm opacity-90">Your Balance</p>
              <p className="text-2xl font-bold">{companyData?.credits || 0} Credits</p>
              <p className="text-xs opacity-80">Plan: {companyData?.plan || 'Basic'}</p>
            </div>
          </div>
        </div>

        {/* Plans */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Zap className="h-6 w-6 text-cyan-600" />
          Subscription Plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition hover:shadow-xl ${
                plan.popular ? 'border-2 border-cyan-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-cyan-500 text-white text-center py-2 text-sm font-bold">
                  🔥 MOST POPULAR
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-4xl font-bold text-cyan-600 mb-2">Rs {plan.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mb-4">{plan.credits} credits</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={plan.name === companyData?.plan && plan.price === 0}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    plan.name === companyData?.plan && plan.price === 0
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
                  }`}
                >
                  {plan.name === companyData?.plan && plan.price === 0 ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Coins className="h-6 w-6 text-purple-600" />
          Quick Credit Packs
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {CREDIT_PACKS.map((pack) => (
            <div 
              key={pack.id} 
              className={`bg-white rounded-xl shadow-md p-5 text-center transition hover:shadow-lg ${
                pack.popular ? 'border-2 border-purple-500 relative' : ''
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full">
                  Best Value
                </span>
              )}
              <p className="text-2xl font-bold text-purple-600">{pack.credits} Credits</p>
              <p className="text-gray-500 mb-3">Rs {pack.price.toLocaleString()}</p>
              <button
                onClick={() => handlePackSelect(pack)}
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="bg-blue-500 p-3 rounded-full h-12 w-12 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">📌 How it works?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                  <p className="text-sm text-gray-600">Select a plan or credit pack</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                  <p className="text-sm text-gray-600">Choose payment method (UBL/EasyPaisa/JazzCash/Sadapay)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                  <p className="text-sm text-gray-600">Send payment to our account</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                  <p className="text-sm text-gray-600">Upload screenshot of payment</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
                  <p className="text-sm text-gray-600">Admin will verify within 24 hours</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">6</span>
                  <p className="text-sm text-gray-600">Credits will be added to your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && <PaymentModal />}
    </div>
  );
}