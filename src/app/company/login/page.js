// src/app/company/login/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Mail, Lock, ArrowRight, KeyRound, Eye, EyeOff } from "lucide-react";

export default function CompanyLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Login successful!");
      router.push("/company/dashboard");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many attempts. Try again later.");
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true,
        dynamicLinkDomain: 'hiringpakistan.co',
      };
      await sendPasswordResetEmail(auth, resetEmail, actionCodeSettings);
      toast.success("Password reset email sent! Check your inbox.");
      setForgotMode(false);
      setResetEmail("");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email");
      } else {
        toast.error(error.message || "Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  if (forgotMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-6">
            <div className="bg-cyan-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <KeyRound className="h-7 w-7 text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-500 text-sm mt-1">We'll send you a reset link</p>
          </div>
          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="email" required value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" placeholder="your@email.com" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 rounded-xl">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button type="button" onClick={() => setForgotMode(false)} className="w-full text-gray-500 hover:text-gray-700 text-sm">← Back to Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Briefcase className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Company Login</h1>
          <p className="text-gray-500 text-sm mt-1">Access your company dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl" placeholder="hr@yourcompany.com" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl" placeholder="Enter your password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center justify-end gap-1">
              <KeyRound className="h-3 w-3" /> Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl">
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have a company account? <Link href="/company/signup" className="text-cyan-600 font-semibold hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}