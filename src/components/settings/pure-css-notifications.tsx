import React from 'react';
import { Switch } from '@/components/ui/switch';

const styles = {
  card: {
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    padding: '24px',
    transition: 'box-shadow 0.2s ease-in-out',
  } as React.CSSProperties,

  cardHover: {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  } as React.CSSProperties,

  cardHeader: {
    marginBottom: '16px',
  } as React.CSSProperties,

  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 4px 0',
    lineHeight: '24px',
  } as React.CSSProperties,

  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '20px',
  } as React.CSSProperties,

  notificationItem: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #f3f4f6',
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    gap: '16px',
    transition: 'background-color 0.2s ease-in-out',
    marginBottom: '12px',
  } as React.CSSProperties,

  notificationItemHover: {
    backgroundColor: '#f9fafb',
  } as React.CSSProperties,

  notificationContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: '1',
    minWidth: '0',
  } as React.CSSProperties,

  notificationIcon: {
    flexShrink: '0',
    marginTop: '2px',
    color: '#6b7280',
  } as React.CSSProperties,

  notificationText: {
    flex: '1',
    minWidth: '0',
  } as React.CSSProperties,

  notificationTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 4px 0',
    lineHeight: '20px',
  } as React.CSSProperties,

  notificationDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '20px',
  } as React.CSSProperties,

  switchContainer: {
    flexShrink: '0',
  } as React.CSSProperties,

  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
  } as React.CSSProperties,
};

interface PureCSS_SettingsCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PureCSS_SettingsCard: React.FC<PureCSS_SettingsCardProps> = ({ 
  title, 
  description, 
  children 
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{title}</h3>
        {description && (
          <p style={styles.cardDescription}>{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

interface PureCSS_NotificationItemProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

const PureCSS_NotificationItem: React.FC<PureCSS_NotificationItemProps> = ({
  title,
  description,
  checked,
  onCheckedChange,
  icon
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div 
      style={{
        ...styles.notificationItem,
        ...(isHovered ? styles.notificationItemHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.notificationContent}>
        {icon && (
          <div style={styles.notificationIcon}>
            {icon}
          </div>
        )}
        <div style={styles.notificationText}>
          <h4 style={styles.notificationTitle}>{title}</h4>
          <p style={styles.notificationDescription}>{description}</p>
        </div>
      </div>
      <div style={styles.switchContainer}>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};

// Componente principal exportado
export const PureCSS_NotificationPreferences: React.FC = () => {
  const [notifications, setNotifications] = React.useState({
    deployments: true,
    security: true,
    marketing: false,
    updates: true,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div style={styles.container}>
      <PureCSS_SettingsCard 
        title="Preferencias de Notificaciones" 
        description="Controla qué notificaciones quieres recibir"
      >
        <div>
          <PureCSS_NotificationItem
            title="Notificaciones de Despliegues"
            description="Recibe notificaciones cuando tus despliegues cambien de estado"
            checked={notifications.deployments}
            onCheckedChange={() => handleNotificationChange('deployments')}
          />
          
          <PureCSS_NotificationItem
            title="Alertas de Seguridad"
            description="Notificaciones sobre actividad sospechosa en tu cuenta"
            checked={notifications.security}
            onCheckedChange={() => handleNotificationChange('security')}
          />
          
          <PureCSS_NotificationItem
            title="Marketing y Promociones"
            description="Ofertas especiales y noticias sobre nuevas funcionalidades"
            checked={notifications.marketing}
            onCheckedChange={() => handleNotificationChange('marketing')}
          />
          
          <PureCSS_NotificationItem
            title="Actualizaciones del Producto"
            description="Información sobre nuevas características y mejoras"
            checked={notifications.updates}
            onCheckedChange={() => handleNotificationChange('updates')}
          />
        </div>
      </PureCSS_SettingsCard>
    </div>
  );
};
