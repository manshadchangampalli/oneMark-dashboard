import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ROUTE_PATTERN } from '@/constants/routes';
import { useUsers } from './hooks/users.hooks';

export default function Users() {
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">All registered learners.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search name or email…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(undefined); }}
          />
        </div>
        <select
          value={suspended}
          onChange={(e) => { setSuspended(e.target.value as '' | 'true' | 'false'); setCursor(undefined); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All users</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead className="text-right">XP</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Loading…</TableCell></TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No users found.</TableCell></TableRow>
            )}
            {data?.data.map(u => (
              <TableRow key={u.id}>
                <TableCell>
                  <Link to={ROUTE_PATTERN.USER_DETAIL(u.id)} className="font-medium hover:underline">{u.name}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email ?? '—'}</TableCell>
                <TableCell>{u.targetExam ?? '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{u.totalAttempts}</TableCell>
                <TableCell className="text-right tabular-nums">{u.accuracy != null ? `${u.accuracy}%` : '—'}</TableCell>
                <TableCell className="text-right tabular-nums">{u.totalXp.toLocaleString()}</TableCell>
                <TableCell>
                  {u.isSuspended
                    ? <Badge variant="destructive">Suspended</Badge>
                    : <Badge variant="success">Active</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
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
