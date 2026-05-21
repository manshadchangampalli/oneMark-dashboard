import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { subjectsApi } from '@/api/subjects.api';
import { topicsApi, type Topic } from '@/api/topics.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES, topicDetailRoute } from '@/constants/routes';

export default function SubjectDetail() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: subject, isLoading: subjectLoading } = useQuery({
    queryKey: ['admin-subject-detail', subjectId],
    queryFn: () => subjectsApi.detail(subjectId!),
    enabled: !!subjectId,
  });

  const { data: topics = [], isLoading: topicsLoading } = useQuery({
    queryKey: ['admin-topics', { subjectId }],
    queryFn: () => topicsApi.list({ subjectId }),
    enabled: !!subjectId,
  });

  const columns: Column<Topic>[] = [
    { header: 'Label', accessorKey: 'label', cell: (t) => <span className="font-medium text-app-text">{t.label}</span> },
    { header: 'Code', accessorKey: 'code', cell: (t) => <span className="font-mono text-xs">{t.code}</span> },
    { header: 'Questions', accessorKey: 'questions', className: 'text-right tabular-nums' },
    {
      header: 'Status',
      accessorKey: 'archivedAt',
      cell: (t) => t.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>,
    },
  ];

  if (subjectLoading) {
    return <div className="flex items-center justify-center h-32 text-sm text-app-muted">Loading…</div>;
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <p className="text-app-muted">Subject not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTES.SUBJECTS)}>Back to Subjects</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-app-muted">
        <Link to={ROUTES.SUBJECTS} className="hover:text-app-text transition-colors">Subjects</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-app-text font-medium">{subject.label}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Subjects</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight flex items-center gap-2">
            <span className="h-5 w-5 rounded-full shrink-0" style={{ background: subject.colorHex }} />
            {subject.label}
          </h1>
          <p className="text-sm text-app-muted mt-1 font-mono">{subject.code} · {subject.short}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.SUBJECTS)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Subjects
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-white border border-app-border rounded-lg p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Status</div>
            <div>
              {subject.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Color</div>
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded border" style={{ background: subject.colorHex }} />
              <span className="font-mono text-xs text-app-text">{subject.colorHex}</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Topics</div>
            <div className="text-lg font-bold text-app-text">{subject.counts?.topics ?? subject.topics}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Questions</div>
            <div className="text-lg font-bold text-app-text">{subject.counts?.questions ?? subject.questions}</div>
          </div>
        </div>
      </div>

      {/* Topics table */}
      <div>
        <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-3">Topics in this subject</div>
        <DataTable
          columns={columns}
          data={topics}
          isLoading={topicsLoading}
          searchKeys={['label', 'code']}
          onRowClick={(t) => navigate(topicDetailRoute(t.id))}
          emptyMessage="No topics in this subject."
        />
      </div>
    </div>
  );
}
