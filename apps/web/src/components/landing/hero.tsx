import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1]">
              Feature flags without the{' '}
              <span className="text-emerald-600">complexity</span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
              Decouple code deployments from feature releases. Scale with confidence using our developer-first SDKs and edge-optimized evaluation.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-3">
              <Link
                href="/signup"
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500 transition-colors"
              >
                Start building for free
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors"
              >
                Book a demo
              </Link>
            </div>
          </div>

          {/* Right side — Code block */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-950/50">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <span className="ml-2 text-xs text-gray-500 font-mono">app.ts</span>
            </div>
            {/* Code */}
            <div className="p-5 overflow-x-auto">
              <pre className="font-mono text-sm leading-relaxed">
                <code>
                  <span className="text-gray-500 select-none mr-4">{'  1'}</span>
                  <span className="text-indigo-400">import</span>
                  <span className="text-slate-300">{' { '}</span>
                  <span className="text-emerald-400">Crivline</span>
                  <span className="text-slate-300">{' } '}</span>
                  <span className="text-indigo-400">from</span>
                  <span className="text-amber-400">{" '@crivline/node'"}</span>
                  <span className="text-slate-500">;</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  2'}</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  3'}</span>
                  <span className="text-indigo-400">const</span>
                  <span className="text-slate-300">{' client = '}</span>
                  <span className="text-indigo-400">new</span>
                  <span className="text-slate-300">{' '}</span>
                  <span className="text-emerald-400">Crivline</span>
                  <span className="text-slate-300">{'('}</span>
                  <span className="text-amber-400">{"'fl_prod_82z...'"}</span>
                  <span className="text-slate-300">{')'}</span>
                  <span className="text-slate-500">;</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  4'}</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  5'}</span>
                  <span className="text-indigo-400">async function</span>
                  <span className="text-slate-300">{' '}</span>
                  <span className="text-emerald-400">initApp</span>
                  <span className="text-slate-300">{'() {'}</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  6'}</span>
                  <span className="text-slate-300">{'  '}</span>
                  <span className="text-indigo-400">const</span>
                  <span className="text-slate-300">{' isEnabled = '}</span>
                  <span className="text-indigo-400">await</span>
                  <span className="text-slate-300">{' client.'}</span>
                  <span className="text-emerald-400">isEnabled</span>
                  <span className="text-slate-300">{'('}</span>
                  <span className="text-amber-400">{"'new-search-AI'"}</span>
                  <span className="text-slate-300">{')'}</span>
                  <span className="text-slate-500">;</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  7'}</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  8'}</span>
                  <span className="text-slate-300">{'  '}</span>
                  <span className="text-indigo-400">if</span>
                  <span className="text-slate-300">{' (isEnabled) {'}</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{'  9'}</span>
                  <span className="text-slate-300">{'    '}</span>
                  <span className="text-emerald-400">renderAISearch</span>
                  <span className="text-slate-300">{'()'}</span>
                  <span className="text-slate-500">;</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{' 10'}</span>
                  <span className="text-slate-300">{'  }'}</span>
                  {'\n'}
                  <span className="text-gray-500 select-none mr-4">{' 11'}</span>
                  <span className="text-slate-300">{'}'}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
