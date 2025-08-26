'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui';

export default function VerifyEmailSentPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  async function handleResend() {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      // For now, just show a success message
      // In a real implementation, you would call an API endpoint
      toast.success('Verification email resent! Please check your inbox.');
    } catch {
      toast.error('Failed to resend email. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Check your email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-gray-600">
                        A verification link has been sent to your email address.
          </p>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter your email to resend"
              value={email}
              onChange={e => setEmail(e.target.value)}
              aria-label="Email"
            />
            <Button
              onClick={handleResend}
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? 'Resending...' : 'Resend Verification Email'}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <a href="/login">Back to Login</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
