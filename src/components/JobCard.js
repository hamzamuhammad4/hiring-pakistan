import Link from "next/link";  // ← YE LINE ZAROORI HAI

export default function JobCard({ job }) {
  // Safe date handling
  const postedDate = job.createdAt 
    ? new Date(job.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) 
    : "Recent";

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h3>
        <p className="text-gray-600 mt-1">Hiring Pakistan</p>
      </div>

      {/* Details */}
      <div className="p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
            {job.location || "Karachi"}
          </span>
          <span className="bg-cyan-50 text-cyan-700 px-3 py-1 rounded-full text-sm font-medium">
            {job.type || "Full Time"}
          </span>
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium font-bold">
            {job.salary || "Negotiable"}
          </span>
        </div>

        {/* Description Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {job.description || "No description available."}
        </p>

        {/* Posted Date & View Details */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Posted: {postedDate}</span>
          <Link
            href={`/jobs/${job.id}`}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}