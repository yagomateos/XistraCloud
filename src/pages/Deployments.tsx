import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, RotateCcw, ExternalLink, Calendar } from 'lucide-react';

interface Deployment {
  id: string;
  projectName: string;
  projectId: string;
  status: 'success' | 'failed' | 'building';
  createdAt: string;
  duration: string;
  url?: string;
  branch: string;
  commit: string;
}

const Deployments = () => {
  const [deployments] = useState<Deployment[]>([
    {
      id: '1',
      projectName: 'mi-app-web',
      projectId: '1',
      status: 'success',
      createdAt: '2024-01-15T10:30:00Z',
      duration: '2m 15s',
      url: 'https://mi-app-web-abc123.vercel.app',
      branch: 'main',
      commit: 'feat: add new homepage design'
    },
    {
      id: '2',
      projectName: 'api-backend',
      projectId: '2',
      status: 'building',
      createdAt: '2024-01-15T10:25:00Z',
      duration: '1m 45s',
      branch: 'main',
      commit: 'fix: update API endpoints'
    },
    {
      id: '3',
      projectName: 'landing-page',
      projectId: '3',
      status: 'failed',
      createdAt: '2024-01-14T15:20:00Z',
      duration: '45s',
      branch: 'main',
      commit: 'refactor: optimize images'
    },
    {
      id: '4',
      projectName: 'mi-app-web',
      projectId: '1',
      status: 'success',
      createdAt: '2024-01-14T08:15:00Z',
      duration: '1m 30s',
      url: 'https://mi-app-web-def456.vercel.app',
      branch: 'main',
      commit: 'chore: update dependencies'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-bg text-success border-success/20';
      case 'building':
        return 'bg-warning-bg text-warning border-warning/20';
      case 'failed':
        return 'bg-error-bg text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Exitoso';
      case 'building':
        return 'En progreso';
      case 'failed':
        return 'Falló';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDeployments = deployments.filter(deployment => {
    const matchesSearch = deployment.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deployment.commit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deployment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Despliegues</h1>
        <p className="text-muted-foreground">
          Historial completo de todos los despliegues realizados
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por proyecto o commit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="success">Exitosos</SelectItem>
            <SelectItem value="building">En progreso</SelectItem>
            <SelectItem value="failed">Fallidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredDeployments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No se encontraron despliegues
          </h3>
          <p className="text-muted-foreground">
            Prueba ajustando los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeployments.map((deployment) => (
            <div key={deployment.id} className="deploy-card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {deployment.projectName}
                    </h3>
                    <Badge className={getStatusColor(deployment.status)}>
                      <div className={`status-dot mr-1 status-${deployment.status === 'success' ? 'success' : deployment.status === 'building' ? 'warning' : 'error'}`} />
                      {getStatusText(deployment.status)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2 truncate">
                    {deployment.commit}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(deployment.createdAt)}
                    </div>
                    <span>•</span>
                    <span>{deployment.duration}</span>
                    <span>•</span>
                    <span className="font-mono">{deployment.branch}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {deployment.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(deployment.url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Redesplegar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Deployments;