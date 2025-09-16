import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useUserData } from '@/hooks/useUserData';

const DashboardLayout = () => {
  const { userData } = useUserData();

  // Convertir userData al formato que espera el Sidebar
  // Siempre mostrar al menos datos por defecto para que aparezca el perfil
  const user = {
    name: userData?.name || 'Usuario',
    email: userData?.email || 'usuario@ejemplo.com',
    avatar: userData?.avatar || ''
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto lg:pt-0 pt-16">
        <div className="w-full max-w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;