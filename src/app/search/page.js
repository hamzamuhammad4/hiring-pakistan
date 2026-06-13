// src/app/search/page.js
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, Building2, Clock, GraduationCap, Search } from "lucide-react";

// Job Card Component
function SearchJobCard({ job }) {
  const formatDateTime = (date) => {
    if (!date) return "Recent";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatSalary = (salary) => {
    if (!salary) return "Negotiable";
    return salary.replace(/\$/g, 'PKR');
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="h-6 w-6 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/jobs/${job.id}`}>
              <h3 className="text-lg font-bold text-gray-800 hover:text-cyan-600 transition line-clamp-1">
                {job.title}
              </h3>
            </Link>
            <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
              <Building2 className="h-3.5 w-3.5" /> {job.companyName || "Hiring Pakistan"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {job.location && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {job.location}
            </span>
          )}
          {job.type && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-lg text-xs flex items-center gap-1">
              <Briefcase className="h-3 w-3" /> {job.type}
            </span>
          )}
        </div>

        {job.salary && job.salary !== "Negotiable" && (
          <div className="mt-2">
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
              {formatSalary(job.salary)}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
          {job.experience && job.experience !== "Not specified" && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {job.experience}
            </span>
          )}
          {job.qualification && (
            <span className="flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> {job.qualification.length > 25 ? job.qualification.substring(0, 25) + "..." : job.qualification}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {formatDateTime(job.createdAt)}
          </span>
          <Link
            href={`/jobs/${job.id}`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition"
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: searchParams.get('q') || "",
    category: searchParams.get('category') || "All",
    location: "",
    type: ""
  });

  const categories = [
    "All", "Web Development", "Mobile App Development", "Graphic Design",
    "UI/UX Design", "Digital Marketing", "Content Writing", "Software Engineering",
    "Data Science / AI", "DevOps / Cloud", "Cyber Security", "Network Engineering", "Other"
  ];

  const jobTypes = ["All", "Full Time", "Part Time", "Contract", "Internship", "Remote"];

  useEffect(() => {
    fetchJobs();
  }, [filters.keyword, filters.category, filters.location, filters.type]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let q = query(collection(db, "jobs"), where("status", "==", "active"), orderBy("createdAt", "desc"));
      let snapshot = await getDocs(q);
      let jobsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        jobsList = jobsList.filter(job =>
          job.title?.toLowerCase().includes(keyword) ||
          job.companyName?.toLowerCase().includes(keyword) ||
          job.location?.toLowerCase().includes(keyword)
        );
      }

      if (filters.category !== "All") {
        jobsList = jobsList.filter(job => job.category === filters.category);
      }

      if (filters.location) {
        const location = filters.location.toLowerCase();
        jobsList = jobsList.filter(job => job.location?.toLowerCase().includes(location));
      }

      if (filters.type && filters.type !== "All") {
        jobsList = jobsList.filter(job => job.type === filters.type);
      }

      setJobs(jobsList);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ keyword: "", category: "All", location: "", type: "" });
  };

  const hasActiveFilters = filters.keyword || filters.category !== "All" || filters.location || filters.type;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keywords, company name..."
                  value={filters.keyword}
                  onChange={(e) => updateFilter('keyword', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-0 focus:ring-2 focus:ring-cyan-400 outline-none bg-white text-gray-800 placeholder:text-gray-400"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="px-5 py-3 rounded-xl border-0 bg-white focus:ring-2 focus:ring-cyan-400 outline-none text-gray-800 font-medium cursor-pointer md:w-48"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <button
                type="submit"
                className="bg-white text-cyan-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl transition shadow-md border-0"
              >
                Search Jobs
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Location (e.g., Karachi)"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="px-4 py-2.5 rounded-lg border-0 text-sm flex-1 md:flex-none md:w-52 outline-none bg-white text-gray-800 placeholder:text-gray-400"
              />
              <select
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="px-4 py-2.5 rounded-lg border-0 text-sm outline-none bg-white text-gray-800 font-medium cursor-pointer"
              >
                {jobTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Search Results</h1>
            <p className="text-gray-500 text-sm mt-1">Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg shadow-sm"
            >
              Clear All Filters ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No jobs found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {jobs.map((job) => (
              <SearchJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}