'use client';
import React from 'react';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-lg mb-6">Forbidden: You do not have permission to access this page.</p>
      <Button onClick={() => router.push('/')}>Go Home</Button>
    </div>
  );
}
