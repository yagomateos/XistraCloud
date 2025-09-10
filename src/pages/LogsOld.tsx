import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Search, Download, AlertCircle, Info, CheckCircle, XCircle, Bug } from 'lucide-react';
import { getLogs, LogEntry } from '@/lib/api';

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Fetch logs from API
  const { data: logs = [], isLoading, error, refetch } = useQuery({
    queryKey: ['logs', levelFilter !== 'all' ? levelFilter : undefined],
    queryFn: () => getLogs({ 
      level: levelFilter !== 'all' ? levelFilter : undefined,
      limit: 200 
    }),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time logs
  });

  // Get unique project names for filter
  const projects = Array.from(new Set(logs.map(log => log.projectName).filter(Boolean)));

  // Filter logs based on search and project filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProject = projectFilter === 'all' || log.projectName === projectFilter;
    
    return matchesSearch && matchesProject;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'debug':
        return <Bug className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
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

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'success':
        return 'default' as const; // Green
      case 'info':
        return 'secondary' as const; // Blue  
      case 'warning':
        return 'outline' as const; // Yellow
      case 'error':
        return 'destructive' as const; // Red
      case 'debug':
        return 'outline' as const; // Gray
      default:
        return 'secondary' as const;
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
      case 'debug':
        return 'Debug';
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

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Project', 'Source', 'Message'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.projectName || 'Unknown',
        log.source,
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('
');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `xistracloud-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar logs</h3>
          <p className="text-gray-600 mb-4">No se pudieron cargar los logs del sistema</p>
          <Button onClick={() => refetch()}>Intentar de nuevo</Button>
        </div>
      </div>
    );
  }

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