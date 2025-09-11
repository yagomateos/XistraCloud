import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Mail, MapPin, Building, Link as LinkIcon, Edit } from 'lucide-react';
import { userStore, UserData } from '@/lib/user-store';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData>(userStore.getUserData());

  // Escuchar cambios en los datos del usuario
  useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent) => {
      setUser(event.detail);
    };

    window.addEventListener('user-data-updated', handleUserDataUpdate as EventListener);

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate as EventListener);
    };
  }, []);

  const handleEditProfile = () => {
    navigate('/dashboard/settings?tab=profile');
  };

  const stats = [
    { label: 'Proyectos', value: '12' },
    { label: 'Despliegues', value: '156' },
    { label: 'Uptime promedio', value: '99.8%' },
    { label: 'Tiempo activo', value: '8 meses' }
  ];

  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Perfil</h1>
        <p className="text-muted-foreground">
          Tu información personal y estadísticas de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge variant="secondary">{user.plan} Plan</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                {user.bio}
              </p>
              
              <Separator />
              
              <div className="space-y-3">
                {user.company && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{user.company}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center space-x-2 text-sm">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.website}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Miembro desde {formatJoinDate(user.joinedAt)}</span>
                </div>
              </div>
              
              <Separator />
              
              <Button className="w-full" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Editar perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>
                Resumen de tu actividad en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad reciente</CardTitle>
              <CardDescription>
                Tus últimas acciones en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Despliegue exitoso de mi-app-web</p>
                    <p className="text-xs text-muted-foreground">hace 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Nuevo proyecto creado: dashboard-analytics</p>
                    <p className="text-xs text-muted-foreground">hace 1 día</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Configuración de dominio actualizada</p>
                    <p className="text-xs text-muted-foreground">hace 3 días</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Plan actualizado a Pro</p>
                    <p className="text-xs text-muted-foreground">hace 1 semana</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
