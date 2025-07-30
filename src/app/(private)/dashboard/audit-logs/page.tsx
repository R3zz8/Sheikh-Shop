'use client';
import React, { useEffect, useState } from 'react';
import { useRequireRole } from '@/hooks/useRBAC';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Button, Input } from '@/components/ui';

const PAGE_SIZE = 20;

export default function AuditLogsPage() {
  useRequireRole('SUPERADMIN');
  const [logs, setLogs] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'desc' | 'asc'>('desc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/audit-logs?page=${page}&size=${PAGE_SIZE}&search=${encodeURIComponent(search)}&sort=${sort}`)
      .then(res => res.json())
      .then(data => {
        setLogs(data.logs);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [page, search, sort]);

  return (
    <Card className="max-w-5xl mx-auto mt-10">
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search by user, action, or metadata..."
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value); }}
            className="w-80"
          />
          <Button variant="outline" onClick={() => setSort(s => s === 'desc' ? 'asc' : 'desc')}>
                        Sort: {sort === 'desc' ? 'Newest' : 'Oldest'}
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Metadata</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={4}>No logs found.</TableCell></TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log.id} className={log.action.toLowerCase().includes('fail') ? 'bg-red-100' : ''}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.user?.email || log.userId || 'N/A'}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>
                    <pre className="whitespace-pre-wrap text-xs max-w-xs overflow-x-auto">{log.metadata ? JSON.stringify(log.metadata, null, 2) : ''}</pre>
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
      </CardContent>
    </Card>
  );
}
