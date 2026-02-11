import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'quick-start', text: 'Quick Start', level: 2 },
  { id: 'api-reference', text: 'API Reference', level: 2 },
  { id: 'crivline-init', text: 'Crivline.init()', level: 3 },
  { id: 'flags-is-enabled', text: 'flags.isEnabled()', level: 3 },
  { id: 'flags-get-value', text: 'flags.getValue()', level: 3 },
  { id: 'flags-on-change', text: "flags.on('change')", level: 3 },
  { id: 'flags-destroy', text: 'flags.destroy()', level: 3 },
  { id: 'runtime-support', text: 'Runtime Support', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function JavaScriptSDKPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'SDK Reference', href: '/docs/sdk/javascript' }, { label: 'JavaScript SDK' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">SDK Reference</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">JavaScript SDK</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          The Crivline JavaScript SDK provides a lightweight, framework-agnostic solution for feature flags in any JavaScript environment. It works seamlessly in Node.js, browsers, Deno, and edge runtimes like Cloudflare Workers and Vercel Edge Functions.
        </p>

        <h2 id="installation" className="text-xl font-semibold text-gray-900 mb-3">Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Install the SDK using your preferred package manager.
        </p>
        <CodeBlock terminal title="Terminal">
          <span className="text-emerald-400">npm install</span>
          <span className="text-slate-300">{' @crivline/js'}</span>
        </CodeBlock>

        <h2 id="quick-start" className="text-xl font-semibold text-gray-900 mb-3">Quick Start</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Initialize the SDK with your API key and start evaluating feature flags immediately.
        </p>
        <CodeBlock title="init.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/js'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' flags = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{'.'}</span>
          <span className="text-emerald-400">init</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  apiKey: '}</span>
          <span className="text-amber-400">{"'cvl_your_api_key'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  context: {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    userId: '}</span>
          <span className="text-amber-400">{"'user_123'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    attributes: {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      plan: '}</span>
          <span className="text-amber-400">{"'pro'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      region: '}</span>
          <span className="text-amber-400">{"'us-east'"}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h2 id="api-reference" className="text-xl font-semibold text-gray-900 mb-6">API Reference</h2>

        <h3 id="crivline-init" className="text-base font-semibold text-gray-900 mb-2">Crivline.init()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Initializes the Crivline client and fetches flag configurations. Returns a Promise that resolves to a flags instance.
        </p>
        <CodeBlock title="init.ts">
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' flags = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{'.'}</span>
          <span className="text-emerald-400">init</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  apiKey: '}</span>
          <span className="text-amber-400">{"'cvl_your_api_key'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  context: '}</span>
          <span className="text-slate-500">{'// Optional user context'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h3 id="flags-is-enabled" className="text-base font-semibold text-gray-900 mb-2">flags.isEnabled()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Check if a boolean flag is enabled. Returns <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">true</code> or <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">false</code>.
        </p>
        <CodeBlock title="is-enabled.ts">
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (flags.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'new-dashboard'"}</span>
          <span className="text-slate-300">{')) {'}</span>
          {'\n'}
          <span className="text-slate-500">{'  // Show new dashboard UI'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">renderNewDashboard</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'} '}</span>
          <span className="text-indigo-400">else</span>
          <span className="text-slate-300">{' {'}</span>
          {'\n'}
          <span className="text-slate-500">{'  // Show legacy dashboard'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">renderLegacyDashboard</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h3 id="flags-get-value" className="text-base font-semibold text-gray-900 mb-2">flags.getValue()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Get the value of any flag type (string, number, JSON). Accepts an optional default value.
        </p>
        <CodeBlock title="get-value.ts">
          <span className="text-slate-500">{'// String flag'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' theme = flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'theme'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-amber-400">{"'light'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Number flag'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' maxResults = flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'search-max-results'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'10'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// JSON flag'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' config = flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'feature-config'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'{ enabled: '}</span>
          <span className="text-indigo-400">false</span>
          <span className="text-slate-300">{' }'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h3 id="flags-on-change" className="text-base font-semibold text-gray-900 mb-2">flags.on(&apos;change&apos;)</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Listen for real-time flag updates via streaming or polling. Perfect for dynamic configuration changes without redeployment.
        </p>
        <CodeBlock title="on-change.ts">
          <span className="text-slate-300">{'flags.'}</span>
          <span className="text-emerald-400">on</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'change'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'(flagKey'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'newValue) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  console.'}</span>
          <span className="text-emerald-400">log</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{'`Flag ${flagKey} changed to:`'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'newValue'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'  // Update UI reactively'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (flagKey === '}</span>
          <span className="text-amber-400">{"'theme'"}</span>
          <span className="text-slate-300">{') {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-emerald-400">applyTheme</span>
          <span className="text-slate-300">{'(newValue)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h3 id="flags-destroy" className="text-base font-semibold text-gray-900 mb-2">flags.destroy()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Clean up resources and close any active connections. Important for preventing memory leaks in long-running applications.
        </p>
        <CodeBlock title="destroy.ts">
          <span className="text-slate-500">{'// Clean up when done'}</span>
          {'\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' flags.'}</span>
          <span className="text-emerald-400">destroy</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h2 id="runtime-support" className="text-xl font-semibold text-gray-900 mb-3">Runtime Support</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The JavaScript SDK is designed to work in any modern JavaScript environment:
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Node.js:</strong> Full support for Node.js 16+, including CommonJS and ES modules.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Browsers:</strong> Works in all modern browsers with native fetch support.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Deno:</strong> First-class support for Deno&apos;s module system and security model.
        </p>
        <p className="text-gray-600 leading-relaxed mb-8">
          <strong className="text-gray-900">Edge Runtimes:</strong> Optimized for Cloudflare Workers, Vercel Edge, Deno Deploy, and other edge computing platforms.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="React SDK"
            description="React hooks and components for feature flags"
            href="/docs/sdk/react"
          />
          <InfoCard
            title="Node.js SDK"
            description="Server-side SDK for backend services"
            href="/docs/sdk/node"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
