import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { MOCK_ORG_COMPLETION, MOCK_GOAL_SHEETS, MOCK_USERS } from '@/lib/mockData';
import { useNavigate } from 'react-router-dom';
import { Users, CheckSquare, CheckCircle2, BarChart2, Download, Grid, ClipboardList, TrendingUp, Settings } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

export function AdminDashboard() {
  const navigate = useNavigate();

  const totalEmployees = MOCK_USERS.filter((u) => u.role === 'employee').length;
  const goalsSubmitted = MOCK_ORG_COMPLETION.filter((e) => e.goalSet).length;
  const goalsApproved = MOCK_ORG_COMPLETION.filter((e) => e.approved).length;
  const avgScore = Math.round(
    MOCK_ORG_COMPLETION.reduce((acc, e) => {
      const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === e.id);
      return acc + (sheet?.overall_score ?? 0);
    }, 0) / MOCK_ORG_COMPLETION.length
  );

  const stats = [
    {
      label: 'Total Employees',
      value: totalEmployees,
      sub: '+2 this month',
      icon: <Users size={20} />,
    },
    {
      label: 'Goals Submitted',
      value: goalsSubmitted,
      sub: `${Math.round((goalsSubmitted / totalEmployees) * 100)}% completion rate`,
      icon: <CheckSquare size={20} />,
    },
    {
      label: 'Goals Approved',
      value: goalsApproved,
      sub: `${totalEmployees - goalsApproved} pending manager action`,
      icon: <CheckCircle2 size={20} />,
    },
    {
      label: 'Avg Score',
      value: avgScore,
      sub: 'Across approved sheets',
      icon: <BarChart2 size={20} />,
      suffix: '%',
    },
  ];

  const handleExportCSV = () => {
    const data = MOCK_ORG_COMPLETION.map((e) => ({
      Employee: e.name,
      Department: e.dept,
      Manager: e.manager,
      'Goal Set': e.goalSet ? 'Yes' : 'No',
      Approved: e.approved ? 'Yes' : 'No',
      'Q1 Employee': e.q1Emp ? 'Yes' : 'No',
      'Q1 Manager': e.q1Mgr ? 'Yes' : 'No',
      'Q2 Employee': e.q2Emp ? 'Yes' : 'No',
      'Q2 Manager': e.q2Mgr ? 'Yes' : 'No',
    }));
    exportToCSV(data, 'lakshya-completion-report');
  };

  const ragSummary = MOCK_ORG_COMPLETION.slice(0, 6);

  const quickLinks = [
    { label: 'Completion Grid', desc: 'RAG status by employee', to: '/admin/completion', icon: <Grid size={20} /> },
    { label: 'Audit Log', desc: 'All post-lock changes', to: '/admin/audit', icon: <ClipboardList size={20} /> },
    { label: 'Analytics', desc: 'Trends, heatmap, charts', to: '/admin/analytics', icon: <TrendingUp size={20} /> },
    { label: 'Settings', desc: 'Cycle & thrust areas', to: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.3 } }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
            Admin Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Strategic performance analysis across all business units for FY 2026-27
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#6B7280' }}
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
            style={{ background: '#FDB813', color: '#000000' }}
          >
            View Analytics →
          </button>
        </div>
      </div>

      {/* Hero metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="card-hover rounded-xl p-4"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(253,184,19,0.1)', color: '#FDB813' }}
            >
              {s.icon}
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#111827' }}>
              <CountUp end={s.value} duration={1.4} suffix={s.suffix} />
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.label}</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickLinks.map((item, i) => (
          <motion.button
            key={item.label}
            custom={i + 4}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            onClick={() => navigate(item.to)}
            className="rounded-xl p-4 text-left transition-all card-hover"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: 'rgba(253,184,19,0.1)', color: '#FDB813' }}
            >
              {item.icon}
            </div>
            <p className="font-semibold text-sm" style={{ color: '#111827' }}>{item.label}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{item.desc}</p>
          </motion.button>
        ))}
      </div>

      {/* RAG Summary grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-xl overflow-hidden"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
          <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>RAG Completion Summary</h2>
          <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>Goal & check-in status for top employees</p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Employee', 'Dept', 'Goal Set', 'Approved', 'Q1 Emp', 'Q1 Mgr', 'Q2 Emp', 'Q2 Mgr'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: '#9CA3AF' }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ragSummary.map((emp) => {
                const cell = (val: boolean) =>
                  val ? (
                    <span style={{ color: '#10B981' }}>✓</span>
                  ) : (
                    <span style={{ color: '#9CA3AF' }}>—</span>
                  );
                return (
                  <tr
                    key={emp.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #E5E7EB' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FFFBEC')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td className="px-4 py-3 font-medium" style={{ color: '#111827' }}>{emp.name}</td>
                    <td className="px-4 py-3" style={{ color: '#6B7280' }}>{emp.dept}</td>
                    <td className="px-4 py-3 text-center">{cell(emp.goalSet)}</td>
                    <td className="px-4 py-3 text-center">{cell(emp.approved)}</td>
                    <td className="px-4 py-3 text-center">{cell(emp.q1Emp)}</td>
                    <td className="px-4 py-3 text-center">{cell(emp.q1Mgr)}</td>
                    <td className="px-4 py-3 text-center">{cell(emp.q2Emp)}</td>
                    <td className="px-4 py-3 text-center">{cell(emp.q2Mgr)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 flex justify-end" style={{ borderTop: '1px solid #E5E7EB' }}>
          <button
            onClick={() => navigate('/admin/completion')}
            className="text-sm font-medium hover:underline"
            style={{ color: '#FDB813' }}
          >
            View Full Grid →
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.28 }}
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <h2 className="font-semibold font-heading mb-4" style={{ color: '#111827' }}>Recent Activity</h2>
        <div className="space-y-3">
          {MOCK_GOAL_SHEETS.slice(0, 4).map((sheet) => {
            const emp = MOCK_USERS.find((u) => u.id === sheet.employee_id);
            const statusConfig: Record<string, { icon: string; color: string }> = {
              approved: { icon: '✅', color: '#10B981' },
              submitted: { icon: '⏳', color: '#FDB813' },
              returned: { icon: '↩️', color: '#EF4444' },
              draft: { icon: '📝', color: '#9CA3AF' },
            };
            const cfg = statusConfig[sheet.status] ?? { icon: '📝', color: '#9CA3AF' };
            return (
              <div key={sheet.id} className="flex items-center gap-3 text-sm">
                <span className="text-base">{cfg.icon}</span>
                <div className="flex-1">
                  <span className="font-medium" style={{ color: '#111827' }}>{emp?.full_name}</span>
                  <span style={{ color: '#9CA3AF' }}> — goal sheet </span>
                  <span className="font-medium" style={{ color: cfg.color }}>{sheet.status}</span>
                </div>
                {sheet.submitted_at && (
                  <span className="text-xs" style={{ color: '#9CA3AF' }}>
                    {new Date(sheet.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
