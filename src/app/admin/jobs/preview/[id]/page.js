// src/app/admin/jobs/preview/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { 
  Briefcase, MapPin, DollarSign, Clock, Calendar, 
  GraduationCap, Building2, FileText, CheckCircle, 
  ArrowLeft, Eye, TrendingUp, Users, Award
} from "lucide-react";

export default function AdminJobPreviewPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const jobRef = doc(db, "jobs", id);
        const jobDoc = await getDoc(jobRef);

        if (!jobDoc.exists()) {
          setError("Job Not Found");
          setLoading(false);
          return;
        }

        setJob({ id: jobDoc.id, ...jobDoc.data() });
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
          <Link href="/admin/jobs" className="text-cyan-600 hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending Approval';
      case 'rejected': return 'Rejected';
      default: return status || 'Pending';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button and Status */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm sm:text-base transition"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Jobs
          </button>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
            Status: {getStatusText(job.status)}
          </span>
        </div>

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
                  <Building2 className="h-4 w-4" /> {job.companyName}
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

            {/* Shift and Vacancies (if available) */}
            {(job.shift || job.vacancies) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {job.shift && (
                  <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Shift</p>
                      <p className="font-medium text-sm">{job.shift}</p>
                    </div>
                  </div>
                )}
                {job.vacancies && (
                  <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-3">
                    <div className="bg-teal-100 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Vacancies</p>
                      <p className="font-medium text-sm">{job.vacancies}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* Contact Information for Admin */}
            {job.contact && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-800">Contact Information</h2>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 text-sm">
                    <strong>Contact Number:</strong> {job.contact}
                  </p>
                  {job.companyEmail && (
                    <p className="text-gray-700 text-sm mt-2">
                      <strong>Company Email:</strong> {job.companyEmail}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Status Note */}
            {job.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4 flex items-start gap-3">
                <div className="bg-yellow-100 p-1 rounded-full">
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Pending Approval</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This job is waiting for admin review. Please review the details and approve or reject it from the admin panel.
                  </p>
                </div>
              </div>
            )}

            {job.status === 'active' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex items-start gap-3">
                <div className="bg-green-100 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-800 font-medium">Job is Active</p>
                  <p className="text-xs text-green-700 mt-1">
                    This job is live and visible to job seekers on the website.
                  </p>
                </div>
              </div>
            )}

            {job.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4 flex items-start gap-3">
                <div className="bg-red-100 p-1 rounded-full">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-red-800 font-medium">Job Rejected</p>
                  <p className="text-xs text-red-700 mt-1">
                    This job has been rejected and is not visible to job seekers.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}