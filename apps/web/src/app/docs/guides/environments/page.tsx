import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'how-environments-work', text: 'How Environments Work', level: 2 },
  { id: 'configuring-flags', text: 'Configuring Flags Per Environment', level: 2 },
  { id: 'environment-api-keys', text: 'Environment-Specific API Keys', level: 2 },
  { id: 'promoting-flags', text: 'Promoting Flag States', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function EnvironmentsPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Guides', href: '/docs/guides/environments' }, { label: 'Environment Targeting' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Guides</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Environment Targeting</h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Environments allow you to maintain separate flag configurations for different stages of your deployment pipeline. Test features in development, validate in staging, and deploy to production with confidence.
        </p>

        <h2 id="how-environments-work" className="text-xl font-semibold text-gray-900 mb-3">How Environments Work</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Crivline supports multiple environments, typically organized as:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li><strong className="text-gray-900">Development</strong> - Local development and testing</li>
          <li><strong className="text-gray-900">Staging</strong> - Pre-production validation environment</li>
          <li><strong className="text-gray-900">Production</strong> - Live user-facing environment</li>
        </ul>

        <p className="text-gray-600 leading-relaxed mb-4">
          Each environment has its own set of flag states, allowing you to enable a feature in development while keeping it disabled in production.
        </p>

        <h2 id="configuring-flags" className="text-xl font-semibold text-gray-900 mb-3">Configuring Flags Per Environment</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          In the Crivline dashboard, you&apos;ll see environment tabs at the top of each flag&apos;s configuration page. Click on an environment to view and modify its settings.
        </p>

        <CodeBlock title="flag-states.txt">
          <span className="text-slate-500">{'// Example flag states across environments'}</span>
          {'\n'}
          <span className="text-slate-300">{'Flag: '}</span>
          <span className="text-amber-400">{'"new-analytics-dashboard"'}</span>
          {'\n\n'}
          <span className="text-slate-300">{'Development:   '}</span>
          <span className="text-emerald-400">{'100% enabled'}</span>
          {'\n'}
          <span className="text-slate-300">{'Staging:       '}</span>
          <span className="text-emerald-400">{'50% rollout'}</span>
          {'\n'}
          <span className="text-slate-300">{'Production:    '}</span>
          <span className="text-emerald-400">{'disabled'}</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-4">
          This isolation ensures that experimental features don&apos;t accidentally reach production users before they&apos;re ready.
        </p>

        <h2 id="environment-api-keys" className="text-xl font-semibold text-gray-900 mb-3">Using Environment-Specific API Keys</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Each environment has its own API key. Configure your application to use the appropriate key based on the deployment environment:
        </p>

        <CodeBlock title="init.ts">
          <span className="text-slate-500">{'// Initialize SDK with environment-specific key'}</span>
          {'\n'}
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' { '}</span>
          <span className="text-emerald-400">CrivlineClient</span>
          <span className="text-slate-300">{' } '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-amber-400">{" '@crivline/sdk'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' crivline = '}</span>
          <span className="text-indigo-400">new</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">CrivlineClient</span>
          <span className="text-slate-300">{'({'}</span>
          {'\n'}
          <span className="text-slate-300">{'  apiKey: process.env.'}</span>
          <span className="text-slate-300">{'CRIVLINE_API_KEY'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-4">
          Store your API keys as environment variables and never commit them to source control:
        </p>

        <CodeBlock title=".env files">
          <span className="text-slate-500">{'# .env.development'}</span>
          {'\n'}
          <span className="text-slate-300">{'CRIVLINE_API_KEY='}</span>
          <span className="text-amber-400">{'cvl_dev_1a2b3c4d5e6f'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'# .env.staging'}</span>
          {'\n'}
          <span className="text-slate-300">{'CRIVLINE_API_KEY='}</span>
          <span className="text-amber-400">{'cvl_stg_9z8y7x6w5v4u'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'# .env.production'}</span>
          {'\n'}
          <span className="text-slate-300">{'CRIVLINE_API_KEY='}</span>
          <span className="text-amber-400">{'cvl_prd_q1w2e3r4t5y6'}</span>
        </CodeBlock>

        <h2 id="promoting-flags" className="text-xl font-semibold text-gray-900 mb-3">Promoting Flag States</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Once you&apos;ve validated a flag configuration in a lower environment, you can promote it to the next stage. This is a manual process to give you full control:
        </p>

        <ol className="text-gray-600 leading-relaxed mb-4 list-decimal list-inside space-y-2">
          <li>Test the flag thoroughly in development</li>
          <li>Copy the configuration to staging environment</li>
          <li>Validate with your QA team or staging users</li>
          <li>Promote to production when ready</li>
        </ol>

        <p className="text-gray-600 leading-relaxed mb-4">
          The dashboard makes it easy to view configurations side-by-side and copy settings between environments. You can also use the API to automate promotion as part of your CI/CD pipeline.
        </p>

        <CodeBlock title="workflow.ts">
          <span className="text-slate-500">{'// Example workflow: Dev \u2192 Staging \u2192 Production'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' workflow = {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  step1: '}</span>
          <span className="text-amber-400">{"'Enable in dev, test locally'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  step2: '}</span>
          <span className="text-amber-400">{"'Promote to staging, run QA'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  step3: '}</span>
          <span className="text-amber-400">{"'Gradual rollout in production'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-4">
          Environment targeting ensures you can iterate quickly in development while maintaining stability in production. It&apos;s a fundamental practice for safe feature deployment.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Percentage Rollouts"
            description="Gradually roll out features to users"
            href="/docs/guides/rollouts"
          />
          <InfoCard
            title="Self-Hosting"
            description="Run Crivline on your own infrastructure"
            href="/docs/guides/self-hosting"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
