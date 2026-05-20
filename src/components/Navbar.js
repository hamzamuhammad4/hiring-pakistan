// src/components/Navbar.js
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  Briefcase, LogOut, LayoutDashboard, 
  ChevronDown, Menu, X, User, Mail, AlertCircle
} from "lucide-react";
import toast from 'react-hot-toast';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
    setDropdownOpen(false);
    setIsOpen(false);
  };

  // Admin panel mein navbar hide
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Get user initial for avatar
  const getUserInitial = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  // Get display name (first part of email)
  const getDisplayName = () => {
    if (!user?.email) return "User";
    return user.email.split('@')[0];
  };

  // Check if email is verified
  const isEmailVerified = user?.emailVerified === true;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo - Only Image, No Text */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Hiring Pakistan" 
              width={160} 
              height={160} 
              priority
              className="rounded-lg object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/jobs" 
              className="text-gray-700 hover:text-cyan-600 font-medium text-lg transition"
            >
              Browse Jobs
            </Link>

            {/* User Section */}
            {!loading && (
              <>
                {user ? (
                  /* User Dropdown */
                  <div ref={dropdownRef} className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition ${
                        !isEmailVerified 
                          ? 'bg-yellow-100 hover:bg-yellow-200' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {getUserInitial()}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {getDisplayName()}
                      </span>
                      {!isEmailVerified && (
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                      )}
                      <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 overflow-hidden">
                        {/* User Info Header */}
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                          
                          {/* Email Verification Warning */}
                          {!isEmailVerified && (
                            <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                              <p className="text-xs text-yellow-800 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                Email not verified
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Please check your inbox and verify your email.
                              </p>
                              <button 
                                onClick={async () => {
                                  await auth.currentUser?.sendEmailVerification();
                                  toast.success('Verification email sent!');
                                }}
                                className="text-xs text-cyan-600 hover:underline mt-1"
                              >
                                Resend verification email
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Only show Dashboard if email is verified */}
                        {isEmailVerified && (
                          <>
                            <Link
                              href="/company/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-cyan-50 hover:text-cyan-600 transition"
                            >
                              <LayoutDashboard className="h-5 w-5" />
                              <span className="font-medium">Dashboard</span>
                            </Link>
                            <div className="border-t border-gray-100 my-1"></div>
                          </>
                        )}
                        
                        {/* Show verification message instead of dashboard */}
                        {!isEmailVerified && (
                          <div className="px-4 py-3 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">
                              <Mail className="h-4 w-4 mx-auto mb-1" />
                              Verify your email to access dashboard
                            </p>
                          </div>
                        )}
                        
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Login/Signup Buttons */
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="text-gray-700 hover:text-cyan-600 font-medium transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-5 py-2 rounded-lg transition"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
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

              {!loading && (
                <>
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-2 py-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {getUserInitial()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{getDisplayName()}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          {!isEmailVerified && (
                            <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> Email not verified
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Only show Dashboard if email is verified */}
                      {isEmailVerified && (
                        <Link
                          href="/company/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-2 py-3 text-gray-700 hover:bg-cyan-50 rounded-lg"
                        >
                          <LayoutDashboard className="h-5 w-5" />
                          Dashboard
                        </Link>
                      )}
                      
                      {!isEmailVerified && (
                        <div className="px-2 py-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Please verify your email to access dashboard
                          </p>
                          <button 
                            onClick={async () => {
                              await auth.currentUser?.sendEmailVerification();
                              toast.success('Verification email sent!');
                            }}
                            className="text-sm text-cyan-600 hover:underline mt-2"
                          >
                            Resend verification email
                          </button>
                        </div>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-2 py-3 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="bg-cyan-600 text-white text-center px-4 py-3 rounded-xl"
                      >
                        Login
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsOpen(false)}
                        className="bg-gray-900 text-white text-center px-4 py-3 rounded-xl"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}