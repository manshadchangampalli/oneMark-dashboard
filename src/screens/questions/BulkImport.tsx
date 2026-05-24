import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Upload, FileJson, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useBulkCreateQuestions } from './hooks/questions.hooks';
import type { BulkRowInput, BulkImportResult } from '@/api/questions.api';
import { cn } from '@/lib/utils';

const SAMPLE = JSON.stringify(
  [
    {
      subjectCode: 'polity',
      topicCode:   'indian-constitution',
      examCodes:   ['psc-ldc'],
      difficulty:  'medium',
      xpReward:    50,
      prompt:      'Who is regarded as the father of the Indian Constitution?',
      options: [
        { label: 'A', text: 'Mahatma Gandhi' },
        { label: 'B', text: 'B. R. Ambedkar' },
        { label: 'C', text: 'Jawaharlal Nehru' },
        { label: 'D', text: 'Sardar Patel' },
      ],
      correctOptionLabel: 'B',
      officialExplanation: { steps: ['Dr. B. R. Ambedkar chaired the drafting committee.'] },
    },
  ],
  null,
  2,
);

interface ParsedRow { row: BulkRowInput; localErrors: string[] }

function clientValidate(row: BulkRowInput): string[] {
  const errors: string[] = [];
  if (!row.subjectId && !row.subjectCode) errors.push('subjectId or subjectCode required');
  if (!row.topicId   && !row.topicCode)   errors.push('topicId or topicCode required');
  if (!row.examIds?.length && !row.examCodes?.length) errors.push('examIds or examCodes required');
  if (!row.prompt?.trim()) errors.push('prompt required');
  if (!row.options?.length || row.options.length < 2) errors.push('at least 2 options');
  if (!row.correctOptionLabel) errors.push('correctOptionLabel required');
  if (row.correctOptionLabel && row.options?.length &&
      !row.options.some(o => o.label === row.correctOptionLabel)) {
    errors.push('correctOptionLabel does not match any option');
  }
  return errors;
}

