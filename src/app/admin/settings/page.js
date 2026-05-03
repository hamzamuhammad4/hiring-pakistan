// src/app/admin/settings/page.js
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { updatePassword, sendEmailVerification } from "firebase/auth";
import toast from 'react-hot-toast';
import { Settings, Mail, Lock, Bell, Shield, Save } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setLoading(true);
    try {
      await updatePassword(auth.currentUser, passwords.new);
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success("Verification email sent!");
    } catch (error) {
      toast.error("Failed to send verification email");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your admin account settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg mb-8">
        <div className="flex border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-4 font-medium flex items-center gap-2 ${
              activeTab === "profile" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-gray-500"
            }`}
          >
            <Shield className="h-4 w-4" /> Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-6 py-4 font-medium flex items-center gap-2 ${
              activeTab === "security" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-gray-500"
            }`}
          >
            <Lock className="h-4 w-4" /> Security
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-4 font-medium flex items-center gap-2 ${
              activeTab === "notifications" ? "text-cyan-600 border-b-2 border-cyan-600" : "text-gray-500"
            }`}
          >
            <Bell className="h-4 w-4" /> Notifications
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-cyan-100 p-4 rounded-full">
              <Mail className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin Account</h2>
              <p className="text-gray-500">firebasehiringpakistan@gmail.com</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <button
              onClick={handleVerifyEmail}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Mail className="h-4 w-4" /> Verify Email
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">Change Password</h2>
          
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
            <div>
              <label className="block font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                className="w-full border rounded-lg px-4 py-3"
                required
                minLength="6"
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                className="w-full border rounded-lg px-4 py-3"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4" /> {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold mb-6">Notification Settings</h2>
          
          <div className="space-y-4 max-w-md">
            <label className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
              <span>New Company Registration</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
            <label className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
              <span>New Job Posting</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
            <label className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
              <span>New Complaint</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
            <label className="flex justify-between items-center p-4 bg-gray-50 rounded-lg cursor-pointer">
              <span>Payment Received</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
          </div>
          
          <button className="mt-6 bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2">
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      )}
    </div>
  );
}