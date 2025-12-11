// src/app/(auth)/login/page.js   ← YE CODE REPLACE KAR DE

"use client";
import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CompanyLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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

  return (
    <div className="bg-white p-10">
      {/* LOGO + WELCOME — SIRF YAHAN DIKHEGA */}
      

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 text-center font-medium shadow-md">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-7">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Company Email
          </label>
          <input
            type="email"
            placeholder="hr@yourcompany.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-lg"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-5 rounded-2xl border-2 border-gray-200 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 outline-none text-lg"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xl py-5 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70"
        >
          {loading ? "Logging in..." : "Login to Dashboard"}
        </button>
      </form>

      <p className="text-center mt-8 text-gray-600">
        Don't have a company account?{" "}
        <Link href="/signup" className="text-cyan-600 font-bold hover:underline text-lg">
          Register your company
        </Link>
      </p>
    </div>
  );
}