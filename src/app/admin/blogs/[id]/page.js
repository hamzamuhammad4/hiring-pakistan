// src/app/blog/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, Tag, ArrowLeft, Clock } from "lucide-react";

export default function BlogDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchBlog = async () => {
      try {
        const blogRef = doc(db, "blogs", id);
        const blogSnap = await getDoc(blogRef);

        if (!blogSnap.exists()) {
          setError("Blog not found");
          setLoading(false);
          return;
        }

        const blogData = { id: blogSnap.id, ...blogSnap.data() };
        setBlog(blogData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-3">{error || "Blog Not Found"}</h1>
          <Link href="/blog" className="text-cyan-600 hover:underline inline-block">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  const formattedDate = blog.createdAt?.toDate
    ? blog.createdAt.toDate().toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recent";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/blog" className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {blog.image && (
            <div className="relative w-full h-64 md:h-96">
              <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" /> {blog.author || "Admin"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> {blog.category || "General"}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{blog.title}</h1>
            
            {blog.excerpt && (
              <p className="text-lg text-gray-600 border-l-4 border-cyan-500 pl-4 mb-6 italic">
                {blog.excerpt}
              </p>
            )}

            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <div className="whitespace-pre-wrap">{blog.content}</div>
            </div>

            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t flex flex-wrap items-center gap-3">
                <Tag className="h-4 w-4 text-gray-400" />
                {blog.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}