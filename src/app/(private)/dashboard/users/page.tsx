'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRequireRole } from '@/hooks/useRBAC';

type User = {
  id: string;
  email: string;
  role: string;
  disabled: boolean;
};

export default function AdminUsersPage() {
  useRequireRole(['ADMIN', 'SUPERADMIN']);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    void fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data.users))
      .catch(err => toast.error(err.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id: string, role: string) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      setUsers(users.map(u => u.id === id ? { ...u, role } : u));
      toast.success('Role updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update role');
    } finally {
      setUpdating(null);
    }
  }

  async function handleToggleDisable(id: string, disabled: boolean) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/users/${id}/disable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disabled: !disabled }),
      });
      if (!res.ok) throw new Error('Failed to update account');
      setUsers(users.map(u => u.id === id ? { ...u, disabled: !disabled } : u));
      toast.success(disabled ? 'Account enabled' : 'Account disabled');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account');
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Email</th>
              <th className="p-2">Role</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className={user.disabled ? 'bg-red-50' : ''}>
                <td className="p-2 font-mono">{user.email}</td>
                <td className="p-2">
                  <label htmlFor={`role-select-${user.id}`} className="sr-only">
                    Role for {user.email}
                  </label>
                  <select
                    id={`role-select-${user.id}`}
                    value={user.role}
                    onChange={e => handleRoleChange(user.id, e.target.value)}
                    disabled={updating === user.id}
                    className="border rounded px-2 py-1"
                  >
                    {['USER', 'EDITOR', 'MODERATOR', 'ADMIN', 'SUPERADMIN'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2">{user.disabled ? 'Disabled' : 'Active'}</td>
                <td className="p-2">
                  <button
                    className={`px-3 py-1 rounded ${user.disabled ? 'bg-green-600' : 'bg-red-600'} text-white hover:opacity-80 disabled:opacity-50`}
                    onClick={() => handleToggleDisable(user.id, user.disabled)}
                    disabled={updating === user.id}
                  >
                    {user.disabled ? 'Enable' : 'Disable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
