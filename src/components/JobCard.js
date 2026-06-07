// src/components/JobCard.js
import Link from "next/link";
import Image from "next/image";
import { Briefcase, MapPin, Calendar, Building2, Clock, GraduationCap } from "lucide-react";

export default function JobCard({ job }) {
  // ✅ FIX: Handle Firestore Timestamp properly
  const getPostedDate = () => {
    if (!job.createdAt) return "Recent";
    
    try {
      // Check if it's Firestore Timestamp (has toDate method)
      let date;
      if (typeof job.createdAt.toDate === 'function') {
        date = job.createdAt.toDate();
      } 
      // Check if it's already a Date object
      else if (job.createdAt instanceof Date) {
        date = job.createdAt;
      }
      // Check if it's a string or timestamp number
      else if (typeof job.createdAt === 'string' || typeof job.createdAt === 'number') {
        date = new Date(job.createdAt);
      }
      else {
        return "Recent";
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Recent";
      }
      
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      console.error("Date parsing error:", error);
      return "Recent";
    }
  };

  // Format salary - replace $ with PKR
  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    let formatted = salary.replace(/\$/g, 'PKR');
    formatted = formatted.replace(/\$\s/g, 'PKR ');
    return formatted;
  };

  // Limit description to 80 characters
  const getShortDescription = (description) => {
    if (!description) return "No description available";
    if (description.length <= 80) return description;
    return description.substring(0, 80) + "...";
  };

  const postedDate = getPostedDate();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 h-full flex flex-col">
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Header with Logo */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100 flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Hiring Pakistan" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 hover:text-cyan-600 line-clamp-1">
              <Link href={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            <p className="text-gray-600 text-xs flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {job.companyName || "Hiring Pakistan"}
            </p>
          </div>
        </div>

        {/* Location & Type Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {job.location && (
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> {job.location}
            </span>
          )}
          {job.type && (
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg text-xs flex items-center gap-1">
              <Briefcase className="h-2.5 w-2.5" /> {job.type}
            </span>
          )}
        </div>

        {/* Salary */}
        {job.salary && job.salary !== "Negotiable" && (
          <div className="mb-2">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg inline-block break-words max-w-full">
              {formatSalary(job.salary)}
            </span>
          </div>
        )}

        {/* Experience & Qualification */}
        <div className="flex flex-wrap gap-2 mb-2 text-xs text-gray-500">
          {job.experience && job.experience !== "Not specified" && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {job.experience}
            </span>
          )}
          {job.qualification && job.qualification !== "Not specified" && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> {job.qualification.length > 20 ? job.qualification.substring(0, 18) + "..." : job.qualification}
            </span>
          )}
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 text-xs mb-3 flex-1">
          {getShortDescription(job.description)}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t mt-auto">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {postedDate}
          </span>
          <Link
            href={`/jobs/${job.id}`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}