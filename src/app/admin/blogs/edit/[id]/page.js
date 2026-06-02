// src/app/admin/blogs/edit/[id]/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Save, X, Trash2 } from "lucide-react";

export default function EditBlog() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const [existingImage, setExistingImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const blogRef = doc(db, "blogs", id);
        const blogSnap = await getDoc(blogRef);
        
        if (blogSnap.exists()) {
          const blogData = blogSnap.data();
          setFormData({
            title: blogData.title || "",
            excerpt: blogData.excerpt || "",
            content: blogData.content || "",
            author: blogData.author || "Admin",
            category: blogData.category || "Jobs"
          });
          setTags(blogData.tags || []);
          setExistingImage(blogData.image || "");
          setImagePreview(blogData.image || "");
        } else {
          toast.error("Blog not found");
          router.push("/admin/blogs");
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        toast.error("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, router]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image too large. Max 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
    setRemoveImage(true);
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    let newTag = tagInput.trim();
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

    setSaving(true);
    setUploading(true);
    
    try {
      let imageUrl = existingImage;
      
      // Upload new image if selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const uploadRes = await fetch('/api/upload-blog-image', {
          method: 'POST',
          body: imageFormData,
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadData.success) {
          throw new Error(uploadData.error);
        }
        
        imageUrl = uploadData.url;
      }
      
      // If remove image is checked
      if (removeImage) {
        imageUrl = "";
      }

      const blogData = {
        title: formData.title,
        excerpt: formData.excerpt || formData.content.substring(0, 150),
        content: formData.content,
        author: formData.author,
        category: formData.category,
        tags: tags,
        image: imageUrl,
        updatedAt: serverTimestamp(),
      };

      const blogRef = doc(db, "blogs", id);
      await updateDoc(blogRef, blogData);

      toast.success("Blog updated successfully!");
      router.push("/admin/blogs");
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error(error.message || "Failed to update blog");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/blogs" className="text-cyan-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Blogs
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Blog Post</h1>
        <p className="text-gray-500 mt-1">Update your blog content and settings</p>
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
          <p className="text-xs text-gray-400 mt-1">Leave empty to auto-generate from content</p>
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
          <label className="block font-medium mb-2">Tags</label>
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
                <div className="flex gap-3 justify-center">
                  <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition inline-flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Change Image
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <button 
                    type="button" 
                    onClick={handleRemoveImage} 
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition inline-flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" /> Remove Image
                  </button>
                </div>
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
            disabled={saving || uploading}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {saving || uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                {uploading ? "Uploading Image..." : "Saving Changes..."}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Save Changes
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