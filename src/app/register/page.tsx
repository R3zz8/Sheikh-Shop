'use client';

import { useState, useTransition } from 'react';
import { registerAction } from './actions';
import { useRouter } from 'next/navigation';
import { Input, Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

function getPasswordStrength(password: string) {
  if (password.length < 6) return 'Weak';
  if (password.match(/[A-Z]/) && password.match(/[0-9]/) && password.length >= 8) return 'Strong';
  return 'Medium';
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; fullName?: string }>({});
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const passwordStrength = getPasswordStrength(password);

  function validate() {
    const errs: typeof errors = {};
    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) errs.email = 'Invalid email address.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    startTransition(async () => {
      try {
        const result = await registerAction(email, password);
        if (result.success) {
          router.push('/');
        } else {
          setMessage('Registration failed');
        }
      } catch (err: any) {
        setMessage(err.message || 'Registration failed');
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white/80 to-blue-100/60">
      <Card className="w-full max-w-md p-0 bg-white/40 backdrop-blur-md shadow-2xl rounded-2xl border border-white/30">
        <CardHeader className="pt-8 pb-2">
          <CardTitle className="text-3xl font-bold text-center tracking-wide">Sign Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Sign up form">
            <Input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              aria-label="Full Name"
              autoFocus
              required
              className={errors.fullName ? 'border-red-400' : ''}
            />
            {errors.fullName && <div className="text-red-500 text-xs">{errors.fullName}</div>}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-label="Email"
              required
              className={errors.email ? 'border-red-400' : ''}
            />
            {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
            <Input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              aria-label="Password"
              required
              className={errors.password ? 'border-red-400' : ''}
            />
            <div className="flex items-center gap-2 text-xs">
              <span>Password strength:</span>
              <span className={
                passwordStrength === 'Weak' ? 'text-red-500' : passwordStrength === 'Medium' ? 'text-yellow-500' : 'text-green-600'
              }>{passwordStrength}</span>
            </div>
            {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              aria-label="Confirm Password"
              required
              className={errors.confirmPassword ? 'border-red-400' : ''}
            />
            {errors.confirmPassword && <div className="text-red-500 text-xs">{errors.confirmPassword}</div>}
            <Button
              type="submit"
              className="w-full font-semibold tracking-wide bg-blue-600/80 hover:bg-blue-700/90 text-white py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? 'Registering...' : 'Sign Up'}
            </Button>
            {message && (
              <div
                className={`text-center mt-2 ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}
                role="alert"
              >
                {message}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
