import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Bell, 
  Shield, 
  Mail, 
  Smartphone,
  Settings,
  User,
  CreditCard,
  Globe,
  Palette
} from 'lucide-react';

// Componente Card Base
interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  description, 
  children, 
  icon,
  className = '' 
}) => {
  return (
    <div className={`
      bg-white 
      border 
      border-gray-200 
      rounded-xl 
      shadow-sm 
      p-6 
      transition-all 
      duration-200 
      hover:shadow-md
      hover:border-gray-300
      ${className}
    `}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Componente Switch Item
interface SwitchItemProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
  variant?: 'default' | 'compact';
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  title,
  description,
  checked,
  onCheckedChange,
  icon,
  variant = 'default'
}) => {
  const isCompact = variant === 'compact';
  
  return (
    <div className={`
      flex 
      items-start 
      justify-between 
      ${isCompact ? 'p-3' : 'p-4'} 
      rounded-lg 
      border 
      border-gray-100 
      bg-gray-50/30 
      hover:bg-gray-50/60 
      hover:border-gray-200
      transition-all 
      duration-200
      gap-4
      group
    `}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className={`
            flex-shrink-0 
            ${isCompact ? 'mt-0.5' : 'mt-1'} 
            text-gray-400
            group-hover:text-gray-600
            transition-colors
            duration-200
          `}>
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className={`
            font-medium 
            text-gray-900 
            ${isCompact ? 'text-sm' : 'text-sm'} 
            leading-5
          `}>
            {title}
          </h4>
          <p className={`
            text-gray-600 
            mt-1 
            leading-5
            ${isCompact ? 'text-xs' : 'text-sm'}
          `}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};

// Componente Principal - Ejemplo Completo
export const ProfessionalSettingsExample: React.FC = () => {
  // Estados para diferentes secciones
  const [notifications, setNotifications] = useState({
    deployments: true,
    security: true,
    marketing: false,
    updates: true,
    email: true,
    push: true,
    sms: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    activityStatus: false,
    dataCollection: true,
  });

  const [preferences, setPreferences] = useState({
    darkMode: false,
    language: true,
    timezone: true,
  });

  // Handlers
  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success(`Preferencia de ${key} actualizada`);
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success(`Configuración de privacidad actualizada`);
  };

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast.success(`Preferencia actualizada`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Configuración de Usuario
        </h1>
        <p className="text-gray-600">
          Personaliza tu experiencia y controla tus preferencias
        </p>
      </div>

      <div className="grid gap-8">
        {/* Notificaciones */}
        <SettingsCard 
          title="Notificaciones" 
          description="Controla qué notificaciones quieres recibir y cómo"
          icon={<Bell size={20} />}
        >
          <div className="space-y-3">
            <SwitchItem
              title="Notificaciones de Despliegues"
              description="Recibe alertas cuando tus despliegues cambien de estado"
              checked={notifications.deployments}
              onCheckedChange={() => handleNotificationChange('deployments')}
              icon={<Settings size={16} />}
            />
            
            <SwitchItem
              title="Alertas de Seguridad"
              description="Notificaciones importantes sobre actividad sospechosa"
              checked={notifications.security}
              onCheckedChange={() => handleNotificationChange('security')}
              icon={<Shield size={16} />}
            />
            
            <SwitchItem
              title="Marketing y Promociones"
              description="Ofertas especiales y noticias sobre funcionalidades"
              checked={notifications.marketing}
              onCheckedChange={() => handleNotificationChange('marketing')}
              icon={<Mail size={16} />}
            />
            
            <SwitchItem
              title="Actualizaciones del Producto"
              description="Información sobre nuevas características y mejoras"
              checked={notifications.updates}
              onCheckedChange={() => handleNotificationChange('updates')}
              icon={<Bell size={16} />}
            />
          </div>

          {/* Subsección: Canales */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Canales de Notificación
            </h4>
            <div className="space-y-2">
              <SwitchItem
                title="Email"
                description="Notificaciones por correo electrónico"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
                icon={<Mail size={14} />}
                variant="compact"
              />
              
              <SwitchItem
                title="Push"
                description="Notificaciones instantáneas"
                checked={notifications.push}
                onCheckedChange={() => handleNotificationChange('push')}
                icon={<Smartphone size={14} />}
                variant="compact"
              />
              
              <SwitchItem
                title="SMS"
                description="Solo para alertas críticas"
                checked={notifications.sms}
                onCheckedChange={() => handleNotificationChange('sms')}
                icon={<Smartphone size={14} />}
                variant="compact"
              />
            </div>
          </div>
        </SettingsCard>

        {/* Privacidad */}
        <SettingsCard 
          title="Privacidad y Seguridad" 
          description="Controla la visibilidad de tu información y datos"
          icon={<Shield size={20} />}
        >
          <div className="space-y-3">
            <SwitchItem
              title="Visibilidad del Perfil"
              description="Permite que otros usuarios vean tu perfil público"
              checked={privacy.profileVisibility}
              onCheckedChange={() => handlePrivacyChange('profileVisibility')}
              icon={<User size={16} />}
            />
            
            <SwitchItem
              title="Estado de Actividad"
              description="Muestra cuándo estás activo en la plataforma"
              checked={privacy.activityStatus}
              onCheckedChange={() => handlePrivacyChange('activityStatus')}
              icon={<Globe size={16} />}
            />
            
            <SwitchItem
              title="Recopilación de Datos"
              description="Permite el análisis de uso para mejorar la experiencia"
              checked={privacy.dataCollection}
              onCheckedChange={() => handlePrivacyChange('dataCollection')}
              icon={<Shield size={16} />}
            />
          </div>
        </SettingsCard>

        {/* Preferencias de Interfaz */}
        <SettingsCard 
          title="Preferencias de Interfaz" 
          description="Personaliza la apariencia y comportamiento"
          icon={<Palette size={20} />}
        >
          <div className="space-y-3">
            <SwitchItem
              title="Modo Oscuro"
              description="Utiliza un tema oscuro para reducir la fatiga visual"
              checked={preferences.darkMode}
              onCheckedChange={() => handlePreferenceChange('darkMode')}
              icon={<Palette size={16} />}
            />
            
            <SwitchItem
              title="Detección de Idioma Automática"
              description="Detecta automáticamente tu idioma preferido"
              checked={preferences.language}
              onCheckedChange={() => handlePreferenceChange('language')}
              icon={<Globe size={16} />}
            />
            
            <SwitchItem
              title="Zona Horaria Automática"
              description="Ajusta automáticamente la zona horaria según tu ubicación"
              checked={preferences.timezone}
              onCheckedChange={() => handlePreferenceChange('timezone')}
              icon={<Globe size={16} />}
            />
          </div>
        </SettingsCard>

        {/* Sección de Acciones */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                ¿Necesitas ayuda?
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Contacta con nuestro equipo de soporte si tienes alguna duda
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Contactar Soporte
              </button>
              <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
