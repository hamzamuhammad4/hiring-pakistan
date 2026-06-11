// src/app/admin/jobs/edit/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, MapPin, DollarSign, ArrowLeft, Save, AlertCircle, Clock, GraduationCap, Users } from "lucide-react";

// ✅ Qualifications List
const qualifications = [
  "Matriculation (10th)",
  "Intermediate (12th/FSc/FA/ICS)",
  "Bachelor's (14 years)",
  "Bachelor of Arts (BA)",
  "Bachelor of Science (BSc)",
  "Bachelor of Commerce (BCom)",
  "Bachelor of Business Administration (BBA)",
  "Bachelor of Computer Science (BCS)",
  "Bachelor of Information Technology (BIT)",
  "Bachelor of Engineering (BE)",
  "Bachelor of Technology (BTech)",
  "Master's (16 years)",
  "Master of Arts (MA)",
  "Master of Science (MSc)",
  "Master of Commerce (MCom)",
  "Master of Business Administration (MBA)",
  "Master of Computer Science (MCS)",
  "Master of Information Technology (MIT)",
  "Master of Engineering (ME)",
  "Master of Technology (MTech)",
  "MS/ M.Phil",
  "PhD/ Doctorate",
  "Diploma (2 years)",
  "Diploma of Associate Engineering (DAE)",
  "Certificate",
  "Short Course",
  "Other"
];

export default function AdminEditJobPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    location: "",
    type: "Full Time",
    salaryMin: "",
    salaryMax: "",
    salaryType: "monthly",
    description: "",
    requirements: "",
    benefits: "",
    contact: "",
    experienceMin: "",
    experienceMax: "",
    qualification: "",
    shift: "Morning",
    vacancies: "",
    status: "pending"
  });

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);
        
        if (jobSnap.exists()) {
          const jobData = jobSnap.data();
          
          let salaryMin = "";
          let salaryMax = "";
          let salaryType = "monthly";
          let experienceMin = "";
          let experienceMax = "";
          
          if (jobData.experience && jobData.experience !== "Not specified") {
            const expMatch = jobData.experience.match(/(\d+)(?:\s*-\s*(\d+))?\s*years?/);
            if (expMatch) {
              if (expMatch[2]) {
                experienceMin = expMatch[1];
                experienceMax = expMatch[2];
              } else if (expMatch[1]) {
                experienceMin = expMatch[1];
              }
            }
          }
          
          if (jobData.experienceMin) experienceMin = jobData.experienceMin;
          if (jobData.experienceMax) experienceMax = jobData.experienceMax;
          if (jobData.salaryMin) salaryMin = jobData.salaryMin;
          if (jobData.salaryMax) salaryMax = jobData.salaryMax;
          if (jobData.salaryType) salaryType = jobData.salaryType;
          
          setFormData({
            title: jobData.title || "",
            companyName: jobData.companyName || "",
            location: jobData.location || "",
            type: jobData.type || "Full Time",
            salaryMin: salaryMin,
            salaryMax: salaryMax,
            salaryType: salaryType,
            description: jobData.description || "",
            requirements: jobData.requirements || "",
            benefits: jobData.benefits || "",
            contact: jobData.contact || "",
            experienceMin: experienceMin,
            experienceMax: experienceMax,
            qualification: jobData.qualification || "",
            shift: jobData.shift || "Morning",
            vacancies: jobData.vacancies || "",
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
    const { name, value } = e.target;
    let newValue = value;
    
    if (['salaryMin', 'salaryMax', 'experienceMin', 'experienceMax', 'vacancies'].includes(name)) {
      if (value && isNaN(value)) {
        setErrors(prev => ({ ...prev, [name]: "Only numbers allowed" }));
        return;
      } else {
        setErrors(prev => ({ ...prev, [name]: "" }));
        newValue = value === "" ? "" : Number(value);
      }
    } else {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.type) newErrors.type = "Job type is required";
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    if (!formData.requirements.trim()) newErrors.requirements = "Requirements are required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);
    
    try {
      let salaryDisplay = "Negotiable";
      if (formData.salaryMin && formData.salaryMax) {
        salaryDisplay = `PKR ${formData.salaryMin.toLocaleString()} - ${formData.salaryMax.toLocaleString()} / ${formData.salaryType}`;
      } else if (formData.salaryMin) {
        salaryDisplay = `From PKR ${formData.salaryMin.toLocaleString()} / ${formData.salaryType}`;
      } else if (formData.salaryMax) {
        salaryDisplay = `Up to PKR ${formData.salaryMax.toLocaleString()} / ${formData.salaryType}`;
      }

      let experienceDisplay = "Not specified";
      if (formData.experienceMin && formData.experienceMax) {
        experienceDisplay = `${formData.experienceMin} - ${formData.experienceMax} years`;
      } else if (formData.experienceMin) {
        experienceDisplay = `${formData.experienceMin}+ years`;
      } else if (formData.experienceMax) {
        experienceDisplay = `Up to ${formData.experienceMax} years`;
      }

      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        title: formData.title.trim(),
        companyName: formData.companyName.trim(),
        location: formData.location.trim(),
        type: formData.type,
        salary: salaryDisplay,
        salaryMin: formData.salaryMin || null,
        salaryMax: formData.salaryMax || null,
        salaryType: formData.salaryType,
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        benefits: formData.benefits.trim() || null,
        contact: formData.contact || null,
        experience: experienceDisplay,
        experienceMin: formData.experienceMin || null,
        experienceMax: formData.experienceMax || null,
        qualification: formData.qualification || null,
        shift: formData.shift,
        vacancies: formData.vacancies || null,
        status: formData.status,
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
  const salaryTypes = ["hourly", "daily", "weekly", "monthly", "yearly"];
  const shifts = ["Morning", "Evening", "Night", "Rotational", "Flexible"];
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

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed text-gray-600"
                />
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Company name cannot be changed by admin</p>
              {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-cyan-600" /> Salary Range
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary (PKR)</label>
                <input
                  type="text"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 50000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Salary (PKR)</label>
                <input
                  type="text"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 80000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
                <select
                  name="salaryType"
                  value={formData.salaryType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {salaryTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="border-t pt-4">
            <h3 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-600" /> Experience Required
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Years</label>
                <input
                  type="text"
                  name="experienceMin"
                  value={formData.experienceMin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Years</label>
                <input
                  type="text"
                  name="experienceMax"
                  value={formData.experienceMax}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="e.g., 5"
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ✅ Qualification as Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <select
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select Qualification</option>
                {qualifications.map((qual) => (
                  <option key={qual} value={qual}>{qual}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {shifts.map(shift => <option key={shift} value={shift}>{shift}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vacancies</label>
              <input
                type="text"
                name="vacancies"
                value={formData.vacancies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="03XXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className={`w-full px-4 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements <span className="text-red-500">*</span>
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleChange}
              rows="4"
              className={`w-full px-4 py-2 border rounded-lg ${errors.requirements ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements}</p>}
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
            <textarea
              name="benefits"
              value={formData.benefits}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Health insurance, paid time off, etc."
            />
          </div>

          <div className="bg-yellow-50 p-3 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-yellow-700">
              After editing, changes will be reflected on the website immediately (if status is active).
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/jobs" className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}