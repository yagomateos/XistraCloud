import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Loader2, CheckCircle, Server, Globe, Shield, Zap, Database, Palette } from 'lucide-react';

import { API_URL } from '@/lib/api';

interface AppTemplate {
  id: string;
  name: string;
  description: string;
  features: string[];
  icon: string;
}

const templates: Record<string, AppTemplate> = {
  wordpress: {
    id: 'wordpress',
    name: 'WordPress',
    description: 'El CMS más poderoso del mundo para crear sitios web increíbles',
    features: [
      'Sistema de gestión de contenidos completo',
      'Base de datos MySQL 8.0 optimizada', 
      'Panel de administración intuitivo',
      'Soporte para temas y plugins',
      'Editor de bloques Gutenberg',
      'SEO optimizado por defecto',
      'Responsive y mobile-first',
      'Actualizaciones automáticas'
    ],
    icon: '📝'
  },
  'wordpress-mysql': {
    id: 'wordpress-mysql',
    name: 'WordPress',
    description: 'El CMS más poderoso del mundo para crear sitios web increíbles',
    features: [
      'Sistema de gestión de contenidos completo',
      'Base de datos MySQL 8.0 optimizada', 
      'Panel de administración intuitivo',
      'Soporte para temas y plugins',
      'Editor de bloques Gutenberg',
      'SEO optimizado por defecto',
      'Responsive y mobile-first',
      'Actualizaciones automáticas'
    ],
    icon: '📝'
  },
  n8n: {
    id: 'n8n',
    name: 'n8n',
    description: 'Automatiza tu flujo de trabajo con esta potente herramienta',
    features: [
      'Editor visual de workflows',
      'Base de datos PostgreSQL incluida',
      '200+ integraciones disponibles',
      'Triggers y acciones personalizables',
      'Interfaz drag & drop',
      'Ejecutor de código personalizado'
    ],
    icon: '⚡'
  },
  mysql: {
    id: 'mysql',
    name: 'MySQL Database',
    description: 'Base de datos MySQL 8.0 de alto rendimiento',
    features: [
      'MySQL 8.0 con mejores características',
      'Almacenamiento persistente',
      'Usuario y contraseña personalizables',
      'Puerto configurable',
      'Respaldos automáticos',
      'Optimización de consultas'
    ],
    icon: '🗄️'
  }
};

