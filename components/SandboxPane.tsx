'use client';

import { useState, useEffect, useRef } from 'react';
import { useRegexStore, type MatchResultItem, type MatchAllResult } from '@/lib/store/useRegexStore';
import { useDebouncedCallback } from 'use-debounce';

type Segment = { type: 'match'; start: number; end: number; text: string } | { type: 'text'; start: number; end: number; text: string };

function segmentsFromMatchResults(text: string, matchResults: MatchResultItem[]): Segment[] {
  if (matchResults.length === 0) {
    return text ? [{ type: 'text', start: 0, end: text.length, text }] : [];
  }
  const sorted = [...matchResults].sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let last = 0;
  for (const m of sorted) {
    if (m.start > last) {
      out.push({ type: 'text', start: last, end: m.start, text: text.slice(last, m.start) });
    }
    out.push({ type: 'match', start: m.start, end: m.end, text: m.match });
    last = m.end;
  }
  if (last < text.length) {
    out.push({ type: 'text', start: last, end: text.length, text: text.slice(last) });
  }
  return out;
}

function MatchHighlight({
  text,
  matchResults,
  isMatch,
  label,
}: {
  text: string;
  matchResults: MatchResultItem[];
  isMatch: boolean;
  label: string;
}) {
  const segments = segmentsFromMatchResults(text, matchResults);
  if (!text) return null;
  return (
    <div className="mt-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="font-mono text-sm text-slate-200 break-all leading-relaxed">
        {segments.map((seg, i) =>
          seg.type === 'match' ? (
            <span key={i} className="bg-green-500/30 text-green-200 rounded px-0.5">
              {seg.text}
            </span>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </div>
    </div>
  );
}

function MatchDetails({
  matchResults,
  error,
  emptyMessage,
}: {
  matchResults: MatchResultItem[];
  error: string | null;
  emptyMessage?: string;
}) {
  if (error) return null;
  if (matchResults.length === 0) {
    if (emptyMessage) {
      return (
        <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2">
          <div className="text-xs font-medium text-green-400/90">{emptyMessage}</div>
        </div>
      );
    }
    return null;
  }
  return (
    <div className="mt-2 rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2">
      <div className="text-xs font-medium text-slate-400 mb-2">
        Match details ({matchResults.length} match{matchResults.length !== 1 ? 'es' : ''})
      </div>
      <ul className="space-y-2 max-h-32 overflow-y-auto">
        {matchResults.map((m, i) => (
          <li key={i} className="text-xs font-mono text-slate-300 border-l-2 border-green-500/50 pl-2">
            <span className="text-slate-500">#{m.index}</span> [{m.start}, {m.end}) &ldquo;{m.match}&rdquo;
            {m.groups.length > 0 && (
              <div className="mt-0.5 text-slate-400">
                Groups: {m.groups.map((g, j) => `[${j + 1}]="${g}"`).join(', ')}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SandboxPane() {
  const {
    safeString,
    deniedString,
    setSafeString,
    setDeniedString,
    testMatch,
    testMatchAll,
    batchTestStrings,
    setBatchTestStrings,
    clearBatchTestStrings,
    debugMode,
    debugSteps,
    debugStepIndex,
    debugTestString,
    startDebug,
    stopDebug,
    debugNextStep,
    debugPrevStep,
  } = useRegexStore();

  const [safeResult, setSafeResult] = useState<{
    matches: boolean;
    groups: string[];
    error: string | null;
  } | null>(null);
  const [safeMatchAll, setSafeMatchAll] = useState<MatchAllResult | null>(null);
  const [deniedResult, setDeniedResult] = useState<{
    matches: boolean;
    groups: string[];
    error: string | null;
  } | null>(null);
  const [deniedMatchAll, setDeniedMatchAll] = useState<MatchAllResult | null>(null);
  const [pasteStatus, setPasteStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const debouncedTestSafe = useDebouncedCallback((value: string) => {
    if (value !== '') {
      setSafeResult(testMatch(value));
      setSafeMatchAll(testMatchAll(value));
    } else {
      setSafeResult(null);
      setSafeMatchAll(null);
    }
  }, 300);

  const debouncedTestDenied = useDebouncedCallback((value: string) => {
    if (value !== '') {
      setDeniedResult(testMatch(value));
      setDeniedMatchAll(testMatchAll(value));
    } else {
      setDeniedResult(null);
      setDeniedMatchAll(null);
    }
  }, 300);

  useEffect(() => {
    debouncedTestSafe(safeString);
  }, [safeString, debouncedTestSafe]);

  useEffect(() => {
    debouncedTestDenied(deniedString);
  }, [deniedString, debouncedTestDenied]);

  const handlePaste = async (target: 'safe' | 'denied') => {
    setPasteStatus('idle');
    try {
      const text = await navigator.clipboard.readText();
      if (target === 'safe') setSafeString(text);
      else setDeniedString(text);
      setPasteStatus('ok');
      setTimeout(() => setPasteStatus('idle'), 1500);
    } catch {
      setPasteStatus('err');
      setTimeout(() => setPasteStatus('idle'), 2000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = (reader.result as string) ?? '';
      const lines = raw.split(/\r?\n/).map((s) => s.trim()).filter((s) => s.length > 0);
      setBatchTestStrings(lines);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full border-t border-slate-700">
      <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
        {/* Toolbar: Paste + Upload */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handlePaste('safe')}
            className="text-xs px-2 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            Paste to Safe
          </button>
          <button
            type="button"
            onClick={() => handlePaste('denied')}
            className="text-xs px-2 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            Paste to Denied
          </button>
          {pasteStatus === 'ok' && <span className="text-xs text-green-400">Pasted</span>}
          {pasteStatus === 'err' && <span className="text-xs text-red-400">Paste failed</span>}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,text/plain"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload plain text file"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-2 py-1.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors"
          >
            Upload .txt (one per line)
          </button>
          {batchTestStrings.length > 0 && (
            <button
              type="button"
              onClick={clearBatchTestStrings}
              className="text-xs px-2 py-1.5 rounded-md border border-slate-600 text-slate-400 hover:bg-slate-800 transition-colors"
            >
              Clear batch
            </button>
          )}
        </div>

        {/* Batch list: one line = one entity */}
        {batchTestStrings.length > 0 && (
          <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
            <div className="text-xs font-medium text-slate-400 mb-2">
              Batch: {batchTestStrings.length} line{batchTestStrings.length !== 1 ? 's' : ''} (click to use as Safe)
            </div>
            <ul className="space-y-1 max-h-24 overflow-y-auto">
              {batchTestStrings.slice(0, 50).map((line, i) => {
                const res = testMatch(line);
                return (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => setSafeString(line)}
                      className="w-full text-left text-xs font-mono px-2 py-1 rounded hover:bg-slate-800 flex items-center gap-2"
                    >
                      <span className={res.matches ? 'text-green-400' : 'text-slate-500'}>
                        {res.matches ? '✓' : '○'}
                      </span>
                      <span className="text-slate-300 truncate flex-1" title={line}>
                        {line.length > 60 ? line.slice(0, 60) + '…' : line}
                      </span>
                    </button>
                  </li>
                );
              })}
              {batchTestStrings.length > 50 && (
                <li className="text-xs text-slate-500 px-2">… and {batchTestStrings.length - 50} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Safe String Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-300 mb-2">Safe (Should Match)</label>
          <div className="relative">
            <textarea
              value={safeString}
              onChange={(e) => setSafeString(e.target.value)}
              placeholder="Enter string that should match..."
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border font-mono text-sm bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all resize-y min-h-10 ${
                safeResult?.matches
                  ? 'border-green-500 shadow-lg shadow-green-500/20'
                  : safeResult?.error
                    ? 'border-red-500'
                    : 'border-slate-700 focus:border-slate-600'
              }`}
            />
            {safeResult && (
              <div className="mt-1 text-xs">
                {safeResult.matches ? (
                  <span className="text-green-400 font-medium">
                    ✓ Matches
                    {safeMatchAll?.matchResults.length
                      ? ` (${safeMatchAll.matchResults.length} match${safeMatchAll.matchResults.length > 1 ? 'es' : ''})`
                      : safeResult.groups.length > 0
                        ? ` (${safeResult.groups.length} group${safeResult.groups.length > 1 ? 's' : ''})`
                        : ''}
                  </span>
                ) : safeResult.error ? (
                  <span className="text-red-400 font-medium">✗ {safeResult.error}</span>
                ) : (
                  <span className="text-slate-400">✗ No match</span>
                )}
              </div>
            )}
            <MatchHighlight
              text={safeString}
              matchResults={safeMatchAll?.matchResults ?? []}
              isMatch={safeResult?.matches ?? false}
              label="Highlight"
            />
            <MatchDetails matchResults={safeMatchAll?.matchResults ?? []} error={safeMatchAll?.error ?? null} />
            {!debugMode && safeString.trim() && (
              <button
                type="button"
                onClick={() => startDebug(safeString)}
                className="mt-2 text-xs px-2 py-1.5 rounded-md border border-violet-500/60 text-violet-300 hover:bg-violet-500/20 transition-colors"
              >
                Step through match
              </button>
            )}
          </div>
        </div>

        {/* Step-by-step debug bar */}
        {debugMode && (
          <div className="rounded-lg border border-violet-500/50 bg-slate-900/80 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-medium text-violet-300">Step-by-step debug</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={debugPrevStep}
                  disabled={debugStepIndex <= 0}
                  className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>
                <span className="text-xs text-slate-400 min-w-16 text-center">
                  {debugSteps.length > 0 ? `${debugStepIndex + 1} / ${debugSteps.length}` : '0 / 0'}
                </span>
                <button
                  type="button"
                  onClick={debugNextStep}
                  disabled={debugSteps.length === 0 || debugStepIndex >= debugSteps.length - 1}
                  className="text-xs px-2 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
                <button
                  type="button"
                  onClick={stopDebug}
                  className="text-xs px-2 py-1 rounded border border-red-500/60 text-red-300 hover:bg-red-500/20"
                >
                  Stop
                </button>
              </div>
            </div>
            {debugSteps.length === 0 ? (
              <p className="text-xs text-slate-400">No match — enter a string that matches the regex to step through.</p>
            ) : (
              <div className="rounded border border-slate-700 bg-slate-950/80 px-3 py-2">
                <div className="text-xs text-slate-400 mb-1">String position (cursor at step)</div>
                <div className="font-mono text-sm text-slate-200 break-all leading-relaxed flex flex-wrap items-center">
                  {Array.from(debugTestString).map((char, i) => (
                    <span key={i} className={i === (debugSteps[debugStepIndex]?.stringIndex ?? 0) ? 'bg-violet-500/40 text-violet-200 rounded px-0.5' : ''}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                  {(debugSteps[debugStepIndex]?.stringIndex ?? 0) >= debugTestString.length && (
                    <span className="bg-violet-500/40 text-violet-200 rounded px-0.5 ml-0.5">│</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Denied String Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-300 mb-2">Denied (Should Not Match)</label>
          <div className="relative">
            <textarea
              value={deniedString}
              onChange={(e) => setDeniedString(e.target.value)}
              placeholder="Enter string that should NOT match..."
              rows={2}
              className={`w-full px-3 py-2 rounded-lg border font-mono text-sm bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-y min-h-10 ${
                deniedResult?.matches
                  ? 'border-red-500 shadow-lg shadow-red-500/20'
                  : deniedResult?.error
                    ? 'border-red-500'
                    : 'border-slate-700 focus:border-slate-600'
              }`}
            />
            {deniedResult && (
              <div className="mt-1 text-xs">
                {deniedResult.matches ? (
                  <span className="text-red-400 font-medium">⚠ Matches (should not!)</span>
                ) : deniedResult.error ? (
                  <span className="text-red-400 font-medium">✗ {deniedResult.error}</span>
                ) : (
                  <span className="text-green-400 font-medium">✓ Correctly rejected</span>
                )}
              </div>
            )}
            <MatchHighlight
              text={deniedString}
              matchResults={deniedMatchAll?.matchResults ?? []}
              isMatch={deniedResult?.matches ?? false}
              label="Highlight"
            />
            <MatchDetails
              matchResults={deniedMatchAll?.matchResults ?? []}
              error={deniedMatchAll?.error ?? null}
              emptyMessage={deniedString.trim() ? 'No matches – correctly rejected' : undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
