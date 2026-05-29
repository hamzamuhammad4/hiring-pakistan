// src/app/jobs/[id]/page.js
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SingleJobPage({ params }) {
  const { id } = await params;

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-3">Invalid Job ID</h1>
          <Link href="/jobs" className="text-cyan-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  try {
    const jobDoc = await getDoc(doc(db, "jobs", id));

    if (!jobDoc.exists()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-red-600 mb-3">Job Not Found</h1>
            <Link href="/jobs" className="text-cyan-600 hover:underline">
              ← Back to Jobs
            </Link>
          </div>
        </div>
      );
    }

    const job = { id: jobDoc.id, ...jobDoc.data() };

    // ✅ Security Check: Only show if job is active
    if (job.status !== "active") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-yellow-600 mb-3">Job Not Available Yet</h1>
            <p className="text-gray-600 mb-4">
              This job is pending admin approval and will be available soon.
            </p>
            <Link href="/jobs" className="text-cyan-600 hover:underline">
              ← Back to Jobs
            </Link>
          </div>
        </div>
      );
    }

    // ✅ INCREMENT VIEWS COUNT
    try {
      const jobRef = doc(db, "jobs", id);
      await updateDoc(jobRef, {
        views: increment(1)
      });
    } catch (err) {
      console.error("Error updating views:", err);
    }

    const postedDate = job.createdAt
      ? new Date(job.createdAt.toDate ? job.createdAt.toDate() : job.createdAt.seconds * 1000).toLocaleDateString()
      : "Recent";

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <Link href="/jobs" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6 text-lg">
            ← Back to Jobs
          </Link>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Job Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-5xl font-bold">
                  H
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{job.title}</h1>
                  <p className="text-xl opacity-90 mb-3">Hiring Pakistan</p>
                  <div className="flex flex-wrap gap-3">
                    <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">{job.location || "Karachi"}</span>
                    <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm">{job.type || "Full Time"}</span>
                    <span className="bg-white/30 px-4 py-1.5 rounded-full text-sm font-bold">{job.salary || "Negotiable"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Salary</p>
                  <p className="text-2xl font-bold text-green-600">{job.salary || "Negotiable"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Experience</p>
                  <p className="text-2xl font-semibold">{job.experience || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Posted</p>
                  <p className="text-2xl font-semibold">{postedDate}</p>
                </div>
              </div>

              <div className="prose max-w-none text-gray-700 leading-relaxed text-base">
                <h2 className="text-2xl font-bold mb-4">Job Description</h2>
                <div className="whitespace-pre-wrap">
                  {job.description || "No detailed description available yet."}
                </div>
              </div>

              {/* Apply Button */}
              <div className="mt-10 text-center">
                <Link
                  href={`/apply/${job.id}`}
                  className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-xl px-12 py-5 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Apply Now — It's Free!
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-red-600 mb-3">Error Loading Job</h1>
          <p className="text-lg text-gray-600 mb-4">{error.message}</p>
          <Link href="/jobs" className="text-cyan-600 hover:underline">
            ← Back to All Jobs
          </Link>
        </div>
      </div>
    );
  }
}