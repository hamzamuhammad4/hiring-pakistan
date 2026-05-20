// src/app/(auth)/signup/page.js
"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import toast from 'react-hot-toast';
import { Briefcase, Building2, User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function CompanySignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email || !password) {
      setError("All fields are required!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "companies", user.uid), {
        companyName: companyName,
        contactPerson: contactPerson,
        email: email,
        role: "company",
        credits: 0,
        plan: "Basic",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await sendEmailVerification(user);

      setSuccess("Company account created! Please check your email for verification.");
      toast.success("Account created! Verify your email before logging in.");
      
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPassword("");
      
      setTimeout(() => {
        router.push("/company/login");
      }, 3000);

    } catch (err) {
      console.error(err);
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered!"
        : "Signup failed. Please try again.";
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        
        {/* Header */}
        <div className="text-center mb-5">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Join as a Company</h1>
          <p className="text-gray-500 text-xs mt-1">Post jobs & hire top talent</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-4">
            <p className="text-xs text-green-700 text-center">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-4">
            <p className="text-xs text-red-600 text-center">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="ABC Technologies"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Your full name"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="hr@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          {/* Credits Info */}
          <div className="bg-amber-50 rounded-lg p-2">
            <p className="text-xs text-amber-700 text-center">
              ⚠️ Start with <strong>0 credits</strong> — buy credits to view CVs.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition text-sm disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Company Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{" "}
            <Link href="/company/login" className="text-cyan-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}