// src/app/about/page.js
import Link from "next/link";
import { Briefcase, Users, Award, TrendingUp, CheckCircle } from "lucide-react";

export const metadata = {
  title: "About Us - Hiring Pakistan",
  description: "Learn about Hiring Pakistan - Pakistan's #1 Job Portal",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pakistan's #1 Job Portal connecting talented professionals with top employers across the country.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To empower job seekers and employers by providing a seamless, efficient, and reliable platform 
                that connects the right talent with the right opportunities across Pakistan.
              </p>
            </div>
            <div className="bg-cyan-100 p-6 rounded-2xl">
              <Briefcase className="h-16 w-16 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-cyan-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-800">10,000+</p>
            <p className="text-gray-500">Active Job Seekers</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Briefcase className="h-12 w-12 text-cyan-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-800">2,000+</p>
            <p className="text-gray-500">Companies Registered</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Award className="h-12 w-12 text-cyan-600 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-800">5,000+</p>
            <p className="text-gray-500">Jobs Placed</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Trusted Platform</h3>
                <p className="text-gray-500 text-sm">Thousands of successful placements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Easy to Use</h3>
                <p className="text-gray-500 text-sm">Simple and intuitive interface</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Free for Job Seekers</h3>
                <p className="text-gray-500 text-sm">No hidden charges for candidates</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">24/7 Support</h3>
                <p className="text-gray-500 text-sm">Dedicated customer support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}