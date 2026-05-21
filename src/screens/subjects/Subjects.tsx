import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Archive, ArchiveRestore } from 'lucide-react';
import { subjectsApi, type Subject, type CreateSubjectDto, type UpdateSubjectDto } from '@/api/subjects.api';
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

export default function Subjects() {
  const qc = useQueryClient();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['admin-subjects', { includeArchived }],
    queryFn:  () => subjectsApi.list(includeArchived),
    staleTime: 30 * 1000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin-subjects'] });
  const archive   = useMutation({ mutationFn: subjectsApi.archive,   onSuccess: invalidate });
  const unarchive = useMutation({ mutationFn: subjectsApi.unarchive, onSuccess: invalidate });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Subjects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage subjects across all exams.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New subject</Button>
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
              <TableHead>Short</TableHead>
              <TableHead>Color</TableHead>
              <TableHead className="text-right">Sort</TableHead>
              <TableHead className="text-right">Topics</TableHead>
              <TableHead className="text-right">Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-px">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Loading…</TableCell></TableRow>}
            {!isLoading && subjects.length === 0 && (
              <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No subjects yet.</TableCell></TableRow>
            )}
            {subjects.map(s => (
              <TableRow key={s.id} className={s.archivedAt ? 'opacity-60' : ''}>
                <TableCell className="font-medium">{s.label}</TableCell>
                <TableCell className="font-mono text-xs">{s.code}</TableCell>
                <TableCell className="font-mono text-xs">{s.short}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-4 rounded border" style={{ background: s.colorHex }} />
                    <span className="font-mono text-xs">{s.colorHex}</span>
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{s.sortOrder}</TableCell>
                <TableCell className="text-right tabular-nums">{s.topics}</TableCell>
                <TableCell className="text-right tabular-nums">{s.questions}</TableCell>
                <TableCell>{s.archivedAt ? <Badge variant="outline">Archived</Badge> : <Badge variant="success">Active</Badge>}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {!s.archivedAt ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(s)}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => archive.mutate(s.id)} disabled={archive.isPending}><Archive className="size-4" /></Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" onClick={() => unarchive.mutate(s.id)} disabled={unarchive.isPending}><ArchiveRestore className="size-4" /></Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <SubjectFormDialog open={creating} onOpenChange={(v) => !v && setCreating(false)} onSaved={() => { setCreating(false); invalidate(); }} />
      <SubjectFormDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)} existing={editing ?? undefined} onSaved={() => { setEditing(null); invalidate(); }} />
    </div>
  );
}

function SubjectFormDialog({
  open, onOpenChange, existing, onSaved,
}: { open: boolean; onOpenChange: (v: boolean) => void; existing?: Subject; onSaved: () => void }) {
  const isEdit = !!existing;
  const [code, setCode]       = useState('');
  const [label, setLabel]     = useState('');
  const [short, setShort]     = useState('');
  const [colorHex, setColor]  = useState('#3D7A4E');
  const [sortOrder, setSort]  = useState(0);

  useEffect(() => {
    if (!open) return;
    setCode(existing?.code ?? '');
    setLabel(existing?.label ?? '');
    setShort(existing?.short ?? '');
    setColor(existing?.colorHex ?? '#3D7A4E');
    setSort(existing?.sortOrder ?? 0);
  }, [open, existing]);

  const create = useMutation({ mutationFn: (dto: CreateSubjectDto) => subjectsApi.create(dto), onSuccess: onSaved });
  const update = useMutation({ mutationFn: (dto: UpdateSubjectDto) => subjectsApi.update(existing!.id, dto), onSuccess: onSaved });
  const error = (create.error || update.error) as { response?: { data?: { message?: string } } } | null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (isEdit) update.mutate({ label, short, colorHex, sortOrder });
    else create.mutate({ code, label, short, colorHex, sortOrder });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit subject' : 'New subject'}</DialogTitle>
            <DialogDescription>{isEdit ? 'Code is read-only.' : 'Create a new subject.'}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2">
              <Label>Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="kerala, india, eng…" disabled={isEdit} required />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Short (2 chars)</Label>
              <Input value={short} onChange={(e) => setShort(e.target.value)} maxLength={4} required />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSort(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Color (hex)</Label>
              <div className="flex gap-2">
                <Input value={colorHex} onChange={(e) => setColor(e.target.value)} required />
                <input type="color" value={colorHex} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded border" />
              </div>
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
