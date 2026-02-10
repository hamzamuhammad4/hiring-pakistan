// src/app/apply/[id]/page.js   ← YE PURA REPLACE KAR DE (CV HATA DIYA HAI)

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplyPage({ params }) {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    coverLetter: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Await params.id
  useEffect(() => {
    params.then((p) => setId(p.id)).catch(() => setError("Invalid job ID"));
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!id) {
      setError("Invalid job ID. Please apply from the job page.");
      setLoading(false);
      return;
    }

    try {
      const applicationData = {
        jobId: id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        coverLetter: formData.coverLetter || "",
        createdAt: serverTimestamp(),
        status: "pending", // dashboard pending count ke liye
      };

      console.log("Saving application:", applicationData); // debug ke liye

      await addDoc(collection(db, "applications"), applicationData);

      console.log("Application saved successfully!");

      setSuccess(true);
      setTimeout(() => router.push("/jobs"), 3000);
    } catch (err) {
      console.error("Apply error:", err.code, err.message);
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!id && !error) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Apply for the Job</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-green-600 mb-4">Success!</h2>
              <p className="text-xl text-gray-700 mb-6">Your application has been submitted.</p>
              <p className="text-gray-600 mb-8">Redirecting to jobs page in 3 seconds...</p>
              <Link href="/jobs" className="inline-block bg-cyan-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-cyan-700 transition">
                Go to Jobs Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none resize-none"
                  placeholder="Why are you a good fit for this role?"
                />
              </div>

              {/* CV upload completely hata diya hai */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xl py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}