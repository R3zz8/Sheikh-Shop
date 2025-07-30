'use client';

import React from 'react';
import { useRequireRole } from '@/hooks/useRBAC';

export default function DashboardClient() {
  const hasAccess = useRequireRole(['ADMIN', 'SUPERADMIN']);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">
                        You don&apos;t have permission to access this page. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Users</h2>
          <p className="text-gray-600">Manage user accounts</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Audit Logs</h2>
          <p className="text-gray-600">View system activity</p>
        </div>
      </div>
    </div>
  );
}
