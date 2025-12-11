// src/app/(auth)/layout.js   ← YE FILE BANANA ZAROORI THA!
import "../globals.css";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img 
            src="/logo.png" 
            alt="Hiring Pakistan" 
            className="w-40 mx-auto mb-6 drop-shadow-2xl" 
          />
          <h1 className="text-4xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-3 text-lg">Pakistan ka #1 Job Portal</p>
        </div>
        <div className="bg-white rounded-3xl shadow-2xl p-10">
          {children}
        </div>
      </div>
    </div>
  );
}