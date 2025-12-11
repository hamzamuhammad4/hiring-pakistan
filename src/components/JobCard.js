{/* FINAL SEARCH BAR — ROZEE.PK JAISE, THODA CHHOTA AUR PERFECT */}
<section className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-700 py-20 px-4">
  <div className="max-w-6xl mx-auto text-center">
    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl">
      Find Your Dream Job
    </h1>
    <p className="text-xl md:text-2xl text-cyan-100 mb-10 font-medium">
      10,000+ jobs from top companies in Pakistan
    </p>

    {/* SEARCH BAR — EXACT ROZEE.PK STYLE */}
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-full shadow-2xl overflow-hidden flex items-center border-4 border-white">
        {/* Search Icon */}
        <div className="pl-8 pr-4">
          <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Job title, keywords, company name..."
          className="w-full py-5 px-4 text-lg text-gray-800 outline-none"
        />

        {/* Button */}
        <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-12 py-5 text-lg rounded-r-full transition shadow-lg hover:shadow-xl">
          Search Jobs
        </button>
      </div>
    </div>

    {/* Stats — Glass Effect */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
      {[
        { num: "10K+", label: "Active Jobs" },
        { num: "5K+", label: "Companies" },
        { num: "50K+", label: "Candidates" },
        { num: "100%", label: "Free for Job Seekers" }
      ].map((item, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl py-6 px-4 border border-white/20">
          <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{item.num}</div>
          <div className="text-cyan-100 text-base md:text-lg mt-2 font-medium">{item.label}</div>
        </div>
      ))}
    </div>
  </div>
</section>