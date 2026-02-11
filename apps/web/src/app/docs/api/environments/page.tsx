import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { HttpMethodBadge } from '@/components/docs/http-method-badge';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'list-environments', text: 'List Environments', level: 2 },
  { id: 'managing-flag-states', text: 'Managing Flag States', level: 2 },
  { id: 'toggle-flag-in-environment', text: 'Toggle Flag in Environment', level: 2 },
  { id: 'update-flag-configuration', text: 'Update Flag Configuration', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function EnvironmentsPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'REST API', href: '/docs/api/environments' }, { label: 'Environments' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">REST API</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Environments</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          Environments allow you to manage different states of your feature flags across development, staging, and production. Each flag can have different values and targeting rules per environment.
        </p>

        <h2 id="list-environments" className="text-xl font-semibold text-gray-900 mb-3">List Environments</h2>
        <HttpMethodBadge method="GET" path="/v1/environments" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Retrieve all environments in your project.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/environments</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
        </CodeBlock>
        <CodeBlock title="Response">
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"environments"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'['}</span>
          {'\n'}
          <span className="text-slate-300">{'    {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"id"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"env_dev"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"Development"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"key"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"development"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"createdAt"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"2026-01-15T10:00:00Z"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"id"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"env_prod"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"Production"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"key"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"production"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"createdAt"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"2026-01-15T10:00:00Z"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  ]'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="managing-flag-states" className="text-xl font-semibold text-gray-900 mb-3">Managing Flag States</h2>
        <HttpMethodBadge method="GET" path="/v1/environments/:env/flags/:key" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Each flag maintains separate state and configuration for every environment. This allows you to test features in development before enabling them in production.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          Get the state of a flag in a specific environment:
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/environments/production/flags/new-checkout</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
        </CodeBlock>
        <CodeBlock title="Response">
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"flagKey"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"new-checkout"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"environment"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"production"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"enabled"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"defaultValue"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">false</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"targeting"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"rules"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'[]'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="toggle-flag-in-environment" className="text-xl font-semibold text-gray-900 mb-3">Toggle Flag in Environment</h2>
        <HttpMethodBadge method="PATCH" path="/v1/environments/:env/flags/:key" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Enable or disable a flag in a specific environment without affecting other environments.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">PATCH</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/environments/production/flags/new-checkout</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Content-Type: application/json"'}</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-d</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{"'"}</span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"enabled"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-amber-400">{"'"}</span>
        </CodeBlock>

        <h2 id="update-flag-configuration" className="text-xl font-semibold text-gray-900 mb-3">Update Flag Configuration</h2>
        <HttpMethodBadge method="PATCH" path="/v1/environments/:env/flags/:key" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Update the default value and targeting rules for a flag in a specific environment.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          This approach allows you to safely test new features with internal users in development before rolling them out to production.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">PATCH</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/environments/development/flags/new-checkout</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Content-Type: application/json"'}</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-d</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{"'"}</span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"enabled"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"defaultValue"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"targeting"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"rules"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'['}</span>
          {'\n'}
          <span className="text-slate-300">{'        {'}</span>
          {'\n'}
          <span className="text-slate-300">{'          '}</span>
          <span className="text-indigo-400">{'"attribute"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"email"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'          '}</span>
          <span className="text-indigo-400">{'"operator"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"endsWith"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'          '}</span>
          <span className="text-indigo-400">{'"value"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"@company.com"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'          '}</span>
          <span className="text-indigo-400">{'"serve"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          {'\n'}
          <span className="text-slate-300">{'        }'}</span>
          {'\n'}
          <span className="text-slate-300">{'      ]'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-amber-400">{"'"}</span>
        </CodeBlock>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Flags API"
            description="Create, retrieve, update and delete flags"
            href="/docs/api/flags"
          />
          <InfoCard
            title="API Authentication"
            description="Learn about API keys and auth"
            href="/docs/api/authentication"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
