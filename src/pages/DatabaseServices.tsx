import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Plus, ExternalLink, Trash2, Play, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, deployApp } from '@/lib/api';

interface DatabaseService {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'redis';
  status: 'running' | 'stopped' | 'error';
  port: number;
  admin_port: number;
  created_at: string;
  connection_string: string;
}

const DatabaseServices = () => {
  const [services, setServices] = useState<DatabaseService[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<string | null>(null);
  const { toast } = useToast();

  // Mock data para desarrollo local
  const mockServices: DatabaseService[] = [
    {
      id: 'mysql-prod-001',
      name: 'MySQL Production',
      type: 'mysql',
      status: 'running',
      port: 3306,
      admin_port: 8080,
      created_at: '2025-01-19T10:30:00Z',
      connection_string: 'mysql://user:pass@localhost:3306/dbname'
    },
    {
      id: 'postgres-dev-002',
      name: 'PostgreSQL Development',
      type: 'postgresql',
      status: 'running',
      port: 5432,
      admin_port: 8080,
      created_at: '2025-01-19T11:15:00Z',
      connection_string: 'postgresql://user:pass@localhost:5432/dbname'
    },
    {
      id: 'redis-cache-003',
      name: 'Redis Cache',
      type: 'redis',
      status: 'stopped',
      port: 6379,
      admin_port: 8080,
      created_at: '2025-01-19T12:00:00Z',
      connection_string: 'redis://localhost:6379'
    }
  ];

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/database/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
        console.log('📊 Loaded database services:', data.services);
      } else {
        // Fallback a mock data si hay error
        setServices(mockServices);
      }
    } catch (error) {
      console.error('Error loading database services:', error);
      setServices(mockServices);
    } finally {
      setLoading(false);
    }
  };

  const deployDatabase = async (type: 'mysql' | 'postgresql' | 'redis') => {
    try {
      setDeploying(type);
      
      const serviceName = `${type}-${Date.now()}`;
      const templateId = `${type}-standalone`;
      
      // Use real endpoint for both local and production
      const deployUrl = `${API_URL}/apps/deploy`;
      
      console.log('🚀 Deploying database via:', deployUrl);
      
      const response = await fetch(deployUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          name: serviceName,
          environment: generateEnvVars(type)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✅ Base de datos desplegada",
          description: `${type.toUpperCase()} se está iniciando...`,
        });
        
        // Recargar servicios después de un delay
        setTimeout(() => {
          loadServices();
        }, 3000);
      } else {
        throw new Error(result.error || 'Error al desplegar');
      }
    } catch (error: any) {
      toast({
        title: "❌ Error al desplegar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeploying(null);
    }
  };

  const generateEnvVars = (type: string) => {
    const timestamp = Date.now();
    const basePassword = `xistra_${timestamp}`;
    
    switch (type) {
      case 'mysql':
        return {
          MYSQL_ROOT_PASSWORD: basePassword,
          MYSQL_DATABASE: 'app_db',
          MYSQL_USER: 'app_user',
          MYSQL_PASSWORD: basePassword,
          MYSQL_PORT: 3306,
          PHPMYADMIN_PORT: 8080
        };
      case 'postgresql':
        return {
          POSTGRES_DB: 'app_db',
          POSTGRES_USER: 'app_user',
          POSTGRES_PASSWORD: basePassword,
          POSTGRES_PORT: 5432,
          PGADMIN_PORT: 8080,
          PGADMIN_EMAIL: 'admin@xistracloud.com',
          PGADMIN_PASSWORD: basePassword
        };
      case 'redis':
        return {
          REDIS_PASSWORD: basePassword,
          REDIS_PORT: 6379,
          REDIS_COMMANDER_PORT: 8080
        };
      default:
        return {};
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'stopped': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Activo';
      case 'stopped': return 'Detenido';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mysql': return '🐬';
      case 'postgresql': return '🐘';
      case 'redis': return '🔴';
      default: return '🗄️';
    }
  };

  const getAdminUrl = (service: DatabaseService) => {
    const baseUrl = API_URL.includes('localhost') ? 'http://localhost' : 'https://xistracloud.com';
    return `${baseUrl}:${service.admin_port}`;
  };

  const deleteService = async (serviceId: string) => {
    // Mostrar confirmación
    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este servicio de base de datos?\n\nEsta acción no se puede deshacer.'
    );
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/database/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "✅ Servicio eliminado",
          description: "El servicio de base de datos ha sido eliminado",
        });
        
        // Recargar servicios
        loadServices();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar');
      }
    } catch (error: any) {
      toast({
        title: "❌ Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Servicios de Base de Datos</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus bases de datos MySQL, PostgreSQL y Redis
            </p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Servicios de Base de Datos</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Gestiona tus bases de datos MySQL, PostgreSQL y Redis
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div></div>
        
        <div className="grid grid-cols-1 sm:flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => deployDatabase('mysql')}
            disabled={deploying === 'mysql'}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            {deploying === 'mysql' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Desplegando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                MySQL
              </>
            )}
          </Button>
          
          <Button
            onClick={() => deployDatabase('postgresql')}
            disabled={deploying === 'postgresql'}
            variant="outline"
            className="border-green-600 text-green-600 hover:bg-green-50 w-full sm:w-auto"
          >
            {deploying === 'postgresql' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                Desplegando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                PostgreSQL
              </>
            )}
          </Button>
          
          <Button
            onClick={() => deployDatabase('redis')}
            disabled={deploying === 'redis'}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50 w-full sm:w-auto"
          >
            {deploying === 'redis' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                Desplegando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Redis
              </>
            )}
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay servicios de base de datos</h3>
            <p className="text-muted-foreground mb-4">
              Despliega tu primera base de datos para empezar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(service.type)}</span>
                    <div>
                      <CardTitle className="text-base sm:text-lg">{service.name}</CardTitle>
                      <CardDescription className="capitalize text-xs sm:text-sm">{service.type}</CardDescription>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(service.status)} text-white text-xs sm:text-sm`}>
                    {getStatusText(service.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                  <div>
                    <span className="text-muted-foreground">Puerto:</span>
                    <div className="font-mono">{service.port}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Admin:</span>
                    <div className="font-mono">{service.admin_port}</div>
                  </div>
                </div>
                
                <div className="text-xs sm:text-sm">
                  <span className="text-muted-foreground">Creado:</span>
                  <div>{new Date(service.created_at).toLocaleDateString()}</div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(getAdminUrl(service), '_blank')}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Panel Admin
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                    onClick={() => deleteService(service.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseServices;