export default function BulkImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [raw, setRaw] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const bulkMutation = useBulkCreateQuestions();

  // Parse JSON + per-row validation
  const parsed = useMemo<ParsedRow[] | null>(() => {
    if (!raw.trim()) { setParseError(null); return null; }
    try {
      const json = JSON.parse(raw);
      if (!Array.isArray(json)) {
        setParseError('Top-level value must be an array of questions');
        return null;
      }
      setParseError(null);
      return json.map((row: BulkRowInput) => ({ row, localErrors: clientValidate(row) }));
    } catch (e: any) {
      setParseError(e?.message ?? 'Invalid JSON');
      return null;
    }
  }, [raw]);

  const validCount   = parsed?.filter(p => p.localErrors.length === 0).length ?? 0;
  const invalidCount = (parsed?.length ?? 0) - validCount;

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result ?? ''));
    reader.readAsText(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  function handleImport() {
    if (!parsed) return;
    // Send only valid rows; the server still validates again
    const rows = parsed.filter(p => p.localErrors.length === 0).map(p => p.row);
    if (rows.length === 0) return;
    bulkMutation.mutate(rows, {
      onSuccess: (res) => setResult(res),
    });
  }

  function reset() {
    setRaw('');
    setResult(null);
    setParseError(null);
  }

  // Results view
  if (result) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm text-app-muted">
            <Link to={ROUTES.QUESTIONS} className="hover:text-app-text">Questions</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-app-text">Bulk import · Results</span>
          </div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Import complete</h1>
          <p className="text-sm text-app-muted">
            {result.succeeded} of {result.total} created
            {result.failed > 0 && <> · <span className="text-red-600">{result.failed} failed</span></>}
          </p>
        </div>

        {result.failed > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50/40 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-red-200 text-sm font-semibold text-red-700">Failed rows</div>
            <ul className="divide-y divide-red-100">
              {result.rows.filter(r => !r.ok).map((r) => (
                <li key={r.index} className="px-4 py-2.5 flex items-start gap-3 text-sm">
                  <span className="font-mono text-app-muted shrink-0">#{r.index + 1}</span>
                  <span className="text-red-700">{(r as any).error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>Import another batch</Button>
          <Button onClick={() => navigate(ROUTES.QUESTIONS)}>Done</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-sm text-app-muted">
          <Link to={ROUTES.QUESTIONS} className="hover:text-app-text">Questions</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-app-text">Bulk import</span>
        </div>
        <div>
          <div className="text-xs font-bold text-app-muted uppercase tracking-widest mb-1">Content · Questions</div>
          <h1 className="text-2xl font-bold text-app-text tracking-tight">Bulk import</h1>
          <p className="text-sm text-app-muted mt-1">
            Paste a JSON array of questions, or drop a <code className="font-mono">.json</code> file. Up to 200 rows per batch.
          </p>
        </div>
      </div>

      {/* Format reference */}
      <details className="rounded-lg border border-app-border bg-app-bg p-4">
        <summary className="cursor-pointer text-sm font-semibold text-app-text inline-flex items-center gap-2">
          <FileJson className="h-4 w-4" />
          Expected format (click to expand sample)
        </summary>
        <div className="mt-3 space-y-2">
          <p className="text-xs text-app-muted">
            Use <code className="font-mono">subjectCode</code> / <code className="font-mono">topicCode</code> / <code className="font-mono">examCodes</code>
            {' '}so you don't need UUIDs. <code className="font-mono">difficulty</code>, <code className="font-mono">xpReward</code>,
            {' '}<code className="font-mono">status</code> and <code className="font-mono">officialExplanation</code> are optional.
          </p>
          <pre className="text-xs font-mono bg-white border border-app-border rounded p-3 overflow-x-auto">
{SAMPLE}
          </pre>
        </div>
      </details>

      {/* Drop / paste area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="rounded-lg border-2 border-dashed border-app-border bg-white p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-app-text">JSON</label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload file
            </Button>
            {raw && <Button type="button" variant="ghost" size="sm" onClick={reset}>Clear</Button>}
          </div>
        </div>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder='[{ "subjectCode": "polity", "topicCode": "indian-constitution", "examCodes": ["psc-ldc"], "prompt": "...", "options": [...], "correctOptionLabel": "B" }]'
          rows={14}
          className="w-full font-mono text-xs rounded-md border border-app-border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Parse / validation feedback */}
      {parseError && (
        <div className="rounded-lg border border-red-200 bg-red-50/40 p-3 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>JSON parse error: {parseError}</span>
        </div>
      )}

      {parsed && (
        <div className="rounded-lg border border-app-border bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-app-border flex items-center justify-between">
            <div className="text-sm font-semibold text-app-text">
              {parsed.length} row{parsed.length === 1 ? '' : 's'} parsed
            </div>
            <div className="text-xs text-app-muted">
              <span className="text-emerald-700 font-semibold">{validCount} valid</span>
              {invalidCount > 0 && (
                <> · <span className="text-red-700 font-semibold">{invalidCount} invalid</span></>
              )}
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <ul className="divide-y divide-app-border">
              {parsed.map((p, i) => (
                <li key={i} className="px-4 py-2.5 flex items-start gap-3 text-sm">
                  <span className="font-mono text-app-muted shrink-0 w-6">#{i + 1}</span>
                  {p.localErrors.length === 0 ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                      <span className="flex-1 truncate text-app-text">{p.row.prompt ?? '(no prompt)'}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-app-text truncate">{p.row.prompt ?? '(no prompt)'}</div>
                        <div className="text-red-700 text-xs mt-0.5">{p.localErrors.join(' · ')}</div>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={cn(
        'sticky bottom-0 -mx-6 md:-mx-8 px-6 md:px-8 py-4 bg-white border-t border-app-border z-10',
        'flex items-center justify-end gap-2',
      )}>
        {bulkMutation.isError && (
          <span className="text-sm text-red-600 mr-auto">
            {(bulkMutation.error as any)?.response?.data?.message ?? 'Import failed.'}
          </span>
        )}
        <Button variant="outline" onClick={() => navigate(ROUTES.QUESTIONS)}>Cancel</Button>
        <Button
          onClick={handleImport}
          disabled={!parsed || validCount === 0 || bulkMutation.isPending}
        >
          {bulkMutation.isPending
            ? 'Importing…'
            : validCount > 0
              ? `Import ${validCount} question${validCount === 1 ? '' : 's'}`
              : 'Import'}
        </Button>
      </div>
    </div>
  );
}
