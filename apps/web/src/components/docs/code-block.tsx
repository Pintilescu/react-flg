'use client';

import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

interface CodeBlockProps {
  children: React.ReactNode;
  title?: string;
  terminal?: boolean;
}

export function CodeBlock({ children, title, terminal }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = async () => {
    const text = preRef.current?.innerText;
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 mb-6 overflow-hidden">
      {(terminal || title) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-950/50">
          <div className="flex items-center gap-2">
            {terminal && (
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
            )}
            {title && (
              <span className="text-xs font-mono text-gray-500">{title}</span>
            )}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
      {!terminal && !title && (
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1 rounded bg-gray-800/80"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
      <div className="relative p-5 overflow-x-auto docs-code-scrollbar">
        <pre className="font-mono text-sm leading-relaxed" ref={preRef}>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
