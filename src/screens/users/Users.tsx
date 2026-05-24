import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { userDetailRoute } from '@/constants/routes';
import { useUsers } from './hooks/users.hooks';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Users() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [suspended, setSuspended] = useState<'' | 'true' | 'false'>('');
  const [cursor, setCursor] = useState<string | undefined>();

  const { data, isLoading } = useUsers({
    search: search || undefined,
    suspended: suspended === '' ? undefined : suspended === 'true',
    cursor,
    limit: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Management · Users</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Users</h1>
          <p className="text-sm text-app-muted mt-1">All registered learners.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted pointer-events-none" />
          <Input
            placeholder="Search name or email…"
            className="pl-9 h-10 bg-white border-app-border"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(undefined); }}
          />
        </div>
        <Select
          value={suspended}
          onChange={(e) => { setSuspended(e.target.value as '' | 'true' | 'false'); setCursor(undefined); }}
          className="w-36"
        >
          <option value="">All users</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </Select>
      </div>

      <div className="rounded-lg border border-app-border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-app-bg border-b border-app-border">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Name</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Email</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Exam</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted text-right">Attempts</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted text-right">Accuracy</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted text-right">XP</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-app-muted text-sm">Loading…</TableCell></TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-app-muted text-sm">No users found.</TableCell></TableRow>
            )}
            {data?.data.map(u => (
              <TableRow
                key={u.id}
                className="border-b border-app-border last:border-0 cursor-pointer hover:bg-app-bg transition-colors"
                onClick={() => navigate(userDetailRoute(u.id))}
              >
                <TableCell className="text-sm font-medium text-app-text">{u.name}</TableCell>
                <TableCell className="text-sm text-app-muted">{u.email ?? '—'}</TableCell>
                <TableCell className="text-sm text-app-muted">{u.targetExam ?? '—'}</TableCell>
                <TableCell className="text-sm text-right tabular-nums text-app-text">{u.totalAttempts}</TableCell>
                <TableCell className="text-sm text-right tabular-nums text-app-text">{u.accuracy != null ? `${u.accuracy}%` : '—'}</TableCell>
                <TableCell className="text-sm text-right tabular-nums text-app-text">{u.totalXp.toLocaleString()}</TableCell>
                <TableCell className="py-3 text-sm">
                  {u.isSuspended
                    ? <Badge variant="destructive">Suspended</Badge>
                    : <Badge variant="success">Active</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-app-muted">
          Showing {data?.data.length ?? 0} {data?.data.length === 1 ? 'user' : 'users'}
        </span>
        <div className="flex gap-2">
          {cursor && (
            <Button variant="outline" size="sm" onClick={() => setCursor(undefined)}>First page</Button>
          )}
          {data?.nextCursor && (
            <Button variant="outline" size="sm" onClick={() => setCursor(data.nextCursor!)}>Next →</Button>
          )}
        </div>
      </div>
    </div>
  );
}
