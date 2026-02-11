import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'create-a-project', text: 'Create a Project', level: 2 },
  { id: 'install-the-sdk', text: 'Install the SDK', level: 2 },
  { id: 'initialize-and-check', text: 'Initialize and Check a Flag', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function QuickStartPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Quick Start' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Getting Started</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Get up and running with Crivline in under 5 minutes. This guide will walk you through creating your first project, installing the SDK, and checking your first feature flag.
        </p>

        <h2 id="create-a-project" className="text-xl font-semibold text-gray-900 mb-3">1. Create a Project</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Head to the Crivline dashboard and create a new project. Once created, copy your project key from the settings page. You&apos;ll need this to initialize the SDK.
        </p>

        <h2 id="install-the-sdk" className="text-xl font-semibold text-gray-900 mb-3">2. Install the SDK</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Install the Crivline SDK in your project using npm:
        </p>
        <CodeBlock terminal title="Terminal">
          <span className="text-emerald-400">npm install</span>
          <span className="text-slate-300"> @crivline/sdk</span>
        </CodeBlock>

        <h2 id="initialize-and-check" className="text-xl font-semibold text-gray-900 mb-3">3. Initialize and Check a Flag</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Import the SDK, initialize it with your project key, and check your first feature flag:
        </p>
        <CodeBlock title="app.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/sdk'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' crivline = '}</span>
          <span className="text-indigo-400">new</span>
          <span className="text-emerald-400">{' Crivline'}</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  projectKey: '}</span>
          <span className="text-slate-300">{'process.env.'}</span>
          <span className="text-emerald-400">CRIVLINE_PROJECT_KEY</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Check if a feature is enabled'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' isNewFeatureEnabled = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' crivline.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'new-feature'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (isNewFeatureEnabled) {'}</span>
          {'\n'}
          <span className="text-slate-500">{'  // Show new feature'}</span>
          {'\n'}
          <span className="text-slate-300">{'} '}</span>
          <span className="text-indigo-400">else</span>
          <span className="text-slate-300">{' {'}</span>
          {'\n'}
          <span className="text-slate-500">{'  // Show original experience'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-8">
          That&apos;s it! You&apos;re now ready to start using feature flags in your application. Check out the installation guide for more configuration options and framework-specific setup instructions.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Installation"
            description="More configuration options and framework-specific setup"
            href="/docs/installation"
          />
          <InfoCard
            title="JavaScript SDK"
            description="Full API reference for the JavaScript SDK"
            href="/docs/sdk/javascript"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
