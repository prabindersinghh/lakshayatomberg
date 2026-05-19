import { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { MOCK_AUDIT_LOGS } from '@/lib/mockData';
import { exportToCSV } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import { Download, Search, ShieldCheck, Activity, Cpu } from 'lucide-react';

const ACTION_LABELS: Record<string, string> = {
  edit_target: 'Goal Revision',
  approve: 'Approval',
  lock: 'Freeze Period',
  return: 'Return for Rework',
  unlock: 'Entity Deletion',
  edit_actual: 'KRA Approval',
};

const ACTION_COLORS: Record<string, string> = {
  edit_target: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approve: 'bg-green-100 text-green-700 border-green-200',
  lock: 'bg-gray-100 text-gray-600 border-gray-200',
  return: 'bg-red-100 text-red-700 border-red-200',
  unlock: 'bg-purple-100 text-purple-700 border-purple-200',
  edit_actual: 'bg-blue-100 text-blue-700 border-blue-200',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-yellow-100 text-yellow-700',
  manager: 'bg-blue-100 text-blue-700',
  employee: 'bg-gray-100 text-gray-600',
  system: 'bg-purple-100 text-purple-700',
};

export function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const stats = [
    { label: 'Total Events', value: MOCK_AUDIT_LOGS.length.toLocaleString(), icon: <Activity size={16} /> },
    { label: 'Admin Actions', value: MOCK_AUDIT_LOGS.filter((l) => l.actor_role === 'admin').length, icon: <ShieldCheck size={16} /> },
    { label: 'System Events', value: MOCK_AUDIT_LOGS.filter((l) => l.actor_role === 'system').length, icon: <Cpu size={16} /> },
    { label: 'Compliance Rate', value: '100%', icon: <ShieldCheck size={16} /> },
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

  const actions = ['All', ...new Set(MOCK_AUDIT_LOGS.map((l) => l.action))];

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Audit Log' }]} />
      <div className="p-6 max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Audit Log</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              A detailed, immutable record of all administrative and goal-related changes across the platform.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FDB813] text-gray-900 text-sm font-semibold hover:bg-yellow-400 transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 text-gray-400 mb-2">{s.icon}</div>
              <div className="font-mono text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs + search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor or action..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg flex-wrap">
            {actions.map((a) => (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${
                  actionFilter === a
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {a === 'All' ? 'All Activity' : ACTION_LABELS[a] ?? a}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {['Timestamp', 'Actor', 'Role', 'Action', 'Field Changed', 'Old Value', 'New Value', 'Reason'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-yellow-50/20 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-mono text-xs text-gray-700">
                      {new Date(log.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </p>
                    <p className="font-mono text-[10px] text-gray-400">
                      {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {log.actor_name ?? log.actor_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${ROLE_COLORS[log.actor_role ?? 'employee'] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.actor_role ?? 'unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.entity_type}
                  </td>
                  <td className="px-4 py-3">
                    {log.old_value ? (
                      <span className="font-mono text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded">
                        {Object.values(log.old_value)[0] as string}
                      </span>
                    ) : (
                      <span className="text-gray-300">null</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.new_value ? (
                      <span className="font-mono text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded">
                        {String(Object.values(log.new_value)[0])}
                      </span>
                    ) : (
                      <span className="text-gray-300">null</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                    {log.reason ? (
                      <span className="line-clamp-2">{log.reason}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              No audit entries match your search.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
