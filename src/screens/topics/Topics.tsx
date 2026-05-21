import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { topicsApi, type Topic, type CreateTopicDto, type UpdateTopicDto } from '@/api/topics.api';
import { subjectsApi } from '@/api/subjects.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Select } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { topicDetailRoute } from '@/constants/routes';

export default function Topics() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState<string>('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['admin-subjects-for-topics'],
    queryFn:  () => subjectsApi.list({}),
    staleTime: 5 * 60 * 1000,
  });

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['admin-topics', { subjectId, includeArchived }],
    queryFn:  () => topicsApi.list({ subjectId: subjectId || undefined, includeArchived }),
    staleTime: 30 * 1000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-topics'] });
  const archive   = useMutation({ mutationFn: topicsApi.archive,   onSuccess: invalidate });
  const unarchive = useMutation({ mutationFn: topicsApi.unarchive, onSuccess: invalidate });

  const columns: Column<Topic>[] = [
    {
      header: 'Label',
      accessorKey: 'label',
      cell: (t) => <span className="font-medium text-app-text">{t.label}</span>,
    },
    {
      header: 'Subject',
      accessorKey: 'subject.label',
      cell: (t) => (
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.subject.colorHex }} />
          <span className="text-app-muted">{t.subject.label}</span>
        </span>
      ),
    },
    { header: 'Code', accessorKey: 'code', cell: (t) => <span className="font-mono text-xs">{t.code}</span> },
    { header: 'Questions', accessorKey: 'questions', className: 'text-right tabular-nums' },
    {
      header: 'Status',
      accessorKey: 'archivedAt',
      cell: (t) => t.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      sortable: false,
      cell: (t) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          {!t.archivedAt ? (
            <>
              <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Pencil className="size-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => archive.mutate(t.id)} disabled={archive.isPending}><Archive className="size-4" /></Button>
            </>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => unarchive.mutate(t.id)} disabled={unarchive.isPending}><ArchiveRestore className="size-4" /></Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Topics</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Topics</h1>
          <p className="text-sm text-app-muted mt-1">Manage topics within each subject.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={subjectId} onChange={(e) => setSubjectId(e.target.value)} className="w-44">
            <option value="">All subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
          <label className="inline-flex items-center gap-2 text-sm text-app-muted">
            <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
            Archived
          </label>
          <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New topic</Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={topics}
        isLoading={isLoading}
        searchKeys={['label', 'code', 'subject.label']}
        onRowClick={(t) => navigate(topicDetailRoute(t.id))}
        emptyMessage="No topics found."
      />

      <TopicFormDialog
        open={creating}
        onOpenChange={(v) => !v && setCreating(false)}
        subjects={subjects.map(s => ({ id: s.id, label: s.label }))}
        onSaved={() => { setCreating(false); invalidate(); }}
      />
      <TopicFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        existing={editing ?? undefined}
        subjects={subjects.map(s => ({ id: s.id, label: s.label }))}
        onSaved={() => { setEditing(null); invalidate(); }}
      />
    </div>
  );
}

function TopicFormDialog({
  open, onOpenChange, existing, subjects, onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existing?: Topic;
  subjects: { id: string; label: string }[];
  onSaved: () => void;
}) {
  const isEdit = !!existing;
  const [subjectId, setSubjectId] = useState('');
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [sortOrder, setSort] = useState(0);

  useEffect(() => {
    if (!open) return;
    setSubjectId(existing?.subject.id ?? '');
    setCode(existing?.code ?? '');
    setLabel(existing?.label ?? '');
    setSort(existing?.sortOrder ?? 0);
  }, [open, existing]);

  const create = useMutation({ mutationFn: (dto: CreateTopicDto) => topicsApi.create(dto), onSuccess: onSaved });
  const update = useMutation({ mutationFn: (dto: UpdateTopicDto) => topicsApi.update(existing!.id, dto), onSuccess: onSaved });
  const error = (create.error || update.error) as { response?: { data?: { message?: string } } } | null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (isEdit) update.mutate({ label, sortOrder });
    else create.mutate({ subjectId, code, label, sortOrder });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit topic' : 'New topic'}</DialogTitle>
            <DialogDescription>{isEdit ? 'Subject and code are read-only.' : 'Create a new topic.'}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={isEdit}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm disabled:opacity-50"
                required
              >
                <option value="">Select a subject…</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="kerala-renaissance…" disabled={isEdit} required />
            </div>
            <div className="space-y-1.5">
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSort(parseInt(e.target.value) || 0)} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error.response?.data?.message ?? 'Something went wrong'}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
