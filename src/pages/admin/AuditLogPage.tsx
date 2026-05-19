import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_AUDIT_LOGS } from '@/lib/mockData';
import { exportToCSV } from '@/lib/export';
import { Download, Search, ShieldCheck, Activity, Cpu } from 'lucide-react';
import CountUp from 'react-countup';

const ACTION_LABELS: Record<string, string> = {
  edit_target: 'Goal Revision',
  approve: 'Approval',
  lock: 'Freeze Period',
  return: 'Return for Rework',
  unlock: 'Unlock',
  edit_actual: 'KRA Update',
};

const ACTION_BADGE: Record<string, { bg: string; color: string }> = {
  edit_target: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  approve: { bg: 'rgba(16,185,129,0.15)', color: '#10B981' },
  lock: { bg: 'rgba(82,82,91,0.3)', color: '#6B7280' },
  return: { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' },
  unlock: { bg: 'rgba(253,184,19,0.15)', color: '#FDB813' },
  edit_actual: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
};

const ROLE_BADGE: Record<string, { bg: string; color: string }> = {
  admin: { bg: 'rgba(253,184,19,0.15)', color: '#FDB813' },
  manager: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
  employee: { bg: 'rgba(82,82,91,0.3)', color: '#6B7280' },
  system: { bg: 'rgba(139,92,246,0.15)', color: '#8B5CF6' },
};

export function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const stats = [
    { label: 'Total Events', value: MOCK_AUDIT_LOGS.length, icon: <Activity size={16} /> },
    { label: 'Admin Actions', value: MOCK_AUDIT_LOGS.filter((l) => l.actor_role === 'admin').length, icon: <ShieldCheck size={16} /> },
    { label: 'System Events', value: MOCK_AUDIT_LOGS.filter((l) => l.actor_role === 'system').length, icon: <Cpu size={16} /> },
    { label: 'Compliance Rate', value: 100, icon: <ShieldCheck size={16} />, suffix: '%' },
  ];

  const filtered = MOCK_AUDIT_LOGS.filter((log) => {
    const matchSearch =
      !search ||
      log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'All' || log.action === actionFilter;
    return matchSearch && matchAction;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleExport = () => {
    const data = filtered.map((log) => ({
      Timestamp: new Date(log.created_at).toLocaleString('en-IN'),
      Actor: log.actor_name ?? log.actor_id,
      Role: log.actor_role ?? '',
      Action: log.action,
      Entity: log.entity_type,
      'Entity ID': log.entity_id,
      'Old Value': JSON.stringify(log.old_value ?? ''),
      'New Value': JSON.stringify(log.new_value ?? ''),
      Reason: log.reason ?? '',
    }));
    exportToCSV(data, 'lakshya-audit-log');
  };

  const actions = ['All', ...Array.from(new Set(MOCK_AUDIT_LOGS.map((l) => l.action)))];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-6xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>Audit Log</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            A detailed, immutable record of all administrative and goal-related changes across the platform.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
          style={{ background: '#FDB813', color: '#000000' }}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="rounded-xl p-4 card-hover"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <div className="flex items-center gap-2 mb-2" style={{ color: '#FDB813' }}>{s.icon}</div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#111827' }}>
              <CountUp end={s.value} duration={1.2} suffix={s.suffix} />
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Search + action filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9CA3AF' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search actor or action..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#111827' }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg flex-wrap" style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}>
          {actions.map((a) => (
            <button
              key={a}
              onClick={() => setActionFilter(a)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize"
              style={
                actionFilter === a
                  ? { background: '#FDB813', color: '#000000' }
                  : { color: '#9CA3AF' }
              }
            >
              {a === 'All' ? 'All Activity' : ACTION_LABELS[a] ?? a}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-xl overflow-auto"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Timestamp', 'Actor', 'Role', 'Action', 'Field', 'Old Value', 'New Value', 'Reason'].map((h) => (
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
            {filtered.map((log, idx) => {
              const actionStyle = ACTION_BADGE[log.action] ?? { bg: 'rgba(82,82,91,0.2)', color: '#6B7280' };
              const roleStyle = ROLE_BADGE[log.actor_role ?? 'employee'] ?? { bg: 'rgba(82,82,91,0.2)', color: '#6B7280' };
              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  className="transition-colors"
                  style={{ borderBottom: '1px solid #E5E7EB' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FFFBEC')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-mono text-xs" style={{ color: '#6B7280' }}>
                      {new Date(log.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </p>
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: '#9CA3AF' }}>
                      {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#111827' }}>
                    {log.actor_name ?? log.actor_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: roleStyle.bg, color: roleStyle.color }}
                    >
                      {log.actor_role ?? 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: actionStyle.bg, color: actionStyle.color }}
                    >
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>
                    {log.entity_type}
                  </td>
                  <td className="px-4 py-3">
                    {log.old_value ? (
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                      >
                        {String(Object.values(log.old_value)[0])}
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>null</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.new_value ? (
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}
                      >
                        {String(Object.values(log.new_value)[0])}
                      </span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>null</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-xs" style={{ color: '#6B7280' }}>
                    {log.reason ? (
                      <span className="line-clamp-2">{log.reason}</span>
                    ) : (
                      <span style={{ color: '#9CA3AF' }}>—</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm" style={{ color: '#9CA3AF' }}>
            No audit entries match your search.
          </div>
        )}

        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}
        >
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            {filtered.length} events
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
