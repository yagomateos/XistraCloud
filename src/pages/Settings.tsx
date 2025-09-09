import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, Bell, Shield, CreditCard, Key, Trash2, Globe } from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '',
    plan: 'Pro'
  });

  const [notifications, setNotifications] = useState({
    deployments: true,
    failures: true,
    weekly: false
  });

  const [apiKeys] = useState([
    { id: '1', name: 'Production API', created: '2024-01-10', lastUsed: 'hace 2 horas' },
    { id: '2', name: 'Development API', created: '2024-01-05', lastUsed: 'hace 3 días' }
  ]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Administra tu cuenta y preferencias de la plataforma
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Perfil de usuario
            </CardTitle>
            <CardDescription>
              Actualiza tu información personal y configuración de cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm">
                  Cambiar avatar
                </Button>
                <Badge variant="secondary">{user.plan} Plan</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={user.name}
                  onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <Button>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificaciones
            </CardTitle>
            <CardDescription>
              Configura cómo y cuándo recibir notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Despliegues exitosos</div>
                  <div className="text-sm text-muted-foreground">
                    Recibe notificaciones cuando un despliegue se complete
                  </div>
                </div>
                <Switch
                  checked={notifications.deployments}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, deployments: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Fallos de despliegue</div>
                  <div className="text-sm text-muted-foreground">
                    Notificaciones inmediatas cuando un despliegue falle
                  </div>
                </div>
                <Switch
                  checked={notifications.failures}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, failures: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Resumen semanal</div>
                  <div className="text-sm text-muted-foreground">
                    Estadísticas semanales de tus proyectos
                  </div>
                </div>
                <Switch
                  checked={notifications.weekly}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weekly: checked }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Claves API
              </div>
              <Button size="sm">
                Crear nueva clave
              </Button>
            </CardTitle>
            <CardDescription>
              Administra las claves API para integraciones externas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Creada el {key.created} • Último uso: {key.lastUsed}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Domains Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Dominios personalizados
              </div>
              <Button size="sm" onClick={() => navigate('/dashboard/domains')}>
                Ver todos
              </Button>
            </CardTitle>
            <CardDescription>
              Administra los dominios conectados a tus proyectos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="font-medium">mi-app-web.com</div>
                <div className="text-sm text-muted-foreground">
                  Verificado • SSL activo
                </div>
              </div>
              <Badge className="bg-success-bg text-success border-success/20">
                Activo
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="font-medium">api.mi-empresa.com</div>
                <div className="text-sm text-muted-foreground">
                  Pendiente verificación DNS
                </div>
              </div>
              <Badge className="bg-warning-bg text-warning border-warning/20">
                Pendiente
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Facturación
            </CardTitle>
            <CardDescription>
              Gestiona tu suscripción y métodos de pago
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Plan actual: Pro</div>
                <div className="text-sm text-muted-foreground">
                  $29/mes • Próxima facturación: 15 de febrero
                </div>
              </div>
              <Button variant="outline">Cambiar plan</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Método de pago</div>
                <div className="text-sm text-muted-foreground">
                  •••• •••• •••• 4242 • Vence 12/25
                </div>
              </div>
              <Button variant="outline">Actualizar</Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-error/20">
          <CardHeader>
            <CardTitle className="flex items-center text-error">
              <Shield className="h-5 w-5 mr-2" />
              Zona de peligro
            </CardTitle>
            <CardDescription>
              Acciones irreversibles para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar cuenta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;