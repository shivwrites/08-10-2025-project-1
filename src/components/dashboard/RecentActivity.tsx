export default function RecentActivity() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Recent Activity */}
      <div className="lg:col-span-2 bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m18 13-3.5 3.5a2 2 0 0 1-2.82 0L10 15"/><path d="m15 16 4 4"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Applied to Senior Frontend Developer at TechCorp</p>
              <p className="text-xs text-slate-500 mt-1">Application submitted successfully</p>
              <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">New</span>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Interview scheduled for tomorrow at 2:00 PM</p>
              <p className="text-xs text-slate-500 mt-1">Google Meet link sent to your email</p>
              <p className="text-xs text-slate-400 mt-1">4 hours ago</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Scheduled</span>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Completed Advanced React Patterns course</p>
              <p className="text-xs text-slate-500 mt-1">Earned certificate and 15 skill points</p>
              <p className="text-xs text-slate-400 mt-1">1 day ago</p>
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Completed</span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Insights */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m18 13-3.5 3.5a2 2 0 0 1-2.82 0L10 15"/><path d="m15 16 4 4"/></svg>
              <span className="font-medium">Create New Resume</span>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span className="font-medium">Find Jobs</span>
            </button>
            <button className="w-full p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              <span className="font-medium">Start Learning</span>
            </button>
          </div>
        </div>

        {/* AI Insights */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">AI Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-white/60 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">Skill Gap Alert</p>
              <p className="text-xs text-slate-600">Consider learning Docker to increase your marketability by 23%</p>
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">Profile Optimization</p>
              <p className="text-xs text-slate-600">Add 2 more projects to increase profile views by 15%</p>
            </div>
            <div className="p-3 bg-white/60 rounded-lg">
              <p className="text-sm font-medium text-slate-900 mb-1">Networking Opportunity</p>
              <p className="text-xs text-slate-600">3 relevant events this week in your area</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

