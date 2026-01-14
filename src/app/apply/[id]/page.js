// src/app/apply/[id]/page.js   ← YE PURA REPLACE KAR DE (CORS + ID Fix + Toast + Redirect)

"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplyPage({ params }) {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    coverLetter: "",
  });
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Await params.id (Next.js dynamic route fix)
  useEffect(() => {
    params.then((p) => {
      setId(p.id);
    }).catch(() => {
      setError("Invalid job ID");
    });
  }, [params]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) {
      setError("Invalid job ID. Please try from job page.");
      return;
    }

    setError("");
    setLoading(true);

    if (!cvFile) {
      setError("Please upload your CV (PDF only, max 5MB)");
      setLoading(false);
      return;
    }

    if (cvFile.size > 5 * 1024 * 1024) {
      setError("CV file size must be less than 5MB");
      setLoading(false);
      return;
    }

    try {
      // Upload CV
      const storageRef = ref(storage, `applications/${id}/${Date.now()}_${cvFile.name}`);
      await uploadBytes(storageRef, cvFile);
      const cvUrl = await getDownloadURL(storageRef);

      // Save to Firestore
      await addDoc(collection(db, "applications"), {
        jobId: id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        coverLetter: formData.coverLetter,
        cvUrl,
        createdAt: serverTimestamp(),
        status: "pending",
      });

      setSuccess(true);
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/jobs");
      }, 3000);
    } catch (err) {
      console.error("Apply error:", err);
      setError(
        err.code === "storage/unauthorized" 
          ? "Storage permission error. Contact admin." 
          : "Failed to submit. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!id && !error) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Apply for the Job</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 text-center font-medium">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-12">
              <h2 className="text-4xl font-bold text-green-600 mb-4">Success!</h2>
              <p className="text-xl text-gray-700 mb-6">Application submitted successfully.</p>
              <p className="text-gray-600 mb-8">Redirecting to jobs page in 3 seconds...</p>
              <Link href="/jobs" className="inline-block bg-cyan-600 text-white font-bold px-10 py-4 rounded-2xl hover:bg-cyan-700 transition">
                Go to Jobs Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none"
                  required
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  rows={4}
                  className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-200 outline-none resize-none"
                  placeholder="Why are you a good fit for this role?"
                />
              </div>

              {/* CV Upload */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2">Upload CV (PDF, max 5MB) *</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setCvFile(e.target.files[0])}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-xl py-5 rounded-2xl shadow-xl transform transition-all disabled:opacity-70 ${
                  loading ? "cursor-not-allowed" : "hover:scale-105"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Application"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}