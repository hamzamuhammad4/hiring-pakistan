// src/app/company/login/page.js

"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";  // ← YE LINE ADD KAR DI

export default function CompanyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push("/company/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/company/dashboard");
    } catch (err) {
      setError(
        err.code === "auth/user-not-found" || err.code === "auth/wrong-password"
          ? "Invalid email or password!"
          : "Login failed. Please try again."
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          Company Login
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Don't have a company account?{" "}
          <Link href="/company/signup" className="text-cyan-600 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}