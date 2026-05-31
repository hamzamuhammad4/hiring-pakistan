// src/app/admin/settings/page.js
"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import toast from 'react-hot-toast';
import { Settings, Mail, Lock, Bell, Shield, Save, Eye, EyeOff } from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  
  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!passwords.current) {
      toast.error("Please enter current password");
      return;
    }
    
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
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwords.current);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwords.new);
      toast.success("Password updated successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        toast.error("Current password is incorrect");
      } else {
        toast.error(error.message);
      }
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
              <p className="text-gray-500">{auth.currentUser?.email}</p>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <button
              onClick={handleVerifyEmail}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition"
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
            {/* Current Password Field */}
            <div>
              <label className="block font-medium mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block font-medium mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:bg-gray-400 hover:bg-cyan-700 transition w-full justify-center"
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
          
          <button className="mt-6 bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-cyan-700 transition">
            <Save className="h-4 w-4" /> Save Settings
          </button>
        </div>
      )}
    </div>
  );
}