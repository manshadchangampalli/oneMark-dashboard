import { Link, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import { useUser } from './hooks/users.hooks';

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: u, isLoading } = useUser(id);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!u) return <div className="text-sm text-muted-foreground">User not found.</div>;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to={ROUTES.USERS}><ChevronLeft className="size-4" /> Back to users</Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-semibold">
            {u.avatarInitial ?? u.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{u.name}</h1>
            <p className="text-sm text-muted-foreground">{u.email ?? 'No email'}</p>
            <div className="flex gap-2 mt-1">
              {u.isSuspended ? <Badge variant="destructive">Suspended</Badge> : <Badge variant="success">Active</Badge>}
              <Badge variant="outline">{u.role}</Badge>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Stats</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { k: 'Attempts', v: u.totalAttempts.toLocaleString() },
            { k: 'Correct',  v: u.totalCorrect.toLocaleString() },
            { k: 'Accuracy', v: u.accuracy != null ? `${u.accuracy}%` : '—' },
            { k: 'Total XP', v: u.totalXp.toLocaleString() },
          ].map(s => (
            <div key={s.k} className="rounded-md border p-3">
              <div className="text-xs text-muted-foreground">{s.k}</div>
              <div className="text-xl font-semibold tabular-nums">{s.v}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Profile</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {[
            ['Target exam',  u.targetExam ?? '—'],
            ['School',       u.school ?? '—'],
            ['Grade',        u.grade ?? '—'],
            ['State',        u.state ?? '—'],
            ['District',     u.district ?? '—'],
            ['Joined',       new Date(u.createdAt).toLocaleDateString()],
            ['Last active',  u.lastActiveAt ? new Date(u.lastActiveAt).toLocaleString() : '—'],
            ['Email verified', u.emailVerifiedAt ? '✓' : '—'],
            ['Enrolled exams', u.exams.map(e => `${e.label}${e.isPrimary ? ' (primary)' : ''}`).join(', ') || '—'],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between border-b border-dashed py-1.5">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
