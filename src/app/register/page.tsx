'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, User } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import PasswordField from '@/components/auth/PasswordField';
import PasswordStrength from '@/components/auth/PasswordStrength';
import SocialAuthButtons from '@/components/auth/SocialAuthButtons';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getChecks(password: string) {
  return {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const emailValid = useMemo(() => (email ? validateEmail(email) : true), [email]);
  const checks = useMemo(() => getChecks(password), [password]);
  const passwordsMatch = useMemo(() => (confirmPassword ? password === confirmPassword : true), [password, confirmPassword]);

  const formValid =
    fullName.trim().length > 0 &&
    validateEmail(email) &&
    checks.length && checks.upper && checks.lower && checks.number && checks.special &&
    password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      try {
        const [firstName, ...rest] = fullName.trim().split(' ');
        const lastName = rest.join(' ') || 'User'; // Fallback if no last name
        const safeFirstName = firstName || 'User'; // Fallback if no first name
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            email, 
            password, 
            firstName: safeFirstName, 
            lastName,
            username: `${safeFirstName.toLowerCase()}${Date.now()}` // Auto-generate username with safe fallback
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          toast.success('Account created successfully!');
          // Store email for verification page
          localStorage.setItem('pendingVerificationEmail', email);
          router.push('/verify-email');
          return;
        }
        if (res.status === 409) {
          setMessage(data?.message || 'Email already in use');
          return;
        }
        setMessage(data?.message || 'Registration failed');
      } catch (err: any) {
        setMessage(err?.message || 'Registration failed');
      }
    });
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="Create your account"
        subtitle="Join our premium experience"
        footer={(
          <div className="space-y-4">
            {/* Main footer link */}
            <div className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="text-slate-600 hover:text-amber-600 transition-colors">Login here</Link>
            </div>
            
            {/* Terms and Privacy links */}
            <div className="text-center text-xs text-slate-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="hover:text-amber-600 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="hover:text-amber-600 transition-colors">Privacy Policy</Link>
            </div>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-label="Register form">
          <InputField
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            icon={<User className="size-4 text-slate-400" aria-hidden />}
            required
          />

          <InputField
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            icon={<Mail className="size-4 text-slate-400" aria-hidden />}
            error={email && !emailValid ? 'Invalid email address' : undefined}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordField
              label="Password"
              placeholder="At least 12 chars, upper/lower/number/special"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />

            <PasswordField
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
              required
            />
          </div>

          <PasswordStrength password={password} />

          <button
            type="submit"
            disabled={!formValid || isPending}
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
            aria-busy={isPending}
          >
            <span className="mr-2">{isPending ? 'Creating account...' : 'Create account'}</span>
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
