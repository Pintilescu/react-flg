import { Breadcrumb } from '@/components/docs/breadcrumb';
import { Callout } from '@/components/docs/callout';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'api-key-types', text: 'API Key Types', level: 2 },
  { id: 'authentication-header', text: 'Authentication Header', level: 2 },
  { id: 'key-management', text: 'Key Management', level: 2 },
  { id: 'example-request', text: 'Example Request', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function AuthenticationPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'REST API', href: '/docs/api/authentication' }, { label: 'Authentication' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">REST API</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Authentication</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          Crivline uses API keys to authenticate requests. You can view and manage your API keys in the dashboard. Your API keys carry many privileges, so be sure to keep them secure.
        </p>

        <h2 id="api-key-types" className="text-xl font-semibold text-gray-900 mb-3">API Key Types</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Crivline provides two types of API keys, each with different access levels and use cases:
        </p>

        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Project Keys</strong> <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">pk_live_...</code> are client-safe keys intended for use in frontend applications. They have read-only access and can only evaluate flags.
        </p>

        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Server Keys</strong> <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">sk_live_...</code> are secret keys that should only be used on your server. They have full read and write access to your project resources.
        </p>

        <Callout type="warning" title="Keep Server Keys Secure">
          Never expose server keys in frontend code or commit them to version control. Use environment variables instead.
        </Callout>

        <h2 id="authentication-header" className="text-xl font-semibold text-gray-900 mb-3">Authentication Header</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          All API requests must include your API key in the <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Authorization</code> header using the Bearer token scheme.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/flags</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key_here"'}</span>
        </CodeBlock>

        <h2 id="key-management" className="text-xl font-semibold text-gray-900 mb-3">Key Management</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          You can create, rotate, and revoke API keys from your project settings in the dashboard. Each key can be given a descriptive name to help you track where it&apos;s being used.
        </p>

        <p className="text-gray-600 leading-relaxed mb-4">
          We recommend rotating your API keys periodically and immediately revoking any keys that may have been compromised.
        </p>

        <h2 id="example-request" className="text-xl font-semibold text-gray-900 mb-3">Example Request</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          If authentication fails, you&apos;ll receive a <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">401 Unauthorized</code> response. Make sure your API key is valid and has the necessary permissions for the endpoint you&apos;re accessing.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/flags/new-checkout</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_abc123def456ghi789"'}</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Content-Type: application/json"'}</span>
        </CodeBlock>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Flags API"
            description="Create, retrieve, update and delete flags"
            href="/docs/api/flags"
          />
          <InfoCard
            title="Evaluation API"
            description="Evaluate flags for specific users"
            href="/docs/api/evaluation"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
