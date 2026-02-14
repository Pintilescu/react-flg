import { prisma } from '@crivline/db';
import { Clock, MoreVertical, Plus } from 'lucide-react';
import Link from 'next/link';

import { getCurrentUser } from '../../../lib/auth';

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)} weeks ago`;
}

export default async function Projects() {
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await prisma.project.findMany({
    where: { tenantId: user.tenantId },
    include: {
      environments: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, name: true, slug: true, color: true },
      },
      flags: {
        select: {
          id: true,
          environments: {
            select: { enabled: true },
          },
        },
      },
      _count: {
        select: { apiKeys: { where: { revokedAt: null } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects ({projects.length})</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your feature flag environments and API deployment keys.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500 transition-colors">
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => {
          const totalFlags = project.flags.length;
          const activeFlags = project.flags.filter((f) =>
            f.environments.some((e) => e.enabled),
          ).length;
          const pausedFlags = totalFlags - activeFlags;
          const activePercent = totalFlags > 0 ? (activeFlags / totalFlags) * 100 : 0;
          const hasActiveFlags = activeFlags > 0;
          const apiKeyCount = project._count.apiKeys;

          return (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.slug}`}
              className="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-gray-300 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasActiveFlags ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {project.name}
                  </h3>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {project.description && (
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{project.description}</p>
              )}

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.environments.map((env) => (
                  <span
                    key={env.id}
                    className="text-[11px] font-medium uppercase tracking-wide px-2 py-0.5 rounded border"
                    style={{
                      borderColor: env.color,
                      color: env.color,
                    }}
                  >
                    {env.name}
                  </span>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-900">{totalFlags} flags</span>
                  <span className="text-xs text-gray-400">
                    {activeFlags} active · {pausedFlags} paused
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${activePercent}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${apiKeyCount > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  />
                  <span className="text-xs text-gray-500">
                    {apiKeyCount > 0
                      ? `${apiKeyCount} API ${apiKeyCount === 1 ? 'key' : 'keys'} active`
                      : 'No API keys'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                Updated {timeAgo(project.updatedAt)}
              </div>
            </Link>
          );
        })}

        <button className="border-2 border-dashed border-gray-200 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors min-h-[280px] group">
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center mb-3 transition-colors">
            <Plus className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <p className="font-semibold text-gray-900 text-sm">Create New Project</p>
          <p className="text-xs text-gray-400 mt-1">Group flags by application or team.</p>
        </button>
      </div>
    </div>
  );
}
