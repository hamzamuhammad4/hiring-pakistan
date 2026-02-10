// src/app/company/edit-job/[id]/page.js   ← YE FILE BANA AUR PASTE KAR

"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "",
    salary: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/company/login");
      return;
    }

    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
          const data = jobSnap.data();
          if (data.companyId !== auth.currentUser.uid) {
            setError("You don't have permission to edit this job.");
          } else {
            setFormData({
              title: data.title || "",
              companyName: data.companyName || "",
              location: data.location || "",
              type: data.type || "",
              salary: data.salary || "",
              description: data.description || "",
            });
          }
        } else {
          setError("Job not found.");
        }
      } catch (err) {
        setError("Failed to load job.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, formData);
      alert("Job updated successfully!");
      router.push("/company/dashboard");
    } catch (err) {
      setError("Failed to update job.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading job...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Edit Job
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Job Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Company Name *</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Job Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              required
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Remote">Remote</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Salary Range *</label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-5 py-4 rounded-xl border border-gray-300 focus:border-cyan-500 outline-none"
              placeholder="e.g. PKR 150,000 - 250,000"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Job Description *</label>
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
            disabled={saving}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xl py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all disabled:opacity-70"
          >
            {saving ? "Updating..." : "Update Job"}
          </button>
        </form>
      </div>
    </div>
  );
}