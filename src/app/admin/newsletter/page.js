// src/app/admin/newsletter/page.js - COMPLETE WORKING VERSION
"use client";

import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import { 
  Mail, Trash2, Download, RefreshCw, 
  AlertTriangle, Users, Search, Calendar,
  ChevronLeft, ChevronRight
} from "lucide-react";

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${day}/${month}/${year}, ${hours}:${minutes} ${ampm}`;
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/newsletter');
      const data = await res.json();
      
      if (res.ok) {
        setSubscribers(data.subscribers || []);
        setStats({
          total: data.count || 0,
          active: (data.subscribers || []).filter(s => s.status !== 'unsubscribed').length
        });
      } else {
        throw new Error(data.error || 'Failed to fetch');
      }
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove this subscriber?")) return;
    try {
      const res = await fetch(`/api/newsletter?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Subscriber removed");
        fetchSubscribers();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast.error("Failed to remove");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Email", "Subscribed Date", "Status"];
    const csvData = subscribers.map(s => [
      s.email,
      formatDateTime(s.subscribedAt),
      s.status || "active"
    ]);
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported!");
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => { setCurrentPage(page); window.scrollTo({ top: 0 }); };
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-500">{error}</p>
        <button onClick={fetchSubscribers} className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Newsletter Subscribers</h1>
          <p className="text-gray-500 mt-1">Manage your email newsletter list</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={fetchSubscribers} className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl"><Users className="h-6 w-6" /></div>
            <div><p className="text-3xl font-bold">{stats.total}</p><p className="text-cyan-100">Total Subscribers</p></div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl"><Mail className="h-6 w-6" /></div>
            <div><p className="text-3xl font-bold">{stats.active}</p><p className="text-green-100">Active Subscribers</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input type="text" placeholder="Search by email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No subscribers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Subscribed Date</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Source</th><th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th></tr>
                </thead>
                <tbody>
                  {paginatedSubscribers.map((sub) => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{sub.email}</span></div></td>
                      <td className="px-6 py-4"><span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-md text-sm"><Calendar className="h-3.5 w-3.5" />{formatDateTime(sub.subscribedAt)}</span></td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{sub.status === 'active' ? 'Active' : 'Unsubscribed'}</span></td>
                      <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded-md text-xs">{sub.source || 'Footer'}</span></td>
                      <td className="px-6 py-4"><button onClick={() => handleDelete(sub.id)} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
                <div className="text-sm text-gray-500">Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length}</div>
                <div className="flex gap-2">
                  <button onClick={prevPage} disabled={currentPage === 1} className="px-3 py-2 rounded-lg bg-white border disabled:opacity-50"><ChevronLeft className="h-4 w-4" /> Previous</button>
                  <button onClick={nextPage} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg bg-white border disabled:opacity-50">Next <ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}