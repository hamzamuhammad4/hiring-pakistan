// src/app/admin/blogs/add/page.js
"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Save } from "lucide-react";

export default function AddBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "Admin",
    category: "Jobs",
    tags: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please fill title and content");
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `blogs/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "blogs"), {
        ...formData,
        tags: formData.tags.split(",").map(t => t.trim()),
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success("Blog published successfully!");
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error adding blog:", error);
      toast.error("Failed to publish blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/blogs" className="text-cyan-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Create New Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <div>
          <label className="block font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-medium mb-2">Author</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3"
            >
              <option>Jobs</option>
              <option>Career Tips</option>
              <option>Interview Tips</option>
              <option>Company News</option>
              <option>Industry Trends</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Excerpt (Short Summary)</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows="2"
            className="w-full border rounded-lg px-4 py-3"
            placeholder="A brief summary of the blog post..."
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="12"
            className="w-full border rounded-lg px-4 py-3 font-mono text-sm"
            placeholder="Write your blog content here..."
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="jobs, career, interview"
            className="w-full border rounded-lg px-4 py-3"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Featured Image</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {imagePreview ? (
              <div>
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto mb-3 rounded" />
                <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }} className="text-red-600 text-sm">
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to upload image</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
          >
            <Save className="h-5 w-5" /> {loading ? "Publishing..." : "Publish Blog"}
          </button>
          <Link href="/admin/blogs" className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}