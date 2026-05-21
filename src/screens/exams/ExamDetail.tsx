import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { examsApi } from '@/api/exams.api';
import { subjectsApi, type Subject } from '@/api/subjects.api';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROUTES, subjectDetailRoute } from '@/constants/routes';

export default function ExamDetail() {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: exam, isLoading: examLoading } = useQuery({
    queryKey: ['admin-exam-detail', examId],
    queryFn: () => examsApi.detail(examId!),
    enabled: !!examId,
  });

  const { data: subjects = [], isLoading: subjectsLoading } = useQuery({
    queryKey: ['admin-subjects', { examId }],
    queryFn: () => subjectsApi.list({ examId }),
    enabled: !!examId,
  });

  const columns: Column<Subject>[] = [
    {
      header: 'Label',
      accessorKey: 'label',
      cell: (s) => (
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full shrink-0" style={{ background: s.colorHex }} />
          <span className="font-medium text-app-text">{s.label}</span>
        </div>
      ),
    },
    { header: 'Code', accessorKey: 'code', cell: (s) => <span className="font-mono text-xs">{s.code}</span> },
    { header: 'Short', accessorKey: 'short', cell: (s) => <span className="font-mono text-xs">{s.short}</span> },
    { header: 'Topics', accessorKey: 'topics', className: 'text-right tabular-nums' },
    { header: 'Questions', accessorKey: 'questions', className: 'text-right tabular-nums' },
    {
      header: 'Status',
      accessorKey: 'archivedAt',
      cell: (s) => s.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>,
    },
  ];

  if (examLoading) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-app-muted">Loading…</div>
    );
  }

  if (!exam) {
    return (
      <div className="text-center py-12">
        <p className="text-app-muted">Exam not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(ROUTES.EXAMS)}>Back to Exams</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-app-muted">
        <Link to={ROUTES.EXAMS} className="hover:text-app-text transition-colors">Exams</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-app-text font-medium">{exam.label}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Exams</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">{exam.label}</h1>
          <p className="text-sm text-app-muted mt-1 font-mono">{exam.code}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.EXAMS)}>
          <ArrowLeft className="h-4 w-4" />
          Back to Exams
        </Button>
      </div>

      {/* Info card */}
      <div className="bg-white border border-app-border rounded-lg p-5 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Status</div>
            <div>
              {exam.archivedAt
                ? <Badge variant="outline">Archived</Badge>
                : exam.isActive
                  ? <Badge variant="success">Active</Badge>
                  : <Badge variant="secondary">Inactive</Badge>}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Users</div>
            <div className="text-lg font-bold text-app-text">{exam.counts?.userExams ?? exam.users}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Subjects</div>
            <div className="text-lg font-bold text-app-text">{exam.counts?.subjectExams ?? exam.subjects}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Topics</div>
            <div className="text-lg font-bold text-app-text">{exam.counts?.topicExams ?? exam.topics}</div>
          </div>
        </div>
        {exam.description && (
          <div className="mt-4 pt-4 border-t border-app-border">
            <div className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Description</div>
            <p className="text-sm text-app-text">{exam.description}</p>
          </div>
        )}
      </div>

      {/* Subjects table */}
      <div>
        <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-3">Subjects in this exam</div>
        <DataTable
          columns={columns}
          data={subjects}
          isLoading={subjectsLoading}
          searchKeys={['label', 'code', 'short']}
          onRowClick={(s) => navigate(subjectDetailRoute(s.id))}
          emptyMessage="No subjects linked to this exam."
        />
      </div>
    </div>
  );
}
