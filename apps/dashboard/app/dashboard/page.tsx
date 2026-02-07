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

  console.log(environmentActivity);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg">
          <p className="text-3xl font-bold">{flagsCount}</p>
          <p className="text-sm text-gray-400">Some text</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <p className="text-3xl font-bold">123</p>
          <p className="text-sm text-gray-400">Some text</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg">
          <p className="text-3xl font-bold">123</p>
          <p className="text-sm text-gray-400">Some text</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Most Recent Flags</h2>
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 text-sm bg-gray-700 border-b border-gray-800">
                <th className="text-left py-3 px-4 whitespace-nowrap">Flag Name</th>
                <th className="text-left py-3 px-4">Environment</th>
                <th className="text-left py-3 px-4">Created</th>
                <th className="text-left py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => {
                const prodEnvironment = flag.environments.find(
                  (env) => env.environment.isProduction,
                );

                return (
                  <tr key={flag.id} className="border-b border-gray-600">
                    <td className="whitespace-nowrap">{flag.name}</td>
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
                    <td className="py-3 px-4"> {timeAgo(flag.createdAt)} </td>
                    <td className="py-3 px-4">
                      {prodEnvironment?.enabled === true ? 'Active' : 'Inactive'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Environment Activity</h2>
          <div className="space-y-0">
            {environmentActivity.map((activity) => {
              console.log(activity);
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 border-b border-gray-800 py-4"
                >
                  <div
                    className="w-10 h-10 shrink-0 rounded-full"
                    style={{ backgroundColor: activity.user.color }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{activity.user.name}</p>
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
                    <p className="text-sm text-gray-400 mt-1">
                      {(activity.after as { description?: string }).description}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap">
                    {timeAgo(activity.createdAt)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
