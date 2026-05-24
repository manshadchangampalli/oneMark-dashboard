import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { ROUTES, questionDetailRoute } from '@/constants/routes';
import { subjectsApi } from '@/api/subjects.api';
import { topicsApi } from '@/api/topics.api';
import { examsApi } from '@/api/exams.api';
import { useCreateQuestion } from './hooks/questions.hooks';
import type { CreateQuestionDto } from '@/api/questions.api';
import { cn } from '@/lib/utils';

const LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface OptionRow { label: string; text: string; sub: string }

function blankOption(label: string): OptionRow {
  return { label, text: '', sub: '' };
}

export default function CreateQuestion() {
  const navigate = useNavigate();
  const createMutation = useCreateQuestion();

  // Reference data
  const { data: subjects = [] } = useQuery({ queryKey: ['subjects'], queryFn: () => subjectsApi.list() });
  const { data: exams    = [] } = useQuery({ queryKey: ['exams'],    queryFn: () => examsApi.list() });

  // Form state
  const [subjectId,  setSubjectId]  = useState('');
  const [topicId,    setTopicId]    = useState('');
  const [examIds,    setExamIds]    = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [status,     setStatus]     = useState<'draft' | 'published'>('draft');
  const [xpReward,   setXpReward]   = useState(50);
  const [prompt,     setPrompt]     = useState('');
  const [options,    setOptions]    = useState<OptionRow[]>(() => [
    blankOption('A'), blankOption('B'), blankOption('C'), blankOption('D'),
  ]);
  const [correctLabel,   setCorrectLabel]   = useState('A');
  const [explanationText, setExplanationText] = useState(''); // newline-separated steps

  // Topic dropdown depends on subject
  const { data: topics = [] } = useQuery({
    queryKey: ['topics', { subjectId }],
    queryFn:  () => topicsApi.list({ subjectId }),
    enabled:  !!subjectId,
  });

  // Reset topic if subject changes
  useEffect(() => { setTopicId(''); }, [subjectId]);

  const correctOk = useMemo(
    () => options.some(o => o.label === correctLabel),
    [options, correctLabel],
  );

  function updateOption(idx: number, patch: Partial<OptionRow>) {
    setOptions(prev => prev.map((o, i) => (i === idx ? { ...o, ...patch } : o)));
  }

  function addOption() {
    if (options.length >= 6) return;
    const usedLabels = new Set(options.map(o => o.label));
    const nextLabel = LABELS.find(l => !usedLabels.has(l)) ?? `${options.length + 1}`;
    setOptions(prev => [...prev, blankOption(nextLabel)]);
  }

  function removeOption(idx: number) {
    if (options.length <= 2) return;
    const removed = options[idx];
    setOptions(prev => prev.filter((_, i) => i !== idx));
    if (removed.label === correctLabel) setCorrectLabel(options[0].label);
  }

  function toggleExam(id: string) {
    setExamIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!subjectId || !topicId || examIds.length === 0 || !prompt.trim() || !correctOk) return;

    const steps = explanationText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const dto: CreateQuestionDto = {
      subjectId,
      topicId,
      examIds,
      difficulty,
      type:     'mcq',
      status,
      xpReward,
      prompt:   prompt.trim(),
      options:  options.map(o => ({ label: o.label, text: o.text, sub: o.sub || null })),
      correctOptionLabel: correctLabel,
      officialExplanation: steps.length > 0 ? { steps } : null,
    };

    createMutation.mutate(dto, {
      onSuccess: (q) => navigate(questionDetailRoute(q.id)),
    });
  }

  const apiError = (createMutation.error as any)?.response?.data?.message;

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Breadcrumb + header */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm text-app-muted">
          <Link to={ROUTES.QUESTIONS} className="hover:text-app-text">Questions</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-app-text">New</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Questions</div>
            <h1 className="text-2xl font-bold text-app-text tracking-tight">New question</h1>
            <p className="text-sm text-app-muted mt-1">Add a new MCQ to the bank. Saves as draft by default.</p>
          </div>
        </div>
      </div>

      {/* Classification */}
      <Section title="Classification">
        <FieldRow>
          <Field label="Subject" required>
            <Select value={subjectId} onChange={e => setSubjectId(e.target.value)} required>
              <option value="">Pick a subject…</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </Field>
          <Field label="Topic" required>
            <Select value={topicId} onChange={e => setTopicId(e.target.value)} required disabled={!subjectId}>
              <option value="">{subjectId ? 'Pick a topic…' : 'Pick subject first'}</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </Select>
          </Field>
        </FieldRow>

        <Field label="Exams" required help="Question appears in practice for the selected exams.">
          <div className="flex flex-wrap gap-2">
            {exams.length === 0 && <span className="text-sm text-app-muted">No exams available.</span>}
            {exams.map(ex => {
              const checked = examIds.includes(ex.id);
              return (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => toggleExam(ex.id)}
                  className={cn(
                    'h-9 px-3 rounded-md border text-sm transition-colors',
                    checked
                      ? 'border-app-text bg-app-text text-white'
                      : 'border-app-border bg-white text-app-text hover:bg-app-bg',
                  )}
                >
                  {ex.label}
                </button>
              );
            })}
          </div>
        </Field>
      </Section>

      {/* Metadata */}
      <Section title="Metadata">
        <FieldRow>
          <Field label="Difficulty" required>
            <Select value={difficulty} onChange={e => setDifficulty(e.target.value as any)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </Field>
          <Field label="XP reward" required>
            <Input
              type="number"
              min={0}
              max={10000}
              value={xpReward}
              onChange={e => setXpReward(parseInt(e.target.value || '0', 10))}
            />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={e => setStatus(e.target.value as any)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </Select>
          </Field>
        </FieldRow>
      </Section>

      {/* Content */}
      <Section title="Content">
        <Field label="Prompt" required>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="State the question…"
            required
            rows={4}
            className="flex w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={options.length >= 6}>
              <Plus className="h-4 w-4" /> Add option
            </Button>
          </div>
          <div className="space-y-2">
            {options.map((opt, i) => {
              const isCorrect = opt.label === correctLabel;
              return (
                <div
                  key={i}
                  className={cn(
                    'rounded-lg border p-3 flex items-start gap-3 transition-colors',
                    isCorrect ? 'border-emerald-300 bg-emerald-50/40' : 'border-app-border bg-white',
                  )}
                >
                  <label className="flex items-center gap-2 cursor-pointer pt-1.5">
                    <input
                      type="radio"
                      name="correct"
                      value={opt.label}
                      checked={isCorrect}
                      onChange={() => setCorrectLabel(opt.label)}
                    />
                    <span className="font-mono text-sm font-semibold w-4">{opt.label}</span>
                  </label>
                  <div className="flex-1 space-y-1.5">
                    <Input
                      value={opt.text}
                      onChange={e => updateOption(i, { text: e.target.value })}
                      placeholder={`Option ${opt.label} text`}
                      required
                    />
                    <Input
                      value={opt.sub}
                      onChange={e => updateOption(i, { sub: e.target.value })}
                      placeholder="Sub-text (optional)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(i)}
                    disabled={options.length <= 2}
                    title="Remove option"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-app-muted mt-2">
            Tick the radio to mark the correct option. 2–6 options.
          </p>
        </div>
      </Section>

      {/* Explanation */}
      <Section title="Official explanation" subtitle="Optional. One step per line.">
        <textarea
          value={explanationText}
          onChange={e => setExplanationText(e.target.value)}
          placeholder={'Step 1: …\nStep 2: …'}
          rows={5}
          className="flex w-full rounded-md border border-app-border bg-white px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Section>

      {/* Footer actions */}
      <div className="sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 py-4 bg-white border-t border-app-border flex items-center justify-end gap-2 z-10">
        {apiError && (
          <span className="text-sm text-red-600 mr-auto">{apiError}</span>
        )}
        <Button type="button" variant="outline" onClick={() => navigate(ROUTES.QUESTIONS)}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending ? 'Creating…' : 'Create question'}
        </Button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-app-border rounded-lg p-5 shadow-sm space-y-4">
      <div>
        <h2 className="text-sm font-bold text-app-text tracking-wide">{title}</h2>
        {subtitle && <p className="text-xs text-app-muted mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>;
}

function Field({
  label, required, help, children,
}: {
  label: string; required?: boolean; help?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-app-text">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {help && <p className="text-xs text-app-muted">{help}</p>}
    </div>
  );
}
