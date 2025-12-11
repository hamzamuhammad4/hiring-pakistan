// src/components/Navbar.js
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
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

          {/* Right Buttons */}
          <div className="flex items-center gap-6">
            <Link 
              href="/jobs" 
              className="text-gray-700 hover:text-cyan-600 font-medium text-lg hidden md:block"
            >
              Browse Jobs
            </Link>
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
          </div>
        </div>
      </div>
    </nav>
  );
}