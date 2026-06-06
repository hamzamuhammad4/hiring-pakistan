// src/app/page.js (debug version with direct auth check)
"use client";

import JobCard from "@/components/JobCard";
import SearchSection from "@/components/SearchSection";
import { db, auth } from "@/lib/firebase"; // ✅ auth bhi import karo
import { collection, query, orderBy, limit, getDocs, where } from "firebase/firestore";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// Fetch jobs function
async function getAllJobs() {
  try {
    const q = query(
      collection(db, "jobs"), 
      where("status", "==", "active"),
      orderBy("createdAt", "desc"), 
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

// Main content component
function HomeContent() {
  const searchParams = useSearchParams();
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompanyLoggedIn, setIsCompanyLoggedIn] = useState(false); // ✅ Direct state

  // Get filters from URL
  const searchQuery = searchParams.get('search') || "";
  const categoryFilter = searchParams.get('category') || "All";

  // ✅ Direct Firebase auth check - MOST RELIABLE
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log("Auth state changed:", user?.email, "Verified:", user?.emailVerified);
      
      if (user && user.emailVerified) {
        // Check if user is company from Firestore
        const userDoc = await import('firebase/firestore').then(({ doc, getDoc }) => 
          getDoc(doc(db, 'users', user.uid))
        );
        const role = userDoc.exists() ? userDoc.data().role : null;
        console.log("User role from DB:", role);
        
        // ✅ Condition: logged in AND role is company
        setIsCompanyLoggedIn(role === "company" || role === "employer");
      } else {
        setIsCompanyLoggedIn(false);
      }
    });
    
    return unsubscribe;
  }, []);

  // Load jobs
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      const jobs = await getAllJobs();
      setAllJobs(jobs);
      setFilteredJobs(jobs);
      setLoading(false);
    }
    loadJobs();
  }, []);

  // Filter jobs based on URL params
  useEffect(() => {
    if (allJobs.length === 0) return;
    
    let results = [...allJobs];
    
    if (categoryFilter !== "All") {
      results = results.filter(job => job.category === categoryFilter);
    }
    
    if (searchQuery.trim() !== "") {
      const term = searchQuery.toLowerCase().trim();
      results = results.filter(job => 
        job.title?.toLowerCase().includes(term) ||
        job.companyName?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.category?.toLowerCase().includes(term)
      );
    }
    
    setFilteredJobs(results);
  }, [searchQuery, categoryFilter, allJobs]);

  const stats = [
    { number: "10K+", label: "Active Jobs" },
    { number: "5K+", label: "Companies" },
    { number: "50K+", label: "Candidates" },
    { number: "100%", label: "Free for Job Seekers" },
  ];

  return (
    <>
      <section className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 py-16 px-4">
        <SearchSection />
        
        <div className="max-w-5xl mx-auto mt-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl py-5 px-6 border border-white/20">
                <div className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{stat.number}</div>
                <div className="text-cyan-100 text-sm md:text-base mt-2 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {searchQuery || categoryFilter !== "All" ? "Search Results" : "Featured Jobs"}
              </h2>
              {(searchQuery || categoryFilter !== "All") && (
                <p className="text-gray-500 mt-1">
                  Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
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

      {/* ✅ UPDATED CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-cyan-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Hire Top Talent?
          </h2>
          <p className="text-cyan-100 mb-8 text-lg">
            Join leading companies who found their ideal candidates through Hiring Pakistan
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Post a Job - Always show */}
            <Link 
              href={isCompanyLoggedIn ? "/company/dashboard/post-job" : "/company/signup"}
              className="bg-white text-cyan-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-full transition"
            >
              Post a Job
            </Link>
            
            {/* Company Login - Only show when NOT logged in */}
            {!isCompanyLoggedIn && (
              <Link 
                href="/company/login"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-full transition"
              >
                Company Login
              </Link>
            )}
          </div>
          
          {/* ✅ Debug info - Remove after testing */}
          <p className="text-white/50 text-xs mt-4">
            Debug: Logged in: {isCompanyLoggedIn ? "YES" : "NO"}
          </p>
        </div>
      </section>
    </>
  );
}

// Main export
export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}