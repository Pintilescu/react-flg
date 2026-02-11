import { FolderOpen, Terminal, Code2 } from 'lucide-react';

const steps = [
  {
    icon: FolderOpen,
    step: '01',
    title: 'Create a project',
    description: 'Get your project key from the dashboard. One project per app, unlimited flags.',
  },
  {
    icon: Terminal,
    step: '02',
    title: 'Set two env variables',
    description: 'CRIVLINE_PROJECT_KEY and CRIVLINE_API_URL. That\'s the entire configuration.',
  },
  {
    icon: Code2,
    step: '03',
    title: 'Check flags in code',
    description: 'One function call. Works in any runtime — Node.js, the browser, Deno, edge functions.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 md:py-32 border-t border-slate-800/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Three steps. That&apos;s it.
          </h2>
          <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            No config files. No build plugins. No SDK bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20">
                <s.icon className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="text-xs font-mono text-indigo-400 mb-2">{s.step}</p>
              <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        {/* Curl example */}
        <div className="mt-16 max-w-2xl mx-auto">
          <p className="text-xs font-mono text-slate-500 mb-3 text-center">Works from anywhere — even curl</p>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 overflow-x-auto">
            <pre className="font-mono text-sm leading-relaxed">
              <code>
                <span className="text-emerald-400">curl</span>
                <span className="text-slate-300"> -H </span>
                <span className="text-amber-400">&quot;Authorization: Bearer pk_live_...&quot;</span>
                <span className="text-slate-300"> \</span>
                {'\n'}
                <span className="text-slate-300">{'  '}</span>
                <span className="text-slate-400">https://api.crivline.dev/v1/flags/new-checkout</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
