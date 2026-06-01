"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";
import { 
  Briefcase, MapPin, DollarSign, Clock, Calendar, 
  GraduationCap, Building2, FileText, CheckCircle, 
  ArrowLeft, Eye, TrendingUp, Users, Award
} from "lucide-react";

export default function SingleJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Invalid Job Link");
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobSnap = await getDoc(jobRef);

        if (!jobSnap.exists()) {
          setError("Job Not Found");
          setLoading(false);
          return;
        }

        const jobData = { id: jobSnap.id, ...jobSnap.data() };

        if (jobData.status !== "active") {
          setError("Job Not Available Yet");
          setLoading(false);
          return;
        }

        setJob(jobData);
        await updateDoc(jobRef, { views: increment(1) });
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary.replace(/\$/g, 'PKR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-3">{error || "Job Not Found"}</h1>
          <Link href="/jobs" className="text-cyan-600 hover:underline inline-block flex items-center gap-1 justify-center">
            <ArrowLeft className="h-4 w-4" /> Browse All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const postedDate = job.createdAt?.toDate
    ? job.createdAt.toDate().toLocaleDateString("en-PK")
    : job.createdAt?.seconds
    ? new Date(job.createdAt.seconds * 1000).toLocaleDateString("en-PK")
    : "Recent";

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-4 text-sm sm:text-base transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          
          {/* Header with Logo and Title */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-5 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="Hiring Pakistan" 
                  width={50} 
                  height={50} 
                  className="object-contain p-1"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{job.title}</h1>
                <p className="text-cyan-100 text-sm sm:text-base flex items-center gap-1 mt-1">
                  <Building2 className="h-4 w-4" /> Hiring Pakistan
                </p>
              </div>
            </div>
          </div>

          {/* Job Details Grid */}
          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-cyan-100 p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Location</p>
                  <p className="font-medium text-sm">{job.location || "Pakistan"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Job Type</p>
                  <p className="font-medium text-sm">{job.type || "Full Time"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Salary</p>
                  <p className="font-medium text-green-600 text-sm">{formatSalary(job.salary) || "Negotiable"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Experience</p>
                  <p className="font-medium text-sm">{job.experience || "Not specified"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Qualification</p>
                  <p className="font-medium text-sm">{job.qualification || "Not specified"}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Posted</p>
                  <p className="font-medium text-sm">{postedDate}</p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            {job.description && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  <h2 className="text-xl font-bold text-gray-800">Job Description</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{job.description}</p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-bold text-gray-800">Requirements</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{job.requirements}</p>
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-amber-600" />
                  <h2 className="text-xl font-bold text-gray-800">Benefits</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{job.benefits}</p>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <div className="mt-8 text-center">
              <Link
                href={`/apply/${job.id}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold text-base sm:text-lg px-10 py-4 rounded-xl shadow-lg transition transform hover:scale-105"
              >
                <Briefcase className="h-5 w-5" /> Apply Now — Free!
              </Link>
            </div>

            {/* Note */}
            <p className="text-center text-xs text-gray-400 mt-4">
              No account required. Your application will be sent directly to the employer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}