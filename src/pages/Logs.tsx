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
import { Search, Download, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  projectName: string;
  projectId: string;
  deploymentId: string;
}

const Logs = () => {
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15T10:32:45Z',
      level: 'success',
      message: 'Deployment completed successfully',
      projectName: 'mi-app-web',
      projectId: '1',
      deploymentId: 'dep_123'
    },
    {
      id: '2',
      timestamp: '2024-01-15T10:32:30Z',
      level: 'info',
      message: 'Building application...',
      projectName: 'mi-app-web',
      projectId: '1',
      deploymentId: 'dep_123'
    },
    {
      id: '3',
      timestamp: '2024-01-15T10:32:15Z',
      level: 'info',
      message: 'Installing dependencies with npm',
      projectName: 'mi-app-web',
      projectId: '1',
      deploymentId: 'dep_123'
    },
    {
      id: '4',
      timestamp: '2024-01-15T10:26:20Z',
      level: 'error',
      message: 'Build failed: Module not found: Error: Can\'t resolve \'./missing-file\'',
      projectName: 'api-backend',
      projectId: '2',
      deploymentId: 'dep_124'
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:26:10Z',
      level: 'warning',
      message: 'Deprecated package detected: Please update your dependencies',
      projectName: 'api-backend',
      projectId: '2',
      deploymentId: 'dep_124'
    },
    {
      id: '6',
      timestamp: '2024-01-14T15:22:30Z',
      level: 'error',
      message: 'Failed to optimize images: Invalid image format',
      projectName: 'landing-page',
      projectId: '3',
      deploymentId: 'dep_125'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const projects = Array.from(new Set(logs.map(log => log.projectName)));

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'info':
        return <Info className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-error" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-success-bg text-success border-success/20';
      case 'info':
        return 'bg-primary-50 text-primary border-primary/20';
      case 'warning':
        return 'bg-warning-bg text-warning border-warning/20';
      case 'error':
        return 'bg-error-bg text-error border-error/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'success':
        return 'Éxito';
      case 'info':
        return 'Info';
      case 'warning':
        return 'Advertencia';
      case 'error':
        return 'Error';
      default:
        return level;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = projectFilter === 'all' || log.projectName === projectFilter;
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    return matchesSearch && matchesProject && matchesLevel;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Logs</h1>
          <p className="text-muted-foreground">
            Registro detallado de actividades y eventos del sistema
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar logs
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar en logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={projectFilter} onValueChange={setProjectFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filtrar por proyecto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los proyectos</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project} value={project}>
                {project}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full lg:w-48">
            <SelectValue placeholder="Filtrar por nivel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los niveles</SelectItem>
            <SelectItem value="success">Éxito</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Advertencia</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No se encontraron logs
          </h3>
          <p className="text-muted-foreground">
            Prueba ajustando los filtros de búsqueda
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="divide-y divide-border">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-card-hover transition-colors">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getLevelIcon(log.level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={getLevelColor(log.level)}>
                        {getLevelText(log.level)}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">
                        {log.projectName}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-foreground font-mono bg-muted/30 rounded p-2 break-all">
                      {log.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;