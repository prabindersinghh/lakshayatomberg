import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  MOCK_QOQ_DATA,
  MOCK_HEATMAP_DATA,
  MOCK_THRUST_DIST,
  MOCK_MGR_EFFECTIVENESS,
} from '@/lib/mockData';
import { exportToCSV } from '@/lib/export';
import { Download, TrendingUp } from 'lucide-react';

const EMPLOYEE_COLORS: Record<string, string> = {
  'Riya Sharma': '#FDB813',
  'Arjun Kapoor': '#3B82F6',
  'Neha Gupta': '#10B981',
  'Rohit Desai': '#F97316',
};
const EMPLOYEES = ['Riya Sharma', 'Arjun Kapoor', 'Neha Gupta', 'Rohit Desai'];

const THRUST_COLORS = ['#FDB813', '#3B82F6', '#10B981', '#F97316', '#8B5CF6'];

const DARK_TOOLTIP_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  color: '#111827',
  fontSize: '12px',
};

function heatBg(val: number): string {
  if (val >= 90) return '#FDB813';
  if (val >= 80) return 'rgba(253,184,19,0.6)';
  if (val >= 70) return 'rgba(253,184,19,0.35)';
  if (val >= 60) return 'rgba(253,184,19,0.18)';
  return '#1A1A1A';
}

function heatTextColor(val: number): string {
  return val >= 80 ? '#000000' : val >= 60 ? '#FDB813' : '#52525B';
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomQoQTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...DARK_TOOLTIP_STYLE, padding: '10px 14px', minWidth: '160px' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: '#6B7280' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs mb-1">
          <span style={{ color: p.color }}>{p.name.split(' ')[0]}</span>
          <span className="font-mono font-bold" style={{ color: '#111827' }}>{p.value.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

function CustomBarTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...DARK_TOOLTIP_STYLE, padding: '10px 14px' }}>
      <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>{label}</p>
      <p className="font-mono font-bold text-sm" style={{ color: payload[0]?.color ?? '#FDB813' }}>
        {payload[0]?.value}%
      </p>
    </div>
  );
}

export function AnalyticsPage() {
  const handleExport = () => {
    exportToCSV(MOCK_QOQ_DATA.map((d) => ({ ...d })), 'lakshya-analytics-qoq');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-6xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>Organizational Insights</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Strategic performance analysis across all business units for FY 2026-27.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
          style={{ background: '#FDB813', color: '#000000' }}
        >
          <Download size={15} />
          Export Report
        </button>
      </div>

      {/* Row 1: QoQ Line + Thrust Donut */}
      <div className="grid grid-cols-[1fr_300px] gap-4 items-start">
        {/* QoQ Area/Line Chart */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="rounded-xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>QoQ Achievement Trend</h2>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Cumulative goal completion % by quarter</p>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
            >
              <TrendingUp size={12} />
              +12.4%
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={MOCK_QOQ_DATA} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                {EMPLOYEES.map((emp) => (
                  <linearGradient key={emp} id={`grad-${emp.split(' ')[0]}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={EMPLOYEE_COLORS[emp]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={EMPLOYEE_COLORS[emp]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis
                dataKey="quarter"
                tick={{ fontSize: 11, fill: '#A1A1AA' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[50, 100]}
                tick={{ fontSize: 11, fill: '#A1A1AA' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip content={<CustomQoQTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#6B7280', paddingTop: '12px' }}
                iconType="circle"
                formatter={(value) => <span style={{ color: '#6B7280' }}>{value}</span>}
              />
              {EMPLOYEES.map((emp) => (
                <Line
                  key={emp}
                  type="monotone"
                  dataKey={emp}
                  stroke={EMPLOYEE_COLORS[emp]}
                  strokeWidth={2.5}
                  isAnimationActive={true}
                  dot={{ r: 4, fill: EMPLOYEE_COLORS[emp], strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#111111' }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Thrust Area Donut */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl p-5"
          style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
        >
          <h2 className="font-semibold font-heading mb-0.5" style={{ color: '#111827' }}>Thrust Area Distribution</h2>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Resource allocation across key focus pillars</p>

          <div className="flex items-center justify-center relative">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={MOCK_THRUST_DIST}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {MOCK_THRUST_DIST.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={THRUST_COLORS[index % THRUST_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={DARK_TOOLTIP_STYLE}
                  formatter={(val: unknown) => [`${val}%`, 'Share'] as [string, string]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              style={{ top: 0 }}
            >
              <span className="font-mono text-2xl font-bold" style={{ color: '#111827' }}>
                {MOCK_THRUST_DIST.length}
              </span>
              <span className="text-[9px] uppercase tracking-wide" style={{ color: '#9CA3AF' }}>Themes</span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5">
            {MOCK_THRUST_DIST.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: THRUST_COLORS[i % THRUST_COLORS.length] }}
                />
                <span className="text-xs flex-1 truncate" style={{ color: '#6B7280' }}>{item.name}</span>
                <span className="font-mono text-xs font-bold" style={{ color: '#111827' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2: Org Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.16 }}
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>Org Performance Heatmap</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              Departmental target completion velocity across quarters
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#9CA3AF' }}>
            <span>Low</span>
            <div className="flex gap-1">
              {[0.12, 0.25, 0.45, 0.7, 1].map((opacity, i) => (
                <div
                  key={i}
                  className="w-5 h-3 rounded-sm"
                  style={{ background: `rgba(253,184,19,${opacity})` }}
                />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                <th className="text-left py-2 pr-4 text-xs font-medium" style={{ color: '#9CA3AF' }}>Department</th>
                {['Q1', 'Q2', 'Q3', 'Q4 (Est)'].map((q) => (
                  <th key={q} className="text-center py-2 px-3 text-xs font-medium" style={{ color: '#9CA3AF' }}>{q}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HEATMAP_DATA.map((row) => (
                <tr key={row.dept} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td className="py-2 pr-4 font-medium text-sm" style={{ color: '#111827' }}>{row.dept}</td>
                  {[row.Q1, row.Q2, row.Q3, row.Q4].map((val, i) => (
                    <td key={i} className="py-1.5 px-3">
                      <div
                        className="group relative rounded-lg text-center font-mono text-sm font-bold py-1.5 px-3 cursor-default transition-all"
                        style={{
                          background: heatBg(val),
                          color: heatTextColor(val),
                        }}
                        title={`${val}%`}
                      >
                        {val}%
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Row 3: Manager Effectiveness BarChart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.22 }}
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <div className="mb-5">
          <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>Manager Effectiveness Index</h2>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Team performance achievement by leadership node</p>
        </div>

        {/* Progress bars */}
        <div className="space-y-4 mb-6">
          {MOCK_MGR_EFFECTIVENESS.map((mgr) => (
            <div key={mgr.manager} className="flex items-center gap-4">
              <div className="w-36 shrink-0">
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{mgr.manager}</p>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>{mgr.dept}</p>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#2A2A2A' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${mgr.score}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ background: mgr.score >= 90 ? '#10B981' : '#FDB813' }}
                  />
                </div>
                <span
                  className="font-mono text-sm font-bold w-12 text-right"
                  style={{ color: mgr.score >= 90 ? '#10B981' : '#FDB813' }}
                >
                  {mgr.score}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={MOCK_MGR_EFFECTIVENESS}
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
            <XAxis
              dataKey="manager"
              tick={{ fontSize: 10, fill: '#A1A1AA' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: string) => v.split(' ')[0]}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fontSize: 10, fill: '#A1A1AA' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} isAnimationActive={true}>
              {MOCK_MGR_EFFECTIVENESS.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.score >= 90 ? '#10B981' : '#FDB813'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
