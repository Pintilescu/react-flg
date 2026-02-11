import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { HttpMethodBadge } from '@/components/docs/http-method-badge';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'list-all-flags', text: 'List All Flags', level: 2 },
  { id: 'get-a-flag', text: 'Get a Flag', level: 2 },
  { id: 'create-a-flag', text: 'Create a Flag', level: 2 },
  { id: 'update-a-flag', text: 'Update a Flag', level: 2 },
  { id: 'delete-a-flag', text: 'Delete a Flag', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function FlagsPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'REST API', href: '/docs/api/flags' }, { label: 'Flags' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">REST API</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Flags</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          The Flags API allows you to create, retrieve, update, and delete feature flags in your project. All endpoints require server key authentication.
        </p>

        <h2 id="list-all-flags" className="text-xl font-semibold text-gray-900 mb-3">List All Flags</h2>
        <HttpMethodBadge method="GET" path="/v1/flags" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Retrieve a list of all flags in your project.
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
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
        </CodeBlock>
        <CodeBlock title="Response">
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"flags"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'['}</span>
          {'\n'}
          <span className="text-slate-300">{'    {'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"id"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"flag_123"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"key"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"new-checkout"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"New Checkout Experience"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"description"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"Redesigned checkout flow"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"type"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"boolean"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"createdAt"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"2026-02-01T10:00:00Z"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  ]'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="get-a-flag" className="text-xl font-semibold text-gray-900 mb-3">Get a Flag</h2>
        <HttpMethodBadge method="GET" path="/v1/flags/:key" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Retrieve a specific flag by its key.
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
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
        </CodeBlock>
        <CodeBlock title="Response">
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"id"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"flag_123"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"key"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"new-checkout"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"New Checkout Experience"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"description"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"Redesigned checkout flow"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"type"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"boolean"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"createdAt"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"2026-02-01T10:00:00Z"'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="create-a-flag" className="text-xl font-semibold text-gray-900 mb-3">Create a Flag</h2>
        <HttpMethodBadge method="POST" path="/v1/flags" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Create a new feature flag in your project.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">POST</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/flags</span>
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
          <span className="text-indigo-400">{'"key"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"new-feature"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"New Feature"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"description"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"Description of the feature"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"type"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"boolean"'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-amber-400">{"'"}</span>
        </CodeBlock>

        <h2 id="update-a-flag" className="text-xl font-semibold text-gray-900 mb-3">Update a Flag</h2>
        <HttpMethodBadge method="PATCH" path="/v1/flags/:key" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Update an existing flag&apos;s metadata. Use <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">PATCH</code> to update specific fields.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">PATCH</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/flags/new-checkout</span>
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
          <span className="text-indigo-400">{'"name"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"Updated Checkout Experience"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"description"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"New description"'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-amber-400">{"'"}</span>
        </CodeBlock>

        <h2 id="delete-a-flag" className="text-xl font-semibold text-gray-900 mb-3">Delete a Flag</h2>
        <HttpMethodBadge method="DELETE" path="/v1/flags/:key" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Permanently delete a flag from your project. This action cannot be undone. Returns <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">204 No Content</code> on successful deletion.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">DELETE</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/flags/new-checkout</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer sk_live_your_api_key"'}</span>
        </CodeBlock>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Environments API"
            description="Manage flag states per environment"
            href="/docs/api/environments"
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
