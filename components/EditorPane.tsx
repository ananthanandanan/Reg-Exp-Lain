'use client';

import { useRef } from 'react';
import { useRegexStore } from '@/lib/store/useRegexStore';
import { useDebouncedCallback } from 'use-debounce';

export default function EditorPane() {
  const { regexInput, error, setRegexInput, setSelectedEditorRange } = useRegexStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedParse = useDebouncedCallback(() => {
    // Parsing happens automatically in setRegexInput
  }, 300);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRegexInput(e.target.value);
    debouncedParse();
  };

  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end) {
        setSelectedEditorRange({ start, end });
      } else {
        setSelectedEditorRange(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <label className="text-sm font-medium text-slate-300 mb-2 px-4 pt-4">
        Regex Pattern
      </label>
      <div className="flex-1 flex flex-col px-4 pb-4">
        <textarea
          ref={textareaRef}
          value={regexInput}
          onChange={handleInput}
          onSelect={handleSelect}
          placeholder="Enter regex pattern, e.g., /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/"
          className={`flex-1 w-full px-3 py-2 rounded-lg border font-mono text-sm bg-slate-900/50 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-700 focus:border-slate-600'
          }`}
        />
        {error && (
          <div className="mt-2 text-xs text-red-400 font-medium">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}
