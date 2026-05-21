import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { ROUTE_PATTERN } from '@/constants/routes';
import { useQuestions } from './hooks/questions.hooks';
import type { ListQuestionsParams } from '@/api/questions.api';

const STATUS_VARIANT: Record<string, 'success' | 'secondary' | 'outline'> = {
  published: 'success',
  draft:     'secondary',
  archived:  'outline',
};

const DIFFICULTY_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  easy: 'success', medium: 'warning', hard: 'destructive',
};

export default function Questions() {
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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
        <p className="text-sm text-muted-foreground mt-1">Browse and review the question bank.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search prompt…"
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCursor(undefined); }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as ListQuestionsParams['status'] | ''); setCursor(undefined); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value as ListQuestionsParams['difficulty'] | ''); setCursor(undefined); }}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="">All difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Attempts</TableHead>
              <TableHead className="text-right">XP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">Loading…</TableCell></TableRow>
            )}
            {!isLoading && data?.data.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-10">No questions found.</TableCell></TableRow>
            )}
            {data?.data.map((q) => (
              <TableRow key={q.id} className="cursor-pointer">
                <TableCell className="max-w-md">
                  <Link to={ROUTE_PATTERN.QUESTION_DETAIL(q.id)} className="block truncate hover:underline">
                    {q.prompt}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: q.subject.colorHex }} />
                    {q.subject.label}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{q.topic.label}</TableCell>
                <TableCell><Badge variant={DIFFICULTY_VARIANT[q.difficulty]}>{q.difficulty}</Badge></TableCell>
                <TableCell><Badge variant={STATUS_VARIANT[q.status]}>{q.status}</Badge></TableCell>
                <TableCell className="text-right tabular-nums">{q.totalAttempts}</TableCell>
                <TableCell className="text-right tabular-nums">+{q.xpReward}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
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
