import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_ORG_COMPLETION } from '@/lib/mockData';
import { exportToCSV } from '@/lib/export';
import { getInitials } from '@/lib/utils';
import { Download } from 'lucide-react';

type CellStatus = 'done' | 'pending' | 'not_started';

function StatusCell({ val }: { val: boolean }) {
  if (val) {
    return (
      <td className="px-3 py-3 text-center">
        <span style={{ color: '#10B981', fontSize: '15px' }}>✓</span>
      </td>
    );
  }
  return (
    <td className="px-3 py-3 text-center">
      <span style={{ color: '#9CA3AF', fontSize: '14px' }}>—</span>
    </td>
  );
}

function PendingCell({ goalSet }: { goalSet: boolean }) {
  if (!goalSet) {
    return (
      <td className="px-3 py-3 text-center">
        <span style={{ color: '#9CA3AF', fontSize: '14px' }}>—</span>
      </td>
    );
  }
  return (
    <td className="px-3 py-3 text-center">
      <span style={{ color: '#FDB813', fontSize: '14px' }}>⏳</span>
    </td>
  );
}

export function CompletionGridPage() {
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [mgrFilter, setMgrFilter] = useState('All Managers');

  const departments = ['All Departments', ...Array.from(new Set(MOCK_ORG_COMPLETION.map((e) => e.dept)))];
  const managers = ['All Managers', ...Array.from(new Set(MOCK_ORG_COMPLETION.map((e) => e.manager)))];

  const filtered = MOCK_ORG_COMPLETION.filter((e) => {
    if (deptFilter !== 'All Departments' && e.dept !== deptFilter) return false;
    if (mgrFilter !== 'All Managers' && e.manager !== mgrFilter) return false;
    return true;
  });

  const handleExport = () => {
    const data = filtered.map((e) => ({
      Employee: e.name,
      Department: e.dept,
      Manager: e.manager,
      'Goal Set': e.goalSet ? '✓' : '—',
      Approved: e.approved ? '✓' : '—',
      'Q1 Emp': e.q1Emp ? '✓' : '—',
      'Q1 Mgr': e.q1Mgr ? '✓' : '—',
      'Q2 Emp': e.q2Emp ? '✓' : '—',
      'Q2 Mgr': e.q2Mgr ? '✓' : '—',
      'Q3 Emp': e.q3Emp ? '✓' : '—',
      'Q3 Mgr': e.q3Mgr ? '✓' : '—',
      'Q4 Emp': e.q4Emp ? '✓' : '—',
      'Q4 Mgr': e.q4Mgr ? '✓' : '—',
    }));
    exportToCSV(data, 'lakshya-completion-grid');
  };

  const selectStyle = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    color: '#6B7280',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-full mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
            Completion Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
            Real-time RAG status of goal and check-in completion across the organisation.
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={selectStyle}>
          {departments.map((d) => <option key={d} style={{ background: '#FFFFFF' }}>{d}</option>)}
        </select>
        <select value={mgrFilter} onChange={(e) => setMgrFilter(e.target.value)} style={selectStyle}>
          {managers.map((m) => <option key={m} style={{ background: '#FFFFFF' }}>{m}</option>)}
        </select>
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl overflow-auto"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                style={{ color: '#9CA3AF', minWidth: '200px' }}
              >
                Employee
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                Dept
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                Goal Set
              </th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: '#9CA3AF' }}>
                Approved
              </th>
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((q) => (
                <th
                  key={q}
                  colSpan={2}
                  className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: '#9CA3AF', borderLeft: '1px solid #E5E7EB' }}
                >
                  {q}
                </th>
              ))}
            </tr>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <td colSpan={4} />
              {(['Q1', 'Q2', 'Q3', 'Q4'] as const).flatMap((q) => [
                <td
                  key={`${q}-emp`}
                  className="text-center text-[10px] px-2 py-1.5"
                  style={{ color: '#9CA3AF', borderLeft: '1px solid #E5E7EB' }}
                >
                  Emp
                </td>,
                <td key={`${q}-mgr`} className="text-center text-[10px] px-2 py-1.5" style={{ color: '#9CA3AF' }}>
                  Mgr
                </td>,
              ])}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, idx) => (
              <motion.tr
                key={emp.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.2 }}
                className="transition-colors"
                style={{ borderBottom: '1px solid #E5E7EB' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#FFFBEC')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: '#FDB813', color: '#000000' }}
                    >
                      {getInitials(emp.name)}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#111827' }}>{emp.name}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{emp.manager}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{emp.dept}</td>
                <StatusCell val={emp.goalSet} />
                {emp.approved ? <StatusCell val={true} /> : <PendingCell goalSet={emp.goalSet} />}
                <StatusCell val={emp.q1Emp} />
                <StatusCell val={emp.q1Mgr} />
                <StatusCell val={emp.q2Emp} />
                <StatusCell val={emp.q2Mgr} />
                <StatusCell val={emp.q3Emp} />
                <StatusCell val={emp.q3Mgr} />
                <StatusCell val={emp.q4Emp} />
                <StatusCell val={emp.q4Mgr} />
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid #E5E7EB', background: '#F9FAFB' }}
        >
          <p className="text-xs" style={{ color: '#9CA3AF' }}>
            Showing {filtered.length} of {MOCK_ORG_COMPLETION.length} employees
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#6B7280' }}>
            <span className="font-semibold uppercase tracking-wide mr-1" style={{ color: '#9CA3AF' }}>Legend:</span>
            <span style={{ color: '#10B981' }}>✓ Completed</span>
            <span style={{ color: '#FDB813' }}>⏳ Pending</span>
            <span style={{ color: '#9CA3AF' }}>— Not Started</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
