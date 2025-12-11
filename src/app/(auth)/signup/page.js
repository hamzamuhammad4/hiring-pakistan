// src/app/(auth)/signup/page.js   ← YE PURA CODE REPLACE KAR DE

"use client";
import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function CompanySignupPage() {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !email || !password) {
      setError("All fields are required!");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save COMPANY data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        companyName,
        contactPerson,
        email,
        role: "company",           // FIXED ROLE = COMPANY ONLY
        createdAt: new Date(),
        status: "pending",         // Admin approve karega baad active hoga
      });

      // 3. Send verification email
      await sendEmailVerification(user);

      setSuccess("Company account created! Please check your email for verification.");
      
      // Reset form
      setCompanyName("");
      setContactPerson("");
      setEmail("");
      setPassword("");

    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered!"
        : "Signup failed. Please try again.";
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">Join as a Company</h1>
        <p className="text-gray-600 mt-3 text-lg">Post jobs & hire top talent in Pakistan</p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Company Name</label>
          <input
            type="text"
            placeholder="e.g. ABC Technologies"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Contact Person Name</label>
          <input
            type="text"
            placeholder="Your full name"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Company Email</label>
          <input
            type="email"
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">Password</label>
          <input
            type="password"
            placeholder="Minimum 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
            required
            minLength="6"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-5 rounded-xl text-xl text-xl shadow-2xl transition transform hover:scale-105 disabled:opacity-70"
        >
          {loading ? "Creating Company Account..." : "Create Company Account"}
        </button>
      </form>

      <p className="text-center mt-8 text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-cyan-600 font-bold hover:underline">
          Login here
        </Link>
      </p>
    </>
  );
}