'use client';

import { useState, useTransition } from 'react';

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    startTransition(async () => {
      const { logoutUser } = await import('@/lib/actions/auth/logout');
      await logoutUser(); // This will redirect on the server
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending || loading}
      className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 transition flex items-center gap-2 disabled:opacity-60"
    >
      {isPending || loading ? (
        <span className="animate-spin mr-2 border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
      ) : null}
      {isPending || loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
