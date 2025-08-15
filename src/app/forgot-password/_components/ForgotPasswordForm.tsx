'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input, Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Label } from '@/components/ui';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    void fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, csrfToken }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password reset email sent! Check your inbox.');
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to send reset email');
      }
    } catch {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href="/login">Back to Login</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
