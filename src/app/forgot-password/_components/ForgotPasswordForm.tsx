'use client';

import { useState } from 'react';
import { Mail, SendHorizontal } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState('');

  const emailValid = email ? validateEmail(email) : true;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValid) return;

    setLoading(true);
    setMessage(null);

    try {
      // Fetch CSRF token
      const csrfRes = await fetch('/api/csrf');
      const csrfData = await csrfRes.json();
      setCsrfToken(csrfData.csrfToken);

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, csrfToken: csrfData.csrfToken }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        toast.success('Password reset email sent! Check your inbox.');
        setMessage('Password reset email sent! Check your inbox.');
      } else {
        setMessage(data?.message || 'Failed to send reset email');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title="Forgot Password"
        subtitle="We'll send a reset link to your email"
        footer={(
          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            <Link href="/login" className="text-blue-700 hover:underline dark:text-blue-400">Back to login</Link>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Forgot password form">
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

          <button
            type="submit"
            className="group relative inline-flex w-full items-center justify-center rounded-xl bg-blue-600/90 text-white font-medium px-4 py-2.5 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
            aria-busy={loading}
          >
            <span className="mr-2">{loading ? 'Sending...' : 'Send reset link'}</span>
            <SendHorizontal className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </button>

          {message && (
            <p className="text-center text-sm text-red-600" role="alert">{message}</p>
          )}
        </form>
      </AuthCard>
    </AnimatedBackground>
  );
}
