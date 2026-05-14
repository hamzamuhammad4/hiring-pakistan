// src/app/resources/page.js
import Link from "next/link";
import { FileText, Users, TrendingUp, Award, CheckCircle, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Employer Resources - Hiring Pakistan",
  description: "Resources for employers to hire better",
};

export default function ResourcesPage() {
  const resources = [
    { title: "How to Write Effective Job Descriptions", icon: FileText, link: "/blog/1" },
    { title: "Interview Questions by Industry", icon: Users, link: "/blog/2" },
    { title: "Employee Retention Strategies", icon: TrendingUp, link: "/blog/3" },
    { title: "Building a Strong Employer Brand", icon: Award, link: "/blog/4" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Employer Resources</h1>
          <p className="text-gray-600">Tools, guides, and tips to help you hire better</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {resources.map((resource, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 flex items-start gap-4">
              <resource.icon className="h-8 w-8 text-cyan-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{resource.title}</h3>
                <Link href={resource.link} className="text-cyan-600 text-sm flex items-center gap-1">Read More <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Guides</h2>
          <ul className="space-y-3">
            <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> How to post your first job</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Understanding credit system</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Managing applications efficiently</li>
            <li className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Tips for successful hiring</li>
          </ul>
        </div>
      </div>
    </div>
  );
}