import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { userStore, UserData as UserStoreData } from '@/lib/user-store';
import {
  User,
  Mail,
  Bell,
  Shield,
  CreditCard,
  Settings2,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff,
  KeyIcon,
} from 'lucide-react';

interface UserData {
  name: string;
  email: string;
  avatar: string;
  plan: string;
  joinedDate: string;
}

interface NotificationSettings {
  deployments: boolean;
  security: boolean;
  marketing: boolean;
  updates: boolean;
}

const Settings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // Estado del usuario desde el store
  const [userData, setUserData] = useState<UserData>(() => {
    const storeData = userStore.getUserData();
    return {
      name: storeData.name,
      email: storeData.email,
      avatar: storeData.avatar,
      plan: storeData.plan,
      joinedDate: new Date(storeData.joinedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    };
  });

  // Estados para los modales
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Estados para formularios
  const [profileForm, setProfileForm] = useState(() => {
    const storeData = userStore.getUserData();
    return {
      name: storeData.name,
      email: storeData.email,
      bio: storeData.bio,
      location: storeData.location,
      company: storeData.company,
      website: storeData.website
    };
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Estado para notificaciones
  const [notifications, setNotifications] = useState<NotificationSettings>({
    deployments: true,
    security: true,
    marketing: false,
    updates: true
  });

  // Estado para archivo de avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Funciones para manejar cambios
  const handleProfileSave = () => {
    // Actualizar el store con todos los campos
    userStore.updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      bio: profileForm.bio,
      location: profileForm.location,
      company: profileForm.company,
      website: profileForm.website
    });

    // Actualizar estado local
    setUserData({
      ...userData,
      name: profileForm.name,
      email: profileForm.email
    });

    setIsProfileModalOpen(false);
    toast.success('Perfil actualizado correctamente');
  };

  const handlePasswordSave = () => {
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.new.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Simular guardado
    setPasswordForm({ current: '', new: '', confirm: '' });
    setIsPasswordModalOpen(false);
    toast.success('Contraseña actualizada correctamente');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarSave = () => {
    if (avatarPreview) {
      // Actualizar el store
      userStore.updateAvatar(avatarPreview);

      // Actualizar estado local
      setUserData({
        ...userData,
        avatar: avatarPreview
      });

      setIsAvatarModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview('');
      toast.success('Avatar actualizado correctamente');
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key]
    });
    toast.success('Preferencias de notificaciones actualizadas');
  };

  const handleDeleteAccount = () => {
    // Simular eliminación de cuenta
    toast.success('Proceso de eliminación iniciado. Recibirás un email de confirmación.');
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Configuración</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          Gestiona tu cuenta y preferencias de XistraCloud
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-auto p-1 md:h-10 lg:w-auto">
          <TabsTrigger value="profile" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:px-3 text-xs md:text-sm">
            <User className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:px-3 text-xs md:text-sm">
            <Bell className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Avisos</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:px-3 text-xs md:text-sm">
            <Shield className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 p-2 md:px-3 text-xs md:text-sm">
            <CreditCard className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden xs:inline">Plan</span>
          </TabsTrigger>
        </TabsList>

        {/* PERFIL */}
        <TabsContent value="profile" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <User className="h-4 w-4 md:h-5 md:w-5" />
                Información Personal
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Actualiza tu información personal y avatar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 mx-auto sm:mx-0">
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback className="text-base md:text-lg">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2 text-center sm:text-left flex-1 min-w-0">
                  <h3 className="font-semibold text-base md:text-lg truncate">{userData.name}</h3>
                  <p className="text-sm md:text-base text-muted-foreground truncate">{userData.email}</p>
                  <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-fit text-xs md:text-sm">
                        <Camera className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Cambiar Avatar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-lg">Cambiar Avatar</DialogTitle>
                        <DialogDescription className="text-sm">
                          Selecciona una nueva imagen para tu perfil
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <Avatar className="h-20 w-20 md:h-24 md:w-24">
                            <AvatarImage src={avatarPreview || userData.avatar} />
                            <AvatarFallback className="text-lg md:text-xl">
                              {userData.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div>
                          <Label htmlFor="avatar-upload">Seleccionar imagen</Label>
                          <Input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAvatarModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAvatarSave} disabled={!avatarPreview}>
                          <Save className="h-4 w-4 mr-2" />
                          Guardar Avatar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Separator />

              {/* Profile Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nombre completo</Label>
                  <p className="text-sm text-muted-foreground mt-1">{userData.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground mt-1">{userData.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan actual</Label>
                  <div className="mt-1">
                    <Badge variant={userData.plan === 'Pro' ? 'default' : 'secondary'}>
                      {userData.plan}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Miembro desde</Label>
                  <p className="text-sm text-muted-foreground mt-1">{userData.joinedDate}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                      <Settings2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Editar Perfil
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[95vw] max-w-md md:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-lg md:text-xl">Editar Perfil</DialogTitle>
                      <DialogDescription className="text-sm md:text-base">
                        Actualiza tu información personal completa
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 md:space-y-4 max-h-[50vh] md:max-h-[400px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">Nombre completo</Label>
                          <Input
                            id="name"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            placeholder="Tu nombre completo"
                            className="text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            placeholder="tu@email.com"
                            className="text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="bio" className="text-sm font-medium">Biografía</Label>
                          <Input
                            id="bio"
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                            placeholder="Describe tu perfil profesional"
                            className="text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company" className="text-sm font-medium">Empresa</Label>
                          <Input
                            id="company"
                            value={profileForm.company}
                            onChange={(e) => setProfileForm({...profileForm, company: e.target.value})}
                            placeholder="Tu empresa actual"
                            className="text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location" className="text-sm font-medium">Ubicación</Label>
                          <Input
                            id="location"
                            value={profileForm.location}
                            onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                            placeholder="Ciudad, País"
                            className="text-sm md:text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website" className="text-sm font-medium">Sitio web</Label>
                          <Input
                            id="website"
                            type="url"
                            value={profileForm.website}
                            onChange={(e) => setProfileForm({...profileForm, website: e.target.value})}
                            placeholder="https://tu-sitio-web.com"
                            className="text-sm md:text-base"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                      <Button variant="outline" onClick={() => setIsProfileModalOpen(false)} className="w-full sm:w-auto">
                        Cancelar
                      </Button>
                      <Button onClick={handleProfileSave} className="w-full sm:w-auto">
                        <Save className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                        Guardar Cambios
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICACIONES */}
        <TabsContent value="notifications" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                Preferencias de Notificaciones
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Controla qué notificaciones quieres recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium text-sm md:text-base">Notificaciones de despliegues</Label>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Recibe notificaciones cuando tus despliegues cambien de estado
                    </p>
                  </div>
                  <Switch
                    checked={notifications.deployments}
                    onCheckedChange={() => handleNotificationChange('deployments')}
                    className="flex-shrink-0"
                  />
                </div>
                <Separator />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium text-sm md:text-base">Alertas de seguridad</Label>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Notificaciones sobre actividad sospechosa en tu cuenta
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={() => handleNotificationChange('security')}
                    className="flex-shrink-0"
                  />
                </div>
                <Separator />
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Label className="font-medium text-sm md:text-base">Marketing y promociones</Label>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 leading-relaxed">
                      Ofertas especiales y noticias sobre nuevas funcionalidades
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={() => handleNotificationChange('marketing')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Actualizaciones del producto</Label>
                    <p className="text-sm text-muted-foreground">
                      Información sobre nuevas funcionalidades y mejoras
                    </p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={() => handleNotificationChange('updates')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURIDAD */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Label className="font-medium">Contraseña</Label>
                    <p className="text-sm text-muted-foreground">
                      Última actualización hace 3 meses
                    </p>
                  </div>
                  <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <KeyIcon className="h-4 w-4 mr-2" />
                        Cambiar Contraseña
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cambiar Contraseña</DialogTitle>
                        <DialogDescription>
                          Introduce tu contraseña actual y la nueva contraseña
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Contraseña actual</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordForm.current}
                              onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                              placeholder="Contraseña actual"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                            >
                              {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="new-password">Nueva contraseña</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordForm.new}
                              onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                              placeholder="Nueva contraseña"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                            >
                              {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                          <div className="relative">
                            <Input
                              id="confirm-password"
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordForm.confirm}
                              onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                              placeholder="Confirmar nueva contraseña"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2"
                              onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                            >
                              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handlePasswordSave}>
                          <Save className="h-4 w-4 mr-2" />
                          Actualizar Contraseña
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Label className="font-medium">Autenticación de dos factores</Label>
                    <p className="text-sm text-muted-foreground">
                      No configurada - Recomendamos activarla para mayor seguridad
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    <Shield className="h-4 w-4 mr-2" />
                    Configurar 2FA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zona Peligrosa */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Zona Peligrosa
              </CardTitle>
              <CardDescription>
                Acciones irreversibles con tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Label className="font-medium">Eliminar cuenta</Label>
                  <p className="text-sm text-muted-foreground">
                    Esto eliminará permanentemente tu cuenta y todos tus datos
                  </p>
                </div>
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Cuenta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>¿Estás seguro?</DialogTitle>
                      <DialogDescription>
                        Esta acción eliminará permanentemente tu cuenta y todos tus proyectos. 
                        No se puede deshacer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-destructive/10 p-4 rounded-lg">
                      <p className="text-sm font-medium text-destructive">
                        ⚠️ Esta acción es irreversible
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Se eliminarán todos tus proyectos, dominios y configuraciones.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sí, Eliminar Cuenta
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACTURACIÓN */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan y Facturación
              </CardTitle>
              <CardDescription>
                Gestiona tu suscripción y métodos de pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">Plan {userData.plan}</h3>
                  <p className="text-sm text-muted-foreground">
                    $20/mes • Próxima facturación: 15 Oct 2025
                  </p>
                </div>
                <Badge variant="default">Activo</Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline">
                  Cambiar Plan
                </Button>
                <Button variant="outline">
                  Ver Historial de Pagos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;