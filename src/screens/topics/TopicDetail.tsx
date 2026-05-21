import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { topicsApi } from '@/api/topics.api';
import { questionsApi, type QuestionListItem } from '@/api/questions.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES, questionDetailRoute } from '@/constants/routes';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'outline'> = {
  published: 'success',
  draft:     'secondary',
  archived:  'outline',
};

const DIFFICULTY_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  easy: 'success', medium: 'warning', hard: 'destructive',
};

export default function TopicDetail() {
  const { id: topicId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: topic, isLoading: topicLoading } = useQuery({
    queryKey: ['admin-topic-detail', topicId],
    queryFn: () => topicsApi.detail(topicId!),
    enabled: !!topicId,
  });

  const { data: questionsPage, isLoading: questionsLoading } = useQuery({
    queryKey: ['admin-questions', { topicId, limit: 100 }],
    queryFn: () => questionsApi.list({ topicId, limit: 100 }),
    enabled: !!topicId,
  });

  const questions = questionsPage?.data ?? [];

  const columns: Column<QuestionListItem>[] = [
    {
      header: 'Prompt',
      accessorKey: 'prompt',
      cell: (q) => (
        <span className="block truncate max-w-sm text-app-text">{q.prompt}</span>
      ),
    },
    {
      header: 'Difficulty',
      accessorKey: 'difficulty',
      cell: (q) => <Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>{q.difficulty}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (q) => <Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge>,
    },
    {
      header: 'Success Rate',
      accessorKey: 'successRate',
      className: 'text-right tabular-nums',
      cell: (q) => q.successRate != null ? `${q.successRate}%` : '—',
    },
    {
      header: 'Attempts',
      accessorKey: 'totalAttempts',
      className: 'text-right tabular-nums',
    },
  ];

  if (topicLoading) {
    return <div className="flex items-center justify-center h-32 text-sm text-app-muted">Loading…</div>;
  }

  if (!topic) {
    return (
      <div className="text-center py-12">
        <p className="text-app-muted">Topic not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTES.TOPICS)}>Back to Topics</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-app-muted">
        <Link to={ROUTES.TOPICS} className="hover:text-app-text transition-colors">Topics</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-app-text font-medium">{topic.label}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Topics</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">{topic.label}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: topic.subject.colorHex }} />
            <span className="text-sm text-app-muted">{topic.subject.label}</span>
            <span className="text-app-muted">·</span>
            <span className="text-sm text-app-muted font-mono">{topic.code}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TOPICS)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-white border border-app-border rounded-lg p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Status</div>
            <div>
              {topic.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Questions</div>
            <div className="text-lg font-bold text-app-text">{topic.counts?.questions ?? topic.questions}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Sort Order</div>
            <div className="text-lg font-bold text-app-text">{topic.sortOrder}</div>
          </div>
        </div>
      </div>

      {/* Questions table */}
      <div>
        <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-3">Questions in this topic</div>
        <DataTable
          columns={columns}
          data={questions}
          isLoading={questionsLoading}
          searchKeys={['prompt']}
          onRowClick={(q) => navigate(questionDetailRoute(q.id))}
          emptyMessage="No questions in this topic."
        />
      </div>
    </div>
  );
}
