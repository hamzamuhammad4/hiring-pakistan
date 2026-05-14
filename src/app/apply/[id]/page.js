// src/app/apply/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Briefcase, Building2, User, Mail, Phone, MapPin, FileText, Upload, ChevronLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function ApplyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", city: "", experience: "", skills: "", coverLetter: ""
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);

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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
      const timestamp = Date.now();
      const fileName = `cv_${formData.email}_${timestamp}_${cvFile.name}`;
      const storageRef = ref(storage, `cvs/${fileName}`);
      await uploadBytes(storageRef, cvFile);
      const cvUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "applications"), {
        jobId: id, jobTitle: job.title, companyId: job.companyId, companyName: job.companyName,
        ...formData, cvUrl, status: "pending", appliedAt: serverTimestamp(), createdAt: serverTimestamp()
      });

      toast.success("Application submitted successfully!");
      router.push(`/jobs/${id}?applied=true`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit application");
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
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur rounded-xl p-3">
                <Briefcase className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="opacity-90 flex items-center gap-1"><Building2 className="h-4 w-4" /> {job.companyName}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name *" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address *" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <select name="experience" value={formData.experience} onChange={handleChange} className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500">
                  <option value="">Experience</option>
                  <option>Fresher</option><option>1-2 years</option><option>3-5 years</option><option>5-7 years</option><option>7+ years</option>
                </select>
                <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="Skills (comma separated)" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" />
              </div>

              <textarea name="coverLetter" value={formData.coverLetter} onChange={handleChange} rows="4" placeholder="Cover Letter" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" />

              <div className="border-2 border-dashed rounded-xl p-6 text-center">
                {cvPreview ? (
                  <div>
                    <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p>{cvPreview}</p>
                    <button type="button" onClick={() => { setCvFile(null); setCvPreview(null); }} className="text-red-500 text-sm mt-2">Remove</button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Click to upload CV (PDF, DOC, DOCX, Max 5MB) *</p>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" required />
                  </label>
                )}
              </div>

              <button type="submit" disabled={submitting} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl transition disabled:bg-gray-400">
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}