// src/components/SearchSection.js
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function SearchSectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const categories = [
    "All", "Web Development", "Mobile App Development", "Graphic Design",
    "UI/UX Design", "Digital Marketing", "Content Writing", "Software Engineering",
    "Data Science / AI", "DevOps / Cloud", "Cyber Security", "Network Engineering", "Other"
  ];

  // Load filters from URL on mount (for when coming back from search page)
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (category && category !== 'All') {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build query params for search page
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'All') {
      params.set('category', selectedCategory);
    }
    if (searchTerm && searchTerm.trim()) {
      params.set('q', searchTerm.trim());
    }
    
    // Redirect to search page
    router.push(`/search?${params.toString()}`);
  };

  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    setSelectedCategory(newCategory);
    // Don't auto-search, just update state
  };

  const handleSearchTermChange = (e) => {
    const newSearch = e.target.value;
    setSearchTerm(newSearch);
    // Don't auto-search, just update state
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    router.push('/search');
  };

  return (
    <div className="max-w-5xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
        Find Your Dream Job
      </h1>
      <p className="text-lg md:text-xl text-cyan-100 mb-10 font-medium">
        10,000+ jobs from top companies in Pakistan
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 bg-white rounded-full shadow-2xl overflow-hidden flex items-center border-4 border-white">
          <div className="pl-7 pr-3">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Job title, keywords, company name..."
            value={searchTerm}
            onChange={handleSearchTermChange}
            className="w-full py-4 px-2 text-base md:text-lg text-gray-700 outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div className="md:w-64">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="w-full py-4 px-6 text-base md:text-lg text-gray-700 bg-white rounded-full border-4 border-white shadow-2xl outline-none cursor-pointer"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <button 
          type="submit"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-10 py-4 text-base md:text-lg rounded-full transition shadow-lg"
        >
          Search Jobs
        </button>
      </form>

      {/* Clear filters button */}
      {(searchTerm || selectedCategory !== "All") && (
        <button 
          onClick={clearFilters}
          className="mt-4 text-white hover:text-cyan-200 text-sm font-medium"
        >
          ✕ Clear all filters
        </button>
      )}
    </div>
  );
}

// Loading fallback
function SearchSectionLoading() {
  return (
    <div className="max-w-5xl mx-auto text-center">
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
        Find Your Dream Job
      </h1>
      <div className="animate-pulse">
        <div className="h-12 bg-white/20 rounded-full max-w-4xl mx-auto"></div>
      </div>
    </div>
  );
}

// Main export with Suspense
export default function SearchSection() {
  return (
    <Suspense fallback={<SearchSectionLoading />}>
      <SearchSectionContent />
    </Suspense>
  );
}