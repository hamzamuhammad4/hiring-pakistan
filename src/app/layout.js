// src/app/layout.js

import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';   // ← Ye line add kar di

export const metadata = {
  title: "Hiring Pakistan - Pakistan ka #1 Job Portal",
  description: "Find your dream job or hire the best talent in Pakistan",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
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