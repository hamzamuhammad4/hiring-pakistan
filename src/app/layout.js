// src/app/layout.js
"use client";

import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Metadata is now in a separate server component
// Client component for layout
export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admin");
  
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <title>Hiring Pakistan - Pakistan's #1 Job Portal</title>
        <meta name="description" content="Find your dream job or hire the best talent in Pakistan at hiringpakistan.co" />
        <meta name="keywords" content="jobs, hiring, Pakistan, careers, employment, job portal, job search" />
        <meta name="author" content="Hiring Pakistan" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Hiring Pakistan - Pakistan's #1 Job Portal" />
        <meta property="og:description" content="Find your dream job or hire the best talent in Pakistan" />
        <meta property="og:url" content="https://hiringpakistan.co" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://hiringpakistan.co" />
      </head>
      <body className="bg-gray-50 font-sans antialiased">
        {isAdminPage ? (
          <main>{children}</main>
        ) : (
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        )}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}