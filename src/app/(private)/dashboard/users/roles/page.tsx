'use client';
import React, { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/useRBAC';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, Input, Select, SelectItem } from '@/components/ui';
import { toast } from 'sonner';

const PAGE_SIZE = 20;
const ROLES = ['user', 'editor', 'moderator', 'admin', 'superadmin'];

export default function UserRolesPage() {
    useRequireRole('superadmin');
    const [users, setUsers] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [changing, setChanging] = useState<string | null>(null);
    const [confirm, setConfirm] = useState<{ id: string; email: string; role: string } | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [highlighted, setHighlighted] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/user`).then(res => res.json()).then(user => setCurrentUserId(user?.id || null));
        fetch(`/api/users?page=${page}&size=${PAGE_SIZE}&search=${encodeURIComponent(search)}&role=${roleFilter}`)
            .then(res => res.json())
            .then(data => {
                setUsers(data.users);
                setTotal(data.total);
            })
            .finally(() => setLoading(false));
    }, [page, search, roleFilter]);

    const handleChangeRole = (id: string, email: string, newRole: string) => {
        setConfirm({ id, email, role: newRole });
    };

    const doChangeRole = async () => {
        if (!confirm) return;
        setChanging(confirm.id);
        try {
            const res = await fetch(`/api/users/${confirm.id}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: confirm.role }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to change role');
            setUsers(users => users.map(u => u.id === confirm.id ? { ...u, role: confirm.role } : u));
            setHighlighted(confirm.id);
            setTimeout(() => setHighlighted(null), 1200);
            toast.success('Role updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to change role');
        } finally {
            setChanging(null);
            setConfirm(null);
        }
    };

    return (
        <Card className="max-w-4xl mx-auto mt-10">
            <CardHeader>
                <CardTitle>User Role Management</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4 gap-2">
                    <Input
                        placeholder="Search by email..."
                        value={search}
                        onChange={e => { setPage(1); setSearch(e.target.value); }}
                        className="w-64"
                    />
                    <Select value={roleFilter} onValueChange={v => { setPage(1); setRoleFilter(v); }}>
                        <SelectItem value="">All Roles</SelectItem>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </Select>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Current Role</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                        ) : users.length === 0 ? (
                            <TableRow><TableCell colSpan={3}>No users found.</TableCell></TableRow>
                        ) : (
                            users.map(user => (
                                <TableRow key={user.id} className={highlighted === user.id ? 'bg-green-100 transition-all' : ''}>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onValueChange={role => handleChangeRole(user.id, user.email, role)}
                                            disabled={user.id === currentUserId || changing === user.id}
                                        >
                                            {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                        </Select>
                                        {user.id === currentUserId && <span className="ml-2 text-xs text-gray-400">(You)</span>}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <div className="flex justify-between items-center mt-4">
                    <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                    <span>Page {page} / {Math.ceil(total / PAGE_SIZE) || 1}</span>
                    <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * PAGE_SIZE >= total}>Next</Button>
                </div>
                {confirm && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                            <h2 className="text-lg font-bold mb-2">Confirm Role Change</h2>
                            <p>Change <span className="font-mono">{confirm.email}</span> to <span className="font-bold">{confirm.role}</span>?</p>
                            <div className="flex gap-4 mt-6">
                                <Button onClick={doChangeRole} disabled={changing === confirm.id}>
                                    {changing === confirm.id ? 'Confirming...' : 'Confirm'}
                                </Button>
                                <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 