import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'how-it-works', text: 'How It Works', level: 2 },
  { id: 'setting-percentage', text: 'Setting Rollout Percentage', level: 2 },
  { id: 'gradual-ramp-up', text: 'Gradual Ramp-Up Strategy', level: 2 },
  { id: 'monitoring', text: 'Monitoring and Rollback', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function RolloutsPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Guides', href: '/docs/guides/rollouts' }, { label: 'Percentage Rollouts' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Guides</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Percentage Rollouts</h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Percentage rollouts allow you to enable a feature for a specific percentage of your users, making it easy to test changes with a small subset before rolling out to everyone. Crivline uses consistent hashing to ensure users always see the same experience.
        </p>

        <h2 id="how-it-works" className="text-xl font-semibold text-gray-900 mb-3">How It Works</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          When you set a rollout percentage, Crivline uses consistent hashing based on the user ID to determine whether that user should see the feature. This means:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li>A user will always get the same result for a given flag and percentage</li>
          <li>Changing the percentage will add or remove users predictably</li>
          <li>User distribution is uniform across the hash space</li>
        </ul>

        <CodeBlock title="rollout-example.ts">
          <span className="text-slate-500">{'// Example: Check flag with user ID'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300"> isEnabled = </span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' crivline.'}</span>
          <span className="text-emerald-400">isEnabled</span>
          <span className="text-slate-300">{'('}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-amber-400">{"'new-checkout-flow'"}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  { userId: '}</span>
          <span className="text-amber-400">{"'user_123'"}</span>
          <span className="text-slate-300">{' }'}</span>
          {'\n'}
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Same user always gets same result'}</span>
          {'\n'}
          <span className="text-slate-500">{'// If rollout is 25%, ~25% of users see the feature'}</span>
        </CodeBlock>

        <h2 id="setting-percentage" className="text-xl font-semibold text-gray-900 mb-3">Setting Rollout Percentage</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          In the Crivline dashboard, navigate to your flag and adjust the rollout percentage slider. The change takes effect immediately, and all SDK clients will receive the update within seconds.
        </p>

        <p className="text-gray-600 leading-relaxed mb-4">
          You can set any value from 0% to 100%. Use <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">0%</code> to disable completely, or <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">100%</code> to enable for everyone.
        </p>

        <h2 id="gradual-ramp-up" className="text-xl font-semibold text-gray-900 mb-3">Gradual Ramp-Up Strategy</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          The recommended approach for rolling out new features is to increase the percentage gradually:
        </p>

        <ol className="text-gray-600 leading-relaxed mb-4 list-decimal list-inside space-y-2">
          <li><strong className="text-gray-900">1% rollout</strong> - Test with a small group, monitor for errors</li>
          <li><strong className="text-gray-900">10% rollout</strong> - If stable, expand to catch edge cases</li>
          <li><strong className="text-gray-900">50% rollout</strong> - Half your users, verify performance at scale</li>
          <li><strong className="text-gray-900">100% rollout</strong> - Full deployment to all users</li>
        </ol>

        <p className="text-gray-600 leading-relaxed mb-4">
          At each stage, monitor your metrics for at least a few hours before proceeding. Look for:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li>Error rates and exceptions</li>
          <li>Performance metrics (latency, throughput)</li>
          <li>User engagement and conversion rates</li>
          <li>Support tickets or user complaints</li>
        </ul>

        <h2 id="monitoring" className="text-xl font-semibold text-gray-900 mb-3">Monitoring and Rollback</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          If you notice issues during a rollout, you can instantly reduce the percentage or set it to 0% in the dashboard. All users will revert to the previous experience within seconds.
        </p>

        <CodeBlock title="fallback-example.ts">
          <span className="text-slate-500">{'// Always implement proper fallback logic'}</span>
          {'\n'}
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (isEnabled) {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-slate-500">{'// New feature code'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">renderNewCheckout</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">else</span>
          <span className="text-slate-300">{' {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-slate-500">{'// Existing stable code'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-emerald-400">renderLegacyCheckout</span>
          <span className="text-slate-300">{'()'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-4">
          By combining percentage rollouts with careful monitoring, you can deploy features with confidence and minimize risk to your users.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Environment Targeting"
            description="Manage flags across environments"
            href="/docs/guides/environments"
          />
          <InfoCard
            title="Webhooks"
            description="Get notified when flags change"
            href="/docs/guides/webhooks"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
