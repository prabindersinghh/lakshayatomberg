import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS, MOCK_GOAL_SHEETS, MOCK_GOALS, MOCK_ACHIEVEMENTS, MOCK_CHECKINS } from '@/lib/mockData';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { computeWeightedScore } from '@/lib/scoring';
import { getInitials } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, Users, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

export function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const reports = MOCK_USERS.filter((u) => u.manager_id === user?.id);
  const reportSheets = MOCK_GOAL_SHEETS.filter((s) => reports.some((r) => r.id === s.employee_id));

  const pendingApprovals = reportSheets.filter((s) => s.status === 'submitted').length;
  const approved = reportSheets.filter((s) => s.status === 'approved').length;
  const checkinsDone = MOCK_CHECKINS.filter((c) => reports.some((r) => {
    const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === r.id);
    return sheet?.id === c.sheet_id && c.quarter === 'Q1';
  })).length;

  const stats = [
    {
      label: 'Team Members',
      value: reports.length,
      icon: <Users size={20} />,
      color: '#60A5FA',
      glow: 'rgba(96,165,250,0.15)',
      action: undefined as (() => void) | undefined,
    },
    {
      label: 'Pending Approvals',
      value: pendingApprovals,
      icon: <Clock size={20} />,
      color: '#FDB813',
      glow: 'rgba(253,184,19,0.15)',
      action: () => navigate('/manager/approvals'),
    },
    {
      label: 'Goals Approved',
      value: approved,
      icon: <CheckSquare size={20} />,
      color: '#10B981',
      glow: 'rgba(16,185,129,0.15)',
      action: undefined as (() => void) | undefined,
    },
    {
      label: 'Check-ins Done',
      value: checkinsDone,
      icon: <TrendingUp size={20} />,
      color: '#A78BFA',
      glow: 'rgba(167,139,250,0.15)',
      action: undefined as (() => void) | undefined,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
          Team Overview
        </h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          {user?.full_name} · {user?.department}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, index) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            onClick={s.action}
            className="text-left transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              cursor: s.action ? 'pointer' : 'default',
            }}
            onMouseEnter={(e) => {
              if (s.action) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#FDB813';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2A2A2A';
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: s.glow, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="font-mono text-2xl font-bold" style={{ color: '#111827' }}>
              <CountUp end={s.value} duration={1.5} />
            </div>
            <div className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              {s.label}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Team table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #E5E7EB' }}
        >
          <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>
            Direct Reports
          </h2>
          <button
            onClick={() => navigate('/manager/team')}
            className="text-sm font-medium hover:underline"
            style={{ color: '#FDB813' }}
          >
            View Full Dashboard →
          </button>
        </div>

        <div>
          {reports.map((report, idx) => {
            const sheet = reportSheets.find((s) => s.employee_id === report.id);
            const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];
            const achs = MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id));
            const scoreData = goals.map((g) => ({
              score:
                achs.find((a) => a.goal_id === g.id && a.quarter === 'Q2')?.score ??
                achs.find((a) => a.goal_id === g.id && a.quarter === 'Q1')?.score ?? 0,
              weightage: g.weightage,
            }));
            const overallScore = computeWeightedScore(scoreData);

            const scoreColor =
              overallScore >= 80 ? '#10B981' : overallScore >= 50 ? '#FDB813' : '#EF4444';
            const circumference = 2 * Math.PI * 12;
            const dashOffset = overallScore > 0
              ? circumference - (overallScore / 100) * circumference
              : circumference;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 + 0.2, duration: 0.2 }}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors"
                style={{
                  borderBottom: idx < reports.length - 1 ? '1px solid #2A2A2A' : 'none',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = '#FFFBEC';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ backgroundColor: '#FDB813', color: '#000000' }}
                >
                  {getInitials(report.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {report.full_name}
                  </p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                    {report.department}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px]" style={{ color: '#9CA3AF' }}>Goals</p>
                  <p className="font-mono text-sm font-bold" style={{ color: '#111827' }}>
                    {goals.length}
                  </p>
                </div>
                <div>
                  {sheet ? <StatusBadge status={sheet.status} /> : <StatusBadge status="draft" />}
                </div>
                {/* Mini score ring */}
                <div className="relative flex items-center justify-center w-8 h-8">
                  <svg width="32" height="32" className="rotate-[-90deg]">
                    <circle cx="16" cy="16" r="12" fill="none" stroke="#2A2A2A" strokeWidth="2.5" />
                    {overallScore > 0 && (
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="2.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                      />
                    )}
                  </svg>
                  {overallScore > 0 && (
                    <span
                      className="absolute font-mono text-[8px] font-bold"
                      style={{ color: scoreColor }}
                    >
                      {overallScore.toFixed(0)}
                    </span>
                  )}
                </div>
                <div>
                  {overallScore > 0 ? (
                    <ScoreBadge score={overallScore} size="sm" />
                  ) : (
                    <span className="text-xs" style={{ color: '#2A2A2A' }}>—</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
