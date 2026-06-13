"use client";

import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, getDocs, doc, updateDoc, deleteDoc,
  query, where, orderBy
} from "firebase/firestore";
import toast from 'react-hot-toast';
import { 
  Building2, Search, Ban, CheckCircle, 
  Trash2, Mail, Phone, AlertTriangle, RefreshCw, Calendar,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 });
  const [adminEmail, setAdminEmail] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Get current admin email
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminEmail(user.email);
    }
  }, []);

  // Format date and time function
  const formatDateTime = (date) => {
    if (!date) return "N/A";
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let companiesList = [];
      try {
        const companiesSnap = await getDocs(query(collection(db, "companies"), orderBy("createdAt", "desc")));
        companiesList = companiesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        if (adminEmail) {
          companiesList = companiesList.filter(company => company.email !== adminEmail);
        }
      } catch (err) {
        companiesList = [];
      }
      
      setCompanies(companiesList);
      
      setStats({
        total: companiesList.length,
        active: companiesList.filter(c => c.status !== 'blocked').length,
        blocked: companiesList.filter(c => c.status === 'blocked').length
      });
      
      // Reset to first page when data changes
      setCurrentPage(1);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when adminEmail is set
  useEffect(() => {
    if (adminEmail !== null) {
      fetchCompanies();
    }
  }, [adminEmail]);

  const handleStatusToggle = async (companyId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    
    try {
      await updateDoc(doc(db, "companies", companyId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setCompanies(companies.map(c => 
        c.id === companyId ? { ...c, status: newStatus } : c
      ));
      
      setStats(prev => ({
        total: prev.total,
        active: newStatus === 'active' ? prev.active + 1 : prev.active - 1,
        blocked: newStatus === 'blocked' ? prev.blocked + 1 : prev.blocked - 1
      }));
      
      toast.success(`Company ${newStatus === 'active' ? 'activated' : 'blocked'}`);
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDelete = async (companyId) => {
    if (!confirm("Delete this company? All their jobs and applications will also be deleted.")) return;
    
    try {
      const jobsQuery = query(collection(db, "jobs"), where("companyId", "==", companyId));
      const jobsSnap = await getDocs(jobsQuery);
      
      for (const jobDoc of jobsSnap.docs) {
        await deleteDoc(doc(db, "jobs", jobDoc.id));
      }
      
      await deleteDoc(doc(db, "companies", companyId));
      
      setCompanies(companies.filter(c => c.id !== companyId));
      
      const deletedCompany = companies.find(c => c.id === companyId);
      setStats(prev => ({
        total: prev.total - 1,
        active: deletedCompany?.status !== 'blocked' ? prev.active - 1 : prev.active,
        blocked: deletedCompany?.status === 'blocked' ? prev.blocked - 1 : prev.blocked
      }));
      
      toast.success("Company deleted successfully");
    } catch (err) {
      toast.error(`Failed to delete: ${err.message}`);
    }
  };

  // Filter companies by search
  const filteredCompanies = companies.filter(company =>
    company.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

  // Go to page
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Companies</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button 
          onClick={fetchCompanies}
          className="bg-cyan-600 text-white px-6 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Companies Management</h1>
        <p className="text-gray-500 mt-1">Manage all registered companies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-blue-600">Total Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
              <p className="text-green-600">Active Companies</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-3 rounded-xl">
              <Ban className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-700">{stats.blocked}</p>
              <p className="text-red-600">Blocked Companies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No companies registered yet</p>
            <p className="text-sm text-gray-400 mt-2">Companies will appear here when they sign up</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Plan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Credits</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCompanies.map((company) => (
                    <tr key={company.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{company.companyName || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: {company.id?.slice(-8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {company.email}
                        </div>
                        {company.phone && (
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <Phone className="h-4 w-4 text-gray-400" />
                            {company.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {company.plan || 'Basic'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{company.credits || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          {formatDateTime(company.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          company.status === 'blocked' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {company.status === 'blocked' ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStatusToggle(company.id, company.status)}
                            className={`p-2 rounded-lg transition ${
                              company.status === 'blocked'
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                            title={company.status === 'blocked' ? 'Activate' : 'Block'}
                          >
                            {company.status === 'blocked' ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} companies
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 transition ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition ${
                            currentPage === pageNum
                              ? 'bg-cyan-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-lg flex items-center gap-1 transition ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}