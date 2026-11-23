import { isAdmin } from '@/lib/auth';
import AdminApp from '@/components/AdminApp';
import AdminLogin from '@/components/AdminLogin';

export default async function AdminPage() {
  return (await isAdmin()) ? <AdminApp /> : <AdminLogin />;
}
