export const dynamic = 'force-dynamic';

import { prisma } from '@crivline/db';
import { Flag, ToggleRight, LayoutGrid, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { getCurrentUser } from '../../lib/auth';

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

function formatAction(action: string): string {
  switch (action) {
    case 'FLAG_TOGGLED':
      return 'toggled';
    case 'FLAG_UPDATED':
      return 'updated';
    case 'FLAG_CREATED':
      return 'created';
    case 'FLAG_DELETED':
      return 'deleted';
    default:
      return action.toLowerCase().replace('_', ' ');
  }
}

export default async function Dashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await prisma.project.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);

  const flagsCount = await prisma.flag.count({ where: { projectId: { in: projectIds } } });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const flagsThisWeek = await prisma.flag.count({
    where: { projectId: { in: projectIds }, createdAt: { gte: oneWeekAgo } },
  });

  const activeFlagsCount = await prisma.flag.count({
    where: {
      projectId: { in: projectIds },
      environments: {
        some: { enabled: true },
      },
    },
  });

  const environments = await prisma.environment.findMany({
    orderBy: { sortOrder: 'asc' },
    select: { name: true },
    where: { projectId: { in: projectIds } },
  });

  const flags = await prisma.flag.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      environments: {
        include: { environment: true },
      },
    },
    where: { projectId: { in: projectIds } },
  });

  const environmentActivity = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      environment: true,
    },
    where: { tenantId: user.tenantId },
  });

  const activePercent = flagsCount > 0 ? Math.round((activeFlagsCount / flagsCount) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <Link
            href="/dashboard/flags/new"
            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create New Flag
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Total Flags</p>
            <div className="p-2 bg-gray-50 rounded-lg">
              <Flag className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-gray-900">{flagsCount}</p>
            {flagsThisWeek > 0 && (
              <span className="text-sm text-emerald-500 font-medium">
                +{flagsThisWeek} this week
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Active Flags</p>
            <div className="p-2 rounded-lg">
              <ToggleRight className="h-4 w-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-gray-900">{activeFlagsCount}</p>
            <span className="text-sm text-gray-400">{activePercent}% of total</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500">Environments</p>
            <div className="p-2 bg-gray-50 rounded-lg">
              <LayoutGrid className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-gray-900">{environments.length}</p>
            <span className="text-sm text-gray-400">
              {environments.map((e) => e.name).join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Most Recent Flags</h2>
          <Link
            href="/dashboard/flags"
            className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
          >
            View All
          </Link>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left py-3 px-6 font-medium">Flag Name</th>
              <th className="text-left py-3 px-6 font-medium">Environment</th>
              <th className="text-left py-3 px-6 font-medium">Created</th>
              <th className="text-left py-3 px-6 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((flag) => {
              const prodEnvironment = flag.environments.find((fe) => fe.environment.isProduction);
              const hasEnabled = flag.environments.some((fe) => fe.enabled);

              return (
                <tr
                  key={flag.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${hasEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
                      />
                      <span className="font-medium text-gray-900">{flag.key}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      {flag.environments.map((fe) => (
                        <span
                          key={fe.id}
                          className="text-xs px-2.5 py-1 rounded font-medium"
                          style={
                            fe.environment.isProduction
                              ? {
                                  backgroundColor: fe.environment.color,
                                  color: 'white',
                                }
                              : {
                                  border: `1px solid ${fe.environment.color}`,
                                  color: fe.environment.color,
                                }
                          }
                        >
                          {fe.environment.slug.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">{timeAgo(flag.createdAt)}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-sm font-semibold uppercase ${
                        prodEnvironment?.enabled ? 'text-emerald-500' : 'text-gray-400'
                      }`}
                    >
                      {prodEnvironment?.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Environment Activity</h2>
        </div>
        <div className="px-6">
          {environmentActivity.map((activity, index) => {
            const initials = (activity.user.name || 'U')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase();

            const actionColor =
              activity.action === 'FLAG_DELETED'
                ? 'bg-red-500'
                : activity.action === 'FLAG_CREATED'
                  ? 'bg-blue-500'
                  : 'bg-orange-500';

            const actionIcon =
              activity.action === 'FLAG_CREATED'
                ? '+'
                : activity.action === 'FLAG_DELETED'
                  ? '×'
                  : '!';

            return (
              <div
                key={activity.id}
                className={`flex items-start gap-4 py-5 ${
                  index < environmentActivity.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: activity.user.color }}
                  >
                    {initials}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${actionColor}`}
                  >
                    <span className="text-white text-[8px] font-bold">{actionIcon}</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.user.name}</span>{' '}
                    <span className="text-emerald-600 font-medium">
                      {formatAction(activity.action)}
                    </span>{' '}
                    {(activity.after as { description?: string })?.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activity.environment?.name || 'Unknown'} Environment
                  </p>
                </div>

                <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                  {timeAgo(activity.createdAt)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="border-t border-gray-200 py-4 text-center bg-gray-100">
          <Link
            href="/dashboard/audit"
            className="text-sm text-gray-500 hover:text-gray-700 font-mediu"
          >
            Show more activity
          </Link>
        </div>
      </div>
    </div>
  );
}
