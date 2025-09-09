import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';

const DashboardLayout = () => {
  const [user, setUser] = useState<{ name: string; email: string; } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;