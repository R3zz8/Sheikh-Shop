'use client';

import React, { useState, useEffect } from 'react';
import { Input, Button, Card, CardHeader, CardTitle, CardContent, CardFooter, Label } from '@/components/ui';
import { toast } from 'sonner';

export default function RecoveryCodesPage() {
  const [step, setStep] = useState<'verify' | 'show' | 'idle'>('verify');
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    fetch('/api/csrf')
      .then(res => res.json())
      .then(data => setCsrfToken(data.csrfToken));
  }, []);

  // For security, codes are only shown after regeneration and not stored after view
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Call server actions instead of importing 2fa functions directly
      const verifyResponse = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!verifyResponse.ok) {
        throw new Error('Invalid 2FA code');
      }

      if (!csrfToken) throw new Error('CSRF token missing. Please refresh and try again.');

      // After successful 2FA, regenerate and show codes
      const regenerateResponse = await fetch('/api/2fa/regenerate-recovery-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csrfToken }),
      });

      if (!regenerateResponse.ok) {
        throw new Error('Failed to regenerate recovery codes');
      }

      const { codes: newCodes } = await regenerateResponse.json();
      setCodes(newCodes);
      setStep('show');
      setLastGenerated(new Date().toLocaleString());
      toast.success('Recovery codes generated!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid 2FA code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(codes.join('\n'));
    toast.success('All codes copied!');
  };

  const handleCopyOne = (c: string) => {
    navigator.clipboard.writeText(c);
    toast.success('Code copied!');
  };

  return (
    <Card className="max-w-xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>2FA Recovery Codes</CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'verify' && (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <Label htmlFor="2fa">Enter 2FA Code</Label>
            <Input
              id="2fa"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              autoFocus
              autoComplete="one-time-code"
              className="w-full"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Regenerate Recovery Codes'}
            </Button>
          </form>
        )}
        {step === 'show' && (
          <div className="space-y-4">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
              <strong>Warning:</strong> These codes are only shown once. Copy them now and store them securely.
            </div>
            <div className="flex flex-col gap-2 mt-4">
              {codes.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-lg bg-gray-100 px-3 py-1 rounded select-all">{c}</span>
                  <Button type="button" size="sm" variant="outline" onClick={() => handleCopyOne(c)}>
                                        Copy
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" className="mt-4 w-full" onClick={handleCopyAll}>
                            Copy All
            </Button>
            {lastGenerated && (
              <div className="text-xs text-gray-500 mt-2 text-right">Last generated: {lastGenerated}</div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href="/dashboard">Back to Dashboard</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
