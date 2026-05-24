import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { questionDetailRoute } from '@/constants/routes';
import { useQuestions } from './hooks/questions.hooks';
import type { ListQuestionsParams } from '@/api/questions.api';
import { Search, Plus, Upload } from 'lucide-react';
import { QUESTION_NEW_ROUTE, QUESTION_BULK_IMPORT_ROUTE } from '@/constants/routes';
import { Input } from '@/components/ui/input';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'outline'> = {
  published: 'success',
  draft:     'secondary',
  archived:  'outline',
};

const DIFFICULTY_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  easy: 'success', medium: 'warning', hard: 'destructive',
};

export default function Questions() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ListQuestionsParams['status'] | ''>('');
  const [difficulty, setDifficulty] = useState<ListQuestionsParams['difficulty'] | ''>('');
  const [cursor, setCursor] = useState<string | undefined>();

  const params: ListQuestionsParams = {
    search:     search || undefined,
    status:     status || undefined,
    difficulty: difficulty || undefined,
    cursor,
    limit: 20,
  };

  const { data, isLoading } = useQuestions(params);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Questions</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Questions</h1>
          <p className="text-sm text-app-muted mt-1">Browse and review the question bank.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(QUESTION_BULK_IMPORT_ROUTE)}>
            <Upload className="size-4" /> Bulk import
          </Button>
          <Button onClick={() => navigate(QUESTION_NEW_ROUTE)}>
            <Plus className="size-4" /> New question
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-app-muted pointer-events-none" />
          <Input
            placeholder="Search prompt…"
            className="pl-9 h-10 bg-white border-app-border"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(undefined); }}
          />
        </div>
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value as ListQuestionsParams['status'] | ''); setCursor(undefined); }}
          className="w-36"
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
        <Select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value as ListQuestionsParams['difficulty'] | ''); setCursor(undefined); }}
          className="w-36"
        >
          <option value="">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </div>

      <div className="rounded-lg border border-app-border bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-app-bg border-b border-app-border">
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Prompt</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Subject</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Topic</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Difficulty</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted">Status</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted text-right">Attempts</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider text-app-muted text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-app-muted text-sm">Loading…</TableCell></TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow><TableCell colSpan={7} className="h-32 text-center text-app-muted text-sm">No questions found.</TableCell></TableRow>
            )}
            {data?.data.map((q) => (
              <TableRow
                key={q.id}
                className="border-b border-app-border last:border-0 cursor-pointer hover:bg-app-bg transition-colors"
                onClick={() => navigate(questionDetailRoute(q.id))}
              >
                <TableCell className="py-3 text-sm text-app-text max-w-md">
                  <span className="block truncate">{q.prompt}</span>
                </TableCell>
                <TableCell className="py-3 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: q.subject.colorHex }} />
                    <span className="text-app-muted">{q.subject.label}</span>
                  </span>
                </TableCell>
                <TableCell className="py-3 text-sm text-app-muted">{q.topic.label}</TableCell>
                <TableCell className="py-3 text-sm"><Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>{q.difficulty}</Badge></TableCell>
                <TableCell className="py-3 text-sm"><Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge></TableCell>
                <TableCell className="py-3 text-sm text-right tabular-nums text-app-text">{q.totalAttempts}</TableCell>
                <TableCell className="py-3 text-sm text-right tabular-nums text-app-text">+{q.xpReward}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-app-muted">
          Showing {data?.data.length ?? 0} {data?.data.length === 1 ? 'question' : 'questions'}
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
