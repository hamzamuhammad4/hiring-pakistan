// src/app/hire/page.js
import Link from "next/link";
import { Briefcase, Users, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Hire Talent - Hiring Pakistan",
  description: "Find the best talent for your company",
};

export default function HirePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Hire Top Talent</h1>
          <p className="text-xl text-gray-600">Find the right candidates for your organization</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Briefcase className="h-12 w-12 text-cyan-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Post a Job</h2>
            <p className="text-gray-600 mb-4">Reach thousands of qualified candidates by posting your job opening.</p>
            <Link href="/company/signup" className="text-cyan-600 font-medium flex items-center gap-1">Get Started <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Users className="h-12 w-12 text-cyan-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Candidates</h2>
            <p className="text-gray-600 mb-4">Browse our database of qualified professionals.</p>
            <Link href="/jobs" className="text-cyan-600 font-medium flex items-center gap-1">Browse Candidates <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Hire?</h2>
          <p className="mb-6 opacity-90">Create a company account and start posting jobs today</p>
          <Link href="/company/signup" className="inline-block bg-white text-cyan-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition">
            Register as Employer
          </Link>
        </div>
      </div>
    </div>
  );
}