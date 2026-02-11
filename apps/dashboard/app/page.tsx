import { redirect } from 'next/navigation';

import { getCurrentUser } from '../lib/auth';

import { auth0 } from '@/lib/auth0';

export default async function HomePage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect('/onboarding');
  }

  redirect('/dashboard');
}
