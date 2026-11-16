import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect('/login?from=/admin');
  }

  const db = await getDatabase();
  return <AdminDashboard initialData={db} />;
}
