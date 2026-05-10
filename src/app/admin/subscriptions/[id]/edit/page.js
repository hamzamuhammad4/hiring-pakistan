// src/app/admin/subscriptions/[id]/edit/page.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function EditSubscription() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    credits: 0,
    features: [""],
    popular: false,
    status: "active"
  });

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      const planDoc = await getDoc(doc(db, "subscriptions", id));
      if (planDoc.exists()) {
        const data = planDoc.data();
        setFormData({
          name: data.name || "",
          price: data.price || 0,
          credits: data.credits || 0,
          features: data.features || [""],
          popular: data.popular || false,
          status: data.status || "active"
        });
      } else {
        toast.error("Plan not found");
        router.push("/admin/subscriptions");
      }
    } catch (error) {
      console.error("Error fetching plan:", error);
      toast.error("Failed to load plan");
    } finally {
      setLoading(false);
    }
  };

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
    
    if (!formData.name || formData.price <= 0 || formData.credits <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    const filteredFeatures = formData.features.filter(f => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      toast.error("Please add at least one feature");
      return;
    }

    setSaving(true);
    
    try {
      await updateDoc(doc(db, "subscriptions", id), {
        ...formData,
        features: filteredFeatures,
        updatedAt: new Date()
      });
      
      toast.success("Plan updated successfully!");
      router.push("/admin/subscriptions");
    } catch (error) {
      console.error("Error updating plan:", error);
      toast.error("Failed to update plan");
    } finally {
      setSaving(false);
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
        <Link href="/admin/subscriptions" className="text-cyan-600 hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Subscriptions
        </Link>
        <h1 className="text-3xl font-bold text-gray-800">Edit Subscription Plan</h1>
        <p className="text-gray-500 mt-1">Update {formData.name} plan details</p>
      </div>

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
                className="w-full border rounded-lg px-4 py-3"
                required
                min="0"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Credits *</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3"
                required
                min="0"
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
                    className="flex-1 border rounded-lg px-4 py-2"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="bg-red-100 text-red-600 px-3 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="text-cyan-600 text-sm flex items-center gap-1 mt-2"
              >
                <Plus className="h-4 w-4" /> Add Feature
              </button>
            </div>
          </div>

          {/* Popular and Status */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="popular"
                checked={formData.popular}
                onChange={handleChange}
                className="w-5 h-5"
              />
              <span>Mark as "Most Popular"</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="status"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked ? 'active' : 'inactive' }))}
                className="w-5 h-5"
              />
              <span>Active (visible to companies)</span>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-lg font-semibold disabled:bg-gray-400"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin/subscriptions"
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}