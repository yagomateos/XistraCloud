import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { supabase } from '@/lib/supabase';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data as Project[]);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.framework.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (projectData: { name: string; repository: string; framework: string }) => {
    const newProject: Project = {
      id: Date.now().toString(), // Temporary ID for optimistic update
      ...projectData,
      status: 'building',
      lastDeploy: 'hace pocos segundos'
    };
    
    setProjects(prev => [newProject, ...prev]);
  };

  const handleViewDetails = (projectId: string) => {
    navigate(`/dashboard/project/${projectId}`);
  };

  const handleDeploy = (projectId: string) => {
    // This should be implemented to call the backend
    console.log('Redeploying project:', projectId);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Proyectos</h1>
          <p className="text-muted-foreground">
            Gestiona y despliega tus proyectos desde repositorios de Git
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchTerm ? 'No se encontraron proyectos' : 'No tienes proyectos aún'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchTerm 
              ? 'Prueba con otros términos de búsqueda'
              : 'Crea tu primer proyecto conectando un repositorio de Git'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer proyecto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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