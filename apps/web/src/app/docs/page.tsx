import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'how-it-works', text: 'How it works', level: 2 },
  { id: 'quick-example', text: 'Quick example', level: 2 },
  { id: 'core-concepts', text: 'Core concepts', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function DocsPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Introduction' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Getting Started</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Introduction</h1>
        <p className="text-gray-600 leading-relaxed mb-8">
          Crivline is a feature flag management platform built for developers. Toggle features
          on and off in real-time, roll out to a percentage of users, and target specific
          environments — all through a simple REST API and lightweight SDKs.
        </p>

        <h2 id="how-it-works" className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          At its core, Crivline stores flag configurations per environment. Your application
          fetches these configurations through the SDK or REST API, evaluates them against the
          current user context, and returns a boolean or variant value. Changes propagate in
          real-time — no redeployment required.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">1. Install</p>
            <p className="text-xs text-gray-500">Add the SDK to your project with npm or yarn.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">2. Configure</p>
            <p className="text-xs text-gray-500">Set your project key as an environment variable.</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">3. Evaluate</p>
            <p className="text-xs text-gray-500">Check flags in your code with a single function call.</p>
          </div>
        </div>

        <h2 id="quick-example" className="text-xl font-semibold text-gray-900 mb-3">Quick example</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Install the JavaScript SDK and initialize it with your project key:
        </p>

        <CodeBlock terminal title="Terminal">
          <span className="text-emerald-400">npm install</span>
          <span className="text-slate-300"> @crivline/sdk</span>
        </CodeBlock>

        <CodeBlock title="index.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/sdk'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' flags = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' Crivline.'}</span>
          <span className="text-emerald-400">init</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  projectKey: '}</span>
          <span className="text-amber-400">{"'pk_live_...'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Check if a flag is enabled'}</span>
          {'\n'}
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (flags.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'new-checkout'"}</span>
          <span className="text-slate-300">{')) {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">showNewCheckout</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="core-concepts" className="text-xl font-semibold text-gray-900 mb-3">Core concepts</h2>

        <div className="space-y-4 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Flags</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              A flag is a named toggle that controls whether a feature is enabled or disabled.
              Each flag has a unique key (like <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">new-checkout</code>)
              and can be configured differently per environment.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Environments</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Environments represent deployment targets — development, staging, production.
              Each environment has its own flag states, so you can enable a flag in staging
              without affecting production.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Projects</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Projects group flags and environments together. Each project gets its own API key
              and can have multiple team members with different permission levels.
            </p>
          </div>
        </div>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Quick Start"
            description="Create your first flag in under 2 minutes"
            href="/docs/quick-start"
          />
          <InfoCard
            title="Installation"
            description="Set up the SDK in your project"
            href="/docs/installation"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
