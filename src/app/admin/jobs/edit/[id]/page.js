// src/app/admin/jobs/edit/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, MapPin, DollarSign, ArrowLeft, Save } from "lucide-react";

export default function AdminEditJobPage() {
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
    status: "pending"
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);
        
        if (jobSnap.exists()) {
          const jobData = jobSnap.data();
          setFormData({
            title: jobData.title || "",
            companyName: jobData.companyName || "",
            location: jobData.location || "",
            type: jobData.type || "Full Time",
            salary: jobData.salary || "",
            description: jobData.description || "",
            requirements: jobData.requirements || "",
            contact: jobData.contact || "",
            status: jobData.status || "pending"
          });
        } else {
          toast.error("Job not found");
          router.push("/admin/jobs");
        }
      } catch (error) {
        console.error(error);
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
    setSaving(true);
    
    try {
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        ...formData,
        updatedAt: serverTimestamp(),
      });

      toast.success("Job updated successfully!");
      router.push("/admin/jobs");
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  const jobTypes = ["Full Time", "Part Time", "Contract", "Internship", "Remote"];
  const statusOptions = ["pending", "active", "rejected"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/jobs" className="text-cyan-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Job</h1>
        <p className="text-gray-500 mt-1">Update job details</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
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
                className="w-full px-4 py-2 border rounded-lg"
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
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input
                type="text"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              className="w-full px-4 py-2 border rounded-lg"
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
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/jobs" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}