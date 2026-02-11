interface Parameter {
  name: string;
  type: string;
  description: string;
  required?: boolean;
}

interface ParameterTableProps {
  parameters: Parameter[];
}

export function ParameterTable({ parameters }: ParameterTableProps) {
  return (
    <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-900">Name</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-900">Type</th>
            <th className="text-left px-4 py-2.5 font-semibold text-gray-900">Description</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((param) => (
            <tr key={param.name} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 font-mono text-sm">
                <span className="text-gray-900">{param.name}</span>
                {param.required && (
                  <span className="ml-1 text-red-500 text-xs">*</span>
                )}
              </td>
              <td className="px-4 py-2.5">
                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-emerald-700">
                  {param.type}
                </code>
              </td>
              <td className="px-4 py-2.5 text-gray-600">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
