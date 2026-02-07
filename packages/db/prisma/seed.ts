import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.auditLog.deleteMany();
  await prisma.flagEnvironment.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.flag.deleteMany();
  await prisma.environment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.usage.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Acme Inc',
      slug: 'acme',
    },
  });

  // Create users
  const emily = await prisma.user.create({
    data: {
      email: 'emily@acme.com',
      name: 'Emily Wu',
      role: 'OWNER',
      tenantId: tenant.id,
    },
  });

  const sarah = await prisma.user.create({
    data: {
      email: 'sarah@acme.com',
      name: 'Sarah Kim',
      role: 'ADMIN',
      tenantId: tenant.id,
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: 'alex@acme.com',
      name: 'Alex Jones',
      role: 'MEMBER',
      tenantId: tenant.id,
    },
  });

  const john = await prisma.user.create({
    data: {
      email: 'john@acme.com',
      name: 'John Doe',
      role: 'MEMBER',
      tenantId: tenant.id,
    },
  });

  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Web App',
      slug: 'web-app',
      description: 'Main web application',
      tenantId: tenant.id,
    },
  });

  // Create environments
  const dev = await prisma.environment.create({
    data: {
      name: 'Development',
      slug: 'dev',
      color: '#22c55e',
      isProduction: false,
      sortOrder: 0,
      projectId: project.id,
    },
  });

  const staging = await prisma.environment.create({
    data: {
      name: 'Staging',
      slug: 'staging',
      color: '#eab308',
      isProduction: false,
      sortOrder: 1,
      projectId: project.id,
    },
  });

  const prod = await prisma.environment.create({
    data: {
      name: 'Production',
      slug: 'prod',
      color: '#ef4444',
      isProduction: true,
      sortOrder: 2,
      projectId: project.id,
    },
  });

  // Create flags
  const flags = await Promise.all([
    prisma.flag.create({
      data: {
        key: 'new-checkout-flow',
        name: 'New Checkout Flow',
        description: 'Enables the redesigned checkout experience',
        type: 'BOOLEAN',
        defaultValue: false,
        projectId: project.id,
        createdById: emily.id,
      },
    }),
    prisma.flag.create({
      data: {
        key: 'beta-feature-toggle',
        name: 'Beta Feature Toggle',
        description: 'Toggles beta features for selected users',
        type: 'BOOLEAN',
        defaultValue: false,
        projectId: project.id,
        createdById: sarah.id,
      },
    }),
    prisma.flag.create({
      data: {
        key: 'dark-mode-enabled',
        name: 'Dark Mode Enabled',
        description: 'Enables dark mode across the application',
        type: 'BOOLEAN',
        defaultValue: false,
        projectId: project.id,
        createdById: alex.id,
      },
    }),
    prisma.flag.create({
      data: {
        key: 'promo-banner',
        name: 'Promo Banner',
        description: 'Shows promotional banner on the homepage',
        type: 'BOOLEAN',
        defaultValue: false,
        projectId: project.id,
        createdById: emily.id,
      },
    }),
    prisma.flag.create({
      data: {
        key: 'api-rate-limit',
        name: 'API Rate Limit',
        description: 'Enables stricter API rate limiting',
        type: 'BOOLEAN',
        defaultValue: false,
        projectId: project.id,
        createdById: john.id,
      },
    }),
  ]);

  // Create flag environments (flag state per environment)
  const flagEnvData = [
    { flag: flags[0], env: dev, enabled: true, rollout: 100 },
    { flag: flags[1], env: staging, enabled: false, rollout: 100 },
    { flag: flags[2], env: prod, enabled: true, rollout: 100 },
    { flag: flags[3], env: dev, enabled: false, rollout: 100 },
    { flag: flags[4], env: prod, enabled: true, rollout: 5 },
  ];

  for (const { flag, env, enabled, rollout } of flagEnvData) {
    await prisma.flagEnvironment.create({
      data: {
        flagId: flag.id,
        environmentId: env.id,
        enabled,
        rolloutPercentage: rollout,
        rules: [],
      },
    });
  }

  // Create audit log entries
  const now = new Date();
  const auditEntries = [
    { user: emily, env: dev, action: 'FLAG_TOGGLED' as const, entity: flags[2], desc: 'Tagging Dark Mode Enabled', ago: 10 * 60 * 1000 },
    { user: sarah, env: dev, action: 'FLAG_UPDATED' as const, entity: flags[1], desc: 'Targeting user_789', ago: 60 * 60 * 1000 },
    { user: alex, env: prod, action: 'FLAG_UPDATED' as const, entity: flags[0], desc: 'Rollout 35% for New Checkout_Flow', ago: 3 * 60 * 60 * 1000 },
    { user: emily, env: dev, action: 'FLAG_UPDATED' as const, entity: flags[3], desc: 'Tagging user_456 for Promo Banner', ago: 5 * 60 * 60 * 1000 },
    { user: john, env: prod, action: 'FLAG_TOGGLED' as const, entity: flags[4], desc: 'Enabled API Rate Limit for 5% of users', ago: 8 * 60 * 60 * 1000 },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        projectId: project.id,
        environmentId: entry.env.id,
        userId: entry.user.id,
        action: entry.action,
        entityType: 'Flag',
        entityId: entry.entity.id,
        after: { description: entry.desc },
        createdAt: new Date(now.getTime() - entry.ago),
      },
    });
  }

  // Create subscription
  await prisma.subscription.create({
    data: {
      tenantId: tenant.id,
      stripeCustomerId: 'cus_demo_123',
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('Seed complete!');
  console.log(`  Tenant: ${tenant.name}`);
  console.log(`  Users: ${[emily, sarah, alex, john].map(u => u.name).join(', ')}`);
  console.log(`  Project: ${project.name}`);
  console.log(`  Environments: dev, staging, prod`);
  console.log(`  Flags: ${flags.length}`);
  console.log(`  Audit entries: ${auditEntries.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
