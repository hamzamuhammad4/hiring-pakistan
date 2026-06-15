// src/app/apply/[id]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, User, Mail, Phone, MapPin, Upload, ChevronLeft, CheckCircle, X, Plus } from "lucide-react";

// Common skills suggestions
const COMMON_SKILLS = [
  "JavaScript", "React", "Next.js", "Node.js", "Python", "Java", "C++", "C#",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "PHP", "Laravel", "Django", "Flask",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "AWS", "Docker", "Git", "GitHub",
  "TypeScript", "Angular", "Vue.js", "GraphQL", "REST API", "Redux",
  "Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX Design", "Graphic Design",
  "SEO", "Digital Marketing", "Content Writing", "Social Media", "WordPress",
  "Excel", "Data Analysis", "Machine Learning", "Flutter", "React Native",
  "DevOps", "Kubernetes", "CI/CD"
];

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", 
    email: "", 
    phone: "", 
    city: "", 
    experience: "", 
    skills: [],
    coverLetter: ""
  });
  const [skillInput, setSkillInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);
        if (jobSnap.exists()) {
          setJob({ id: jobSnap.id, ...jobSnap.data() });
        } else {
          router.push("/jobs");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, router]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (skillInput.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    const filtered = COMMON_SKILLS.filter(skill => 
      skill.toLowerCase().includes(skillInput.toLowerCase()) &&
      !formData.skills.includes(skill)
    ).slice(0, 8);
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [skillInput, formData.skills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData({ ...formData, [name]: numbersOnly });
      if (errors.phone) setErrors({ ...errors, phone: '' });
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Phone number must be at least 10 digits";
    }
    
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    
    if (!formData.experience) {
      newErrors.experience = "Experience is required";
    }
    
    if (formData.skills.length === 0) {
      newErrors.skills = "At least one skill is required";
    }
    
    if (!cvFile) {
      newErrors.cv = "CV is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSkill = (skill) => {
    const upperCaseSkill = skill.trim().toUpperCase();
    
    if (upperCaseSkill && !formData.skills.includes(upperCaseSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, upperCaseSkill]
      }));
    }
    setSkillInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
    if (errors.skills) setErrors({ ...errors, skills: '' });
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (skillInput.trim()) {
        addSkill(skillInput);
      }
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max 5MB");
        return;
      }
      setCvFile(file);
      setCvPreview(file.name);
      if (errors.cv) setErrors({ ...errors, cv: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('cv', cvFile);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      const uploadData = await uploadRes.json();
      
      if (!uploadData.success) {
        throw new Error(uploadData.error);
      }
      
      const cvUrl = uploadData.url;

      await addDoc(collection(db, "applications"), {
        jobId: id, 
        jobTitle: job.title, 
        companyId: job.companyId, 
        companyName: job.companyName,
        ...formData,
        skills: formData.skills.join(", "),
        cvUrl: cvUrl,
        status: "pending", 
        appliedAt: serverTimestamp(), 
        createdAt: serverTimestamp()
      });

      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        applicantsCount: increment(1)
      });

      toast.success("Application submitted successfully!");
      router.push(`/jobs/${id}?applied=true`);
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href={`/jobs/${id}`} className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6">
          <ChevronLeft className="h-4 w-4" /> Back to Job
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur rounded-xl p-3">
                <Briefcase className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                <p className="text-cyan-100 text-sm flex items-center gap-1 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" /> Hiring Pakistan
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mx-6 mt-6">
            <p className="text-sm text-green-700 flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" /> No account required. Your application will be sent directly to the employer.
            </p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="03XXXXXXXXX"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Karachi, Lahore, Islamabad..."
                    />
                  </div>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-cyan-500 bg-white ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select Experience</option>
                    <option value="Fresher">Fresher (No experience)</option>
                    <option value="1-2 years">1 - 2 years</option>
                    <option value="3-5 years">3 - 5 years</option>
                    <option value="5-7 years">5 - 7 years</option>
                    <option value="7+ years">7+ years</option>
                  </select>
                  {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
                </div>

                {/* ✅ FIXED: Skills Field - Better mobile responsive tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <div className={`border rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-transparent p-2 bg-white ${errors.skills ? 'border-red-500' : 'border-gray-300'}`}>
                    {/* Skills Tags - Improved for mobile */}
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.skills.map((skill, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-1.5 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium uppercase shadow-sm"
                          >
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => removeSkill(skill)} 
                              className="hover:text-red-600 focus:outline-none"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyPress}
                        placeholder={formData.skills.length === 0 ? "Type a skill and press Enter (e.g., JavaScript)..." : "Add more skills..."}
                        className="w-full px-2 py-1 outline-none text-sm"
                      />
                      {showSuggestions && suggestions.length > 0 && (
                        <div ref={suggestionsRef} className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {suggestions.map((skill, index) => (
                            <button 
                              key={index} 
                              type="button" 
                              onClick={() => addSkill(skill)} 
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between"
                            >
                              <span>{skill}</span>
                              <Plus className="h-3 w-3 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                  <p className="text-xs text-gray-400 mt-1">Press Enter to add skill (Required)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Letter (Optional)</label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                  placeholder="Tell us why you're a great fit for this position..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Upload CV <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-cyan-500 transition ${errors.cv ? 'border-red-500' : 'border-gray-300'}`}>
                  {cvPreview ? (
                    <div>
                      <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 break-all">{cvPreview}</p>
                      <button
                        type="button"
                        onClick={() => { setCvFile(null); setCvPreview(null); }}
                        className="text-red-500 text-sm mt-2 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Click to upload your CV/Resume</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                {errors.cv && <p className="text-red-500 text-xs mt-1">{errors.cv}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}