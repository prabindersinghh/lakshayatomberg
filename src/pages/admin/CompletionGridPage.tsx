import { useState } from 'react';
import { Topbar } from '@/components/layout/Topbar';
import { MOCK_ORG_COMPLETION } from '@/lib/mockData';
import { exportToCSV } from '@/lib/export';
import { getInitials } from '@/lib/utils';
import { Download, CheckCircle2, XCircle, Clock, Circle } from 'lucide-react';

type CellStatus = 'done' | 'partial' | 'not_started' | 'overdue';

interface CellProps {
  status: CellStatus;
  onClick?: () => void;
}

function RAGCell({ status, onClick }: CellProps) {
  const config = {
    done: { icon: <CheckCircle2 size={16} className="text-green-600" />, bg: 'bg-green-50 hover:bg-green-100' },
    partial: { icon: <Clock size={16} className="text-yellow-500" />, bg: 'bg-yellow-50 hover:bg-yellow-100' },
    overdue: { icon: <XCircle size={16} className="text-red-500" />, bg: 'bg-red-50 hover:bg-red-100' },
    not_started: { icon: <Circle size={16} className="text-gray-300" />, bg: 'hover:bg-gray-50' },
  };
  const { icon, bg } = config[status];

  return (
    <td
      onClick={onClick}
      className={`px-3 py-2.5 text-center ${bg} ${onClick ? 'cursor-pointer' : ''} transition-colors`}
    >
      <div className="flex justify-center">{icon}</div>
    </td>
  );
}

function getStatus(done: boolean, started: boolean = true): CellStatus {
  if (done) return 'done';
  if (!started) return 'not_started';
  return 'partial';
}

export function CompletionGridPage() {
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [mgrFilter, setMgrFilter] = useState('All Managers');

  const departments = ['All Departments', ...new Set(MOCK_ORG_COMPLETION.map((e) => e.dept))];
  const managers = ['All Managers', ...new Set(MOCK_ORG_COMPLETION.map((e) => e.manager))];

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
      'Goal Set': e.goalSet ? '✓' : '✗',
      Approved: e.approved ? '✓' : '✗',
      'Q1 Emp': e.q1Emp ? '✓' : '✗',
      'Q1 Mgr': e.q1Mgr ? '✓' : '✗',
      'Q2 Emp': e.q2Emp ? '✓' : '✗',
      'Q2 Mgr': e.q2Mgr ? '✓' : '✗',
      'Q3 Emp': e.q3Emp ? '✓' : '✗',
      'Q3 Mgr': e.q3Mgr ? '✓' : '✗',
      'Q4 Emp': e.q4Emp ? '✓' : '✗',
      'Q4 Mgr': e.q4Mgr ? '✓' : '✗',
    }));
    exportToCSV(data, 'lakshya-completion-grid');
  };

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Completion Grid' }]} />
      <div className="p-6 max-w-full mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Completion Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Real-time RAG status of goal and check-in completion across the organisation.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-700"
          >
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={mgrFilter}
            onChange={(e) => setMgrFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-700"
          >
            {managers.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        {/* Grid */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-[200px]">
                  Employee
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Goal Set
                </th>
                <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Approved
                </th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500" colSpan={2}>
                  Q1
                </th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500" colSpan={2}>
                  Q2
                </th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500" colSpan={2}>
                  Q3
                </th>
                <th className="text-center px-3 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500" colSpan={2}>
                  Q4
                </th>
              </tr>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <td className="px-4 py-1.5" />
                <td className="text-center text-[10px] text-gray-400 py-1.5"></td>
                <td className="text-center text-[10px] text-gray-400 py-1.5"></td>
                {(['Q1', 'Q2', 'Q3', 'Q4'] as const).flatMap((q) => [
                  <td key={`${q}-emp`} className="text-center text-[10px] text-gray-400 px-2 py-1.5">Emp</td>,
                  <td key={`${q}-mgr`} className="text-center text-[10px] text-gray-400 px-2 py-1.5">Mgr</td>,
                ])}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-yellow-50/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FDB813] flex items-center justify-center text-xs font-bold text-gray-900 shrink-0">
                        {getInitials(emp.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.dept}</p>
                      </div>
                    </div>
                  </td>
                  <RAGCell status={getStatus(emp.goalSet)} />
                  <RAGCell status={emp.approved ? 'done' : emp.goalSet ? 'partial' : 'not_started'} />
                  <RAGCell status={emp.q1Emp ? 'done' : emp.approved ? 'overdue' : 'not_started'} />
                  <RAGCell status={emp.q1Mgr ? 'done' : emp.q1Emp ? 'partial' : 'not_started'} />
                  <RAGCell status={emp.q2Emp ? 'done' : emp.q1Mgr ? 'partial' : 'not_started'} />
                  <RAGCell status={emp.q2Mgr ? 'done' : emp.q2Emp ? 'partial' : 'not_started'} />
                  <RAGCell status={emp.q3Emp ? 'done' : 'not_started'} />
                  <RAGCell status={emp.q3Mgr ? 'done' : 'not_started'} />
                  <RAGCell status={emp.q4Emp ? 'done' : 'not_started'} />
                  <RAGCell status={emp.q4Mgr ? 'done' : 'not_started'} />
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-400">Showing {filtered.length} of {MOCK_ORG_COMPLETION.length} employees</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="font-semibold uppercase tracking-wide text-gray-400 mr-1">Status Legend:</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-600" /> Completed / Approved</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-yellow-500" /> Pending Action</span>
              <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Overdue / Rejected</span>
              <span className="flex items-center gap-1"><Circle size={12} className="text-gray-300" /> Not Started</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
