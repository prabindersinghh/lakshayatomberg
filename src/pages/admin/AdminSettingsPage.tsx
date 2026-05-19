import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_CYCLE, MOCK_THRUST_AREAS } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';
import { Calendar, Tag, AlertTriangle, Plus, Trash2, Save } from 'lucide-react';

const INPUT_STYLE = {
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  color: '#111827',
  borderRadius: '8px',
  padding: '8px 12px',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
};

const SAVE_BUTTON_STYLE = {
  background: '#FDB813',
  color: '#000000',
  border: 'none',
  borderRadius: '8px',
  padding: '8px 18px',
  fontSize: '13px',
  fontWeight: '600',
  cursor: 'pointer',
};

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, duration: 0.28 } }),
};

export function AdminSettingsPage() {
  const [thrustAreas, setThrustAreas] = useState(MOCK_THRUST_AREAS.map((ta) => ({ ...ta })));
  const [newThrust, setNewThrust] = useState('');

  const [escalationRules, setEscalationRules] = useState([
    { id: 1, trigger: 'Goal not submitted within 7 days of cycle open', targets: ['Employee', 'Manager'], days: 7 },
    { id: 2, trigger: 'Goal not approved within 5 days of submission', targets: ['Manager', 'HR'], days: 5 },
    { id: 3, trigger: 'Check-in not completed within active window', targets: ['Employee', 'Manager', 'HR'], days: 3 },
  ]);

  const handleAddThrust = () => {
    if (!newThrust.trim()) return;
    setThrustAreas((prev) => [
      ...prev,
      { id: `ta-${Date.now()}`, name: newThrust.trim(), cycle_id: 'cycle-001', is_active: true },
    ]);
    setNewThrust('');
  };

  const handleRemoveThrust = (id: string) => {
    setThrustAreas((prev) => prev.filter((ta) => ta.id !== id));
  };

  const cycleWindows = [
    { label: 'Goal Setting Window', open: MOCK_CYCLE.goal_setting_open, close: MOCK_CYCLE.goal_setting_close },
    { label: 'Q1 Check-in Window', open: MOCK_CYCLE.q1_open, close: MOCK_CYCLE.q1_close },
    { label: 'Q2 Check-in Window', open: MOCK_CYCLE.q2_open, close: MOCK_CYCLE.q2_close },
    { label: 'Q3 Check-in Window', open: MOCK_CYCLE.q3_open, close: MOCK_CYCLE.q3_close },
    { label: 'Q4 Check-in Window', open: MOCK_CYCLE.q4_open, close: MOCK_CYCLE.q4_close },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ background: '#FFFFFF', minHeight: '100vh' }}
      className="p-6 max-w-3xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>Admin Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
          Manage cycle configuration, thrust areas, and escalation rules.
        </p>
      </div>

      {/* Active Cycle */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={18} style={{ color: '#FDB813' }} />
          <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>Active Cycle</h2>
          <span
            className="ml-auto text-xs font-medium rounded-full px-2.5 py-0.5"
            style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }}
          >
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>Cycle Name</label>
            <input defaultValue={MOCK_CYCLE.name} style={INPUT_STYLE} />
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>Status</label>
            <div
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', color: '#10B981' }}
            >
              {MOCK_CYCLE.is_active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-5">
          {cycleWindows.map((w) => (
            <div key={w.label}>
              <label className="text-xs mb-1 block" style={{ color: '#9CA3AF' }}>{w.label}</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  defaultValue={w.open ?? ''}
                  placeholder="Open date"
                  style={INPUT_STYLE}
                />
                <input
                  defaultValue={w.close ?? ''}
                  placeholder="Close date"
                  style={INPUT_STYLE}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#9CA3AF' }}>
                {w.open && w.close ? `${formatDate(w.open)} → ${formatDate(w.close)}` : 'Not configured'}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4 flex justify-end" style={{ borderTop: '1px solid #E5E7EB' }}>
          <button style={SAVE_BUTTON_STYLE} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Save size={14} />
            Save Cycle
          </button>
        </div>
      </motion.div>

      {/* Thrust Areas */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <Tag size={18} style={{ color: '#FDB813' }} />
          <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>Thrust Areas</h2>
          <span className="ml-auto text-xs" style={{ color: '#9CA3AF' }}>
            {thrustAreas.length} active
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {thrustAreas.map((ta) => (
            <div
              key={ta.id}
              className="flex items-center justify-between p-3 rounded-lg transition-colors"
              style={{ border: '1px solid #E5E7EB', background: '#FFFFFF' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(253,184,19,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2A2A2A')}
            >
              <span className="text-sm font-medium" style={{ color: '#111827' }}>{ta.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium" style={{ color: '#10B981' }}>Active</span>
                <button
                  onClick={() => handleRemoveThrust(ta.id)}
                  className="transition-colors hover:opacity-100"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#52525B')}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={newThrust}
            onChange={(e) => setNewThrust(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddThrust()}
            placeholder="New thrust area name..."
            style={{ ...INPUT_STYLE, flex: 1 }}
          />
          <button
            onClick={handleAddThrust}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#FDB813', color: '#000000', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </motion.div>

      {/* Escalation Rules */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="rounded-xl p-5"
        style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
      >
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={18} style={{ color: '#FDB813' }} />
          <h2 className="font-semibold font-heading" style={{ color: '#111827' }}>Escalation Rules</h2>
        </div>

        <div className="space-y-3">
          {escalationRules.map((rule, i) => (
            <div
              key={rule.id}
              className="p-4 rounded-lg"
              style={{ border: '1px solid #E5E7EB', background: '#FFFFFF' }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm font-medium" style={{ color: '#111827' }}>{rule.trigger}</p>
                <div
                  className="text-xs font-mono font-bold px-2 py-0.5 rounded shrink-0"
                  style={{ background: 'rgba(253,184,19,0.1)', color: '#FDB813' }}
                >
                  {rule.days}d
                </div>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs" style={{ color: '#9CA3AF' }}>Trigger after (days):</label>
                <input
                  type="number"
                  defaultValue={rule.days}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      setEscalationRules((prev) =>
                        prev.map((r) => (r.id === rule.id ? { ...r, days: val } : r))
                      );
                    }
                  }}
                  style={{ ...INPUT_STYLE, width: '70px' }}
                />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>Notify:</span>
                {rule.targets.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-medium rounded-full px-2 py-0.5"
                    style={{ background: '#2A2A2A', color: '#6B7280', border: '1px solid #3A3A3A' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 flex items-center justify-between" style={{ borderTop: '1px solid #E5E7EB' }}>
          <button
            className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: '#FDB813' }}
          >
            <Plus size={14} />
            Add Rule
          </button>
          <button style={SAVE_BUTTON_STYLE} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Save size={14} />
            Save Rules
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
