import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ExternalLink, GitBranch, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    repository: string;
    framework: string;
    status: 'deployed' | 'building' | 'failed' | 'stopped';
    lastDeploy: string;
    url?: string;
  };
  onViewDetails: (projectId: string) => void;
  onDeploy: (projectId: string) => void;
  onDelete?: (projectId: string) => void;
}

const ProjectCard = ({ project, onViewDetails, onDeploy, onDelete }: ProjectCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-success-bg text-success border-success/20';
      case 'building':
        return 'bg-warning-bg text-warning border-warning/20';
      case 'failed':
        return 'bg-error-bg text-error border-error/20';
      case 'stopped':
        return 'bg-muted text-muted-foreground border-muted/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'Desplegado';
      case 'building':
        return 'Construyendo';
      case 'failed':
        return 'Falló';
      case 'stopped':
        return 'Detenido';
      default:
        return status;
    }
  };

  return (
    <div className="deploy-card group">
      <div className="flex flex-col space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2 mb-2">
              <h3 
                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors text-base lg:text-lg"
                onClick={() => onViewDetails(project.id)}
              >
                {project.name}
              </h3>
              <Badge variant="secondary" className="text-xs mt-1 lg:mt-0 w-fit">
                {project.framework}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2 mb-3">
              <GitBranch className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs lg:text-sm text-muted-foreground truncate">
                {project.repository}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewDetails(project.id)}>
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeploy(project.id)}>
                Redesplegar
              </DropdownMenuItem>
              {project.url && (
                <DropdownMenuItem asChild>
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir sitio
                  </a>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(project.id)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar proyecto
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
          <Badge className={getStatusColor(project.status)}>
            <div className={`status-dot mr-1 status-${
              project.status === 'deployed' ? 'success' : 
              project.status === 'building' ? 'warning' : 
              project.status === 'stopped' ? 'muted' : 
              'error'
            }`} />
            {getStatusText(project.status)}
          </Badge>
          
          <div className="flex items-center justify-between lg:justify-end lg:space-x-4">
            <span className="text-xs text-muted-foreground">
              {project.lastDeploy}
            </span>

            {project.status === 'deployed' && project.url && (
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden text-xs px-2 py-1 h-7"
                onClick={() => window.open(project.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver sitio
              </Button>
            )}
          </div>
        </div>

        {/* Desktop action button */}
        {project.status === 'deployed' && project.url && (
          <div className="hidden lg:block mt-3 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => window.open(project.url, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              Ver sitio en vivo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;