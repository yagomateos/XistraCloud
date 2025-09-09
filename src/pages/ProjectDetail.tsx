import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ExternalLink, 
  GitBranch, 
  Rocket, 
  Settings, 
  Activity,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getStatusBadgeClassName, formatDate } from '@/lib/utils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Mock project data
  const project = {
    id: id || '1',
    name: 'mi-app-web',
    repository: 'https://github.com/usuario/mi-app-web.git',
    framework: 'React',
    status: 'deployed',
    lastDeploy: 'hace 2 horas',
    url: 'https://mi-app-web.vercel.app',
    branch: 'main',
    buildCommand: 'npm run build',
    installCommand: 'npm install',
    outputDirectory: 'dist'
  };

  const [envVars, setEnvVars] = useState([
    { id: '1', key: 'API_URL', value: 'https://api.example.com', visible: false },
    { id: '2', key: 'DATABASE_URL', value: 'postgres://...', visible: false }
  ]);
  
  const [newEnvVar, setNewEnvVar] = useState({ key: '', value: '' });

  // Mock analytics data
  const trafficData = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { weekday: 'short' }),
    requests: Math.floor(Math.random() * 1000) + 500,
    uptime: 99.5 + Math.random() * 0.5
  }));

  const deploymentHistory = [
    {
      id: '1',
      status: 'success',
      createdAt: '2024-01-15T10:30:00Z',
      duration: '2m 15s',
      commit: 'feat: add new homepage design',
      branch: 'main'
    },
    {
      id: '2',
      status: 'success',
      createdAt: '2024-01-14T08:15:00Z',
      duration: '1m 30s',
      commit: 'chore: update dependencies',
      branch: 'main'
    },
    {
      id: '3',
      status: 'failed',
      createdAt: '2024-01-13T14:20:00Z',
      duration: '45s',
      commit: 'fix: resolve build errors',
      branch: 'develop'
    }
  ];

  const addEnvVar = () => {
    if (newEnvVar.key && newEnvVar.value) {
      setEnvVars(prev => [...prev, {
        id: Date.now().toString(),
        ...newEnvVar,
        visible: false
      }]);
      setNewEnvVar({ key: '', value: '' });
    }
  };

  const toggleVisibility = (id: string) => {
    setEnvVars(prev => prev.map(env => 
      env.id === id ? { ...env, visible: !env.visible } : env
    ));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const deleteEnvVar = (id: string) => {
    setEnvVars(prev => prev.filter(env => env.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard/projects')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted-foreground flex items-center mt-1">
              <GitBranch className="h-4 w-4 mr-2" />
              {project.repository}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getStatusBadgeClassName(project.status)}>
            <div className={`status-dot mr-1 status-${project.status === 'deployed' ? 'success' : project.status}`} />
            {project.status === 'deployed' ? 'Desplegado' : project.status}
          </Badge>
          <Button>
            <Rocket className="h-4 w-4 mr-2" />
            Desplegar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista general</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="environment">Variables</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Configuración del proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Framework</Label>
                  <p className="text-sm text-muted-foreground">{project.framework}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Rama de despliegue</Label>
                  <p className="text-sm text-muted-foreground">{project.branch}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Comando de instalación</Label>
                  <p className="text-sm text-muted-foreground font-mono">{project.installCommand}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Comando de build</Label>
                  <p className="text-sm text-muted-foreground font-mono">{project.buildCommand}</p>
                </div>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">Directorio de salida</Label>
                  <p className="text-sm text-muted-foreground font-mono">{project.outputDirectory}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado</span>
                  <Badge className={getStatusBadgeClassName(project.status)}>
                    Desplegado
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Último deploy</span>
                  <span className="text-sm text-muted-foreground">{project.lastDeploy}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">URL de producción</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(project.url, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historial de deployments</CardTitle>
              <CardDescription>
                Registro completo de todos los despliegues realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deploymentHistory.map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusBadgeClassName(deployment.status as any)}>
                        <div className={`status-dot mr-1 status-${deployment.status === 'success' ? 'success' : deployment.status === 'building' ? 'warning' : 'error'}`} />
                        {deployment.status === 'success' ? 'Exitoso' : deployment.status === 'building' ? 'En progreso' : 'Falló'}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">{deployment.commit}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(deployment.createdAt)} • {deployment.duration} • {deployment.branch}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Rocket className="h-3 w-3 mr-1" />
                      Redesplegar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Variables Tab */}
        <TabsContent value="environment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variables de entorno</CardTitle>
              <CardDescription>
                Configura las variables de entorno para tu aplicación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new env var */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="key">Clave</Label>
                  <Input
                    id="key"
                    placeholder="API_KEY"
                    value={newEnvVar.key}
                    onChange={(e) => setNewEnvVar(prev => ({ ...prev, key: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="value">Valor</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="value"
                      placeholder="tu-valor-secreto"
                      value={newEnvVar.value}
                      onChange={(e) => setNewEnvVar(prev => ({ ...prev, value: e.target.value }))}
                    />
                    <Button onClick={addEnvVar}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Existing env vars */}
              <div className="space-y-3">
                {envVars.map((envVar) => (
                  <div key={envVar.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">{envVar.key}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-mono">
                          {envVar.visible ? envVar.value : '••••••••••••'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(envVar.id)}
                      >
                        {envVar.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(envVar.value)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteEnvVar(envVar.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Requests totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24,321</div>
                <p className="text-xs text-success">+12% desde ayer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground">Últimos 7 días</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Tiempo de respuesta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">234ms</div>
                <p className="text-xs text-success">-5ms desde ayer</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Tráfico de los últimos 7 días
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="requests" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
