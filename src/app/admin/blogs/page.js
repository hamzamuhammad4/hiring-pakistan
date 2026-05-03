// src/app/admin/blogs/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Newspaper, Plus, Edit, Trash2, Eye, Calendar, User, AlertTriangle } from "lucide-react";

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let blogsList = [];
      try {
        const blogsSnap = await getDocs(query(collection(db, "blogs"), orderBy("createdAt", "desc")));
        blogsList = blogsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
      } catch (err) {
        console.log("Blogs collection not found:", err.message);
        blogsList = [];
      }
      
      setBlogs(blogsList);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (!confirm("Delete this blog?")) return;
    
    try {
      await deleteDoc(doc(db, "blogs", blogId));
      setBlogs(blogs.filter(b => b.id !== blogId));
      toast.success("Blog deleted");
    } catch (err) {
      console.error("Error deleting blog:", err);
      toast.error("Failed to delete");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blogs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Blogs</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={fetchBlogs}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
        >
          Retry
        </button>
        <p className="text-xs text-gray-400 mt-4">
          Tip: Create your first blog post using the "New Blog Post" button.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Blog Management</h1>
          <p className="text-gray-500 mt-1">Create and manage blog posts</p>
        </div>
        <Link
          href="/admin/blogs/add"
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Plus className="h-5 w-5" /> New Blog Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-16 text-center">
          <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500 mb-2">No blog posts yet</p>
          <p className="text-gray-400">Create your first blog post using the button above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
              {blog.image && (
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover" />
              )}
              {!blog.image && (
                <div className="w-full h-48 bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Newspaper className="h-12 w-12 text-white opacity-50" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 line-clamp-2 text-gray-800">{blog.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {blog.createdAt?.toLocaleDateString('en-PK')}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" /> {blog.author || 'Admin'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {blog.excerpt || blog.content?.substring(0, 100) || 'No description'}
                </p>
                <div className="flex gap-3">
                  <Link 
                    href={`/blog/${blog.id}`} 
                    target="_blank" 
                    className="text-cyan-600 hover:text-cyan-800 text-sm flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" /> View
                  </Link>
                  <Link 
                    href={`/admin/blogs/${blog.id}/edit`} 
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" /> Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(blog.id)} 
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}