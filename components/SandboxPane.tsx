'use client';

import { useState, useEffect } from 'react';
import { useRegexStore } from '@/lib/store/useRegexStore';
import { useDebouncedCallback } from 'use-debounce';

export default function SandboxPane() {
  const { safeString, deniedString, setSafeString, setDeniedString, testMatch } =
    useRegexStore();
  const [safeResult, setSafeResult] = useState<{
    matches: boolean;
    groups: string[];
    error: string | null;
  } | null>(null);
  const [deniedResult, setDeniedResult] = useState<{
    matches: boolean;
    groups: string[];
    error: string | null;
  } | null>(null);

  const debouncedTestSafe = useDebouncedCallback((value: string) => {
    if (value) {
      setSafeResult(testMatch(value));
    } else {
      setSafeResult(null);
    }
  }, 300);

  const debouncedTestDenied = useDebouncedCallback((value: string) => {
    if (value) {
      setDeniedResult(testMatch(value));
    } else {
      setDeniedResult(null);
    }
  }, 300);

  useEffect(() => {
    debouncedTestSafe(safeString);
  }, [safeString, debouncedTestSafe]);

  useEffect(() => {
    debouncedTestDenied(deniedString);
  }, [deniedString, debouncedTestDenied]);

  return (
    <div className="flex flex-col h-full border-t border-slate-700">
      <div className="flex-1 flex flex-col p-4 space-y-4">
        {/* Safe String Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-300 mb-2">
            Safe (Should Match)
          </label>
          <div className="relative">
            <input
              type="text"
              value={safeString}
              onChange={(e) => setSafeString(e.target.value)}
              placeholder="Enter string that should match..."
              className={`w-full px-3 py-2 rounded-lg border font-mono text-sm bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all ${
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
                    {safeResult.groups.length > 0 &&
                      ` (${safeResult.groups.length} group${safeResult.groups.length > 1 ? 's' : ''})`}
                  </span>
                ) : safeResult.error ? (
                  <span className="text-red-400 font-medium">✗ {safeResult.error}</span>
                ) : (
                  <span className="text-slate-400">✗ No match</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Denied String Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-slate-300 mb-2">
            Denied (Should Not Match)
          </label>
          <div className="relative">
            <input
              type="text"
              value={deniedString}
              onChange={(e) => setDeniedString(e.target.value)}
              placeholder="Enter string that should NOT match..."
              className={`w-full px-3 py-2 rounded-lg border font-mono text-sm bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all ${
                deniedResult?.matches
                  ? 'border-red-500 shadow-lg shadow-red-500/20 animate-pulse'
                  : deniedResult?.error
                    ? 'border-red-500'
                    : 'border-slate-700 focus:border-slate-600'
              }`}
            />
            {deniedResult && (
              <div className="mt-1 text-xs">
                {deniedResult.matches ? (
                  <span className="text-red-400 font-medium animate-pulse">
                    ⚠ Matches (should not!)
                  </span>
                ) : deniedResult.error ? (
                  <span className="text-red-400 font-medium">✗ {deniedResult.error}</span>
                ) : (
                  <span className="text-green-400 font-medium">✓ Correctly rejected</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
