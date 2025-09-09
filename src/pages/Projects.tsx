import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProjectCard from '@/components/ProjectCard';
import CreateProjectModal from '@/components/CreateProjectModal';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'mi-app-web',
      repository: 'github.com/usuario/mi-app-web',
      framework: 'React',
      status: 'deployed',
      lastDeploy: 'hace 2 horas',
      url: 'https://mi-app-web.vercel.app'
    },
    {
      id: '2', 
      name: 'api-backend',
      repository: 'github.com/usuario/api-backend',
      framework: 'Node.js',
      status: 'building',
      lastDeploy: 'hace 5 min'
    },
    {
      id: '3',
      name: 'landing-page',
      repository: 'github.com/usuario/landing-page',
      framework: 'Next.js',
      status: 'failed',
      lastDeploy: 'hace 1 día'
    }
  ]);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.framework.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateProject = (projectData: { name: string; repository: string; framework: string }) => {
    const newProject: Project = {
      id: Date.now().toString(),
      ...projectData,
      status: 'building',
      lastDeploy: 'hace pocos segundos'
    };
    
    setProjects(prev => [newProject, ...prev]);
    
    // Simulate deployment process
    setTimeout(() => {
      setProjects(prev => prev.map(p => 
        p.id === newProject.id 
          ? { ...p, status: 'deployed', url: `https://${projectData.name}.vercel.app` }
          : p
      ));
    }, 3000);
  };

  const handleViewDetails = (projectId: string) => {
    navigate(`/dashboard/project/${projectId}`);
  };

  const handleDeploy = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId 
        ? { ...p, status: 'building', lastDeploy: 'hace pocos segundos' }
        : p
    ));

    setTimeout(() => {
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, status: 'deployed' }
          : p
      ));
    }, 2000);
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