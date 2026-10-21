import { getDatabase } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export const revalidate = 0;

export default function AdminPage() {
  const db = getDatabase();
  return <AdminDashboard initialData={db} />;
}
