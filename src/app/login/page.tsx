'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isEmailValid = useMemo(() => (email ? validateEmail(email) : true), [email]);
  const isPasswordValid = useMemo(() => (password ? password.length >= 1 : true), [password]);
  const isFormValid = isEmailValid && isPasswordValid && email.length > 0 && password.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password, remember }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          toast.success('Welcome back!');
          router.push('/');
          return;
        }

        if (res.status === 429) {
          setMessage(data?.message || 'Too many login attempts. Please try again later.');
          return;
        }
        if (res.status === 401 || res.status === 403) {
          setMessage(data?.message || 'Invalid credentials.');
          return;
        }

        setMessage(data?.message || 'Login failed');
      } catch (err: any) {
        setMessage(err?.message || 'Login failed');
      }
    });
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue"
        footer={(
          <div className="space-y-4">
            {/* Main footer links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
              <Link href="/forgot-password" className="text-slate-600 hover:text-amber-600 transition-colors text-center sm:text-left">
                Forgot password?
              </Link>
              <div className="text-slate-600 text-center sm:text-right">
                Don't have an account?{' '}
                <Link href="/register" className="text-slate-600 hover:text-amber-600 transition-colors">Register here</Link>
              </div>
            </div>
            
            {/* Terms and Privacy links */}
            <div className="text-center text-xs text-slate-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="hover:text-amber-600 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="hover:text-amber-600 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Login form">
          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="size-4 text-slate-400" aria-hidden />}
            error={email && !isEmailValid ? 'Invalid email address' : undefined}
            required
          />

          <PasswordField
            label="Password"
            placeholder="Your secure password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={password === '' ? undefined : !isPasswordValid ? 'Password is required' : undefined}
            required
          />

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isPending}
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            aria-busy={isPending}
          >
            <span className="mr-2">{isPending ? 'Signing in...' : 'Sign in'}</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>

          {message && (
            <p className="text-center text-sm text-red-600" role="alert">{message}</p>
          )}

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>
          <SocialAuthButtons showGoogle={false} showGithub={false} />
        </form>
      </AuthCard>
    </AnimatedBackground>
  );
}
