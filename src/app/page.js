// src/app/page.js   ← YE PURA CODE REPLACE KAR DE (Category Filter Working)

"use client";   // ← YE SABSE ZAROORI HAI (client-side filtering ke liye)

import JobCard from "@/components/JobCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

// Server-side data fetch (featured jobs)
async function getFeaturedJobs() {
  try {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(6));
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

// Main page component (client-side)
export default function HomePage() {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      const fetchedJobs = await getFeaturedJobs();
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredJobs(jobs);
    } else {
      const filtered = jobs.filter(job => job.category === selectedCategory);
      setFilteredJobs(filtered);
    }
  }, [selectedCategory, jobs]);

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
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
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
            <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-10 py-4 text-base md:text-lg rounded-full transition shadow-lg">
              Search Jobs
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">
            {["10K+", "5K+", "50K+", "100%"].map((num, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl py-5 px-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{num}</div>
                <div className="text-cyan-100 text-sm md:text-base mt-2 font-medium">
                  {["Active Jobs", "Companies", "Candidates", "Free for Job Seekers"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Featured Jobs {selectedCategory !== "All" && `in ${selectedCategory}`}
          </h2>

          {loading ? (
            <p className="text-center text-xl text-gray-500 py-20">Loading jobs...</p>
          ) : filteredJobs.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-20">
              No jobs found in this category yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}