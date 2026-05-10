// src/app/admin/subscriptions/add/page.js
"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, AlertCircle } from "lucide-react";

export default function AddSubscription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    credits: 0,
    features: [""],
    popular: false,
    status: "active",
    type: "plan"
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, ""]
    }));
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (!formData.name || formData.name.trim() === "") {
      toast.error("Please enter plan name");
      return;
    }
    
    if (formData.price < 0) {
      toast.error("Price cannot be negative");
      return;
    }
    
    if (formData.credits < 0) {
      toast.error("Credits cannot be negative");
      return;
    }

    const filteredFeatures = formData.features.filter(f => f && f.trim() !== "");
    if (filteredFeatures.length === 0) {
      toast.error("Please add at least one feature");
      return;
    }

    setLoading(true);
    
    try {
      console.log("Creating plan with data:", {
        ...formData,
        features: filteredFeatures,
        createdAt: new Date(),
      });
      
      // Simple add without serverTimestamp first to debug
      const docRef = await addDoc(collection(db, "subscriptions"), {
        name: formData.name.trim(),
        price: formData.price,
        credits: formData.credits,
        features: filteredFeatures,
        popular: formData.popular,
        status: formData.status,
        type: formData.type,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log("Plan created with ID:", docRef.id);
      toast.success("Subscription plan created successfully!");
      router.push("/admin/subscriptions");
      
    } catch (error) {
      console.error("Detailed error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      setError(error.message);
      toast.error(`Failed to create plan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link href="/admin/subscriptions" className="text-cyan-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Subscriptions
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Add New Subscription Plan</h1>
        <p className="text-gray-500 mt-1">Create a new pricing plan for companies</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">Error Creating Plan</p>
            <p className="text-sm text-red-600">{error}</p>
            <p className="text-xs text-red-500 mt-1">Make sure you are logged in and have proper permissions.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl">
        <div className="space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block font-semibold mb-2">Plan Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Basic, Standard, Premium"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          {/* Price and Credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Price (PKR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full border rounded-lg px-4 py-3"
                required
                min="0"
                step="100"
              />
              <p className="text-xs text-gray-400 mt-1">Set 0 for free plan</p>
            </div>
            <div>
              <label className="block font-semibold mb-2">Credits *</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                placeholder="0"
                className="w-full border rounded-lg px-4 py-3"
                required
                min="0"
                step="5"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block font-semibold mb-2">Features *</label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="bg-red-100 text-red-600 px-3 rounded-lg hover:bg-red-200 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-cyan-600 text-sm flex items-center gap-1 mt-2 hover:text-cyan-800 transition"
              >
                <Plus className="h-4 w-4" /> Add Feature
              </button>
            </div>
          </div>

          {/* Popular and Status */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="popular"
                checked={formData.popular}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Mark as "Most Popular"</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="status"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span>Active (visible to companies)</span>
            </label>
          </div>

          {/* Type selector */}
          <div>
            <label className="block font-semibold mb-2">Plan Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="plan"
                  checked={formData.type === 'plan'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>Subscription Plan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value="pack"
                  checked={formData.type === 'pack'}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span>Credit Pack (Add-on)</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                "Create Plan"
              )}
            </button>
            <Link
              href="/admin/subscriptions"
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}