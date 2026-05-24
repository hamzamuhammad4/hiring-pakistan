// src/app/contact/page.js
"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-gray-600">We'd love to hear from you. Get in touch with our team.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* <div className="flex items-center gap-4 mb-4">
                <div className="bg-cyan-100 p-3 rounded-xl"><MapPin className="h-6 w-6 text-cyan-600" /></div>
                <div><h3 className="font-semibold text-gray-800">Address</h3><p className="text-gray-500 text-sm">123 Main Street, Karachi, Pakistan</p></div>
              </div> */}
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-cyan-100 p-3 rounded-xl"><Phone className="h-6 w-6 text-cyan-600" /></div>
                <div><h3 className="font-semibold text-gray-800">Phone</h3><p className="text-gray-500 text-sm">+92 348 2350367</p></div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-cyan-100 p-3 rounded-xl"><Mail className="h-6 w-6 text-cyan-600" /></div>
                <div><h3 className="font-semibold text-gray-800">Email</h3><p className="text-gray-500 text-sm">info.hiringpakistan@gmail.com</p></div>
              </div>
              {/* <div className="flex items-center gap-4">
                <div className="bg-cyan-100 p-3 rounded-xl"><Clock className="h-6 w-6 text-cyan-600" /></div>
                <div><h3 className="font-semibold text-gray-800">Working Hours</h3><p className="text-gray-500 text-sm">Mon - Fri: 9:00 AM - 6:00 PM</p></div>
              </div> */}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Your Email" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
              </div>
              <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
              <textarea name="message" value={formData.message} onChange={handleChange} rows="5" placeholder="Your Message" className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500" required />
              <button type="submit" disabled={submitting} className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium px-8 py-3 rounded-xl flex items-center gap-2 disabled:bg-gray-400">
                <Send className="h-5 w-5" /> {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}