export default function AppInstall() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const template = templateId ? templates[templateId] : null;
  
  // Estados para el formulario
  const [config, setConfig] = useState({
    appName: '',
    language: 'es',
    adminUser: 'admin',
    adminEmail: '',
    adminPassword: '',
    siteName: '',
    description: ''
  });

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <CardTitle className="text-red-600">Aplicación no encontrada</CardTitle>
            <CardDescription>
              La aplicación que buscas no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard/apps')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInstall = async () => {
    // Validaciones mejoradas
    if (!config.appName.trim()) {
      alert('Por favor ingresa un nombre para la aplicación');
      return;
    }

    if (template.id === 'wordpress' || template.id === 'wordpress-mysql') {
      if (!config.siteName.trim()) {
        alert('Por favor ingresa el nombre de tu sitio web');
        return;
      }
      if (!config.adminEmail.trim()) {
        alert('Por favor ingresa el email del administrador');
        return;
      }
      if (!config.adminPassword.trim() || config.adminPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/apps/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          name: config.appName,
          environment: {
            LANGUAGE: config.language,
            ADMIN_USER: config.adminUser,
            ADMIN_EMAIL: config.adminEmail,
            ADMIN_PASSWORD: config.adminPassword,
            SITE_NAME: config.siteName,
            SITE_DESCRIPTION: config.description
          }
        })
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // Mostrar éxito y abrir en nueva pestaña
        setTimeout(() => {
          window.open(result.deployment.accessUrl, '_blank');
        }, 1000);
        
        // Redirigir a proyectos después de 2 segundos
        setTimeout(() => {
          navigate('/dashboard/projects');
        }, 2000);
      } else {
        throw new Error(result.error || 'Error en la instalación');
      }
    } catch (error) {
      console.error('Error instalando app:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderWordPressConfig = () => (
    <div className="space-y-6">
      {/* Información del sitio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Información del sitio</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-sm font-medium">Nombre del sitio *</Label>
            <Input
              id="siteName"
              placeholder="Mi Blog Increíble"
              value={config.siteName}
              onChange={(e) => setConfig(prev => ({ ...prev, siteName: e.target.value }))}
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Este será el título principal de tu sitio web</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="language" className="text-sm font-medium">Idioma del sitio</Label>
            <Select value={config.language} onValueChange={(value) => setConfig(prev => ({ ...prev, language: value }))}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                <SelectItem value="pt">🇵🇹 Português</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">Descripción del sitio</Label>
          <Input
            id="description"
            placeholder="Un sitio increíble sobre tecnología, diseño y más..."
            value={config.description}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">Breve descripción que aparecerá en los resultados de búsqueda</p>
        </div>
      </div>

      <Separator />

      {/* Cuenta de administrador */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-600" />
          <h3 className="font-semibold text-lg">Cuenta de administrador</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="adminUser" className="text-sm font-medium">Usuario administrador *</Label>
            <Input
              id="adminUser"
              value={config.adminUser}
              onChange={(e) => setConfig(prev => ({ ...prev, adminUser: e.target.value }))}
              className="h-11"
              placeholder="admin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminEmail" className="text-sm font-medium">Email administrador *</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="admin@midominio.com"
              value={config.adminEmail}
              onChange={(e) => setConfig(prev => ({ ...prev, adminEmail: e.target.value }))}
              className="h-11"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminPassword" className="text-sm font-medium">Contraseña administrador *</Label>
          <Input
            id="adminPassword"
            type="password"
            placeholder="Contraseña segura (mínimo 8 caracteres)"
            value={config.adminPassword}
            onChange={(e) => setConfig(prev => ({ ...prev, adminPassword: e.target.value }))}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Usa una contraseña fuerte con letras, números y símbolos
          </p>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Configuración automática habilitada
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                WordPress se configurará automáticamente con estos datos. No tendrás que volver a ingresarlos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultConfig = () => (
    <div>
      <Label htmlFor="adminUser">Usuario administrador</Label>
      <Input
        id="adminUser"
        placeholder="admin"
        value={config.adminUser}
        onChange={(e) => setConfig(prev => ({ ...prev, adminUser: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Header mejorado */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard/apps')}
            className="mb-6 hover:bg-white/80 dark:hover:bg-slate-800/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Marketplace
          </Button>
          
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-5 sm:p-8 border border-white/20 dark:border-slate-700/50 shadow-xl">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl shadow-lg">
                {template.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Instalar {template.name}
                  </h1>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                    <Server className="w-3 h-3 mr-1" />
                    Hosting Profesional
                  </Badge>
                </div>
                <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 mb-4">
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300">
                    <Zap className="w-3 h-3 mr-1" />
                    Configuración automática
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950/50 dark:border-green-800 dark:text-green-300">
                    <Database className="w-3 h-3 mr-1" />
                    Base de datos incluida
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/50 dark:border-purple-800 dark:text-purple-300">
                    <Palette className="w-3 h-3 mr-1" />
                    Listo para usar
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 xl:gap-8">
          {/* Configuración principal */}
          <div className="xl:col-span-2">
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Configuración de {template.name}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      Personaliza tu instalación con los siguientes parámetros
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Nombre de la aplicación */}
                <div className="space-y-2">
                  <Label htmlFor="appName" className="text-sm font-medium flex items-center gap-2">
                    <span>Nombre de la aplicación</span>
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="appName"
                    placeholder={`mi-${template.id}`}
                    value={config.appName}
                    onChange={(e) => setConfig(prev => ({ ...prev, appName: e.target.value }))}
                    className="h-11 bg-white dark:bg-slate-800"
                  />
                  <p className="text-xs text-muted-foreground">
                    Identificador único para tu aplicación (solo letras, números y guiones)
                  </p>
                </div>

                <Separator />

                {(template.id === 'wordpress' || template.id === 'wordpress-mysql') ? renderWordPressConfig() : renderDefaultConfig()}

                {/* Botón de instalación mejorado */}
                <div className="pt-6">
                  <Button 
                    onClick={handleInstall} 
                    disabled={loading || !config.appName.trim()}
                    className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Instalando {template.name}...
                      </>
                    ) : (
                      <>
                        <Server className="w-5 h-5 mr-3" />
                        Instalar {template.name}
                      </>
                    )}
                  </Button>
                  
                  {loading && (
                    <div className="mt-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                          Configurando tu {template.name}... Esto puede tardar unos minutos.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel lateral de información */}
          <div className="space-y-6">
            {/* Características */}
            <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-white/20 dark:border-slate-700/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  ¿Qué incluye?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {template.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-indigo-800 dark:text-indigo-200">
                  <Zap className="w-5 h-5" />
                  Hosting Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-700 dark:text-indigo-300">Contenedores Docker optimizados</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-700 dark:text-indigo-300">Base de datos de alta velocidad</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-700 dark:text-indigo-300">Seguridad empresarial</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-indigo-700 dark:text-indigo-300">Acceso inmediato</span>
                  </div>
                </div>
                
                <Separator className="bg-indigo-200 dark:bg-indigo-800" />
                
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    ⚡ Instalación en menos de 2 minutos
                  </p>
                  <p className="text-xs text-indigo-500 dark:text-indigo-500">
                    Tu aplicación estará lista y funcionando automáticamente
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}