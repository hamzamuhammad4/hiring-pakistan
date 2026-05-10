// src/components/Navbar.js
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Menu, X, LayoutDashboard, LogOut, User } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    setIsOpen(false);
  };

  // Admin panel mein navbar mat dikhao
  const isAdminPage = pathname?.startsWith("/admin");
  if (isAdminPage) {
    return null;
  }

  // Company dashboard ya other pages mein show karo with condition
  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-4">
            <Image 
              src="/logo.png" 
              alt="Hiring Pakistan" 
              width={150} 
              height={150} 
              priority 
              className="rounded-lg"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="/jobs" 
              className="text-gray-700 hover:text-cyan-600 font-medium text-lg"
            >
              Browse Jobs
            </Link>

            {/* Agar user LOGGED IN nahi hai to Login/Signup dikhao */}
            {!user && !loading && (
              <>
                <Link 
                  href="/login" 
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-md"
                >
                  Login
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-8 py-3 rounded-xl transition shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Agar user LOGGED IN hai to Dashboard aur Logout dikhao */}
            {user && (
              <div className="flex items-center gap-4">
                <Link 
                  href="/company/dashboard" 
                  className="text-gray-700 hover:text-cyan-600 font-medium text-lg flex items-center gap-1"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 font-medium text-lg flex items-center gap-1"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
                <span className="text-sm text-gray-500 flex items-center gap-1 ml-2">
                  <User className="h-4 w-4" />
                  {user.email?.split('@')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 focus:outline-none"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              <Link
                href="/jobs"
                onClick={() => setIsOpen(false)}
                className="text-gray-600 hover:text-cyan-600 px-2 py-2 text-lg"
              >
                Browse Jobs
              </Link>

              {/* Mobile mein bhi condition */}
              {!user && !loading && (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="bg-cyan-600 text-white text-center px-4 py-3 rounded-xl hover:bg-cyan-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-900 text-white text-center px-4 py-3 rounded-xl hover:bg-gray-800"
                  >
                    Sign Up
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    href="/company/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-600 hover:text-cyan-600 px-2 py-2 text-lg flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 px-2 py-2 text-lg text-left flex items-center gap-2"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                  <span className="text-sm text-gray-500 px-2 py-1">
                    {user.email}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}