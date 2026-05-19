import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_CREDENTIALS } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const profile = await login(data.email, data.password);
      if (!profile) {
        toast.error('Invalid credentials. Use the demo accounts below.');
        return;
      }
      const redirect =
        profile.role === 'admin' ? '/admin' :
        profile.role === 'manager' ? '/manager' :
        '/employee';
      navigate(redirect);
      toast.success('Welcome back!');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-gray-900 flex-col relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, #FDB813 0%, transparent 50%), radial-gradient(circle at 75% 75%, #FDB813 0%, transparent 50%)',
            }}
          />
        </div>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#FDB813 1px, transparent 1px), linear-gradient(90deg, #FDB813 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#FDB813] flex items-center justify-center">
              <div className="w-4.5 h-4.5 rounded-full bg-[#FDB813]" />
            </div>
            <div>
              <span className="text-white font-bold text-xl font-heading">◎ Lakshya</span>
              <p className="text-gray-500 text-[10px] uppercase tracking-widest">Goal Tracking Portal</p>
            </div>
          </div>

          {/* Atomberg logo area */}
          <div className="flex-1 flex flex-col items-start justify-center">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#FDB813]/10 border border-[#FDB813]/20 rounded-full px-4 py-1.5 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#FDB813] animate-pulse" />
                <span className="text-[#FDB813] text-xs font-medium tracking-wide">SYSTEM ONLINE · FY26 Q2</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white leading-tight font-heading mb-6">
              Every goal.<br />
              Every quarter.<br />
              <span className="text-[#FDB813]">One platform.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-sm leading-relaxed">
              Atomberg's precision-engineered workspace for strategic alignment and high-performance execution.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 w-full max-w-sm">
              {[
                { label: 'Active Goals', value: '1,248' },
                { label: 'Completion Rate', value: '88%' },
                { label: 'Employees', value: '340+' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="font-mono text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Atomberg branding */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FDB813] flex items-center justify-center">
              <span className="text-black font-black text-sm font-heading">a</span>
            </div>
            <span className="text-gray-500 text-sm">atomberg technologies</span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Support link */}
        <div className="flex justify-end p-6">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 bg-white rounded-full px-4 py-1.5 transition-colors">
            <Shield size={14} />
            Support
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-gray-900 font-heading">Sign In</h2>
                <p className="text-gray-500 text-sm mt-1">Enter your internal credentials to access the portal.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Official Email
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="name@atomberg.com"
                      className={cn(
                        'w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-all',
                        errors.email ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-gray-600">Password</label>
                    <button type="button" className="text-xs text-[#FDB813] hover:text-yellow-600 font-medium">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={cn(
                        'w-full pl-10 pr-10 py-2.5 rounded-lg border bg-white text-sm transition-all',
                        errors.password ? 'border-red-400' : 'border-gray-200 hover:border-gray-300'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <input
                    {...register('remember')}
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 rounded border-gray-300 accent-[#FDB813]"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600">
                    Keep me signed in for 30 days
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#FDB813] text-gray-900 font-semibold py-3 rounded-lg hover:bg-yellow-400 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Restricted Access. By logging in, you agree to our{' '}
                <button className="text-[#FDB813] hover:underline">Internal Usage Policy</button>.
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Demo Credentials
              </p>
              <div className="space-y-2">
                {DEMO_CREDENTIALS.map((c) => (
                  <button
                    key={c.role}
                    onClick={() => fillDemo(c.email, c.password)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:border-[#FDB813] hover:bg-yellow-50 transition-all text-left group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">
                        {c.role}
                      </span>
                      <p className="font-mono text-[10px] text-gray-400">{c.email}</p>
                    </div>
                    <span className="font-mono text-[10px] text-gray-300 group-hover:text-[#FDB813]">
                      Demo@1234
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest">
              Powered by Atomberg Technologies · Lakshya v2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
