// src/app/company/settings/page.js
// Complete Company Settings Page

"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, updateEmail, sendEmailVerification, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Building2, Phone, Globe, MapPin, Linkedin, Facebook, Twitter } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Company Data
  const [companyData, setCompanyData] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    industry: '',
    size: '1-10',
    description: '',
    logo: null,
    socialMedia: {
      linkedin: '',
      facebook: '',
      twitter: ''
    }
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNewApplication: true,
    emailStatusChange: true,
    emailMarketing: false,
    smsNewApplication: false,
    whatsappUpdates: false
  });

  // Password Change
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  
  const [passwordErrors, setPasswordErrors] = useState({});

  // Industries List
  const industries = [
    'Technology', 'Healthcare', 'Education', 'Finance', 'Manufacturing',
    'Retail', 'Construction', 'Transportation', 'Hospitality', 'Media',
    'Real Estate', 'Agriculture', 'Energy', 'Other'
  ];

  // Company Size Options
  const sizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  ];

  useEffect(() => {
    // Check authentication
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/company/login");
        return;
      }

      try {
        // Get company data
        const companyRef = doc(db, "companies", user.uid);
        const companySnap = await getDoc(companyRef);
        
        if (companySnap.exists()) {
          const data = companySnap.data();
          setCompanyData({
            companyName: data.companyName || '',
            email: data.email || user.email || '',
            phone: data.phone || '',
            website: data.website || '',
            address: data.address || '',
            city: data.city || '',
            industry: data.industry || '',
            size: data.size || '1-10',
            description: data.description || '',
            logo: data.logo || null,
            socialMedia: data.socialMedia || {
              linkedin: '',
              facebook: '',
              twitter: ''
            }
          });
          
          setNotifications(data.notifications || {
            emailNewApplication: true,
            emailStatusChange: true,
            emailMarketing: false,
            smsNewApplication: false,
            whatsappUpdates: false
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const user = auth.currentUser;
      const companyRef = doc(db, "companies", user.uid);
      
      await updateDoc(companyRef, {
        companyName: companyData.companyName,
        phone: companyData.phone,
        website: companyData.website,
        address: companyData.address,
        city: companyData.city,
        industry: companyData.industry,
        size: companyData.size,
        description: companyData.description,
        socialMedia: companyData.socialMedia,
        updatedAt: new Date()
      });

      // Update email in Firebase Auth if changed
      if (companyData.email !== user.email) {
        try {
          await updateEmail(user, companyData.email);
          await sendEmailVerification(user);
          toast.success("Verification email sent to new address");
        } catch (emailError) {
          console.error("Email update error:", emailError);
          if (emailError.code === 'auth/requires-recent-login') {
            toast.error("Please log out and log in again to change email");
          } else {
            toast.error("Failed to update email: " + emailError.message);
          }
        }
      }

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle password change with reauthentication
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordErrors({});
    
    // Validate passwords
    const errors = {};
    if (!passwords.current) {
      errors.current = "Current password is required";
    }
    if (!passwords.new) {
      errors.new = "New password is required";
    } else if (passwords.new.length < 6) {
      errors.new = "Password must be at least 6 characters";
    }
    if (!passwords.confirm) {
      errors.confirm = "Please confirm your new password";
    } else if (passwords.new !== passwords.confirm) {
      errors.confirm = "New passwords don't match";
    }
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setSaving(true);

    try {
      const user = auth.currentUser;
      
      // Reauthenticate user before changing password
      const credential = EmailAuthProvider.credential(
        user.email,
        passwords.current
      );
      
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, passwords.new);
      
      setPasswords({ current: '', new: '', confirm: '' });
      setPasswordErrors({});
      toast.success("Password updated successfully!");
      
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/wrong-password':
          setPasswordErrors({ current: "Current password is incorrect" });
          toast.error("Current password is incorrect");
          break;
        case 'auth/too-many-requests':
          toast.error("Too many failed attempts. Please try again later");
          break;
        case 'auth/requires-recent-login':
          toast.error("Please log out and log in again to change password");
          break;
        default:
          toast.error(error.message || "Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  };

  // Handle notifications update
  const handleNotificationsUpdate = async () => {
    setSaving(true);

    try {
      const user = auth.currentUser;
      const companyRef = doc(db, "companies", user.uid);
      
      await updateDoc(companyRef, {
        notifications: notifications
      });

      toast.success("Notification settings updated!");
    } catch (error) {
      console.error("Error updating notifications:", error);
      toast.error("Failed to update notifications");
    } finally {
      setSaving(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle social media change
  const handleSocialChange = (platform, value) => {
    setCompanyData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <Link href="/company/dashboard" className="text-cyan-600 hover:underline mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">⚙️ Company Settings</h1>
          <p className="text-gray-600">Manage your profile, preferences, and account settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-8 py-4 font-medium whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'text-cyan-600 border-b-2 border-cyan-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🏢 Company Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-8 py-4 font-medium whitespace-nowrap ${
                activeTab === 'notifications' 
                  ? 'text-cyan-600 border-b-2 border-cyan-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔔 Notifications
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-8 py-4 font-medium whitespace-nowrap ${
                activeTab === 'security' 
                  ? 'text-cyan-600 border-b-2 border-cyan-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔐 Security
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`px-8 py-4 font-medium whitespace-nowrap ${
                activeTab === 'billing' 
                  ? 'text-cyan-600 border-b-2 border-cyan-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💳 Billing
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Company Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium mb-2">Company Name *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={companyData.email}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-cyan-500"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={companyData.phone}
                      onChange={handleInputChange}
                      placeholder="+92 XXX XXXXXXX"
                      className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={companyData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-sm font-medium mb-2">Industry</label>
                  <select
                    name="industry"
                    value={companyData.industry}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select Industry</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                {/* Company Size */}
                <div>
                  <label className="block text-sm font-medium mb-2">Company Size</label>
                  <select
                    name="size"
                    value={companyData.size}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500"
                  >
                    {sizes.map(size => (
                      <option key={size} value={size}>{size} employees</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={companyData.city}
                      onChange={handleInputChange}
                      placeholder="Karachi, Lahore, Islamabad..."
                      className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={companyData.address}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Company Description</label>
                  <textarea
                    name="description"
                    value={companyData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500"
                    placeholder="Tell candidates about your company..."
                  />
                </div>

                {/* Social Media */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4">Social Media Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">LinkedIn</label>
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
                        <input
                          type="url"
                          value={companyData.socialMedia.linkedin}
                          onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/company/..."
                          className="w-full border rounded-lg pl-10 pr-4 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Facebook</label>
                      <div className="relative">
                        <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-600" />
                        <input
                          type="url"
                          value={companyData.socialMedia.facebook}
                          onChange={(e) => handleSocialChange('facebook', e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full border rounded-lg pl-10 pr-4 py-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Twitter</label>
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                        <input
                          type="url"
                          value={companyData.socialMedia.twitter}
                          onChange={(e) => handleSocialChange('twitter', e.target.value)}
                          placeholder="https://twitter.com/..."
                          className="w-full border rounded-lg pl-10 pr-4 py-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-3 rounded-lg transition disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Email Notifications</h3>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">New Applications</p>
                    <p className="text-sm text-gray-500">Get email when someone applies to your job</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNewApplication}
                    onChange={(e) => setNotifications({...notifications, emailNewApplication: e.target.checked})}
                    className="w-5 h-5 text-cyan-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Application Status Changes</p>
                    <p className="text-sm text-gray-500">When applicant status is updated</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailStatusChange}
                    onChange={(e) => setNotifications({...notifications, emailStatusChange: e.target.checked})}
                    className="w-5 h-5 text-cyan-600"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Marketing & Promotions</p>
                    <p className="text-sm text-gray-500">Receive offers and updates</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailMarketing}
                    onChange={(e) => setNotifications({...notifications, emailMarketing: e.target.checked})}
                    className="w-5 h-5 text-cyan-600"
                  />
                </label>

                <h3 className="text-lg font-semibold mt-6">SMS Notifications</h3>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">New Application SMS</p>
                    <p className="text-sm text-gray-500">Get SMS when someone applies</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.smsNewApplication}
                    onChange={(e) => setNotifications({...notifications, smsNewApplication: e.target.checked})}
                    className="w-5 h-5 text-cyan-600"
                  />
                </label>

                <h3 className="text-lg font-semibold mt-6">WhatsApp Updates</h3>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">WhatsApp Notifications</p>
                    <p className="text-sm text-gray-500">Receive updates on WhatsApp</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.whatsappUpdates}
                    onChange={(e) => setNotifications({...notifications, whatsappUpdates: e.target.checked})}
                    className="w-5 h-5 text-cyan-600"
                  />
                </label>
              </div>

              <button
                onClick={handleNotificationsUpdate}
                disabled={saving}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-3 rounded-lg transition disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Notification Settings'}
              </button>
            </div>
          )}

          {/* Security Tab - Fixed with eye icons and reauthentication */}
          {activeTab === 'security' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Change Password</h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className={`w-full border rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-cyan-500 ${
                          passwordErrors.current ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                    {passwordErrors.current && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.current}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwords.new}
                        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                        className={`w-full border rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-cyan-500 ${
                          passwordErrors.new ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                    {passwordErrors.new && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.new}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters</p>
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                        className={`w-full border rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-cyan-500 ${
                          passwordErrors.confirm ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                    {passwordErrors.confirm && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirm}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-3 rounded-lg transition disabled:bg-gray-400"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                
                <div className="bg-red-50 p-4 rounded-lg max-w-md">
                  <p className="text-sm text-red-800 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm("Are you sure? This action cannot be undone!")) {
                        toast.error("Account deletion is disabled in demo mode");
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-6">Billing Information</h2>
              
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Current Plan: {companyData.plan || 'Basic'}</h3>
                <p className="text-gray-600 mb-4">Credits: {companyData.credits || 0}</p>
                <Link
                  href="/company/funds"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg inline-block"
                >
                  Buy More Credits
                </Link>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
                <p className="text-gray-500">No payment methods saved yet.</p>
                <button className="mt-4 bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-lg">
                  + Add Payment Method
                </button>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                <p className="text-gray-500">No transactions yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}