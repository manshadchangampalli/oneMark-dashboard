import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useQuestion } from './hooks/questions.hooks';
import { cn } from '@/lib/utils';

export default function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: q, isLoading } = useQuestion(id);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (!q) return <div className="text-sm text-muted-foreground">Question not found.</div>;

  const rev = q.currentRevision;

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link to={ROUTES.QUESTIONS}><ChevronLeft className="size-4" /> Back to questions</Link>
        </Button>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-2 text-sm">
            <span className="size-2 rounded-full" style={{ background: q.subject.colorHex }} />
            {q.subject.label}
          </span>
          <span className="text-sm text-muted-foreground">· {q.topic.label}</span>
          <Badge variant="outline" className="ml-1">{q.difficulty}</Badge>
          <Badge variant={q.status === 'published' ? 'success' : 'secondary'}>{q.status}</Badge>
        </div>
        <h1 className="text-xl font-serif leading-snug">{rev?.prompt ?? '(no revision)'}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Options</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {q.options.map((opt) => {
            const isCorrect = opt.label === rev?.correctOptionLabel;
            return (
              <div
                key={opt.id}
                className={cn(
                  'flex items-start gap-3 rounded-md border p-3',
                  isCorrect && 'border-green-500/60 bg-green-50 dark:bg-green-950/30',
                )}
              >
                <div className={cn(
                  'size-7 rounded-md border flex items-center justify-center text-xs font-medium',
                  isCorrect ? 'bg-green-500 text-white border-green-500' : 'bg-muted',
                )}>
                  {opt.label}
                </div>
                <div className="flex-1 text-sm">
                  <div>{opt.text}</div>
                  {opt.sub && <div className="text-xs text-muted-foreground mt-0.5">{opt.sub}</div>}
                </div>
                {isCorrect && <Check className="size-4 text-green-600" />}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {rev?.officialExplanation?.steps?.length ? (
        <Card>
          <CardHeader><CardTitle className="text-base">Official explanation</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {rev.officialExplanation.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader><CardTitle className="text-base">Metadata</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {[
            ['XP reward',     `+${q.xpReward}`],
            ['Attempts',      String(q.totalAttempts)],
            ['Success rate',  q.successRate != null ? `${q.successRate}%` : '—'],
            ['Avg time',      q.avgTimeSeconds != null ? `${q.avgTimeSeconds}s` : '—'],
            ['Revisions',     String(q.revisionCount)],
            ['Current version', String(rev?.version ?? '—')],
            ['Exams',         q.exams.map(e => e.label).join(', ') || '—'],
            ['Created',       new Date(q.createdAt).toLocaleString()],
            ['Updated',       new Date(q.updatedAt).toLocaleString()],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between border-b border-dashed py-1.5">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-right">{v}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
