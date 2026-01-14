// src/app/page.js   ← YE PURA CODE REPLACE KAR DE (Error Fix)

import JobCard from "@/components/JobCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

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
        // Timestamp ko safe string mein convert kar do
        createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
      });
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default async function HomePage() {
  const jobs = await getFeaturedJobs();

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

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-full shadow-2xl overflow-hidden flex items-center border-4 border-white">
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
              <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-10 py-4 text-base md:text-lg rounded-r-full transition shadow-lg">
                Search Jobs
              </button>
            </div>
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
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Featured Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-center text-xl text-gray-500 py-20">No jobs posted yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}