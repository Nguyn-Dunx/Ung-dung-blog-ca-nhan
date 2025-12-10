import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import jwt, { JwtPayload } from 'jsonwebtoken';
import DashboardClient from '@/components/dashboard/DashboardClient';

interface AppJwtPayload extends JwtPayload {
  id?: string;
  role?: string;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/auth/login');
  }

  // Decode token to get user info
  let userId: string | null = null;
  let userRole: string = 'user';

  try {
    const decoded = jwt.decode(token) as AppJwtPayload | null;
    userId = decoded?.id || null;
    userRole = decoded?.role || 'user';
  } catch (err) {
    console.error("Failed to decode JWT:", err);
    redirect('/auth/login');
  }

  return <DashboardClient userId={userId} userRole={userRole} />;
}