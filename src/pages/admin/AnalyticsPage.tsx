import { Topbar } from '@/components/layout/Topbar';
import {
  MOCK_QOQ_DATA,
  MOCK_HEATMAP_DATA,
  MOCK_THRUST_DIST,
  MOCK_MGR_EFFECTIVENESS,
} from '@/lib/mockData';
import { exportToCSV } from '@/lib/export';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Download, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

function heatColor(val: number): string {
  if (val >= 90) return 'bg-green-500 text-white';
  if (val >= 80) return 'bg-green-400 text-white';
  if (val >= 70) return 'bg-yellow-400 text-gray-900';
  if (val >= 60) return 'bg-yellow-200 text-gray-800';
  return 'bg-yellow-100 text-gray-700';
}

const LINE_COLORS = ['#FDB813', '#16A34A', '#2563EB', '#DC2626'];
const EMPLOYEES = ['Riya Sharma', 'Arjun Kapoor', 'Neha Gupta', 'Rohit Desai'];

export function AnalyticsPage() {
  const handleExport = () => {
    exportToCSV(
      MOCK_QOQ_DATA.map((d) => ({ ...d })),
      'lakshya-analytics-qoq'
    );
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Analytics' }]} />
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Organizational Insights</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Strategic performance analysis across all business units for FY 2026-27.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Download size={15} />
              Export Report
            </button>
          </div>
        </div>

        {/* Row 1: QoQ Line + Thrust Donut */}
        <div className="grid grid-cols-[1fr_320px] gap-4 items-start">
          {/* QoQ Line Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-semibold text-gray-900 font-heading">QoQ Achievement Trend</h2>
                <p className="text-xs text-gray-400 mt-0.5">Cumulative goal completion percentage by quarter</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                <TrendingUp size={12} />
                +12.4%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MOCK_QOQ_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                  }}
                  formatter={(val: unknown) => [`${(val as number).toFixed(1)}%`]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', fontFamily: 'Plus Jakarta Sans' }}
                  iconType="circle"
                />
                {EMPLOYEES.map((emp, i) => (
                  <Line
                    key={emp}
                    type="monotone"
                    dataKey={emp}
                    stroke={LINE_COLORS[i]}
                    strokeWidth={2}
                    dot={{ r: 3, fill: LINE_COLORS[i] }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Thrust Donut */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 font-heading mb-0.5">Thrust Area Distribution</h2>
            <p className="text-xs text-gray-400 mb-4">Resource allocation across key focus pillars</p>
            <div className="flex items-center justify-center">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={MOCK_THRUST_DIST}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {MOCK_THRUST_DIST.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#1F2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                      formatter={(val: unknown) => [`${val}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-2xl font-bold text-gray-900">
                    {MOCK_THRUST_DIST.length}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">Key Themes</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {MOCK_THRUST_DIST.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-600 flex-1 truncate">{item.name}</span>
                  <span className="font-mono text-xs font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Org Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-semibold text-gray-900 font-heading">Org Performance Heatmap</h2>
              <p className="text-xs text-gray-400 mt-0.5">Departmental target completion velocity across quarters</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Low</span>
              <div className="flex gap-1">
                {['bg-yellow-100', 'bg-yellow-200', 'bg-yellow-400', 'bg-green-400', 'bg-green-500'].map((c, i) => (
                  <div key={i} className={`w-4 h-3 rounded-sm ${c}`} />
                ))}
              </div>
              <span>High</span>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Department</th>
                  {['Q1', 'Q2', 'Q3', 'Q4 (Est)'].map((q) => (
                    <th key={q} className="text-center py-2 px-2 text-xs text-gray-500 font-medium">{q}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-1">
                {MOCK_HEATMAP_DATA.map((row) => (
                  <tr key={row.dept}>
                    <td className="py-2 pr-4 font-medium text-gray-900">{row.dept}</td>
                    {[row.Q1, row.Q2, row.Q3, row.Q4].map((val, i) => (
                      <td key={i} className="py-1 px-2">
                        <div className={cn('rounded-lg text-center font-mono text-sm font-bold py-1.5 px-3', heatColor(val))}>
                          {val}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: Manager Effectiveness */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-gray-900 font-heading">Manager Effectiveness Index</h2>
            <p className="text-xs text-gray-400 mt-0.5">Team performance achievement by leadership node</p>
          </div>

          <div className="space-y-4">
            {MOCK_MGR_EFFECTIVENESS.map((mgr) => (
              <div key={mgr.manager} className="flex items-center gap-4">
                <div className="w-44 shrink-0">
                  <p className="text-sm font-medium text-gray-900">{mgr.manager}</p>
                  <p className="text-xs text-gray-400">{mgr.dept}</p>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        mgr.score >= 90 ? 'bg-green-500' : mgr.score >= 80 ? 'bg-[#FDB813]' : 'bg-yellow-500'
                      )}
                      style={{ width: `${mgr.score}%` }}
                    />
                  </div>
                  <span className={cn(
                    'font-mono text-sm font-bold w-12 text-right',
                    mgr.score >= 90 ? 'text-green-600' : 'text-yellow-600'
                  )}>
                    {mgr.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bar chart version */}
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={MOCK_MGR_EFFECTIVENESS}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis
                  dataKey="manager"
                  tick={{ fontSize: 10, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: string) => v.split(' ')[0]}
                />
                <YAxis
                  domain={[50, 100]}
                  tick={{ fontSize: 10, fill: '#9CA3AF', fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(v: unknown) => [`${v}%`, 'Score']}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {MOCK_MGR_EFFECTIVENESS.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.score >= 90 ? '#16A34A' : entry.score >= 80 ? '#FDB813' : '#D97706'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 text-center">
            <button className="text-sm font-medium text-[#FDB813] hover:underline">
              View Detailed Leaderboard →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
