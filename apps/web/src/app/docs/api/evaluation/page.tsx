import { Breadcrumb } from '@/components/docs/breadcrumb';
import { CodeBlock } from '@/components/docs/code-block';
import { HttpMethodBadge } from '@/components/docs/http-method-badge';
import { InfoCard } from '@/components/docs/info-card';
import { ParameterTable } from '@/components/docs/parameter-table';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'evaluate-single-flag', text: 'Evaluate Single Flag', level: 2 },
  { id: 'evaluate-multiple-flags', text: 'Evaluate Multiple Flags', level: 2 },
  { id: 'user-context', text: 'User Context', level: 2 },
  { id: 'response-reasons', text: 'Response Reasons', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function EvaluationPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'REST API', href: '/docs/api/evaluation' }, { label: 'Evaluation' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">REST API</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Evaluation</h1>

        <p className="text-gray-600 leading-relaxed mb-8">
          The Evaluation API allows you to check feature flag values for specific users or contexts. This is the primary way to determine whether a feature should be enabled for a given user.
        </p>

        <h2 id="evaluate-single-flag" className="text-xl font-semibold text-gray-900 mb-3">Evaluate Single Flag</h2>
        <HttpMethodBadge method="POST" path="/v1/evaluate" />
        <p className="text-gray-600 leading-relaxed mb-4">
          Evaluate a single flag for a user context. Pass user attributes to enable targeted feature rollouts.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">POST</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/evaluate</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer pk_live_your_api_key"'}</span>
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
          <span className="text-indigo-400">{'"flagKey"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"new-checkout"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"environment"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"production"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"context"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"userId"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"user_123"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"email"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"user@example.com"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"plan"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"premium"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-amber-400">{"'"}</span>
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
          <span className="text-indigo-400">{'"value"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"reason"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"TARGETING_MATCH"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"ruleId"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"rule_abc123"'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="evaluate-multiple-flags" className="text-xl font-semibold text-gray-900 mb-3">Evaluate Multiple Flags</h2>
        <HttpMethodBadge method="POST" path="/v1/evaluate/batch" />
        <p className="text-gray-600 leading-relaxed mb-4">
          For better performance, evaluate multiple flags in a single request using the batch endpoint.
        </p>
        <CodeBlock terminal title="cURL">
          <span className="text-emerald-400">curl</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">-X</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-indigo-400">POST</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">https://api.crivline.com/v1/evaluate/batch</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-slate-500">\</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">-H</span>
          <span className="text-slate-300">{' '}</span>
          <span className="text-amber-400">{'"Authorization: Bearer pk_live_your_api_key"'}</span>
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
          <span className="text-indigo-400">{'"environment"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"production"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"context"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"userId"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"user_123"'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"email"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"user@example.com"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"flags"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'['}</span>
          <span className="text-amber-400">{'"new-checkout"'}</span>
          <span className="text-slate-500">, </span>
          <span className="text-amber-400">{'"dark-mode"'}</span>
          <span className="text-slate-500">, </span>
          <span className="text-amber-400">{'"ai-recommendations"'}</span>
          <span className="text-slate-300">{']'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          <span className="text-amber-400">{"'"}</span>
        </CodeBlock>
        <CodeBlock title="Response">
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">{'"evaluations"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"new-checkout"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"value"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"reason"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"TARGETING_MATCH"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"dark-mode"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"value"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">true</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"reason"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"DEFAULT"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">{'"ai-recommendations"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-slate-300">{'{'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"value"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-emerald-400">false</span>
          <span className="text-slate-500">,</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">{'"reason"'}</span>
          <span className="text-slate-500">: </span>
          <span className="text-amber-400">{'"DISABLED"'}</span>
          {'\n'}
          <span className="text-slate-300">{'    }'}</span>
          {'\n'}
          <span className="text-slate-300">{'  }'}</span>
          {'\n'}
          <span className="text-slate-300">{'}'}</span>
        </CodeBlock>

        <h2 id="user-context" className="text-xl font-semibold text-gray-900 mb-3">User Context</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          The context object allows you to pass user attributes that can be used for targeting. Common attributes include:
        </p>

        <ParameterTable
          parameters={[
            { name: 'userId', type: 'string', description: 'Unique identifier for the user', required: true },
            { name: 'email', type: 'string', description: 'User email for email-based targeting rules' },
            { name: 'plan', type: 'string', description: 'Subscription plan (e.g., free, premium, enterprise)' },
            { name: 'country', type: 'string', description: 'ISO country code for geographic targeting' },
            { name: 'signupDate', type: 'string', description: 'ISO date string for cohort-based targeting' },
            { name: 'betaTester', type: 'boolean', description: 'Custom attribute for beta program' },
            { name: 'companySize', type: 'string', description: 'Custom attribute for B2B targeting' },
          ]}
        />

        <h2 id="response-reasons" className="text-xl font-semibold text-gray-900 mb-3">Response Reasons</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          The <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">reason</code> field explains why a particular value was returned:
        </p>

        <div className="space-y-2 mb-4">
          <p className="text-gray-600 leading-relaxed">
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">TARGETING_MATCH</code> — User matched a targeting rule
          </p>
          <p className="text-gray-600 leading-relaxed">
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">DEFAULT</code> — No targeting rules matched, using default value
          </p>
          <p className="text-gray-600 leading-relaxed">
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">DISABLED</code> — Flag is disabled in this environment
          </p>
          <p className="text-gray-600 leading-relaxed">
            <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">ERROR</code> — An error occurred during evaluation
          </p>
        </div>

        <p className="text-gray-600 leading-relaxed mb-4">
          Understanding these reasons can help you debug targeting rules and ensure your flags are configured correctly.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Flags API"
            description="Create, retrieve, update and delete flags"
            href="/docs/api/flags"
          />
          <InfoCard
            title="Environments API"
            description="Manage flag states per environment"
            href="/docs/api/environments"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
