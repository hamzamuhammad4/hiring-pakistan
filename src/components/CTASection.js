// src/components/CTASection.js
"use client";

import Link from "next/link";
import { useAuth } from "@/lib/useAuth"; // Aapki auth hook ki location

export default function CTASection() {
  const { user, role } = useAuth();
  
  // Check if company is logged in
  const isCompanyLoggedIn = user && role === "company";
  
  return (
    <section className="py-16 px-4 bg-gradient-to-r from-cyan-600 to-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Hire Top Talent?
        </h2>
        <p className="text-cyan-100 mb-8 text-lg">
          Join leading companies who found their ideal candidates through Hiring Pakistan
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* ✅ Post a Job button - ALWAYS show */}
          <Link 
            href={isCompanyLoggedIn ? "/company/dashboard/post-job" : "/company/signup"}
            className="bg-white text-cyan-600 hover:bg-gray-100 font-bold px-8 py-3 rounded-full transition"
          >
            Post a Job
          </Link>
          
          {/* ❌ Company Login button - ONLY show when NOT logged in */}
          {!isCompanyLoggedIn && (
            <Link 
              href="/company/login"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold px-8 py-3 rounded-full transition"
            >
              Company Login
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}