"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const blogsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        setBlogs(blogsList);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Blog & Tips</h1>
          <p className="text-gray-600">Career advice, job search strategies, and industry insights</p>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Link key={blog.id} href={`/blog/${blog.id}`} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                {blog.image && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {blog.createdAt?.toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><User className="h-4 w-4" /> {blog.author || "Admin"}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{blog.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt || blog.content?.substring(0, 100)}...</p>
                  <span className="text-cyan-600 font-medium inline-flex items-center gap-1">Read More <ArrowRight className="h-4 w-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}