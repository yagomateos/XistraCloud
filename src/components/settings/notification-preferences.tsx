import React, { useState } from 'react';
import { SettingsCard } from '@/components/ui/settings-card';
import { NotificationItem } from '@/components/ui/notification-item';
import { toast } from 'sonner';
import { 
  Bell, 
  Shield, 
  Mail, 
  Smartphone,
  AlertTriangle,
  Megaphone,
  RefreshCw 
} from 'lucide-react';

interface NotificationSettings {
  deployments: boolean;
  security: boolean;
  marketing: boolean;
  updates: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export const NotificationPreferences: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationSettings>({
    deployments: true,
    security: true,
    marketing: false,
    updates: true,
    email: true,
    push: true,
    sms: false,
  });

  const handleNotificationChange = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success('Preferencias de notificaciones actualizadas');
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta Principal de Notificaciones */}
      <SettingsCard 
        title="Preferencias de Notificaciones" 
        description="Controla qué notificaciones quieres recibir y cómo las recibes"
      >
        <div className="space-y-3">
          <NotificationItem
            title="Notificaciones de Despliegues"
            description="Recibe notificaciones cuando tus despliegues cambien de estado o se completen"
            checked={notifications.deployments}
            onCheckedChange={() => handleNotificationChange('deployments')}
            icon={<RefreshCw size={18} />}
          />
          
          <NotificationItem
            title="Alertas de Seguridad"
            description="Notificaciones importantes sobre actividad sospechosa en tu cuenta"
            checked={notifications.security}
            onCheckedChange={() => handleNotificationChange('security')}
            icon={<Shield size={18} />}
          />
          
          <NotificationItem
            title="Marketing y Promociones"
            description="Ofertas especiales, noticias y actualizaciones sobre nuevas funcionalidades"
            checked={notifications.marketing}
            onCheckedChange={() => handleNotificationChange('marketing')}
            icon={<Megaphone size={18} />}
          />
          
          <NotificationItem
            title="Actualizaciones del Producto"
            description="Información sobre nuevas características, mejoras y cambios en la plataforma"
            checked={notifications.updates}
            onCheckedChange={() => handleNotificationChange('updates')}
            icon={<Bell size={18} />}
          />
        </div>
      </SettingsCard>

      {/* Tarjeta de Canales de Notificación */}
      <SettingsCard 
        title="Canales de Notificación" 
        description="Selecciona cómo prefieres recibir las notificaciones"
      >
        <div className="space-y-3">
          <NotificationItem
            title="Notificaciones por Email"
            description="Recibe notificaciones en tu dirección de correo electrónico"
            checked={notifications.email}
            onCheckedChange={() => handleNotificationChange('email')}
            icon={<Mail size={18} />}
          />
          
          <NotificationItem
            title="Notificaciones Push"
            description="Notificaciones instantáneas en tu navegador o aplicación móvil"
            checked={notifications.push}
            onCheckedChange={() => handleNotificationChange('push')}
            icon={<Smartphone size={18} />}
          />
          
          <NotificationItem
            title="Notificaciones SMS"
            description="Recibe alertas críticas por mensaje de texto (solo emergencias)"
            checked={notifications.sms}
            onCheckedChange={() => handleNotificationChange('sms')}
            icon={<AlertTriangle size={18} />}
          />
        </div>
      </SettingsCard>
    </div>
  );
};
