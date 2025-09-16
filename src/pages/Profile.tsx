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
  const [user, setUser] = useState<UserData | null>(userStore.getUserData());

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

  // Datos seguros por defecto si no hay usuario
  const safeUser = user || {
    name: 'Usuario',
    email: 'usuario@ejemplo.com',
    avatar: '',
    bio: '',
    location: '',
    company: '',
    website: '',
    plan: 'free',
    joinedAt: new Date().toISOString()
  };

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
    <div className="pt-6 px-4 pb-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Perfil</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Tu información personal y estadísticas de la plataforma
        </p>
      </div>

      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center pb-4">
              <Avatar className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-3 md:mb-4">
                <AvatarImage src={safeUser.avatar} />
                <AvatarFallback className="text-xl md:text-2xl">
                  {safeUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg md:text-xl">{safeUser.name}</CardTitle>
              <CardDescription className="text-sm md:text-base">{safeUser.email}</CardDescription>
              <div className="flex justify-center mt-2">
                <Badge variant="secondary" className="text-xs md:text-sm">{safeUser.plan} Plan</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {safeUser.bio && (
                <p className="text-xs md:text-sm text-center text-muted-foreground leading-relaxed">
                  {safeUser.bio}
                </p>
              )}
              
              <Separator />
              
              <div className="space-y-3">
                {safeUser.company && (
                  <div className="flex items-center space-x-2 text-xs md:text-sm">
                    <Building className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{safeUser.company}</span>
                  </div>
                )}
                
                {safeUser.location && (
                  <div className="flex items-center space-x-2 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{safeUser.location}</span>
                  </div>
                )}
                
                {safeUser.website && (
                  <div className="flex items-center space-x-2 text-xs md:text-sm">
                    <LinkIcon className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={safeUser.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      {safeUser.website}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 text-xs md:text-sm">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Miembro desde {formatJoinDate(safeUser.joinedAt)}</span>
                </div>
              </div>
              
              <Separator />
              
              <Button className="w-full" onClick={handleEditProfile}>
                <Edit className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Editar perfil
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Activity */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* Statistics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">Estadísticas</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Resumen de tu actividad en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xl md:text-2xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg md:text-xl">Actividad reciente</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Tus últimas acciones en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium truncate">Despliegue exitoso de mi-app-web</p>
                    <p className="text-xs md:text-sm text-muted-foreground">hace 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium truncate">Nuevo proyecto creado: dashboard-analytics</p>
                    <p className="text-xs md:text-sm text-muted-foreground">hace 1 día</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium truncate">Configuración de dominio actualizada</p>
                    <p className="text-xs md:text-sm text-muted-foreground">hace 3 días</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium truncate">Plan actualizado a Pro</p>
                    <p className="text-xs md:text-sm text-muted-foreground">hace 1 semana</p>
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
