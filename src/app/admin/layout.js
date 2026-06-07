// src/app/admin/layout.js
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, Building2, Briefcase, FileText, 
  CreditCard, AlertTriangle, Newspaper, Settings, 
  LogOut, CheckCircle, Menu, X, Layers, Mail
} from "lucide-react";

const adminEmails = [
  "firebasehiringpakistan@gmail.com",
  "hamzaayyub125@gmail.com",
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Hide footer when admin layout is mounted
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    return () => {
      const footer = document.querySelector('footer');
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, []);

  useEffect(() => {
    // Login page ke liye layout skip karo
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log("No user, redirecting to login");
        router.push("/admin/login");
        return;
      }
      
      console.log("User email:", user.email);
      console.log("Admin emails:", adminEmails);
      
      if (!adminEmails.includes(user.email)) {
        console.log("Not admin, signing out");
        toast.error("Access denied. Admin only.");
        await auth.signOut();
        router.push("/admin/login");
        return;
      }
      
      console.log("Admin access granted");
      setIsAdmin(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/admin/login");
    toast.success("Logged out");
  };

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/companies", label: "Companies", icon: Building2 },
    { path: "/admin/subscriptions", label: "Subscriptions", icon: Layers },
    { path: "/admin/jobs", label: "Jobs Approval", icon: Briefcase },
    { path: "/admin/cvs", label: "CV Approval", icon: FileText },
    { path: "/admin/payments", label: "Payments", icon: CreditCard },
    { path: "/admin/complaints", label: "Complaints", icon: AlertTriangle },
    { path: "/admin/blogs", label: "Blogs", icon: Newspaper },
    { path: "/admin/newsletter", label: "Newsletter", icon: Mail }, // ✅ NEW
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  // Login page ke liye - sirf children render karo (no sidebar)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-cyan-600 text-white p-2 rounded-lg"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-xl font-bold flex items-center gap-2">
            Hiring Pakistan
          </h3>
          <p className="text-sm text-gray-400 mt-1">Admin Portal</p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
                {isActive && <CheckCircle className="h-4 w-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-900/30 transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}