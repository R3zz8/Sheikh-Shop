'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import AuthCard from '@/components/auth/AuthCard';
import InputField from '@/components/auth/InputField';
import AnimatedBackground from '@/components/auth/AnimatedBackground';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState('');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from URL params or localStorage
  useState(() => {
    const emailFromParams = searchParams.get('email');
    const emailFromStorage = localStorage.getItem('pendingVerificationEmail');
    
    if (emailFromParams) {
      setEmail(emailFromParams);
      localStorage.setItem('pendingVerificationEmail', emailFromParams);
    } else if (emailFromStorage) {
      setEmail(emailFromStorage);
    }
  });

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!verificationCode.trim() || !email.trim()) {
      setMessage('Please enter both email and verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setMessage('Verification code must be 6 digits');
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode }),
        });

        const data = await res.json();

        if (res.ok && data?.success) {
          setIsVerified(true);
          toast.success('Email verified successfully!');
          localStorage.removeItem('pendingVerificationEmail');
          
          // Redirect to login after a short delay
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          setMessage(data?.message || 'Verification failed');
        }
      } catch (err: any) {
        setMessage(err?.message || 'Verification failed');
      }
    });
  }

  async function handleResendCode() {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data?.success) {
        toast.success('Verification code sent successfully!');
        setMessage('A new verification code has been sent to your email');
      } else {
        setMessage(data?.message || 'Failed to send verification code');
      }
    } catch (err: any) {
      setMessage(err?.message || 'Failed to send verification code');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AnimatedBackground>
      <AuthCard
        title={isVerified ? "Email Verified!" : "Verify Your Email"}
        subtitle={isVerified ? "You can now log in to your account" : "Enter the 6-digit code sent to your email"}
        footer={(
          <div className="space-y-4">
            <div className="text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-slate-600 hover:text-amber-600 transition-colors">Register here</Link>
            </div>
            
            <div className="text-center text-sm text-slate-600">
              Already verified?{' '}
              <Link href="/login" className="text-slate-600 hover:text-amber-600 transition-colors">Login here</Link>
            </div>
          </div>
        )}
      >
        {isVerified ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <p className="text-slate-600">Your email has been successfully verified!</p>
            <p className="text-sm text-slate-500">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <InputField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="size-4 text-slate-400" aria-hidden />}
              required
            />

            <InputField
              label="Verification Code"
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={e => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              maxLength={6}
              pattern="[0-9]{6}"
              required
            />

            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.includes('successfully') ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <XCircle className="size-4" />
                )}
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={!verificationCode.trim() || !email.trim() || isPending}
              className="group relative inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium px-4 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
              aria-busy={isPending}
            >
              {isPending ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || !email.trim()}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`size-4 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Sending...' : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </AnimatedBackground>
  );
}
