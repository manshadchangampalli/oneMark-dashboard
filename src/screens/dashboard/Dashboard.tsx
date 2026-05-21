import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, GraduationCap, Activity } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { statsApi } from '@/api/stats.api';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: statsApi.get,
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Admin · Overview</div>
        <h1 className="text-2xl font-bold text-app-text tracking-tight">System Overview</h1>
        <p className="text-sm text-app-muted mt-1">Real-time stats across the oneMark platform.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Questions" value={stats?.totalQuestions ?? '—'} icon={BookOpen} />
        <StatCard title="Total Users" value={stats?.totalUsers ?? '—'} icon={Users} />
        <StatCard title="Exams" value={stats?.totalExams ?? '—'} icon={GraduationCap} />
        <StatCard title="Practice Sessions" value={stats?.totalSessions ?? '—'} icon={Activity} />
      </div>

      <div className="bg-white border border-app-border rounded-lg p-6 shadow-sm">
        <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Activity</div>
        <h2 className="text-base font-bold text-app-text mb-2">Recent Activity</h2>
        <p className="text-sm text-app-muted">Activity feed coming soon.</p>
      </div>
    </div>
  );
}
