import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_CREDENTIALS } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginForm = z.infer<typeof loginSchema>;

const ROLE_COLORS: Record<string, string> = {
  Employee: '#3B82F6',
  Manager: '#10B981',
  Admin: '#FDB813',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const profile = await login(data.email, data.password);
      if (!profile) {
        toast.error('Invalid credentials. Use the demo accounts below.');
        return;
      }
      const redirect = profile.role === 'admin' ? '/admin' : profile.role === 'manager' ? '/manager' : '/employee';
      navigate(redirect);
      toast.success(`Welcome, ${profile.full_name}!`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#FFFFFF' }}>
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{ background: '#000000', borderRight: '1px solid #1F1F1F' }}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #FDB813, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#FDB813 1px, transparent 1px), linear-gradient(90deg, #FDB813 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }} />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img src="/atomberg-logo.png" alt="Atomberg" style={{ width: '220px', height: 'auto' }} className="object-contain" />
          </motion.div>

          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8 text-xs font-medium"
                style={{ background: 'rgba(253,184,19,0.1)', border: '1px solid rgba(253,184,19,0.2)', color: '#FDB813' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#FDB813] animate-pulse" />
                SYSTEM ONLINE · FY 2026-27 · Q1 WINDOW OPEN
              </div>

              <h1 className="text-5xl font-bold text-white leading-[1.1] font-heading mb-6">
                Every goal.<br />
                Every quarter.<br />
                <span style={{ color: '#FDB813' }}>One platform.</span>
              </h1>
              <p className="text-[#A1A1AA] text-lg max-w-sm leading-relaxed">
                Atomberg's precision-engineered workspace for strategic alignment and high-performance execution.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="grid grid-cols-3 gap-6 mt-12"
            >
              {[
                { label: 'Active Goals', value: '1,248' },
                { label: 'Avg Score', value: '84.2%' },
                { label: 'Employees', value: '340+' },
              ].map((s) => (
                <div key={s.label}
                  className="p-4 rounded-xl"
                  style={{ background: '#141414', border: '1px solid #2A2A2A' }}
                >
                  <div className="font-mono text-2xl font-bold text-white">{s.value}</div>
                  <div style={{ color: '#71717A' }} className="text-xs mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          <p className="text-[#52525B] text-xs">
            © 2026 Atomberg Technologies Pvt. Ltd. · Internal use only
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: '#FFFFFF' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm"
        >
          {/* Form card */}
          <div
            className="rounded-2xl p-8 mb-4"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(253,184,19,0.15)' }}>
                  <Zap size={16} style={{ color: '#FDB813' }} />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-heading" style={{ color: '#111827' }}>Welcome back</h2>
              <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Sign in to access your goals portal.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Official Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52525B]" />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@atomberg.demo"
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all',
                      'border',
                      errors.email
                        ? 'border-red-500'
                        : 'border-gray-200 hover:border-gray-300',
                    )}
                    style={{ background: '#FFFFFF', color: '#111827' }}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#374151' }}>Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn(
                      'w-full pl-10 pr-10 py-2.5 rounded-lg text-sm transition-all border',
                      errors.password ? 'border-red-500' : 'border-gray-200 hover:border-gray-300',
                    )}
                    style={{ background: '#FFFFFF', color: '#111827' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#A1A1AA]"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm text-black transition-all disabled:opacity-50"
                style={{ background: '#FDB813' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(253,184,19,0.3)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
              >
                {isLoading
                  ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  : <><span>Sign In</span><ArrowRight size={16} /></>
                }
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          <div
            className="rounded-xl p-4"
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB' }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>
              Demo Accounts
            </p>
            <div className="space-y-2">
              {DEMO_CREDENTIALS.map((c) => (
                <motion.button
                  key={c.role}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => { setValue('email', c.email); setValue('password', c.password); }}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all"
                  style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = ROLE_COLORS[c.role] + '66';
                    (e.currentTarget as HTMLButtonElement).style.background = ROLE_COLORS[c.role] + '0D';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E7EB';
                    (e.currentTarget as HTMLButtonElement).style.background = '#F9FAFB';
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-black"
                      style={{ background: ROLE_COLORS[c.role] }}>
                      {c.role[0]}
                    </div>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: '#111827' }}>{c.role}</p>
                      <p className="font-mono text-[10px]" style={{ color: '#9CA3AF' }}>{c.email}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#52525B]">Demo@1234</span>
                </motion.button>
              ))}
            </div>
          </div>

          <p className="text-center text-[10px] text-[#52525B] mt-4 uppercase tracking-widest">
            Lakshya v2.0 · Atomberg Technologies
          </p>
        </motion.div>
      </div>
    </div>
  );
}
