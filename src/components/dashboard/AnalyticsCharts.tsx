import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const applicationData = [
  { name: 'Jan', applications: 45, interviews: 10 },
  { name: 'Feb', applications: 52, interviews: 12 },
  { name: 'Mar', applications: 61, interviews: 15 },
  { name: 'Apr', applications: 58, interviews: 14 },
  { name: 'May', applications: 72, interviews: 18 },
  { name: 'Jun', applications: 68, interviews: 16 },
];

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Application Trends Chart */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Application Trends</h3>
            <p className="text-sm text-slate-600">Monthly application activity</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">This Year</button>
            <button className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">Last Year</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={applicationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#1e293b', fontWeight: 600 }}
              itemStyle={{ color: '#4f46e5' }}
            />
            <Bar 
              dataKey="applications" 
              fill="#4f46e5" 
              radius={[6, 6, 0, 0]} 
              name="Applications"
            />
            <Bar 
              dataKey="interviews" 
              fill="#10b981" 
              radius={[6, 6, 0, 0]} 
              name="Interviews"
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">Total applications: 356</span>
          <span className="text-green-600 font-medium">+23% from last year</span>
        </div>
      </div>

      {/* Skills Progress Chart */}
      <div className="bg-white/50 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Skills Progress</h3>
            <p className="text-sm text-slate-600">Top performing skills</p>
          </div>
          <button className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full">View All</button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600">JS</span>
              </div>
              <span className="text-sm font-medium text-slate-900">JavaScript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">85%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-semibold text-green-600">TS</span>
              </div>
              <span className="text-sm font-medium text-slate-900">TypeScript</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">72%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-semibold text-purple-600">R</span>
              </div>
              <span className="text-sm font-medium text-slate-900">React</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">68%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-xs font-semibold text-orange-600">N</span>
              </div>
              <span className="text-sm font-medium text-slate-900">Node.js</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: '55%' }}></div>
              </div>
              <span className="text-sm font-medium text-slate-700">55%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
