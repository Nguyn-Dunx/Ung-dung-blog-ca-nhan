import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  return <DashboardClient />;
}