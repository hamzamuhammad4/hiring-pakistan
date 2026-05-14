// src/app/companies/CompaniesClient.js
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { Building2, MapPin, Users } from "lucide-react";

export default function CompaniesClient() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const snapshot = await getDocs(collection(db, "companies"));
        const companiesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCompanies(companiesList);
      } catch (error) {
        console.error("Error fetching companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Top Companies</h1>
          <p className="text-gray-600">Discover leading employers across Pakistan</p>
        </div>

        {companies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No companies registered yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <div key={company.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                    {company.companyName?.[0]?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{company.companyName || "Company"}</h3>
                    <p className="text-gray-500 text-sm">{company.industry || "Various Industries"}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {company.city || "Pakistan"}</p>
                  <p className="flex items-center gap-2"><Users className="h-4 w-4" /> {company.size || "N/A"} employees</p>
                </div>
                <Link href={`/companies/${company.id}`} className="mt-4 inline-block text-cyan-600 hover:underline text-sm">
                  View Jobs →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}