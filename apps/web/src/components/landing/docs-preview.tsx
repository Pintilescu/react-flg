import Link from 'next/link';

export function DocsPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-emerald-950 px-8 py-16 md:px-16 md:py-20 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Get integrated in 3 minutes
              </h2>
              <p className="mt-4 text-emerald-200/80 leading-relaxed max-w-md">
                Our documentation is written by developers, for developers. Comprehensive guides, SDK references, and best practices to get you live faster.
              </p>
              <Link
                href="/docs"
                className="mt-6 inline-flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Read documentation &rarr;
              </Link>
            </div>

            {/* Right — Code mockup */}
            <div className="rounded-xl border border-emerald-800/50 bg-emerald-900/50 overflow-hidden shadow-xl">
              {/* Title bar */}
              <div className="flex items-center px-4 py-2.5 border-b border-emerald-800/50 bg-emerald-900/30">
                <span className="text-xs text-emerald-400 font-mono">Quickstart Guide</span>
              </div>
              {/* Content lines */}
              <div className="p-5 space-y-3">
                <div className="h-2.5 w-3/4 rounded-full bg-emerald-800/40" />
                <div className="h-2.5 w-full rounded-full bg-emerald-800/40" />
                <div className="h-2.5 w-5/6 rounded-full bg-emerald-800/40" />
                <div className="h-2.5 w-2/3 rounded-full bg-emerald-800/40" />

                {/* Code block inside */}
                <div className="mt-4 rounded-lg bg-emerald-950/80 border border-emerald-800/30 p-4">
                  <pre className="font-mono text-sm leading-relaxed">
                    <span className="text-emerald-400">npm install</span>
                    <span className="text-emerald-200/60">{' @crivline/node'}</span>
                  </pre>
                </div>

                <div className="h-2.5 w-full rounded-full bg-emerald-800/40" />
                <div className="h-2.5 w-4/5 rounded-full bg-emerald-800/40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
