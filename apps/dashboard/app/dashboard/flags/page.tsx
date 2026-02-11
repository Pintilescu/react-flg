import type { Prisma } from '@crivline/db';
import { prisma } from '@crivline/db';

import { getCurrentUser } from '../../../lib/auth';

import { FlagFilters } from './_components/flag-filters';
import { Pagination } from './_components/pagination';

function badgeHelper(slug: string) {
  switch (slug) {
    case 'dev':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'staging':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'prod':
      return 'bg-red-100 text-red-700 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}
export default async function Flags({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    environment?: string;
    status?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const conditions: Prisma.FlagWhereInput[] = [];

  const query = params.q?.trim() ?? '';
  const envFilter = params.environment ?? '';
  const statusFilter = params.status ?? '';
  const sortField = params.sort === 'name' ? 'name' : 'createdAt';
  const sortOrder = params.order === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const user = await getCurrentUser();
  if (!user) return null;

  const projects = await prisma.project.findMany({
    where: { tenantId: user.tenantId },
    select: { id: true },
  });

  const projectIds = projects.map((p) => p.id);
  conditions.push({ projectId: { in: projectIds } });

  if (query) {
    conditions.push({
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { key: { contains: query, mode: 'insensitive' as const } },
      ],
    });
  }

  if (envFilter) {
    conditions.push({ environments: { some: { environment: { slug: envFilter } } } });
  }

  if (statusFilter === 'enabled') {
    conditions.push({
      environments: { some: { enabled: true } },
    });
  } else if (statusFilter === 'disabled') {
    conditions.push({
      environments: { none: { enabled: true } },
    });
  }

  const where = conditions.length > 0 ? { AND: conditions } : {};

  const pageSize = 8;

  // Count total matching flags
  const [totalCount, allEnvironments] = await Promise.all([
    prisma.flag.count({ where }),
    prisma.environment.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);

  // Fetch only this page's flags
  const flags = await prisma.flag.findMany({
    where,
    include: {
      environments: { include: { environment: true } },
      createdBy: true,
    },
    orderBy: { [sortField]: sortOrder },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  });

  const from = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, totalCount);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-sm text-gray-500">
            Manage configuration toggles across all environments
          </p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500">
          + Create New Flag
        </button>
      </div>

      <FlagFilters
        environments={allEnvironments}
        currentQuery={query}
        currentEnvironment={envFilter}
        currentStatus={statusFilter}
        currentSort={sortField}
      />

      <div className="bg-white border border-gray-200 rounded-lg mb-8">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left py-3 px-6 font-medium">Name</th>
              <th className="text-left py-3 px-6 font-medium">Key</th>
              <th className="text-left py-3 px-6 font-medium">Environments</th>
              <th className="text-left py-3 px-6 font-medium">Created Date</th>
            </tr>
          </thead>
          <tbody>
            {flags.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-gray-400">
                  No flags found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              flags.map((flag) => (
                <tr key={flag.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 border-b border-gray-100 font-medium text-gray-900">
                    {flag.name}
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100">
                    <span className="font-mono text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {flag.key}
                    </span>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100">
                    <div className="flex gap-1.5">
                      {flag.environments.map((env) => (
                        <span
                          key={env.environment.id}
                          className={`px-2 py-0.5 text-xs font-medium rounded border ${badgeHelper(env.environment.slug)}`}
                        >
                          {env.environment.slug.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 border-b border-gray-100 text-sm text-gray-500">
                    {flag.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          from={from}
          to={to}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';
