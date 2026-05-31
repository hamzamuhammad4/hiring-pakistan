// src/app/apply/[id]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, User, Mail, Phone, MapPin, FileText, Upload, ChevronLeft, CheckCircle, AlertCircle, X, Plus } from "lucide-react";

// Common skills suggestions
const COMMON_SKILLS = [
  "JavaScript", "React", "Next.js", "Node.js", "Python", "Java", "C++", "C#",
  "HTML", "CSS", "Tailwind CSS", "Bootstrap", "PHP", "Laravel", "Django", "Flask",
  "MongoDB", "PostgreSQL", "MySQL", "Firebase", "AWS", "Docker", "Git", "GitHub",
  "TypeScript", "Angular", "Vue.js", "Svelte", "GraphQL", "REST API", "Redux",
  "Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX Design", "Graphic Design",
  "SEO", "Digital Marketing", "Content Writing", "Social Media", "WordPress",
  "Shopify", "WooCommerce", "Excel", "Power BI", "Data Analysis", "Machine Learning",
  "AI", "Deep Learning", "TensorFlow", "PyTorch", "Flutter", "React Native", "Swift",
  "Kotlin", "Android", "iOS", "DevOps", "Kubernetes", "Jenkins", "CI/CD"
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = (skill) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !formData.skills.includes(trimmedSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill]
      }));
    }
    setSkillInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !cvFile) {
      toast.error("Please fill all required fields and upload CV");
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
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-5 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur rounded-xl p-2 sm:p-3">
                <Briefcase className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">{job.title}</h1>
                <p className="text-cyan-100 text-sm sm:text-base flex items-center gap-1"><Building2 className="h-3 w-3 sm:h-4 sm:w-4" /> Hiring Pakistan</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name *" className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address *" className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
                </div>
              </div>

              {/* Phone and City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              {/* Experience and Skills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <select name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-cyan-500">
                  <option value="">Select Experience</option>
                  <option>Fresher</option><option>1-2 years</option><option>3-5 years</option><option>5-7 years</option><option>7+ years</option>
                </select>

                {/* Skills Field - Improved Layout */}
                <div>
                  <div className="border rounded-xl focus-within:ring-2 focus-within:ring-cyan-500 p-2 bg-white">
                    {/* Skills Tags */}
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {formData.skills.map((skill, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-800 px-2 py-1 rounded-lg text-xs sm:text-sm">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600 transition">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Skill Input */}
                    <div className="relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyPress}
                        placeholder={formData.skills.length === 0 ? "Type a skill and press Enter..." : "Add more skills..."}
                        className="w-full px-2 py-1 outline-none text-sm sm:text-base"
                      />
                      
                      {/* Suggestions Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                        >
                          {suggestions.map((skill, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addSkill(skill)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition flex items-center justify-between"
                            >
                              <span>{skill}</span>
                              <Plus className="h-3 w-3 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Press Enter to add skill</p>
                </div>
              </div>

              {/* Cover Letter */}
              <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange} rows="4" placeholder="Cover Letter (Optional)" className="w-full px-4 py-3 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-cyan-500" />

              {/* CV Upload */}
              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                {cvPreview ? (
                  <div>
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-sm break-all">{cvPreview}</p>
                    <button type="button" onClick={() => { setCvFile(null); setCvPreview(null); }} className="text-red-500 text-sm mt-2 hover:underline">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Click to upload CV</p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" required />
                  </label>
                )}
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl transition disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
        
        {/* Note */}
        <div className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          <p>✅ No account required. Your application will be sent directly to the employer.</p>
        </div>
      </div>
    </div>
  );
}