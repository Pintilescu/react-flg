import { auth0 } from './auth0';
import { prisma } from '@crivline/db';

export async function getCurrentUser() {
  const session = await auth0.getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { auth0Id: session.user.sub },
    include: { tenant: true },
  });

  return user;
}
