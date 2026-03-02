// src/app/company/post-job/page.js

"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function PostJobPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    category: "",           // ← New field
    companyName: "",
    location: "",
    type: "Full Time",
    salary: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/company/login");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (!auth.currentUser) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    // Category required check
    if (!formData.category) {
      setError("Please select a category");
      setLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        companyId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        status: "active",
      });

      setSuccess(true);
      setFormData({
        title: "",
        category: "",           // reset new field
        companyName: "",
        location: "",
        type: "Full Time",
        salary: "",
        description: "",
      });

      setTimeout(() => router.push("/company/dashboard"), 2000);
    } catch (err) {
      setError("Failed to post job. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Post a New Job
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
            Job posted successfully! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Job Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          {/* New Category Dropdown */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none bg-white"
              required
            >
              <option value="">Select Category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Content Writing">Content Writing</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Data Science / AI">Data Science / AI</option>
              <option value="DevOps / Cloud">DevOps / Cloud</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Network Engineering">Network Engineering</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Job Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none bg-white"
              required
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Salary Range *
            </label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              placeholder="e.g. PKR 150,000 - 250,000 or Negotiable"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xl py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all disabled:opacity-70"
          >
            {loading ? "Posting Job..." : "Post Job"}
          </button>
        </form>
      </div>
    </div>
  );
}