import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const AdminDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-pontiac text-white text-center mb-8 text-shadow-lg">Admin Dashboard</h1>
          <div className="mt-6 flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link href="/admin/settings" className="w-full sm:w-auto">
              <span className="block bg-white bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 rounded-lg shadow-lg p-6 border border-white border-opacity-20 text-center">
                <h2 className="text-xl font-semibold text-white mb-2">Settings</h2>
                <p className="text-gray-300">Configure application settings</p>
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;