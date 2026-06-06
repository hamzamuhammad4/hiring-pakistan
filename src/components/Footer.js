// src/components/Footer.js - WITH AUTH CONDITION
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, Twitter, Linkedin, Instagram, Mail, 
  Phone, Send, ChevronRight, Youtube
} from "lucide-react";
import { useAuth } from "@/lib/useAuth"; // ✅ Import auth hook

export default function Footer() {
  const { user, role } = useAuth(); // ✅ Get auth state
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // ✅ Check if company is logged in
  const isCompanyLoggedIn = user && role === "company" && user.emailVerified === true;

  const handleNewsletterSubscribe = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setNewsletterStatus({ error: 'Please enter a valid email address' });
      setTimeout(() => setNewsletterStatus(null), 3000);
      return;
    }
    
    setNewsletterLoading(true);
    setNewsletterStatus(null);
    
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewsletterStatus({ success: data.message || 'Subscribed successfully!' });
        setNewsletterEmail('');
      } else {
        setNewsletterStatus({ error: data.error || 'Subscription failed' });
      }
    } catch (error) {
      setNewsletterStatus({ error: 'Network error. Please try again.' });
    } finally {
      setNewsletterLoading(false);
      setTimeout(() => setNewsletterStatus(null), 5000);
    }
  };

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
            <div className="flex flex-wrap gap-3 mt-4">
              <a href="https://www.youtube.com/@HiringPakistan" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://facebook.com/HiringPakistan" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/company/hiring-pakistan" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-700 transition">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com/hiringpakistan" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/HiringPakistan" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-gray-600 transition">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Browse Jobs</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Blog & Tips</Link></li>
              <li><a href="https://pk.indeed.com/cmp/Hiring-Pakistan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Indeed Profile</a></li>
              <li><Link href="/about" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> About Us</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Contact Us</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Privacy Policy</Link></li>
            </ul>
          </div>

          {/* ✅ Column 3 - For Employers (UPDATED with condition) */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">For Employers</h3>
            <ul className="space-y-2">
              {/* ✅ Company Login - Hide when company is logged in */}
              {!isCompanyLoggedIn && (
                <li>
                  <Link href="/company/login" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                    <ChevronRight className="h-4 w-4" /> Company Login
                  </Link>
                </li>
              )}
              
              {/* ✅ Dashboard - Show when company is logged in */}
              {isCompanyLoggedIn && (
                <li>
                  <Link href="/company/dashboard" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                    <ChevronRight className="h-4 w-4" /> Dashboard
                  </Link>
                </li>
              )}
              
              {/* ✅ Post a Job - Always show */}
              <li>
                <Link href={isCompanyLoggedIn ? "/company/dashboard/post-job" : "/pricing"} className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1">
                  <ChevronRight className="h-4 w-4" /> Post a Job
                </Link>
              </li>
              
              <li><Link href="/pricing" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Pricing Plans</Link></li>
              <li><Link href="/hire" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> Hire Talent</Link></li>
              <li><a href="https://wa.me/923482350367" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition flex items-center gap-1"><ChevronRight className="h-4 w-4" /> WhatsApp Support</a></li>
            </ul>
          </div>

          {/* Column 4 - Contact & Social */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Stay Connected</h3>
            <ul className="space-y-3">
              <li><a href="https://www.youtube.com/@HiringPakistan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition flex items-center gap-3"><Youtube className="h-5 w-5" /><span>YouTube Channel</span></a></li>
              <li><a href="https://wa.me/923482350367" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition flex items-center gap-3"><Phone className="h-5 w-5" /><span>WhatsApp: +92 348 2350367</span></a></li>
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-cyan-500" /><a href="mailto:info.hiringpakistan@gmail.com" className="text-gray-400 hover:text-cyan-500 transition">info.hiringpakistan@gmail.com</a></li>
              <li><a href="https://www.tiktok.com/@hiringpakistan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300 transition flex items-center gap-3"><span className="text-lg">🎵</span><span>TikTok</span></a></li>
              <li><a href="https://pinterest.com/hiringpakistan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition flex items-center gap-3"><span className="text-lg">📌</span><span>Pinterest</span></a></li>
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <a href="https://pk.indeed.com/cmp/Hiring-Pakistan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-500 transition flex items-center gap-2 text-sm"><span>📢</span> Find us on Indeed</a>
            </div>
          </div>
        </div>

        {/* WhatsApp & YouTube Alert Bar */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-cyan-600 rounded-xl p-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-white">
            <div className="flex items-center gap-2"><span>📢</span><p className="text-sm font-medium">For latest job updates, subscribe to our <a href="https://www.youtube.com/@HiringPakistan" target="_blank" rel="noopener noreferrer" className="underline font-bold mx-1 hover:text-yellow-200">YouTube Channel</a> for daily job alerts!</p></div>
            <a href="https://wa.me/923482350367" target="_blank" rel="noopener noreferrer" className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition flex items-center gap-2"><Phone className="h-4 w-4" /> WhatsApp Us</a>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg">Subscribe to Newsletter</h3>
              <p className="text-gray-400 text-sm">Get latest job updates and career tips</p>
            </div>
            <div className="w-full md:w-auto">
              <div className="flex flex-col sm:flex-row w-full gap-2">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-cyan-500"
                  disabled={newsletterLoading}
                />
                <button 
                  onClick={handleNewsletterSubscribe}
                  disabled={newsletterLoading}
                  className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none transition flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  <Send className="h-4 w-4" /> 
                  {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {newsletterStatus && (
                <div className={`text-sm mt-2 text-center ${newsletterStatus.error ? 'text-red-400' : 'text-green-400'}`}>
                  {newsletterStatus.error || newsletterStatus.success}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© {currentYear} Hiring Pakistan. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="text-gray-400 hover:text-cyan-500 text-sm transition">Terms of Service</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-cyan-500 text-sm transition">Privacy Policy</Link>
              <Link href="/cookies" className="text-gray-400 hover:text-cyan-500 text-sm transition">Cookie Policy</Link>
              <a href="https://pk.indeed.com/cmp/Hiring-Pakistan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-500 text-sm transition">Indeed</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}