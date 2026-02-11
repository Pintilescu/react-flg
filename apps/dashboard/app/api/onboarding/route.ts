import { prisma } from '@crivline/db';
import { NextResponse } from 'next/server';

import { generateApiKeys } from '../../../lib/api-keys';
import { auth0 } from '../../../lib/auth0';

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }

    const { orgName, projectName, projectDescription } = await request.json();

    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: orgName,
          slug: slugify(orgName),
        },
      });

      const user = await tx.user.create({
        data: {
          email: session.user.email!,
          name: session.user.name,
          avatarUrl: session.user.picture,
          auth0Id: session.user.sub,
          role: 'OWNER',
          tenant: { connect: { id: tenant.id } },
        },
      });

      await tx.subscription.create({
        data: {
          tenant: { connect: { id: tenant.id } },
          plan: 'FREE',
          status: 'ACTIVE',
        },
      });

      const project = await tx.project.create({
        data: {
          name: projectName,
          slug: slugify(projectName),
          description: projectDescription || null,
          tenant: { connect: { id: tenant.id } },
        },
      });

      await tx.environment.createMany({
        data: [
          {
            name: 'Development',
            slug: 'development',
            color: '#22C55E',
            sortOrder: 0,
            projectId: project.id,
          },
          {
            name: 'Staging',
            slug: 'staging',
            color: '#F59E0B',
            sortOrder: 1,
            projectId: project.id,
          },
          {
            name: 'Production',
            slug: 'production',
            color: '#EF4444',
            sortOrder: 2,
            isProduction: true,
            projectId: project.id,
          },
        ],
      });

      const environments = await tx.environment.findMany({
        where: { projectId: project.id },
      });

      const apiKeyData = environments.map((env) => {
        const { keyHash, keyPrefix } = generateApiKeys(env.slug);
        return {
          name: `Default ${env.name} Key`,
          keyHash,
          keyPrefix,
          projectId: project.id,
          environmentId: env.id,
          createdById: user.id,
        };
      });

      await tx.apiKey.createMany({ data: apiKeyData });

      return { tenant, user, project };
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Onboarding failed' }, { status: 500 });
  }
}
