import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'installation', text: 'Installation', level: 2 },
  { id: 'quick-start', text: 'Quick Start', level: 2 },
  { id: 'api-reference', text: 'API Reference', level: 2 },
  { id: 'crivline-provider', text: 'CrivlineProvider', level: 3 },
  { id: 'use-flag', text: 'useFlag()', level: 3 },
  { id: 'use-flags', text: 'useFlags()', level: 3 },
  { id: 'use-crivline', text: 'useCrivline()', level: 3 },
  { id: 'server-side-rendering', text: 'Server-Side Rendering', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function ReactSDKPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'SDK Reference', href: '/docs/sdk/react' }, { label: 'React SDK' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">SDK Reference</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">React SDK</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          The Crivline React SDK provides React hooks and components for seamless feature flag integration in your React applications. Built on top of the JavaScript SDK, it offers reactive flag updates and an idiomatic React API.
        </p>

        <h2 id="installation" className="text-xl font-semibold text-gray-900 mb-3">Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Install the React SDK package.
        </p>
        <CodeBlock terminal title="Terminal">
          <span className="text-emerald-400">npm install</span>
          <span className="text-slate-300">{' @crivline/react'}</span>
        </CodeBlock>

        <h2 id="quick-start" className="text-xl font-semibold text-gray-900 mb-3">Quick Start</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Wrap your application with the <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">CrivlineProvider</code> and start using hooks in your components.
        </p>
        <CodeBlock title="App.tsx">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">CrivlineProvider</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/react'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">function</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">App</span>
          <span className="text-slate-300">{'() {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' ('}</span>
          {'\n'}
          <span className="text-slate-300">{'    <'}</span>
          <span className="text-emerald-400">CrivlineProvider</span>
          {'\n'}
          <span className="text-slate-300">{'      apiKey='}</span>
          <span className="text-amber-400">{'"cvl_your_api_key"'}</span>
          {'\n'}
          <span className="text-slate-300">{'      context={{'}</span>
          {'\n'}
          <span className="text-slate-300">{'        userId: '}</span>
          <span className="text-amber-400">{"'user_123'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'        attributes: { plan: '}</span>
          <span className="text-amber-400">{"'pro'"}</span>
          <span className="text-slate-300">{' }'}</span>
          {'\n'}
          <span className="text-slate-300">{'      }}'}</span>
          {'\n'}
          <span className="text-slate-300">{'    >'}</span>
          {'\n'}
          <span className="text-slate-300">{'      <'}</span>
          <span className="text-emerald-400">YourApp</span>
          <span className="text-slate-300">{' />'}</span>
          {'\n'}
          <span className="text-slate-300">{'    </'}</span>
          <span className="text-emerald-400">CrivlineProvider</span>
          <span className="text-slate-300">{'>'}</span>
          {'\n'}
          <span className="text-slate-300">{'  )'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="api-reference" className="text-xl font-semibold text-gray-900 mb-6">API Reference</h2>

        <h3 id="crivline-provider" className="text-base font-semibold text-gray-900 mb-2">CrivlineProvider</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          The provider component that initializes the Crivline client and makes flags available to all child components via React Context.
        </p>
        <CodeBlock title="provider.tsx">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">CrivlineProvider</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/react'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'<'}</span>
          <span className="text-emerald-400">CrivlineProvider</span>
          {'\n'}
          <span className="text-slate-300">{'  apiKey='}</span>
          <span className="text-amber-400">{'"cvl_your_api_key"'}</span>
          {'\n'}
          <span className="text-slate-300">{'  context={{'}</span>
          {'\n'}
          <span className="text-slate-300">{'    userId: currentUser.id'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    attributes: {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      email: currentUser.email'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      plan: currentUser.subscription.plan'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }}'}</span>
          {'\n'}
          <span className="text-slate-300">{'  fallback={'}</span>
          <span className="text-slate-300">{'<'}</span>
          <span className="text-emerald-400">LoadingSpinner</span>
          <span className="text-slate-300">{' />'}</span>
          <span className="text-slate-300">{'}'}</span>
          {'\n'}
          <span className="text-slate-300">{'>'}</span>
          {'\n'}
          <span className="text-slate-300">{'  {children}'}</span>
          {'\n'}
          <span className="text-slate-300">{'</'}</span>
          <span className="text-emerald-400">CrivlineProvider</span>
          <span className="text-slate-300">{'>'}</span>
        </CodeBlock>

        <h3 id="use-flag" className="text-base font-semibold text-gray-900 mb-2">useFlag()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Hook to check if a specific boolean flag is enabled. Returns a boolean value and automatically re-renders when the flag changes.
        </p>
        <CodeBlock title="use-flag.tsx">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">useFlag</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/react'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">function</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Dashboard</span>
          <span className="text-slate-300">{'() {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' isNewDashboard = '}</span>
          <span className="text-emerald-400">useFlag</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'new-dashboard'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' ('}</span>
          {'\n'}
          <span className="text-slate-300">{'    <div>'}</span>
          {'\n'}
          <span className="text-slate-300">{'      {isNewDashboard ? ('}</span>
          {'\n'}
          <span className="text-slate-300">{'        <'}</span>
          <span className="text-emerald-400">NewDashboardUI</span>
          <span className="text-slate-300">{' />'}</span>
          {'\n'}
          <span className="text-slate-300">{'      ) : ('}</span>
          {'\n'}
          <span className="text-slate-300">{'        <'}</span>
          <span className="text-emerald-400">LegacyDashboardUI</span>
          <span className="text-slate-300">{' />'}</span>
          {'\n'}
          <span className="text-slate-300">{'      )}'}</span>
          {'\n'}
          <span className="text-slate-300">{'    </div>'}</span>
          {'\n'}
          <span className="text-slate-300">{'  )'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h3 id="use-flags" className="text-base font-semibold text-gray-900 mb-2">useFlags()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Hook to access flag values with the full API. Returns an object with <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">isEnabled()</code> and <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">getValue()</code> methods.
        </p>
        <CodeBlock title="use-flags.tsx">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">useFlags</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/react'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">function</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">SearchResults</span>
          <span className="text-slate-300">{'() {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' flags = '}</span>
          <span className="text-emerald-400">useFlags</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' maxResults = flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'search-max-results'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'10'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' showFilters = flags.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'search-filters'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' config = flags.'}</span>
          <span className="text-emerald-400">getValue</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'search-config'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'{ fuzzy: '}</span>
          <span className="text-indigo-400">false</span>
          <span className="text-slate-300">{' }'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' ('}</span>
          {'\n'}
          <span className="text-slate-300">{'    <div>'}</span>
          {'\n'}
          <span className="text-slate-300">{'      {showFilters && <'}</span>
          <span className="text-emerald-400">SearchFilters</span>
          <span className="text-slate-300">{' />}'}</span>
          {'\n'}
          <span className="text-slate-300">{'      <'}</span>
          <span className="text-emerald-400">Results</span>
          <span className="text-slate-300">{' limit={maxResults} config={config} />'}</span>
          {'\n'}
          <span className="text-slate-300">{'    </div>'}</span>
          {'\n'}
          <span className="text-slate-300">{'  )'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h3 id="use-crivline" className="text-base font-semibold text-gray-900 mb-2">useCrivline()</h3>
        <p className="text-gray-600 leading-relaxed mb-4">
          Hook to access the underlying Crivline client instance. Useful for advanced use cases like updating user context or listening to change events.
        </p>
        <CodeBlock title="use-crivline.tsx">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">useCrivline</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/react'"}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">useEffect</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" 'react'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">function</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">FeatureMonitor</span>
          <span className="text-slate-300">{'() {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' client = '}</span>
          <span className="text-emerald-400">useCrivline</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">useEffect</span>
          <span className="text-slate-300">{'(() => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' unsubscribe = client.'}</span>
          <span className="text-emerald-400">on</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'change'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'(key'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'value) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      console.'}</span>
          <span className="text-emerald-400">log</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{'`Flag ${key} updated to:`'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'value'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-500">{'      // Send analytics event'}</span>
          {'\n'}
          <span className="text-slate-300">{'      analytics.'}</span>
          <span className="text-emerald-400">track</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'flag_changed'"}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'{ key'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'value }'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'    })'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' unsubscribe'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-slate-500">{', '}</span>
          <span className="text-slate-300">{'[client])'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">null</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="server-side-rendering" className="text-xl font-semibold text-gray-900 mb-3">Server-Side Rendering</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          The React SDK supports server-side rendering with Next.js, Remix, and other React frameworks. For optimal performance, initialize flags on the server and pass them as props.
        </p>
        <CodeBlock title="getServerSideProps.ts">
          <span className="text-slate-500">{'// Next.js example'}</span>
          {'\n'}
          <span className="text-indigo-400">export</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">async</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">function</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">getServerSideProps</span>
          <span className="text-slate-300">{'() {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' flags = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">Crivline</span>
          <span className="text-slate-300">{'.'}</span>
          <span className="text-emerald-400">init</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'    apiKey: process.env.'}</span>
          <span className="text-emerald-400">CRIVLINE_API_KEY</span>
          {'\n'}
          <span className="text-slate-300">{'  })'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' initialFlags = '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' flags.'}</span>
          <span className="text-emerald-400">getAllFlags</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' { props: { initialFlags } }'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="JavaScript SDK"
            description="Framework-agnostic JavaScript SDK"
            href="/docs/sdk/javascript"
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
