// src/app/admin/dashboard/page.js
"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, getDocs, query, where, 
  doc, getDoc, orderBy, limit 
} from "firebase/firestore";
import Link from "next/link";
import toast from 'react-hot-toast';

// Lucide Icons
import {
  Building2,
  Briefcase,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminEmail, setAdminEmail] = useState(null);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalJobs: 0,
    totalApplicants: 0,
    totalEarnings: 0,
    pendingJobs: 0,
    pendingCVs: 0,
    pendingComplaints: 0,
    activeCompanies: 0,
    totalViews: 0,
    totalApplications: 0
  });
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan', jobs: 0 },
    { month: 'Feb', jobs: 0 },
    { month: 'Mar', jobs: 0 },
    { month: 'Apr', jobs: 0 },
    { month: 'May', jobs: 0 },
    { month: 'Jun', jobs: 0 }
  ]);

  // Get current admin email
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminEmail(user.email);
    }
  }, []);

  useEffect(() => {
    if (adminEmail !== null) {
      fetchDashboardData();
    }
  }, [adminEmail]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Helper function to safely get collection data
      const getCollectionData = async (collectionName) => {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
          console.log(`Collection '${collectionName}' not found or empty:`, err.message);
          return [];
        }
      };

      // Get all data safely
      let companies = await getCollectionData("companies");
      const jobs = await getCollectionData("jobs");
      const applications = await getCollectionData("applications");
      const complaints = await getCollectionData("complaints");

      // ✅ FILTER OUT ADMIN COMPANY - don't count admin's own company
      if (adminEmail) {
        companies = companies.filter(company => company.email !== adminEmail);
      }

      // Calculate stats
      const pendingJobsCount = jobs.filter(j => j.status === 'pending').length;
      const pendingCVsCount = applications.filter(a => a.cvStatus === 'pending' || !a.cvStatus).length;
      const pendingComplaintsCount = complaints.filter(c => c.status === 'pending').length;
      const totalViewsCount = jobs.reduce((sum, job) => sum + (job.views || 0), 0);

      setStats({
        totalCompanies: companies.length,
        activeCompanies: companies.filter(c => c.status !== 'blocked').length,
        totalJobs: jobs.length,
        pendingJobs: pendingJobsCount,
        totalApplicants: applications.length,
        totalApplications: applications.length,
        totalViews: totalViewsCount,
        pendingCVs: pendingCVsCount,
        pendingComplaints: pendingComplaintsCount,
        totalEarnings: 2500 // Example - will be from payments collection
      });

      // Recent companies (last 5) - filtered out admin company
      const sortedCompanies = [...companies].sort((a, b) => 
        (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
      ).slice(0, 5);
      setRecentCompanies(sortedCompanies);

      // Recent jobs (last 5)
      const sortedJobs = [...jobs].sort((a, b) => 
        (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
      ).slice(0, 5);
      setRecentJobs(sortedJobs);

      // Monthly data (last 6 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const monthlyStats = months.map((month, index) => {
        const monthJobs = jobs.filter(job => {
          const jobDate = job.createdAt?.toDate?.();
          return jobDate && jobDate.getMonth() === index;
        }).length;
        return { month, jobs: monthJobs };
      });
      setMonthlyData(monthlyStats);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Companies" 
          value={stats.totalCompanies}
          icon={Building2}
          color="bg-blue-500 text-white"
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Total Jobs" 
          value={stats.totalJobs}
          icon={Briefcase}
          color="bg-green-500 text-white"
          bgColor="bg-green-50"
        />
        <StatCard 
          title="Total Applicants" 
          value={stats.totalApplicants}
          icon={Users}
          color="bg-purple-500 text-white"
          bgColor="bg-purple-50"
        />
        <StatCard 
          title="Total Earnings" 
          value={`PKR ${stats.totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="bg-amber-500 text-white"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Pending Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/jobs" className="bg-yellow-50 rounded-2xl p-6 hover:shadow-lg transition block">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-500 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-700">{stats.pendingJobs}</p>
              <p className="text-yellow-600">Pending Jobs</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/cvs" className="bg-indigo-50 rounded-2xl p-6 hover:shadow-lg transition block">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 p-3 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-700">{stats.pendingCVs}</p>
              <p className="text-indigo-600">Pending CVs</p>
            </div>
          </div>
        </Link>

        <Link href="/admin/complaints" className="bg-red-50 rounded-2xl p-6 hover:shadow-lg transition block">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.pendingComplaints}</p>
              <p className="text-red-600">Pending Complaints</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-600" />
          Monthly Job Posts
        </h2>
        <div className="flex items-end justify-between h-64 gap-4">
          {monthlyData.map((item) => (
            <div key={item.month} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t-lg transition-all duration-300"
                style={{ height: `${Math.max(20, item.jobs * 15)}px` }}
              ></div>
              <span className="text-sm font-medium text-gray-600 mt-2">{item.month}</span>
              <span className="text-xs text-gray-400">{item.jobs} jobs</span>
            </div>
          ))}
        </div>
        {monthlyData.every(m => m.jobs === 0) && (
          <p className="text-center text-gray-400 mt-4">No jobs posted yet</p>
        )}
      </div>

      {/* Recent Companies & Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Companies */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-600" />
              Recent Companies
            </h2>
            <Link href="/admin/companies" className="text-cyan-600 text-sm hover:underline">
              View All →
            </Link>
          </div>
          
          {recentCompanies.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No companies registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCompanies.map((company) => (
                <div key={company.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{company.companyName || 'N/A'}</p>
                    <p className="text-sm text-gray-500">{company.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    company.status === 'blocked' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {company.status === 'blocked' ? 'Blocked' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-cyan-600" />
              Recent Jobs
            </h2>
            <Link href="/admin/jobs" className="text-cyan-600 text-sm hover:underline">
              View All →
            </Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No jobs posted yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{job.title}</p>
                    <p className="text-sm text-gray-500">{job.companyName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    job.status === 'active' || job.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : job.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {job.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State Message */}
      {stats.totalCompanies === 0 && stats.totalJobs === 0 && (
        <div className="mt-8 bg-blue-50 rounded-2xl p-8 text-center">
          <p className="text-blue-800">
            📊 No data yet. Once companies register and post jobs, you'll see them here.
          </p>
        </div>
      )}
    </div>
  );
}