import { redirect } from 'next/navigation';

import { auth0 } from '@/lib/auth0';

import { getCurrentUser } from '../lib/auth';

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
