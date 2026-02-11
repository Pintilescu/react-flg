type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface HttpMethodBadgeProps {
  method: HttpMethod;
  path: string;
}

const colors: Record<HttpMethod, string> = {
  GET: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PATCH: 'bg-amber-100 text-amber-700 border-amber-200',
  PUT: 'bg-orange-100 text-orange-700 border-orange-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
};

export function HttpMethodBadge({ method, path }: HttpMethodBadgeProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${colors[method]}`}
      >
        {method}
      </span>
      <code className="text-sm font-mono text-gray-700">{path}</code>
    </div>
  );
}
