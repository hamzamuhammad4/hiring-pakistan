// src/app/company/post-job/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, MapPin, DollarSign, Clock, Building2, ArrowLeft } from "lucide-react";

export default function PostJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "Full Time",
    category: "",
    salary: "",
    description: "",
    requirements: "",
    benefits: "",
    contact: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Please login first");
        router.push("/company/login");
        return;
      }

      // ✅ STATUS "PENDING" - Admin approval needed
      await addDoc(collection(db, "jobs"), {
        ...formData,
        companyId: user.uid,
        companyEmail: user.email,
        status: "pending",  // ← IMPORTANT: pending rakhna hai
        views: 0,
        applicantsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success("Job posted successfully! Awaiting admin approval.");
      router.push("/company/dashboard");
      
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = ["Full Time", "Part Time", "Contract", "Internship", "Remote"];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/company/dashboard" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Post a New Job</h1>
            </div>
            <p className="text-cyan-100 mt-2">Fill in the details below to post a job. Admin will review and approve it.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Karachi, Lahore, Islamabad..."
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="e.g., 50,000 - 80,000"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number (for CVs)</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="03XXXXXXXXX"
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                placeholder="List the requirements for this position..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500"
                placeholder="Health insurance, paid time off, etc."
              />
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Note:</strong> Your job will be reviewed by admin before appearing on the website. This usually takes 24-48 hours.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition disabled:bg-gray-400"
            >
              {loading ? "Posting..." : "Post Job for Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}