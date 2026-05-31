// src/app/admin/login/page.js
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Mail, Lock, ArrowRight } from "lucide-react";


const adminEmails = [
  "firebasehiringpakistan@gmail.com",
  "hamzaayyub125@gmail.com",
];

export default function AdminLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      const user = userCredential.user;
      console.log("Logged in user:", user.email);
      
      if (!adminEmails.includes(user.email)) {
        await auth.signOut();
        toast.error("You don't have admin access!");
        return;
      }
      
      toast.success("Welcome Admin!");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found') {
        toast.error("User not found. Please check email.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Wrong password.");
      } else {
        toast.error(error.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="bg-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-500 mt-1">Access the admin control panel</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="admin@hiringpakistan.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-3 rounded-xl transition disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? "Logging in..." : "Login"}
            {!loading && <ArrowRight className="h-5 w-5" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-cyan-600 hover:underline">
            ← Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}