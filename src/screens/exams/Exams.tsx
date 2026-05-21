import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { examsApi, type Exam, type CreateExamDto, type UpdateExamDto } from '@/api/exams.api';
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

export default function Exams() {
  const qc = useQueryClient();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: exams = [], isLoading } = useQuery({
    queryKey: ['admin-exams', { includeArchived }],
    queryFn:  () => examsApi.list(includeArchived),
    staleTime: 30 * 1000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-exams'] });

  const archive   = useMutation({ mutationFn: examsApi.archive,   onSuccess: invalidate });
  const unarchive = useMutation({ mutationFn: examsApi.unarchive, onSuccess: invalidate });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Exams</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage exams shown across the app.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New exam</Button>
      </div>

      <label className="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} />
        Show archived
      </label>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Label</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Subjects</TableHead>
              <TableHead className="text-right">Topics</TableHead>
              <TableHead className="w-px">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && exams.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No exams yet.</TableCell></TableRow>
            )}
            {exams.map(e => (
              <TableRow key={e.id} className={e.archivedAt ? 'opacity-60' : ''}>
                <TableCell>
                  <div className="font-medium">{e.label}</div>
                  {e.description && <div className="text-xs text-muted-foreground truncate max-w-xs">{e.description}</div>}
                </TableCell>
                <TableCell className="font-mono text-xs">{e.code}</TableCell>
                <TableCell>
                  {e.archivedAt
                    ? <Badge variant="outline">Archived</Badge>
                    : e.isActive
                      ? <Badge variant="success">Active</Badge>
                      : <Badge variant="secondary">Inactive</Badge>}
                </TableCell>
                <TableCell className="text-right tabular-nums">{e.users}</TableCell>
                <TableCell className="text-right tabular-nums">{e.subjects}</TableCell>
                <TableCell className="text-right tabular-nums">{e.topics}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!e.archivedAt && (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(e)} title="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => archive.mutate(e.id)} disabled={archive.isPending} title="Archive">
                          <Archive className="size-4" />
                        </Button>
                      </>
                    )}
                    {e.archivedAt && (
                      <Button variant="ghost" size="icon" onClick={() => unarchive.mutate(e.id)} disabled={unarchive.isPending} title="Unarchive">
                        <ArchiveRestore className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <ExamFormDialog
        open={creating}
        onOpenChange={(v) => !v && setCreating(false)}
        onSaved={() => { setCreating(false); invalidate(); }}
      />
      <ExamFormDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        existing={editing ?? undefined}
        onSaved={() => { setEditing(null); invalidate(); }}
      />
    </div>
  );
}

function ExamFormDialog({
  open, onOpenChange, existing, onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existing?: Exam;
  onSaved: () => void;
}) {
  const isEdit = !!existing;
  const [code, setCode] = useState(existing?.code ?? '');
  const [label, setLabel] = useState(existing?.label ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  // Reset when existing changes
  useResetForm(open, () => {
    setCode(existing?.code ?? '');
    setLabel(existing?.label ?? '');
    setDescription(existing?.description ?? '');
    setIsActive(existing?.isActive ?? true);
  });

  const create = useMutation({ mutationFn: (dto: CreateExamDto) => examsApi.create(dto), onSuccess: onSaved });
  const update = useMutation({ mutationFn: (dto: UpdateExamDto) => examsApi.update(existing!.id, dto), onSuccess: onSaved });
  const error = (create.error || update.error) as { response?: { data?: { message?: string } } } | null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (isEdit) update.mutate({ label, description: description || undefined, isActive });
    else create.mutate({ code, label, description: description || undefined, isActive });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit exam' : 'New exam'}</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update exam details. Code cannot be changed.' : 'Create a new exam.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="jee, neet, psc…" disabled={isEdit} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label">Label</Label>
              <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <label className="inline-flex items-center gap-2 text-sm pt-1">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error.response?.data?.message ?? 'Something went wrong'}
            </p>
          )}

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

// Reset form state whenever dialog opens
function useResetForm(open: boolean, reset: () => void) {
  useEffect(() => { if (open) reset(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [open]);
}
