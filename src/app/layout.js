// src/app/layout.js
import "./globals.css";
import Navbar from "@/components/Navbar";

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
      </body>
    </html>
  );
}