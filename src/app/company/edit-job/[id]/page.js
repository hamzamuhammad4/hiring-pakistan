// src/app/company/edit-job/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, MapPin, DollarSign, Clock, ArrowLeft, Save, AlertCircle } from "lucide-react";

// ✅ Qualification List - Same as post job page
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

const jobTypes = ["Full Time", "Part Time", "Contract", "Internship", "Remote"];
const salaryTypes = ["hourly", "daily", "weekly", "monthly", "yearly"];
const shifts = ["Morning", "Evening", "Night", "Rotational", "Flexible"];

export default function EditJobPage() {
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
            salaryMin: jobData.salaryMin || "",
            salaryMax: jobData.salaryMax || "",
            salaryType: jobData.salaryType || "monthly",
            description: jobData.description || "",
            requirements: jobData.requirements || "",
            benefits: jobData.benefits || "",
            contact: jobData.contact || "",
            experienceMin: jobData.experienceMin || "",
            experienceMax: jobData.experienceMax || "",
            qualification: jobData.qualification || "",
            shift: jobData.shift || "Morning",
            vacancies: jobData.vacancies || "",
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
    const { name, value } = e.target;
    let newValue = value;
    
    // Don't allow changes to companyName field
    if (name === "companyName") return;
    
    // For contact field - only allow numbers
    if (name === "contact") {
      const numbersOnly = value.replace(/\D/g, '');
      newValue = numbersOnly;
      setFormData(prev => ({ ...prev, [name]: newValue }));
      return;
    }
    
    // Number validation for numeric fields
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
    if (!formData.salaryMin && !formData.salaryMax) {
      newErrors.salary = "Salary range is required";
    }
    if (formData.salaryMin && formData.salaryMin <= 0) newErrors.salaryMin = "Salary must be greater than 0";
    if (formData.salaryMax && formData.salaryMax <= 0) newErrors.salaryMax = "Salary must be greater than 0";
    if (formData.salaryMin && formData.salaryMax && formData.salaryMin > formData.salaryMax) {
      newErrors.salary = "Minimum salary cannot be greater than maximum salary";
    }
    if (!formData.description.trim()) newErrors.description = "Job description is required";
    if (!formData.requirements.trim()) newErrors.requirements = "Requirements are required";
    
    if (formData.contact && formData.contact.length < 10) {
      newErrors.contact = "Please enter a valid phone number (at least 10 digits)";
    }
    
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
      const user = auth.currentUser;
      
      // Format salary display with PKR
      let salaryDisplay = "Negotiable";
      if (formData.salaryMin && formData.salaryMax) {
        salaryDisplay = `PKR ${formData.salaryMin.toLocaleString()} - ${formData.salaryMax.toLocaleString()} / ${formData.salaryType}`;
      } else if (formData.salaryMin) {
        salaryDisplay = `From PKR ${formData.salaryMin.toLocaleString()} / ${formData.salaryType}`;
      } else if (formData.salaryMax) {
        salaryDisplay = `Up to PKR ${formData.salaryMax.toLocaleString()} / ${formData.salaryType}`;
      }

      // Format experience display
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
        status: "pending",
        updatedAt: serverTimestamp(),
      });

      toast.success("Job updated successfully! It will be reviewed by admin again.");
      router.push("/company/dashboard");
      
    } catch (error) {
      console.error("Error updating job:", error);
      toast.error("Failed to update job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
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
            <p className="text-cyan-100 mt-2">Update your job posting details below. Admin will review the changes.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
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
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Senior Software Engineer"
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
                    className="w-full px-4 py-3 border rounded-xl bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                  <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Company name is automatically fetched from your profile</p>
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
                  className={`w-full px-4 py-3 border rounded-xl ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Karachi, Lahore, Islamabad..."
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                >
                  {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-cyan-600" /> Salary Range <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary (PKR)</label>
                  <input
                    type="text"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="e.g., 50000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary (PKR)</label>
                  <input
                    type="text"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="e.g., 80000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Per</label>
                  <select
                    name="salaryType"
                    value={formData.salaryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  >
                    {salaryTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
              </div>
              {errors.salary && <p className="text-red-500 text-xs mt-2">{errors.salary}</p>}
            </div>

            {/* Experience */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-600" /> Experience Required
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Years</label>
                  <input
                    type="text"
                    name="experienceMin"
                    value={formData.experienceMin}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Years</label>
                  <input
                    type="text"
                    name="experienceMax"
                    value={formData.experienceMax}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>
            </div>

            {/* ✅ Additional Details - Qualification as Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ✅ Qualification Dropdown - FIXED */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification <span className="text-red-500">*</span>
                </label>
                <select
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select Qualification</option>
                  {qualifications.map((qual) => (
                    <option key={qual} value={qual}>
                      {qual}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the minimum required qualification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shift</label>
                <select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                >
                  {shifts.map(shift => <option key={shift} value={shift}>{shift}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Vacancies</label>
                <input
                  type="text"
                  name="vacancies"
                  value={formData.vacancies}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  placeholder="e.g., 5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number (for CVs)</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-xl ${errors.contact ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="03XXXXXXXXX"
                  maxLength="15"
                />
                {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
                <p className="text-xs text-gray-500 mt-1">Only numbers allowed (e.g., 03001234567)</p>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className={`w-full px-4 py-3 border rounded-xl ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Describe the role, responsibilities, and what the candidate will do..."
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows="4"
                className={`w-full px-4 py-3 border rounded-xl ${errors.requirements ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="List the skills, qualifications, and experience required..."
              />
              {errors.requirements && <p className="text-red-500 text-xs mt-1">{errors.requirements}</p>}
            </div>

            {/* Benefits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
              <textarea
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                placeholder="Health insurance, paid time off, flexible hours, etc."
              />
            </div>

            {/* Note */}
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Note:</p>
                <p className="text-sm text-yellow-700">
                  After editing, your job will be set to <strong>pending</strong> status and needs to be reviewed by admin again.
                  This ensures all changes are verified before going live.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? "Saving Changes..." : "Save Changes & Submit for Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}