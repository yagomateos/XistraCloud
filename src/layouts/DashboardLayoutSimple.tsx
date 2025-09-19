import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';

const DashboardLayoutSimple = () => {
  const [user, setUser] = useState({
    name: 'Usuario',
    email: 'usuario@ejemplo.com',
    avatar: ''
  });

  useEffect(() => {
    // Verificar si hay usuario en localStorage
    const userData = localStorage.getItem('user');
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    
    if (isAuthenticated === 'true' && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({
          name: parsedUser.name || 'Usuario',
          email: parsedUser.email || 'usuario@ejemplo.com',
          avatar: parsedUser.avatar || ''
        });
        console.log('✅ User loaded from localStorage:', parsedUser);
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
      }
    } else {
      // Si no está autenticado, redirigir al login
      console.log('❌ Not authenticated, redirecting to login');
      window.location.href = '/login';
    }
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto lg:pt-0 pt-14 sm:pt-16">
        <div className="w-full max-w-full px-3 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayoutSimple;
