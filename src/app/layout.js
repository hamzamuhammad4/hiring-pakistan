// src/app/layout.js
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';

// Inter font - body ke liye (clean, readable)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Outfit font - headings ke liye (bold, modern)
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Hiring Pakistan - Pakistan ka #1 Job Portal",
  description: "Find your dream job or hire the best talent in Pakistan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-gray-50 font-sans antialiased">
        <Navbar />
        <main>{children}</main>
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
              fontSize: '16px',
              padding: '16px',
            },
            success: {
              style: {
                background: '#10B981',
                color: 'white',
              },
            },
            error: {
              style: {
                background: '#EF4444',
                color: 'white',
              },
            },
          }}
        />
      </body>
    </html>
  );
}