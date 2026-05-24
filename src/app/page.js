// src/app/page.js
"use client";

import JobCard from "@/components/JobCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import Link from "next/link";

// Client-side data fetch function - ✅ Sirf ACTIVE jobs fetch karega
async function getFeaturedJobs() {
  try {
    const q = query(
      collection(db, "jobs"), 
      where("status", "==", "active"),  // ← ONLY ACTIVE JOBS
      orderBy("createdAt", "desc"), 
      limit(6)
    );
    const snapshot = await getDocs(q);
    const jobs = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      jobs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      });
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories list
  const categories = [
    "All",
    "Web Development",
    "Mobile App Development",
    "Graphic Design",
    "UI/UX Design",
    "Digital Marketing",
    "Content Writing",
    "Software Engineering",
    "Data Science / AI",
    "DevOps / Cloud",
    "Cyber Security",
    "Network Engineering",
    "Other",
  ];

  useEffect(() => {
    async function fetchJobs() {
      const fetchedJobs = await getFeaturedJobs();
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  // Filter jobs based on category AND search term
  useEffect(() => {
    let filtered = jobs;
    
    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(term) ||
        job.companyName?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.category?.toLowerCase().includes(term)
      );
    }
    
    setFilteredJobs(filtered);
  }, [selectedCategory, searchTerm, jobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Filter is already applied via useEffect
  };

  const stats = [
    { number: "10K+", label: "Active Jobs" },
    { number: "5K+", label: "Companies" },
    { number: "50K+", label: "Candidates" },
    { number: "100%", label: "Free for Job Seekers" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
            Find Your Dream Job
          </h1>
          <p className="text-lg md:text-xl text-cyan-100 mb-10 font-medium">
            10,000+ jobs from top companies in Pakistan
          </p>

          {/* Search + Category Filter */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 bg-white rounded-full shadow-2xl overflow-hidden flex items-center border-4 border-white">
              <div className="pl-7 pr-3">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Job title, keywords, company name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-4 px-2 text-base md:text-lg text-gray-700 outline-none"
              />
            </div>

            {/* Category Dropdown */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-4 px-6 text-base md:text-lg text-gray-700 bg-white rounded-full border-4 border-white shadow-2xl outline-none cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Button */}
            <button 
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-10 py-4 text-base md:text-lg rounded-full transition shadow-lg"
            >
              Search Jobs
            </button>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl py-5 px-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{stat.number}</div>
                <div className="text-cyan-100 text-sm md:text-base mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Jobs {selectedCategory !== "All" && `in ${selectedCategory}`}
            </h2>
            <Link href="/jobs" className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1">
              Browse All Jobs →
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-xl text-gray-500">No jobs found matching your criteria</p>
              <button 
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchTerm("");
                }}
                className="mt-4 text-cyan-600 hover:underline"
              >
                Clear filters →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cyan-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p className="text-gray-500">Register your company - Post jobs & hire talent</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cyan-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search & Apply</h3>
              <p className="text-gray-500">Find your dream job and apply with one click</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-cyan-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Hired</h3>
              <p className="text-gray-500">Connect with employers and land your dream job</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
<section className="py-16 px-4 bg-gradient-to-r from-cyan-600 to-blue-600">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
      Ready to Hire Top Talent?
    </h2>
    <p className="text-cyan-100 mb-8 text-lg">
      Join leading companies who found their ideal candidates through Hiring Pakistan
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link 
        href="/company/signup"   // ✅ Post a Job button
        className="bg-white text-cyan-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-full transition"
      >
        Post a Job
      </Link>
      <Link 
        href="/company/login"    // ✅ Company Login button
        className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-full transition"
      >
        Company Login
      </Link>
    </div>
  </div>
</section>
    </>
  );
}