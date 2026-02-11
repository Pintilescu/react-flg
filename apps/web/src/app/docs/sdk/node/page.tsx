import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'quick-start', text: 'Quick Start', level: 2 },
  { id: 'express-integration', text: 'Express Integration', level: 2 },
  { id: 'fastify-integration', text: 'Fastify Integration', level: 2 },
  { id: 'per-request-evaluation', text: 'Per-Request Evaluation', level: 2 },
  { id: 'performance', text: 'Performance', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function NodeSDKPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'SDK Reference', href: '/docs/sdk/node' }, { label: 'Node.js SDK' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">SDK Reference</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Node.js SDK</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          The Crivline Node.js SDK is optimized for server-side feature flag evaluation. Built for high-performance backend services, it provides per-request flag evaluation with user context, making it perfect for APIs, webhooks, and server-rendered applications.
        </p>

        <h2 id="installation" className="text-xl font-semibold text-gray-900 mb-3">Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Install the Node.js SDK package.
        </p>
        <CodeBlock terminal title="Terminal">
          <span className="text-emerald-400">npm install</span>
          <span className="text-slate-300">{' @crivline/node'}</span>
        </CodeBlock>

        <h2 id="quick-start" className="text-xl font-semibold text-gray-900 mb-3">Quick Start</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Initialize the SDK once at application startup, then evaluate flags on each request with user-specific context.
        </p>
        <CodeBlock title="server.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/node'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Initialize once at startup'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' crivline = '}</span>
          <span className="text-indigo-400">new</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'cvl_your_api_key'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' crivline.'}</span>
          <span className="text-emerald-400">initialize</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Evaluate flags per-request'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' isEnabled = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' crivline.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'new-api-endpoint'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  userId: '}</span>
          <span className="text-amber-400">{"'user_123'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  attributes: { plan: '}</span>
          <span className="text-amber-400">{"'enterprise'"}</span>
          <span className="text-slate-300">{' }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h2 id="express-integration" className="text-xl font-semibold text-gray-900 mb-3">Express Integration</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Use Crivline as Express middleware to make flags available on every request. The middleware adds a <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">req.flags</code> object for convenient access.
        </p>
        <CodeBlock title="express.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">express</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" 'express'"}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/node'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' app = '}</span>
          <span className="text-emerald-400">express</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' crivline = '}</span>
          <span className="text-indigo-400">new</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{'(process.env.'}</span>
          <span className="text-emerald-400">CRIVLINE_API_KEY</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' crivline.'}</span>
          <span className="text-emerald-400">initialize</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Middleware to attach flags to requests'}</span>
          {'\n'}
          <span className="text-slate-300">{'app.'}</span>
          <span className="text-emerald-400">use</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-indigo-400">async</span>
          <span className="text-slate-300">{' (req'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'res'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'next) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' context = {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    userId: req.user?.id'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    attributes: {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      plan: req.user?.plan'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      email: req.user?.email'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      ipAddress: req.ip'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  req.flags = crivline.'}</span>
          <span className="text-emerald-400">forContext</span>
          <span className="text-slate-300">{'(context)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">next</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Use flags in routes'}</span>
          {'\n'}
          <span className="text-slate-300">{'app.'}</span>
          <span className="text-emerald-400">get</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'/api/dashboard'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-indigo-400">async</span>
          <span className="text-slate-300">{' (req'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'res) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' useNewAPI = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' req.flags.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'new-api-endpoint'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' maxItems = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' req.flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'dashboard-items'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'10'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (useNewAPI) {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' data = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">fetchDashboardV2</span>
          <span className="text-slate-300">{'(maxItems)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'    res.'}</span>
          <span className="text-emerald-400">json</span>
          <span className="text-slate-300">{'(data)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  } '}</span>
          <span className="text-indigo-400">else</span>
          <span className="text-slate-300">{' {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' data = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">fetchDashboardV1</span>
          <span className="text-slate-300">{'(maxItems)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'    res.'}</span>
          <span className="text-emerald-400">json</span>
          <span className="text-slate-300">{'(data)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'app.'}</span>
          <span className="text-emerald-400">listen</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-slate-300">{'3000'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h2 id="fastify-integration" className="text-xl font-semibold text-gray-900 mb-3">Fastify Integration</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Fastify users can leverage decorators and hooks for a clean integration. This pattern works great with Fastify&apos;s plugin system.
        </p>
        <CodeBlock title="fastify.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Fastify</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" 'fastify'"}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/node'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' fastify = '}</span>
          <span className="text-emerald-400">Fastify</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' crivline = '}</span>
          <span className="text-indigo-400">new</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{'(process.env.'}</span>
          <span className="text-emerald-400">CRIVLINE_API_KEY</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' crivline.'}</span>
          <span className="text-emerald-400">initialize</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Decorate request with flags'}</span>
          {'\n'}
          <span className="text-slate-300">{'fastify.'}</span>
          <span className="text-emerald-400">decorateRequest</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'flags'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-indigo-400">null</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Add hook to initialize flags per request'}</span>
          {'\n'}
          <span className="text-slate-300">{'fastify.'}</span>
          <span className="text-emerald-400">addHook</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'onRequest'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-indigo-400">async</span>
          <span className="text-slate-300">{' (request) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' context = {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    userId: request.user?.id'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    attributes: {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      plan: request.user?.subscription?.plan'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  request.flags = crivline.'}</span>
          <span className="text-emerald-400">forContext</span>
          <span className="text-slate-300">{'(context)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Use in routes'}</span>
          {'\n'}
          <span className="text-slate-300">{'fastify.'}</span>
          <span className="text-emerald-400">get</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'/api/features'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-indigo-400">async</span>
          <span className="text-slate-300">{' (request'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'reply) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' features = {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    advancedAnalytics: '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' request.flags.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'analytics'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    exportLimit: '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' request.flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'export-limit'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'100'}</span>
          <span className="text-slate-300">{')'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' features'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' fastify.'}</span>
          <span className="text-emerald-400">listen</span>
          <span className="text-slate-300">{'({ port: '}</span>
          <span className="text-slate-300">{'3000'}</span>
          <span className="text-slate-300">{' })'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h2 id="per-request-evaluation" className="text-xl font-semibold text-gray-900 mb-3">Per-Request Evaluation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The Node.js SDK evaluates flags in real-time with user context. This enables powerful targeting rules based on user attributes, A/B testing, and gradual rollouts.
        </p>
        <CodeBlock title="per-request.ts">
          <span className="text-slate-500">{'// Different users see different features'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' premiumUser = crivline.'}</span>
          <span className="text-emerald-400">forContext</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  userId: '}</span>
          <span className="text-amber-400">{"'user_premium'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  attributes: { plan: '}</span>
          <span className="text-amber-400">{"'premium'"}</span>
          <span className="text-slate-300">{' }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' freeUser = crivline.'}</span>
          <span className="text-emerald-400">forContext</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  userId: '}</span>
          <span className="text-amber-400">{"'user_free'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  attributes: { plan: '}</span>
          <span className="text-amber-400">{"'free'"}</span>
          <span className="text-slate-300">{' }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' premiumUser.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'ai-assistant'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">{'// true'}</span>
          {'\n'}
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' freeUser.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'ai-assistant'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">{'// false'}</span>
        </CodeBlock>

        <h2 id="performance" className="text-xl font-semibold text-gray-900 mb-3">Performance</h2>
        <p className="text-gray-600 leading-relaxed mb-8">
          The Node.js SDK is optimized for high-throughput servers. Flag evaluations happen locally with in-memory caching, ensuring sub-millisecond latency. The SDK automatically syncs flag configurations in the background.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="JavaScript SDK"
            description="Framework-agnostic JavaScript SDK"
            href="/docs/sdk/javascript"
          />
          <InfoCard
            title="API Authentication"
            description="Learn about API keys and authentication"
            href="/docs/api/authentication"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
