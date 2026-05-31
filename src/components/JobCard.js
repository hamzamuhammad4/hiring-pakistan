// src/components/JobCard.js
import Link from "next/link";
import Image from "next/image";
import { Briefcase, MapPin, DollarSign, Users, Calendar, Building2, Clock, GraduationCap, Users as UsersIcon } from "lucide-react";

export default function JobCard({ job }) {
  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
      <div className="p-5">
        {/* Header with Logo */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
            <Image 
              src="/logo.png" 
              alt="Hiring Pakistan" 
              width={32} 
              height={32} 
              className="rounded-lg object-contain"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 hover:text-cyan-600 line-clamp-1">
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            <p className="text-gray-600 text-sm flex items-center gap-1">
              <Building2 className="h-3 w-3" /> Hiring Pakistan
            </p>
          </div>
        </div>

        {/* Location, Type, Salary Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {job.location && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {job.location}
            </span>
          )}
          {job.type && (
            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {job.type}
            </span>
          )}
          {job.salary && job.salary !== "Negotiable" && (
            <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> {job.salary}
            </span>
          )}
        </div>

        {/* Experience & Qualification */}
        <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-500">
          {job.experience && job.experience !== "Not specified" && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Exp: {job.experience}
            </span>
          )}
          {job.qualification && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> {job.qualification}
            </span>
          )}
          {job.shift && job.shift !== "Morning" && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Shift: {job.shift}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" /> {job.applicantsCount || 0} applicants
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="h-4 w-4" /> {job.vacancies || 1} vacancy
          </span>
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {job.description?.substring(0, 100)}...
        </p>

        {/* Footer */}
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