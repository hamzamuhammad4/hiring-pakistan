// src/app/admin/blogs/add/page.js
"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Save, X } from "lucide-react";

export default function AddBlog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "Admin",
    category: "Jobs"
  });
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large. Max 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle tag input
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    let newTag = tagInput.trim();
    // Remove trailing comma if present
    if (newTag.endsWith(',')) {
      newTag = newTag.slice(0, -1).trim();
    }
    
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    } else if (newTag && tags.includes(newTag)) {
      toast.error("Tag already exists");
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast.error("Please fill title and content");
      return;
    }

    setLoading(true);
    setUploading(true);
    
    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(storage, `blogs/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt || formData.content.substring(0, 150),
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: tags,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "published"
      };

      await addDoc(collection(db, "blogs"), blogData);

      toast.success("Blog published successfully!");
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error adding blog:", error);
      toast.error(error.message || "Failed to publish blog");
    } finally {
      setLoading(false);
      setUploading(false);
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
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
            className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
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
            className="w-full border rounded-lg px-4 py-3 font-mono text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            placeholder="Write your blog content here..."
            required
          />
        </div>

        {/* Tags Input with Chips */}
        <div>
          <label className="block font-medium mb-2">Tags (comma separated)</label>
          <div className="border rounded-lg p-3 focus-within:ring-2 focus-within:ring-cyan-500">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-cyan-200 rounded-full p-0.5 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleTagBlur}
              placeholder={tags.length === 0 ? "Type a tag and press Enter or comma (e.g., jobs, career, interview)" : ""}
              className="w-full outline-none text-gray-700"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Press Enter or comma (,) to add a tag</p>
        </div>

        {/* Featured Image */}
        <div>
          <label className="block font-medium mb-2">Featured Image</label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {imagePreview ? (
              <div>
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto mb-3 rounded" />
                <button 
                  type="button" 
                  onClick={() => { setImageFile(null); setImagePreview(""); }} 
                  className="text-red-600 text-sm hover:underline"
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (Max 2MB)</p>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {loading || uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {uploading ? "Uploading Image..." : "Publishing..."}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Publish Blog
              </>
            )}
          </button>
          <Link href="/admin/blogs" className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}