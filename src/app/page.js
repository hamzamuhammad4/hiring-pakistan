// src/app/jobs/page.js   ← YE PURA CODE REPLACE KAR DE (100% Working + Beautiful)

import JobCard from "@/components/JobCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const CITIES = ["All Cities", "Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Multan"];
const SALARY_RANGES = ["Any", "0-50k", "50k-100k", "100k-200k", "200k+"];
const EXPERIENCE = ["Any", "Fresh", "1-2 years", "3-5 years", "5+ years"];
const JOB_TYPES = ["Any", "Full Time", "Part Time", "Remote", "Internship"];

async function getAllJobs() {
  try {
    const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"), limit(50));
    const snapshot = await getDocs(q);
    const jobs = [];
    snapshot.forEach((doc) => jobs.push({ id: doc.id, ...doc.data() }));
    return jobs;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function JobsPage() {
  const jobs = await getAllJobs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO + SEARCH BAR */}
      <section className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
            Find Your Dream Job
          </h1>
          <p className="text-lg md:text-xl text-cyan-100 mb-10 font-medium">
            10,000+ jobs from top companies in Pakistan
          </p>

          {/* SEARCH BAR */}
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

      {/* MAIN CONTENT — FILTERS + JOBS LIST */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Filters */}
          <aside className="lg:w-80">
            <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800">Filters</h3>
              {[
                { label: "Location", options: CITIES },
                { label: "Salary Range", options: SALARY_RANGES },
                { label: "Experience", options: EXPERIENCE },
                { label: "Job Type", options: JOB_TYPES }
              ].map((filter) => (
                <div key={filter.label}>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    {filter.label}
                  </label>
                  <select className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-cyan-500 outline-none text-gray-700">
                    {filter.options.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </aside>

          {/* Jobs List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800">{jobs.length} Jobs Found</h2>
              <select className="px-8 py-4 border-2 border-gray-200 rounded-2xl font-medium">
                <option>Latest First</option>
                <option>Salary High to Low</option>
              </select>
            </div>

            {jobs.length === 0 ? (
              <div className="text-center py-32 bg-white rounded-3xl shadow-xl">
                <p className="text-3xl text-gray-500 font-bold">No jobs posted yet</p>
                <p className="text-xl text-gray-400 mt-4">Be the first company to post a job!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}