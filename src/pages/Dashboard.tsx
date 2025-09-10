import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Rocket, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  ExternalLink,
  BarChart3,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000 // Actualizar cada 30 segundos
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error al cargar los datos del dashboard</div>;
  }

  const projectsStatus = [
    { name: 'Activos', value: dashboardData?.projectStats.active || 0, color: 'hsl(var(--success))' },
    { name: 'En construcción', value: dashboardData?.projectStats.building || 0, color: 'hsl(var(--warning))' },
    { name: 'Con errores', value: dashboardData?.projectStats.error || 0, color: 'hsl(var(--error))' }
  ];

  const deploymentTrend = dashboardData?.deploymentTrend || [];
  const recentActivity = (dashboardData?.recentActivity || []).map(activity => ({
    id: activity.id,
    type: activity.type,
    project: activity.project,
    message: activity.message,
    status: activity.status,
    time: formatDistanceToNow(new Date(activity.created_at), { locale: es, addSuffix: true })
  }));

  // Datos de ejemplo para uptime
  const uptimeData = [
    { date: 'Hace 7d', uptime: 99.9 },
    { date: 'Hace 6d', uptime: 99.8 },
    { date: 'Hace 5d', uptime: 99.9 },
    { date: 'Hace 4d', uptime: 100 },
    { date: 'Hace 3d', uptime: 99.7 },
    { date: 'Hace 2d', uptime: 99.9 },
    { date: 'Hoy', uptime: 100 },
  ];

  // Datos de ejemplo para proyectos principales
  const topProjects = [
    { name: 'example-voting-app', requests: '5.1K', uptime: '98.8%', status: 'deployed' },
    { name: 'fastapi-blog-api', requests: '3.2K', uptime: '99.9%', status: 'deployed' },
    { name: 'react-dashboard', requests: '1.8K', uptime: '99.5%', status: 'deployed' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deployment':
        return <Rocket className="h-4 w-4" />;
      case 'domain':
        return <ExternalLink className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success';
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Vista general de todos tus proyectos y métricas de rendimiento
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos totales</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.projectStats.active || 0) + (dashboardData?.projectStats.building || 0) + (dashboardData?.projectStats.error || 0) + (dashboardData?.projectStats.stopped || 0)}</div>
            <p className="text-xs text-success">+2 este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments hoy</CardTitle>
            <Rocket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.projectStats.active || 0}</div>
            <p className="text-xs text-success">+15% vs ayer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.2%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo respuesta</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189ms</div>
            <p className="text-xs text-success">-12ms vs semana pasada</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Deployment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de deployments</CardTitle>
              <CardDescription>Deployments exitosos vs fallidos en los últimos 7 días</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deploymentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="success" stroke="hsl(var(--success))" strokeWidth={2} />
                  <Line type="monotone" dataKey="failed" stroke="hsl(var(--error))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Uptime Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Uptime últimas 24 horas</CardTitle>
              <CardDescription>Disponibilidad promedio de todos los proyectos</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={uptimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis domain={[95, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="uptime" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Projects */}
          <Card>
            <CardHeader>
              <CardTitle>Proyectos con más tráfico</CardTitle>
              <CardDescription>Ranking por número de requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div key={project.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.requests} requests</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-success-bg text-success border-success/20">
                        {project.uptime}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Project Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de proyectos</CardTitle>
              <CardDescription>Distribución actual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={projectsStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {projectsStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {projectsStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.name}</span>
                    </div>
                    <span className="font-medium">{status.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Actividad reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`mt-1 ${getActivityColor(activity.status)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.project}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver toda la actividad
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;