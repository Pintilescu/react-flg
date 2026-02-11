import { Breadcrumb } from '@/components/docs/breadcrumb';
import { Callout } from '@/components/docs/callout';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'required-services', text: 'Required Services', level: 2 },
  { id: 'docker-compose', text: 'Docker Compose Setup', level: 2 },
  { id: 'environment-variables', text: 'Environment Variables', level: 2 },
  { id: 'running-migrations', text: 'Running Migrations', level: 2 },
  { id: 'production-notes', text: 'Production Deployment Notes', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function SelfHostingPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Guides', href: '/docs/guides/self-hosting' }, { label: 'Self-Hosting' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Guides</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Self-Hosting</h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Crivline can be self-hosted on your own infrastructure, giving you complete control over your feature flag data. This guide covers setting up Crivline using Docker Compose.
        </p>

        <h2 id="required-services" className="text-xl font-semibold text-gray-900 mb-3">Required Services</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          A self-hosted Crivline deployment requires three services:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li><strong className="text-gray-900">PostgreSQL</strong> - Primary database for flag configurations and audit logs</li>
          <li><strong className="text-gray-900">Redis</strong> - Cache layer for fast flag evaluations</li>
          <li><strong className="text-gray-900">Crivline API</strong> - Core API server and dashboard</li>
        </ul>

        <h2 id="docker-compose" className="text-xl font-semibold text-gray-900 mb-3">Docker Compose Setup</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Create a <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">docker-compose.yml</code> file with the following configuration:
        </p>

        <CodeBlock title="docker-compose.yml">
          <span className="text-indigo-400">version</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{"'3.8'"}</span>
          {'\n\n'}
          <span className="text-indigo-400">services</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">postgres</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">image</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'postgres:16-alpine'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">environment</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">POSTGRES_DB</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'crivline'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">POSTGRES_USER</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'crivline'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">POSTGRES_PASSWORD</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'your_secure_password'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">volumes</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - postgres_data:/var/lib/postgresql/data'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">ports</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - '}</span>
          <span className="text-amber-400">{'"5432:5432"'}</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">redis</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">image</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'redis:7-alpine'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">command</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'redis-server --appendonly yes'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">volumes</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - redis_data:/data'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">ports</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - '}</span>
          <span className="text-amber-400">{'"6379:6379"'}</span>
          {'\n\n'}
          <span className="text-slate-300">{'  '}</span>
          <span className="text-indigo-400">crivline</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">image</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'crivline/crivline:latest'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">depends_on</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - postgres'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - redis'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">environment</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">DATABASE_URL</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'postgres://crivline:your_secure_password@postgres:5432/crivline'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">REDIS_URL</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'redis://redis:6379'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">JWT_SECRET</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-amber-400">{'your_jwt_secret_key'}</span>
          {'\n'}
          <span className="text-slate-300">{'      '}</span>
          <span className="text-indigo-400">API_PORT</span>
          <span className="text-slate-300">{': '}</span>
          <span className="text-emerald-400">{'3000'}</span>
          {'\n'}
          <span className="text-slate-300">{'    '}</span>
          <span className="text-indigo-400">ports</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'      - '}</span>
          <span className="text-amber-400">{'"3000:3000"'}</span>
          {'\n\n'}
          <span className="text-indigo-400">volumes</span>
          <span className="text-slate-300">{':'}</span>
          {'\n'}
          <span className="text-slate-300">{'  postgres_data:'}</span>
          {'\n'}
          <span className="text-slate-300">{'  redis_data:'}</span>
        </CodeBlock>

        <h2 id="environment-variables" className="text-xl font-semibold text-gray-900 mb-3">Environment Variables</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Configure these required environment variables for the Crivline service:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">DATABASE_URL</code> - PostgreSQL connection string</li>
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">REDIS_URL</code> - Redis connection string</li>
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">JWT_SECRET</code> - Secret key for JWT token signing (minimum 32 characters)</li>
          <li><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">API_PORT</code> - Port for the API server (default: 3000)</li>
        </ul>

        <p className="text-gray-600 leading-relaxed mb-4">
          Optional environment variables for additional features:
        </p>

        <CodeBlock title=".env">
          <span className="text-slate-500">{'# Email notifications (optional)'}</span>
          {'\n'}
          <span className="text-slate-300">{'SMTP_HOST='}</span>
          <span className="text-amber-400">{'smtp.sendgrid.net'}</span>
          {'\n'}
          <span className="text-slate-300">{'SMTP_PORT='}</span>
          <span className="text-emerald-400">{'587'}</span>
          {'\n'}
          <span className="text-slate-300">{'SMTP_USER='}</span>
          <span className="text-amber-400">{'apikey'}</span>
          {'\n'}
          <span className="text-slate-300">{'SMTP_PASSWORD='}</span>
          <span className="text-amber-400">{'your_sendgrid_api_key'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'# Analytics (optional)'}</span>
          {'\n'}
          <span className="text-slate-300">{'ANALYTICS_ENABLED='}</span>
          <span className="text-emerald-400">{'true'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'# Rate limiting'}</span>
          {'\n'}
          <span className="text-slate-300">{'RATE_LIMIT_REQUESTS='}</span>
          <span className="text-emerald-400">{'100'}</span>
          {'\n'}
          <span className="text-slate-300">{'RATE_LIMIT_WINDOW='}</span>
          <span className="text-emerald-400">{'60'}</span>
        </CodeBlock>

        <h2 id="running-migrations" className="text-xl font-semibold text-gray-900 mb-3">Running Migrations</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          Before starting Crivline for the first time, run database migrations to create the necessary tables:
        </p>

        <CodeBlock terminal title="Terminal">
          <span className="text-slate-500">{'# Start the database'}</span>
          {'\n'}
          <span className="text-emerald-400">{'docker-compose'}</span>
          <span className="text-slate-300">{' up '}</span>
          <span className="text-indigo-400">{'-d'}</span>
          <span className="text-slate-300">{' postgres redis'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'# Run migrations'}</span>
          {'\n'}
          <span className="text-emerald-400">{'docker-compose'}</span>
          <span className="text-slate-300">{' run crivline '}</span>
          <span className="text-emerald-400">{'npm'}</span>
          <span className="text-slate-300">{' run migrate'}</span>
          {'\n\n'}
          <span className="text-slate-500">{'# Start all services'}</span>
          {'\n'}
          <span className="text-emerald-400">{'docker-compose'}</span>
          <span className="text-slate-300">{' up '}</span>
          <span className="text-indigo-400">{'-d'}</span>
        </CodeBlock>

        <Callout type="tip" title="First Login">
          Once running, access the dashboard at <code className="text-xs bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">http://localhost:3000</code>. The default admin credentials are shown in the container logs on first startup.
        </Callout>

        <h2 id="production-notes" className="text-xl font-semibold text-gray-900 mb-3">Production Deployment Notes</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          For production deployments, follow these best practices:
        </p>

        <ul className="text-gray-600 leading-relaxed mb-4 list-disc list-inside space-y-2">
          <li><strong className="text-gray-900">Use a reverse proxy</strong> - Place Nginx or Caddy in front of Crivline for SSL/TLS</li>
          <li><strong className="text-gray-900">Enable backups</strong> - Regular PostgreSQL backups are critical</li>
          <li><strong className="text-gray-900">Set resource limits</strong> - Configure memory and CPU limits in docker-compose</li>
          <li><strong className="text-gray-900">Monitor logs</strong> - Use a log aggregation service like Loki or Datadog</li>
          <li><strong className="text-gray-900">Update regularly</strong> - Pull the latest image and run migrations for updates</li>
        </ul>

        <CodeBlock terminal title="Terminal">
          <span className="text-slate-500">{'# Example production update workflow'}</span>
          {'\n'}
          <span className="text-emerald-400">{'docker-compose'}</span>
          <span className="text-slate-300">{' pull'}</span>
          {'\n'}
          <span className="text-emerald-400">{'docker-compose'}</span>
          <span className="text-slate-300">{' run crivline '}</span>
          <span className="text-emerald-400">{'npm'}</span>
          <span className="text-slate-300">{' run migrate'}</span>
          {'\n'}
          <span className="text-emerald-400">{'docker-compose'}</span>
          <span className="text-slate-300">{' up '}</span>
          <span className="text-indigo-400">{'-d'}</span>
        </CodeBlock>

        <p className="text-gray-600 leading-relaxed mb-4">
          For Kubernetes deployments, Helm charts are available in the official Crivline repository. Self-hosting gives you full control while maintaining all the features of the hosted version.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="Installation"
            description="Set up the SDK in your project"
            href="/docs/installation"
          />
          <InfoCard
            title="Quick Start"
            description="Create your first flag in minutes"
            href="/docs/quick-start"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
