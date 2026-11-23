export const metadata = { title: 'Studio', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function AdminLayout({ children }) {
  return <>{children}</>;
}
