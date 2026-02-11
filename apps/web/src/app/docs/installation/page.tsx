import { Breadcrumb } from '@/components/docs/breadcrumb';
import { Callout } from '@/components/docs/callout';
import { CodeBlock } from '@/components/docs/code-block';
import { InfoCard } from '@/components/docs/info-card';
import { TableOfContents } from '@/components/docs/table-of-contents';

const tocItems = [
  { id: 'package-manager', text: 'Package Manager Installation', level: 2 },
  { id: 'environment-variables', text: 'Environment Variables', level: 2 },
  { id: 'framework-setup', text: 'Framework-Specific Setup', level: 2 },
  { id: 'next-steps', text: 'Next steps', level: 2 },
];

export default function InstallationPage() {
  return (
    <div className="flex gap-8">
      <article className="flex-1 min-w-0 max-w-3xl">
        <Breadcrumb items={[{ label: 'Installation' }]} />
        <p className="text-sm text-emerald-600 font-mono mb-2">Getting Started</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Installation</h1>

        <p className="text-gray-600 leading-relaxed mb-4">
          Install the Crivline SDK using your preferred package manager. The SDK works with Node.js, React, Next.js, Vite, and other modern JavaScript frameworks.
        </p>

        <h2 id="package-manager" className="text-xl font-semibold text-gray-900 mb-3">Package Manager Installation</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Choose your preferred package manager:
        </p>
        <CodeBlock terminal title="Terminal">
          <span className="text-slate-500"># npm</span>
          {'\n'}
          <span className="text-emerald-400">npm install</span>
          <span className="text-slate-300"> @crivline/sdk</span>
          {'\n\n'}
          <span className="text-slate-500"># yarn</span>
          {'\n'}
          <span className="text-emerald-400">yarn add</span>
          <span className="text-slate-300"> @crivline/sdk</span>
          {'\n\n'}
          <span className="text-slate-500"># pnpm</span>
          {'\n'}
          <span className="text-emerald-400">pnpm add</span>
          <span className="text-slate-300"> @crivline/sdk</span>
        </CodeBlock>

        <h2 id="environment-variables" className="text-xl font-semibold text-gray-900 mb-3">Environment Variables</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Configure your Crivline project credentials using environment variables. Create a .env file in your project root:
        </p>
        <CodeBlock title=".env">
          <span className="text-indigo-400">CRIVLINE_PROJECT_KEY</span>
          <span className="text-slate-500">=</span>
          <span className="text-amber-400">your_project_key_here</span>
          {'\n'}
          <span className="text-indigo-400">CRIVLINE_API_URL</span>
          <span className="text-slate-500">=</span>
          <span className="text-amber-400">https://api.crivline.com</span>
        </CodeBlock>

        <Callout type="info" title="API URL">
          The API URL is optional and defaults to the production Crivline API. Only set it if you&apos;re using a self-hosted instance.
        </Callout>

        <h2 id="framework-setup" className="text-xl font-semibold text-gray-900 mb-3">Framework-Specific Setup</h2>

        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Next.js:</strong> The SDK works seamlessly with both the App Router and Pages Router. For server components, initialize the client in your server code. For client components, create a singleton instance or use React Context.
        </p>

        <p className="text-gray-600 leading-relaxed mb-4">
          <strong className="text-gray-900">Vite:</strong> Use import.meta.env for environment variables. Make sure to prefix your variables with VITE_ for client-side access.
        </p>

        <p className="text-gray-600 leading-relaxed mb-8">
          <strong className="text-gray-900">Node.js:</strong> The SDK works out of the box with Node.js 16+. Use process.env to access environment variables loaded via dotenv or your deployment platform.
        </p>

        <h2 id="next-steps" className="text-xl font-semibold text-gray-900 mb-3">Next steps</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <InfoCard
            title="JavaScript SDK"
            description="Full API reference for the JavaScript SDK"
            href="/docs/sdk/javascript"
          />
          <InfoCard
            title="React SDK"
            description="React hooks and components for feature flags"
            href="/docs/sdk/react"
          />
        </div>
      </article>

      <TableOfContents items={tocItems} />
    </div>
  );
}
