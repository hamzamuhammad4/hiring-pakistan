// src/app/company/edit-job/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, MapPin, DollarSign, ArrowLeft, Save } from "lucide-react";

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "Full Time",
    salary: "",
    description: "",
    requirements: "",
    contact: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/company/login");
          return;
        }

        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);
        
        if (jobSnap.exists()) {
          const jobData = jobSnap.data();
          // Check if this job belongs to the current user
          if (jobData.companyId !== user.uid) {
            toast.error("You don't have permission to edit this job");
            router.push("/company/dashboard");
            return;
          }
          
          setFormData({
            title: jobData.title || "",
            companyName: jobData.companyName || "",
            location: jobData.location || "",
            type: jobData.type || "Full Time",
            salary: jobData.salary || "",
            description: jobData.description || "",
            requirements: jobData.requirements || "",
            contact: jobData.contact || "",
          });
        } else {
          toast.error("Job not found");
          router.push("/company/dashboard");
        }
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.description) {
      toast.error("Please fill all required fields");
      return;
    }

    setSaving(true);
    
    try {
      const user = auth.currentUser;
      const jobRef = doc(db, "jobs", id);
      
      await updateDoc(jobRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      toast.success("Job updated successfully!");
      router.push("/company/dashboard");
      
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const jobTypes = ["Full Time", "Part Time", "Contract", "Internship", "Remote"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Edit Job</h1>
            </div>
            <p className="text-cyan-100 mt-2">Update your job posting details below.</p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
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

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Note:</strong> After editing, your job will need to be reviewed by admin again if it was already approved.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}