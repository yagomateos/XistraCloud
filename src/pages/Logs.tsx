import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Download, AlertCircle, Info, CheckCircle, XCircle, Bug, RefreshCw, ChevronLeft, ChevronRight, Activity, Server, Cpu, HardDrive, Wifi } from 'lucide-react';
import { getLogs } from '@/lib/api';

const Logs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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
  const projects = Array.from(new Set(logs.map(log => log.project_name).filter(Boolean)));

  // Filter logs based on search and project filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.project_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProject = projectFilter === 'all' || log.project_name === projectFilter;
    
    return matchesSearch && matchesProject;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

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

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'success':
        return 'default' as const;
      case 'info':
        return 'secondary' as const;
      case 'warning':
        return 'outline' as const;
      case 'error':
        return 'destructive' as const;
      case 'debug':
        return 'outline' as const;
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
    if (!timestamp) return 'Fecha no disponible';
    
    try {
      const date = new Date(timestamp);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error);
      return 'Error en fecha';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Project', 'Source', 'Message'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.level,
        log.project_name || 'Unknown',
        log.source,
        `"${log.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\\n');

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

  return (
    <div className="pt-6 px-4 pb-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Monitoreo y Logs</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Registro en tiempo real de actividades y métricas del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()} size="sm" className="h-9">
            <RefreshCw className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden lg:inline">Actualizar</span>
          </Button>
          <Button variant="outline" onClick={exportLogs} size="sm" className="h-9">
            <Download className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
            <span className="hidden lg:inline">Exportar</span>
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operativo</div>
            <p className="text-xs text-muted-foreground">
              Última verificación: hace 2 min
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23%</div>
            <p className="text-xs text-muted-foreground">
              Uso promedio en 1h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memoria</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2 GB</div>
            <p className="text-xs text-muted-foreground">
              De 4 GB disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Red</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 MB/s</div>
            <p className="text-xs text-muted-foreground">
              Tráfico saliente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar en logs..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              resetPagination();
            }}
            className="pl-10 h-11"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={projectFilter} onValueChange={(value) => {
            setProjectFilter(value);
            resetPagination();
          }}>
            <SelectTrigger className="flex-1 h-11">
              <SelectValue placeholder="Todos los proyectos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los proyectos</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project!}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={(value) => {
            setLevelFilter(value);
            resetPagination();
          }}>
            <SelectTrigger className="flex-1 h-11">
              <SelectValue placeholder="Todos los niveles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Éxito</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Advertencia</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs List */}
      <div className="bg-card border border-border rounded-lg">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <Info className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base lg:text-lg font-semibold mb-2">No hay logs disponibles</h3>
            <p className="text-sm lg:text-base text-muted-foreground px-4">
              {logs.length === 0 
                ? "No se han generado logs aún" 
                : "No se encontraron logs que coincidan con los filtros aplicados"
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedLogs.map((log) => (
              <div key={log.id} className="p-3 lg:p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getLevelIcon(log.level)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                        <Badge variant={getLevelBadgeVariant(log.level)} className="text-xs">
                          {getLevelText(log.level)}
                        </Badge>
                        
                        {log.project_name && (
                          <Badge variant="outline" className="text-xs">
                            📦 {log.project_name}
                          </Badge>
                        )}
                        
                        {log.domain_name && (
                          <Badge variant="outline" className="text-xs">
                            🌐 {log.domain_name}
                          </Badge>
                        )}
                        
                        <Badge variant="secondary" className="text-xs">
                          {log.source}
                        </Badge>
                      </div>
                      
                      <span className="text-xs text-muted-foreground lg:ml-auto">
                        {formatTimestamp(log.timestamp || log.created_at || '')}
                      </span>
                    </div>
                    
                    <p className="text-xs lg:text-sm text-foreground break-words leading-relaxed">
                      {log.message}
                    </p>
                    
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1 pl-2 border-l-2 border-muted/20 italic">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {filteredLogs.length > ITEMS_PER_PAGE && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs lg:text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} de {filteredLogs.length} logs filtrados
            {logs.length !== filteredLogs.length && ` (${logs.length} total)`}
            {logs.length >= 200 && " (últimos 200)"}
          </p>
        </div>
      )}

      {/* Footer info when no pagination needed */}
      {filteredLogs.length > 0 && filteredLogs.length <= ITEMS_PER_PAGE && (
        <div className="mt-4 text-center">
          <p className="text-xs lg:text-sm text-muted-foreground">
            Mostrando {filteredLogs.length} de {logs.length} logs
            {logs.length >= 200 && " (últimos 200)"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Logs;
