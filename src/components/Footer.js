// src/components/Footer.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, Twitter, Linkedin, Instagram, Mail, 
  Phone, MapPin, Clock, Send, ChevronRight 
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1 - Logo & About */}
          <div>
            <div className="mb-4">
              <Image 
                src="/logo.png" 
                alt="Hiring Pakistan" 
                width={140} 
                height={140} 
                className="rounded-lg"
              />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pakistan's #1 Job Portal connecting talented professionals with 
              top employers across the country.
            </p>
            <div className="flex gap-4 mt-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-cyan-600 hover:text-white transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-cyan-600 hover:text-white transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-cyan-600 hover:text-white transition"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-cyan-600 hover:text-white transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Top Companies
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Blog & Tips
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - For Employers */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">For Employers</h3>
            <ul className="space-y-2">
              {/* <li>
                <Link href="/company/register" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Post a Job
                </Link>
              </li> */}
              <li>
                <Link href="/company/login" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Company Login
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/hire" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Hire Talent
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Employer Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-cyan-500 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Main Street,<br />
                  Karachi, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-cyan-500" />
                <a href="tel:+923482350367" className="text-gray-400 hover:text-cyan-500 transition">
                  +92 348 2350367
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-cyan-500" />
                <a href="mailto:info@hiringpakistan.com" className="text-gray-400 hover:text-cyan-500 transition">
                  info@hiringpakistan.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-cyan-500" />
                <span className="text-gray-400 text-sm">
                  Mon - Fri: 9:00 AM - 6:00 PM
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h3 className="text-white font-bold text-lg">Subscribe to Newsletter</h3>
              <p className="text-gray-400 text-sm">Get latest job updates and career tips</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 md:w-80 px-4 py-3 rounded-l-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
              />
              <button className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-r-lg transition flex items-center gap-2">
                <Send className="h-4 w-4" /> Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} Hiring Pakistan. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/terms" className="text-gray-400 hover:text-cyan-500 text-sm transition">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-cyan-500 text-sm transition">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-cyan-500 text-sm transition">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}