import { Breadcrumb } from '@/components/docs/breadcrumb';
import { Callout } from '@/components/docs/callout';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'webhook-events', text: 'Webhook Events', level: 2 },
  { id: 'configuring-endpoints', text: 'Configuring Webhook Endpoints', level: 2 },
  { id: 'payload-format', text: 'Payload Format', level: 2 },
  { id: 'verifying-signatures', text: 'Verifying Webhook Signatures', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function WebhooksPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Guides', href: '/docs/guides/webhooks' }, { label: 'Webhooks' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Guides</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Webhooks</h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Webhooks allow you to receive real-time notifications when flags change in your Crivline account. Use them to trigger CI/CD pipelines, update monitoring dashboards, or send alerts to your team.
        </p>

        <h2 id="webhook-events" className="text-xl font-semibold text-gray-900 mb-3">Webhook Events</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Crivline sends webhook notifications for the following events:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">flag.toggled</code> - A flag was enabled or disabled</li>
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">flag.updated</code> - A flag&apos;s configuration was modified</li>
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">flag.created</code> - A new flag was created</li>
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">flag.deleted</code> - A flag was deleted</li>
        </ul>

        <p className="text-gray-600 leading-relaxed mb-4">
          Each event includes detailed information about what changed and who made the change.
        </p>

        <h2 id="configuring-endpoints" className="text-xl font-semibold text-gray-900 mb-3">Configuring Webhook Endpoints</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          To set up a webhook, navigate to Settings &rarr; Webhooks in the Crivline dashboard. Add your endpoint URL and select which events you want to receive.
        </p>

        <CodeBlock title="webhook-config.txt">
          <span className="text-slate-500">{'// Example webhook endpoint configuration'}</span>
          {'\n'}
          <span className="text-slate-300">{'URL: '}</span>
          <span className="text-amber-400">{'https://api.yourapp.com/webhooks/crivline'}</span>
          {'\n'}
          <span className="text-slate-300">{'Events: '}</span>
          <span className="text-amber-400">{'flag.toggled, flag.updated'}</span>
          {'\n'}
          <span className="text-slate-300">{'Method: '}</span>
          <span className="text-amber-400">{'POST'}</span>
        </CodeBlock>

        <Callout type="info" title="Response Requirements">
          Your endpoint must respond with a 200 status code within 5 seconds. If your endpoint fails or times out, Crivline will retry up to 3 times with exponential backoff.
        </Callout>

        <h2 id="payload-format" className="text-xl font-semibold text-gray-900 mb-3">Payload Format</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Webhook payloads are sent as JSON with the following structure:
        </p>

        <CodeBlock title="payload.json">
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"event"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"flag.toggled"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"timestamp"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"2026-02-08T15:30:00Z"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"data"'}</span>
          <span className="text-slate-300">{': {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"flag"'}</span>
          <span className="text-slate-300">{': {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"key"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"new-checkout-flow"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"New Checkout Flow"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"enabled"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-emerald-400">{'true'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"environment"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"production"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"actor"'}</span>
          <span className="text-slate-300">{': {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"email"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"sarah@company.com"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'"Sarah Chen"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-4">
          Here&apos;s a basic Express.js handler for processing webhooks:
        </p>

        <CodeBlock title="webhook-handler.ts">
          <span className="text-slate-300">{'app.'}</span>
          <span className="text-emerald-400">post</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'/webhooks/crivline'"}</span>
          <span className="text-slate-500">,</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">async</span>
          <span className="text-slate-300">{' (req'}</span>
          <span className="text-slate-500">,</span>
          <span className="text-slate-300">{' res) => {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' { event'}</span>
          <span className="text-slate-500">,</span>
          <span className="text-slate-300">{' data } = req.body'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (event === '}</span>
          <span className="text-amber-400">{"'flag.toggled'"}</span>
          <span className="text-slate-300">{') {'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-slate-500">{'// Send notification to Slack'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">await</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">sendSlackNotification</span>
          <span className="text-slate-300">{'('}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-amber-400">{"`Flag ${data.flag.key} was ${data.flag.enabled ? 'enabled' : 'disabled'}`"}</span>
          {'\n'}
          <span className="text-slate-300">{'    )'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n\n'}
          <span className="text-slate-300">{'  res.'}</span>
          <span className="text-emerald-400">sendStatus</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-emerald-400">200</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
        </CodeBlock>

        <h2 id="verifying-signatures" className="text-xl font-semibold text-gray-900 mb-3">Verifying Webhook Signatures</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          To ensure webhooks are genuinely from Crivline, verify the HMAC signature included in the <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">X-Crivline-Signature</code> header.
        </p>

        <CodeBlock title="verify-signature.ts">
          <span className="text-indigo-400">import</span>
          <span className="text-slate-300">{' crypto '}</span>
          <span className="text-indigo-400">from</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{"'crypto'"}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">function</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-emerald-400">verifyWebhook</span>
          <span className="text-slate-300">{'(payload'}</span>
          <span className="text-slate-500">,</span>
          <span className="text-slate-300">{' signature'}</span>
          <span className="text-slate-500">,</span>
          <span className="text-slate-300">{' secret) {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' hmac = crypto.'}</span>
          <span className="text-emerald-400">createHmac</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'sha256'"}</span>
          <span className="text-slate-500">,</span>
          <span className="text-slate-300">{' secret)'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' expectedSignature = hmac.'}</span>
          <span className="text-emerald-400">update</span>
          <span className="text-slate-300">{'(payload).'}</span>
          <span className="text-emerald-400">digest</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'hex'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' crypto.'}</span>
          <span className="text-emerald-400">timingSafeEqual</span>
          <span className="text-slate-300">{'('}</span>
          {'\n'}
          <span className="text-slate-300">{'    Buffer.'}</span>
          <span className="text-emerald-400">from</span>
          <span className="text-slate-300">{'(signature)'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    Buffer.'}</span>
          <span className="text-emerald-400">from</span>
          <span className="text-slate-300">{'(expectedSignature)'}</span>
          {'\n'}
          <span className="text-slate-300">{'  )'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'// Use in your webhook handler'}</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{" signature = req.headers['x-crivline-signature']"}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-indigo-400">const</span>
          <span className="text-slate-300">{' isValid = '}</span>
          <span className="text-emerald-400">verifyWebhook</span>
          <span className="text-slate-300">{'('}</span>
          {'\n'}
          <span className="text-slate-300">{'  JSON.'}</span>
          <span className="text-emerald-400">stringify</span>
          <span className="text-slate-300">{'(req.body)'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  signature'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  process.env.WEBHOOK_SECRET'}</span>
          {'\n'}
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n\n'}
          <span className="text-indigo-400">if</span>
          <span className="text-slate-300">{' (!isValid) {'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">return</span>
          <span className="text-slate-300">{' res.'}</span>
          <span className="text-emerald-400">status</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-emerald-400">401</span>
          <span className="text-slate-300">{').'}</span>
          <span className="text-emerald-400">send</span>
          <span className="text-slate-300">{'('}</span>
          <span className="text-amber-400">{"'Invalid signature'"}</span>
          <span className="text-slate-300">{')'}</span>
          <span className="text-slate-500">;</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <Callout type="warning" title="Keep Your Secret Secure">
          Your webhook secret is displayed in the dashboard when you create the webhook. Store it securely and never commit it to source control.
        </Callout>

        <p className="text-gray-600 leading-relaxed mb-4">
          Webhooks provide a powerful way to integrate Crivline with your existing tools and workflows. Use them to keep your team informed and automate responses to flag changes.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Self-Hosting"
            description="Run Crivline on your own infrastructure"
            href="/docs/guides/self-hosting"
          />
          <InfoCard
            title="API Authentication"
            description="Learn about API key types and auth"
            href="/docs/api/authentication"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
