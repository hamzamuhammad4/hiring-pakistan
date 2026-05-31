// src/components/JobCard.js
import Link from "next/link";
import { Briefcase, MapPin, DollarSign, Eye, Users, Calendar, Building2 } from "lucide-react";

export default function JobCard({ job }) {
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 hover:text-cyan-600">
            <Link href={`/jobs/${job.id}`}>{job.title}</Link>
          </h3>
        </div>
        <p className="text-gray-600 flex items-center gap-1 mt-1">
          <Building2 className="h-4 w-4" /> Hiring Pakistan
        </p>
        <div className="flex flex-wrap gap-2 mb-4 mt-2">
          <span className="bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {job.location || "Pakistan"}
          </span>
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
            {job.type || "Full Time"}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <DollarSign className="h-3 w-3" /> {job.salary || "Negotiable"}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {job.applicantsCount || 0} applicants</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {job.description?.substring(0, 100)}...
        </p>
        <div className="flex justify-between items-center pt-3 border-t">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Posted: {postedDate}
          </span>
          <Link
            href={`/jobs/${job.id}`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}