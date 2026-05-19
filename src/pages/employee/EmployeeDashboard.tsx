import { useAuth } from '@/contexts/AuthContext';
import { MOCK_GOAL_SHEETS, MOCK_GOALS, MOCK_ACHIEVEMENTS, MOCK_CYCLE } from '@/lib/mockData';
import { ScoreBadge } from '@/components/ui/ScoreBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { computeWeightedScore } from '@/lib/scoring';
import { formatDate } from '@/lib/utils';
import { Target, CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const sheet = MOCK_GOAL_SHEETS.find((s) => s.employee_id === user?.id);
  const goals = sheet ? MOCK_GOALS.filter((g) => g.sheet_id === sheet.id) : [];
  const achievements = MOCK_ACHIEVEMENTS.filter((a) => goals.some((g) => g.id === a.goal_id));

  const latestAchievements = goals.map((g) => {
    const q2 = achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q2');
    const q1 = achievements.find((a) => a.goal_id === g.id && a.quarter === 'Q1');
    const latest = q2 ?? q1;
    return { score: latest?.score ?? 0, weightage: g.weightage };
  });

  const overallScore = computeWeightedScore(latestAchievements);

  const stats = [
    {
      label: 'My Goals',
      value: goals.length,
      icon: <Target size={20} />,
      color: '#60A5FA',
      glow: 'rgba(96,165,250,0.15)',
    },
    {
      label: 'Completed',
      value: achievements.filter((a) => a.status === 'completed').length,
      icon: <CheckCircle2 size={20} />,
      color: '#10B981',
      glow: 'rgba(16,185,129,0.15)',
    },
    {
      label: 'On Track',
      value: achievements.filter((a) => a.status === 'on_track').length,
      icon: <Clock size={20} />,
      color: '#FDB813',
      glow: 'rgba(253,184,19,0.15)',
    },
    {
      label: 'At Risk',
      value: achievements.filter((a) => (a.score ?? 0) < 50).length,
      icon: <AlertCircle size={20} />,
      color: '#EF4444',
      glow: 'rgba(239,68,68,0.15)',
    },
  ];

  const scoreColor =
    overallScore >= 80 ? '#10B981' : overallScore >= 50 ? '#FDB813' : '#EF4444';
  const circumference = 2 * Math.PI * 28;
  const dashOffset = circumference - (overallScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ backgroundColor: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-5xl mx-auto space-y-6"
    >
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>
            Good morning, {user?.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
            {MOCK_CYCLE.name} · {sheet ? `Goal sheet is ${sheet.status}` : 'No goal sheet yet'}
          </p>
        </div>
        {sheet && overallScore > 0 && (
          <div className="flex items-center gap-3">
            <TrendingUp size={16} style={{ color: '#9CA3AF' }} />
            {/* Score ring */}
            <div className="relative flex items-center justify-center w-16 h-16">
              <svg width="64" height="64" className="rotate-[-90deg]">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#2A2A2A" strokeWidth="4" />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className="absolute font-mono text-xs font-bold"
                style={{ color: scoreColor }}
              >
                {overallScore.toFixed(0)}
              </span>
            </div>
            <ScoreBadge score={overallScore} size="lg" showLabel />
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, index) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25 }}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
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
          </motion.div>
        ))}
      </div>

      {/* Goal status card */}
      {sheet ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '20px',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>
              Goal Sheet Status
            </h2>
            <StatusBadge status={sheet.status} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Total Weightage</p>
              <p className="font-mono font-bold mt-0.5" style={{ color: '#111827' }}>
                {sheet.total_weightage}%
              </p>
            </div>
            {sheet.submitted_at && (
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Submitted</p>
                <p className="font-medium mt-0.5" style={{ color: '#6B7280' }}>
                  {formatDate(sheet.submitted_at)}
                </p>
              </div>
            )}
            {sheet.approved_at && (
              <div>
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Approved</p>
                <p className="font-medium mt-0.5" style={{ color: '#6B7280' }}>
                  {formatDate(sheet.approved_at)}
                </p>
              </div>
            )}
            {sheet.return_reason && (
              <div className="col-span-full">
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Return Reason</p>
                <p
                  className="text-sm mt-0.5 rounded-lg p-2"
                  style={{
                    color: '#F87171',
                    backgroundColor: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                  }}
                >
                  {sheet.return_reason}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate('/employee/goals')}
              className="text-sm font-medium hover:underline"
              style={{ color: '#FDB813' }}
            >
              View My Goals →
            </button>
            {sheet.status === 'approved' && (
              <button
                onClick={() => navigate('/employee/checkin')}
                className="text-sm font-medium hover:underline ml-4"
                style={{ color: '#60A5FA' }}
              >
                Q2 Check-in →
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.25 }}
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <Target size={40} style={{ color: '#9CA3AF', margin: '0 auto 12px' }} />
          <h3 className="font-semibold" style={{ color: '#6B7280' }}>No Goals Yet</h3>
          <p className="text-sm mt-1 mb-4" style={{ color: '#9CA3AF' }}>
            Start by creating your goal sheet for {MOCK_CYCLE.name}
          </p>
          <button
            onClick={() => navigate('/employee/goals')}
            className="font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
            style={{ backgroundColor: '#FDB813', color: '#000000' }}
          >
            Create Goal Sheet
          </button>
        </motion.div>
      )}

      {/* Cycle timeline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.25 }}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '20px',
        }}
      >
        <h2 className="font-semibold font-heading mb-4" style={{ color: '#111827' }}>
          Cycle Timeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Goal Setting', open: MOCK_CYCLE.goal_setting_open, close: MOCK_CYCLE.goal_setting_close },
            { label: 'Q1 Check-in', open: MOCK_CYCLE.q1_open!, close: MOCK_CYCLE.q1_close! },
            { label: 'Q2 Check-in', open: MOCK_CYCLE.q2_open!, close: MOCK_CYCLE.q2_close! },
            { label: 'Q3 Check-in', open: MOCK_CYCLE.q3_open!, close: MOCK_CYCLE.q3_close! },
            { label: 'Q4 / Annual', open: MOCK_CYCLE.q4_open!, close: MOCK_CYCLE.q4_close! },
          ].map((period, i) => {
            const isActive = i === 1;
            return (
              <div
                key={period.label}
                style={{
                  borderRadius: '8px',
                  padding: '12px',
                  border: isActive ? '1px solid #FDB813' : '1px solid #2A2A2A',
                  backgroundColor: isActive ? '#FFFBEC' : '#F9FAFB',
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: isActive ? '#FDB813' : '#A1A1AA' }}
                >
                  {period.label}
                </p>
                <p className="font-mono text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
                  {new Date(period.open).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  {' – '}
                  {new Date(period.close).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                {isActive && (
                  <span
                    className="inline-block mt-1 text-[10px] font-medium rounded-full px-2 py-0.5"
                    style={{ color: '#FDB813', backgroundColor: 'rgba(253,184,19,0.1)' }}
                  >
                    Active
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
