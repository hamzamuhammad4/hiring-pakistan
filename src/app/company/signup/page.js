// src/app/company/signup/page.js - FULLY FIXED
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function CompanySignup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    city: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactPerson || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // 2. Send email verification
      await sendEmailVerification(user);
      
      // ✅ 3. FIXED: Save to BOTH collections with ROLE
      
      // 3a. Save to 'users' collection (for auth/role checking)
      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
        role: "company",           // ← CRITICAL: Role set karo
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        phone: formData.phone || "",
        city: formData.city || "",
        status: "active",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // 3b. Save to 'companies' collection (for company-specific data)
      await setDoc(doc(db, "companies", user.uid), {
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone || "",
        city: formData.city || "",
        credits: 0,
        plan: "Basic",
        status: "active",
        role: "company",           // ← Role yahan bhi set karo
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      toast.success("Account created! Please verify your email before logging in.");
      router.push("/company/login");
      
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Email already registered. Please login.");
      } else {
        toast.error(error.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        
        <div className="text-center mb-5">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Register Company</h1>
          <p className="text-gray-500 text-xs mt-1">Post jobs & hire top talent</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="ABC Technologies" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Contact Person *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Your full name" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Company Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="hr@company.com" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Minimum 6 characters" required minLength="6" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Confirm password" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="03XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" placeholder="Karachi" />
            </div>
          </div>

          <div className="bg-blue-50 p-2 rounded-lg">
            <p className="text-xs text-blue-800 text-center">⚠️ Start with <strong>0 credits</strong> — buy credits to view CVs.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 rounded-lg transition text-sm">
            {loading ? "Creating Account..." : "Register Company"}
          </button>
        </form>

        <p className="text-center mt-4 text-xs text-gray-600">
          Already have an account? <Link href="/company/login" className="text-cyan-600 font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}