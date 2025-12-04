export default function StatsOverview() {
  return (
    <>
      {/* Header Section */}
      <div className="pt-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Career Analytics Dashboard</h1>
            <p className="text-lg text-slate-600">Comprehensive overview of your career development progress</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Last updated:</span>
              <span className="text-sm font-medium text-slate-700">2 minutes ago</span>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Applications */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m18 13-3.5 3.5a2 2 0 0 1-2.82 0L10 15"/><path d="m15 16 4 4"/></svg>
            </div>
            <div className="text-right">
              <span className="text-sm text-green-600 font-semibold">+12.5%</span>
              <p className="text-xs text-slate-500">vs last month</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">47</p>
            <p className="text-sm text-slate-600 mb-3">Applications Sent</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">This month</span>
              <span className="text-slate-700 font-medium">47 applications</span>
            </div>
          </div>
        </div>

        {/* Interview Rate */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
            </div>
            <div className="text-right">
              <span className="text-sm text-green-600 font-semibold">+8.2%</span>
              <p className="text-xs text-slate-500">vs last month</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">23%</p>
            <p className="text-sm text-slate-600 mb-3">Interview Rate</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">11 interviews</span>
              <span className="text-slate-700 font-medium">from 47 applications</span>
            </div>
          </div>
        </div>

        {/* Skills Progress */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div className="text-right">
              <span className="text-sm text-green-600 font-semibold">+15</span>
              <p className="text-xs text-slate-500">skills improved</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">18</p>
            <p className="text-sm text-slate-600 mb-3">Skills Tracked</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Avg. progress</span>
              <span className="text-slate-700 font-medium">73% completion</span>
            </div>
          </div>
        </div>

        {/* Profile Performance */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M1 12s4-8 8-8 8 4 8 8-4 8-8 8-8-4-8-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </div>
            <div className="text-right">
              <span className="text-sm text-green-600 font-semibold">+34%</span>
              <p className="text-xs text-slate-500">vs last month</p>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900 mb-1">2.4K</p>
            <p className="text-sm text-slate-600 mb-3">Profile Views</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">This month</span>
              <span className="text-slate-700 font-medium">+820 views</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}







