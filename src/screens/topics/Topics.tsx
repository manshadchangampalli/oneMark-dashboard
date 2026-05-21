import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { topicsApi, type Topic, type CreateTopicDto, type UpdateTopicDto } from '@/api/topics.api';
import { subjectsApi } from '@/api/subjects.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export default function Topics() {
  const qc = useQueryClient();
  const [subjectId, setSubjectId] = useState<string>('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<Topic | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: subjects = [] } = useQuery({
    queryKey: ['admin-subjects-for-topics'],
    queryFn:  () => subjectsApi.list(false),
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

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Topics</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage topics within each subject.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New topic</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
          Show archived
        </label>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Sort</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-px">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && topics.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No topics found.</TableCell></TableRow>
            )}
            {topics.map(t => (
              <TableRow key={t.id} className={t.archivedAt ? 'opacity-60' : ''}>
                <TableCell className="font-medium">{t.label}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: t.subject.colorHex }} />
                    {t.subject.label}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-xs">{t.code}</TableCell>
                <TableCell className="text-right tabular-nums">{t.sortOrder}</TableCell>
                <TableCell className="text-right tabular-nums">{t.questionCount}</TableCell>
                <TableCell>{t.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!t.archivedAt ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(t)}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => archive.mutate(t.id)} disabled={archive.isPending}><Archive className="size-4" /></Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => unarchive.mutate(t.id)} disabled={unarchive.isPending}><ArchiveRestore className="size-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
