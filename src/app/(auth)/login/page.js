// src/app/(auth)/login/page.js
"use client";
import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { KeyRound, Briefcase } from "lucide-react";

export default function CompanyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/company/dashboard");
    } catch (err) {
      const msg =
        err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
          ? "Invalid email or password!"
          : err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/too-many-requests"
          ? "Too many attempts. Try again later."
          : "Login failed. Please try again.";
      setError(msg);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      setForgotMode(false);
      setResetEmail("");
    } catch (err) {
      const msg = err.code === "auth/user-not-found"
        ? "No account found with this email"
        : "Failed to send reset email. Try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8 text-center">
          <div className="text-5xl md:text-6xl mb-4">📧</div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
          <p className="text-gray-600 text-sm md:text-base mb-6">
            We've sent a password reset link to <br />
            <strong className="break-all">{resetEmail}</strong>
          </p>
          <button
            onClick={() => setResetSent(false)}
            className="text-cyan-600 hover:underline text-sm md:text-base"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (forgotMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl max-w-md w-full md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="bg-cyan-100 w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
              <KeyRound className="h-6 w-6 md:h-8 md:w-8 text-cyan-600" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reset Password</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">We'll send you a reset link</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-xl mb-4 md:mb-6 text-center text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="hr@yourcompany.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-4 py-3 md:px-5 md:py-4 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-sm md:text-base"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-base md:text-lg py-3 md:py-4 rounded-xl transition disabled:opacity-70"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="w-full text-gray-500 hover:text-gray-700 text-sm md:text-base mt-2"
            >
              ← Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Normal Login Mode - Clean, No Double Container
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8">
        
        {/* Logo */}
        <div className="text-center mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-md">
            <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 text-sm md:text-base mt-1">Pakistan's #1 Job Portal</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 md:px-4 md:py-3 rounded-xl mb-4 md:mb-6 text-center text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Company Email
            </label>
            <input
              type="email"
              placeholder="hr@yourcompany.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 md:px-5 md:py-4 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-sm md:text-base"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 md:px-5 md:py-4 rounded-xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-sm md:text-base"
              required
            />
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="text-xs md:text-sm text-cyan-600 hover:text-cyan-800 flex items-center justify-end gap-1"
            >
              <KeyRound className="h-3 w-3" /> Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-base md:text-lg py-3 md:py-4 rounded-xl shadow-md transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center mt-6 md:mt-8 text-gray-600 text-sm md:text-base">
          Don't have a company account?{" "}
          <Link href="/signup" className="text-cyan-600 font-bold hover:underline">
            Register your company
          </Link>
        </p>
      </div>
    </div>
  );
}