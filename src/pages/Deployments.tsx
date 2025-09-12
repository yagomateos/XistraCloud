import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Search, RotateCcw, ExternalLink, Calendar, Trash2 } from 'lucide-react';
import { getProjects, deleteProject, redeployProject } from '@/lib/api';
import { toast } from 'sonner';

// Updated interface to match backend data
interface Deployment {
  id: string;
  name: string;
  status: string;
  created_at: string;
  url?: string;
  repository: string; // This is the gitUrl
  framework: string;
}

const Deployments = () => {
  const [buildingProjects, setBuildingProjects] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Use React Query with our API function that has mock data support
  const { data: deployments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['deployments'],
    queryFn: getProjects,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Delete deployment mutation
  const deleteDeploymentMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      toast.success('Proyecto eliminado exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting deployment:', error);
      toast.error('Error al eliminar el proyecto');
    },
  });

  // Redeploy mutation
  const redeployMutation = useMutation({
    mutationFn: redeployProject,
    onMutate: (projectId) => {
      setBuildingProjects(prev => [...prev, projectId]);
      toast.success('Creando nuevo despliegue...');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] }); // También actualizar proyectos
      setTimeout(() => {
        toast.success('Nuevo despliegue completado exitosamente');
      }, 3000);
    },
    onError: (error) => {
      console.error('Error redeploying:', error);
      toast.error('Error al crear nuevo despliegue');
    },
    onSettled: (data, error, projectId) => {
      setBuildingProjects(prev => prev.filter(id => id !== projectId));
    }
  });

  // Sort deployments by created_at
  const sortedDeployments = deployments.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const handleRedeploy = async (deployment: Deployment) => {
    redeployMutation.mutate(deployment.id);
  };

  const handleDelete = async (deploymentId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      deleteDeploymentMutation.mutate(deploymentId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'deployed':
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
    console.log('📊 Getting status text for:', status);
    switch (status.toLowerCase()) {
      case 'deployed':
      case 'success':
        console.log('📊 Returning: Exitoso');
        return 'Exitoso';
      case 'building':
        console.log('📊 Returning: En progreso');
        return 'En progreso';
      case 'failed':
        console.log('📊 Returning: Falló');
        return 'Falló';
      default:
        console.log('📊 Returning default:', status);
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
    const matchesSearch = deployment.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deployment.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-6 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Despliegues</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Historial completo de todos los despliegues realizados
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por proyecto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="deployed">Exitosos</SelectItem>
            <SelectItem value="building">En progreso</SelectItem>
            <SelectItem value="failed">Fallidos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground animate-spin" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-foreground mb-2">
            Cargando despliegues...
          </h3>
          <p className="text-sm lg:text-base text-muted-foreground px-4">
            Obteniendo la lista de proyectos y despliegues.
          </p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-error rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="h-6 w-6 lg:h-8 lg:w-8 text-error-foreground" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-foreground mb-2">
            Error al cargar despliegues
          </h3>
          <p className="text-sm lg:text-base text-muted-foreground px-4">
            {error?.message || 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'}
          </p>
        </div>
      ) : filteredDeployments.length === 0 && buildingProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 lg:w-24 lg:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base lg:text-lg font-medium text-foreground mb-2">
            No se encontraron despliegues
          </h3>
          <p className="text-sm lg:text-base text-muted-foreground px-4">
            Prueba ajustando los filtros de búsqueda o despliega un nuevo proyecto.
          </p>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {filteredDeployments.map((deployment) => {
            const isBuilding = buildingProjects.includes(deployment.id);
            return (
              <div key={deployment.id} className="deploy-card">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 mb-2">
                        <h3 className="font-semibold text-foreground text-base lg:text-lg">
                          {deployment.name}
                        </h3>
                        <Badge className={`${getStatusColor(isBuilding ? 'building' : deployment.status)} mt-1 lg:mt-0 w-fit`}>
                          <div className={`status-dot mr-1 status-${isBuilding ? 'warning' : deployment.status.toLowerCase() === 'deployed' ? 'success' : 'error'}`} />
                          {isBuilding ? 'En progreso' : getStatusText(deployment.status)}
                        </Badge>
                      </div>

                      <p className="text-xs lg:text-sm text-muted-foreground mb-2 truncate">
                        {deployment.repository}
                      </p>

                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(deployment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-2 lg:gap-2 lg:justify-end">
                    {deployment.url && !isBuilding && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(deployment.url, '_blank')}
                        className="w-full lg:w-auto h-9 text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Ver sitio
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRedeploy(deployment)} 
                      disabled={isBuilding}
                      className="w-full lg:w-auto h-9 text-xs"
                    >
                      <RotateCcw className={`h-3 w-3 mr-2 ${isBuilding ? 'animate-spin' : ''}`} />
                      {isBuilding ? 'Desplegando...' : 'Redesplegar'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(deployment.id)} 
                      disabled={isBuilding}
                      className="w-full lg:w-auto h-9 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Borrar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deployments;