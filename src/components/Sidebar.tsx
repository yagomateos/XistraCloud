import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Rocket, 
  FileText, 
  Settings, 
  Menu,
  ChevronLeft,
  User,
  LogOut,
  BarChart3,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

const Sidebar = ({ user }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Proyectos', href: '/dashboard/projects', icon: FolderOpen },
    { name: 'Despliegues', href: '/dashboard/deployments', icon: Rocket },
    { name: 'Logs', href: '/dashboard/logs', icon: FileText },
    { name: 'Dominios', href: '/dashboard/domains', icon: Globe },
    { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className={`
      flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <NavLink to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">X</span>
            </div>
            <span className="font-semibold text-foreground">XistraCloud</span>
          </NavLink>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/dashboard'}
              className={({ isActive }) => `
                  sidebar-item
                  ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                  ${collapsed ? 'justify-center' : ''}
                `}
            >
              <Icon className="h-4 w-4" />
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile */}
      {user && (
        <div className="p-3 border-t border-border mt-auto">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
            <NavLink
              to="/dashboard/profile"
              className={({ isActive }) => `
                  sidebar-item flex-1
                  ${isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
                  ${collapsed ? 'justify-center' : ''}
                `}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{user.name}</div>
                </div>
              )}
            </NavLink>
            {!collapsed && <ThemeToggle />}
          </div>
          
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Cerrar sesión
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Sidebar;