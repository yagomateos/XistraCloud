import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProjects, Project } from '@/lib/api';

const Projects = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Use React Query with our API function that has mock data support
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>Cargando proyectos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500">Error al cargar proyectos: {error.message}</div>
      </div>
    );
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.framework.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (projectData: { name: string; repository: string; framework: string }) => {
    // In a real app, this would make an API call to create the project
    // For now, we'll just refetch the data
    refetch();
  };

  const handleViewDetails = (projectId: string) => {
    navigate(`/dashboard/project/${projectId}`);
  };

  const handleDeploy = (projectId: string) => {
    // This should be implemented to call the backend
    console.log('Redeploying project:', projectId);
  };

  return (
    <div className="pt-6 px-4 pb-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Proyectos</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gestiona y despliega tus proyectos desde repositorios de Git
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full lg:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative w-full lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
          </h3>
          <p className="text-sm lg:text-base text-muted-foreground mb-6 px-4">
            {searchTerm 
              ? 'Prueba con otros términos de búsqueda'
              : 'Crea tu primer proyecto conectando un repositorio de Git'
            }
          </p>
          {!searchTerm && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full lg:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear primer proyecto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={handleViewDetails}
              onDeploy={handleDeploy}
            />
          ))}
        </div>
      )}

      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};

export default Projects;