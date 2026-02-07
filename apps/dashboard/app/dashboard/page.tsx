export const dynamic = 'force-dynamic';

import { prisma } from '@flagline/db';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes} mins ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export default async function Dashboard() {
  const flagsCount = await prisma.flag.count();
  const flags = await prisma.flag.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      environments: {
        include: { environment: true },
      },
    },
  });

  const environmentActivity = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      environment: true,
    },
  });

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <p className="text-3xl font-bold text-gray-900">{flagsCount}</p>
          <p className="text-sm text-gray-500">Total Flags</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <p className="text-3xl font-bold text-gray-900">123</p>
          <p className="text-sm text-gray-500">Some text</p>
        </div>
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <p className="text-3xl font-bold text-gray-900">123</p>
          <p className="text-sm text-gray-500">Some text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Most Recent Flags</h2>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-sm bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 whitespace-nowrap font-medium">Flag Name</th>
                  <th className="text-left py-3 px-4 font-medium">Environment</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => {
                  const prodEnvironment = flag.environments.find(
                    (env) => env.environment.isProduction,
                  );

                  return (
                    <tr key={flag.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 whitespace-nowrap text-gray-900">{flag.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {prodEnvironment && (
                            <span
                              key={prodEnvironment.id}
                              className="text-white text-xs px-2 py-1 rounded-full"
                              style={{ backgroundColor: prodEnvironment.environment.color }}
                            >
                              {prodEnvironment.environment.slug}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{timeAgo(flag.createdAt)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            prodEnvironment?.enabled
                              ? 'text-green-600 font-medium'
                              : 'text-gray-400'
                          }
                        >
                          {prodEnvironment?.enabled === true ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Environment Activity</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {environmentActivity.map((activity, index) => (
              <div
                key={activity.id}
                className={`flex items-start gap-3 py-4 ${
                  index < environmentActivity.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div
                  className="w-10 h-10 shrink-0 rounded-full"
                  style={{ backgroundColor: activity.user.color }}
                ></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-900">{activity.user.name}</p>
                    {activity.environment?.isProduction && (
                      <span
                        key={activity.environmentId}
                        className="text-white text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: activity.environment.color }}
                      >
                        {activity.environment.slug}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {(activity.after as { description?: string })?.description}
                  </p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap">
                  {timeAgo(activity.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
