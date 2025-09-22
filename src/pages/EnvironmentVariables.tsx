import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret?: boolean;
}

interface Project {
  id: string;
  name: string;
  template?: string;
  framework?: string;
  status: string;
  environment?: EnvironmentVariable[];
}

export default function EnvironmentVariables() {
  const { apiCall } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState({ key: '', value: '' });
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await apiCall(`http://localhost:3001/deployments`);
      if (!response.ok) throw new Error('Error al cargar proyectos');
      
      const data = await response.json();
      // Handle both formats: { deployments: [...] } and direct array
      const deployments = Array.isArray(data) ? data : (data.deployments || []);
      setProjects(deployments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const toggleSecretVisibility = (projectId: string, variableKey: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [`${projectId}-${variableKey}`]: !prev[`${projectId}-${variableKey}`]
    }));
  };

  const addVariable = async (projectId: string) => {
    if (!newVariable.key.trim() || !newVariable.value.trim()) return;

    try {
      const response = await apiCall(`http://localhost:3001/projects/${projectId}/environment`, {
        method: 'POST',
        body: JSON.stringify(newVariable)
      });

      if (!response.ok) throw new Error('Error al añadir variable');

      await loadProjects();
      setNewVariable({ key: '', value: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const updateVariable = async (projectId: string, oldKey: string, newKey: string, newValue: string) => {
    try {
      const response = await apiCall(`http://localhost:3001/projects/${projectId}/environment/${oldKey}`, {
        method: 'PUT',
        body: JSON.stringify({ key: newKey, value: newValue })
      });

      if (!response.ok) throw new Error('Error al actualizar variable');

      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const deleteVariable = async (projectId: string, variableKey: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta variable de entorno?')) return;

    try {
      const response = await apiCall(`http://localhost:3001/projects/${projectId}/environment/${variableKey}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar variable');

      await loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const isSecretVariable = (key: string) => {
    const secretKeys = ['password', 'secret', 'key', 'token', 'auth'];
    return secretKeys.some(secret => key.toLowerCase().includes(secret));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="h-6 w-6 text-error-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error al cargar proyectos</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadProjects}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="pt-8 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Variables de Entorno</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Gestiona las variables de entorno para cada uno de tus proyectos desplegados
        </p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No hay proyectos desplegados</h3>
            <p className="text-muted-foreground mb-4">
              Despliega tu primer proyecto para poder configurar sus variables de entorno.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/apps'}>
              Ir a Apps
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">{project.name}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      {project.template || project.framework || 'Sin template'} • {project.environment?.length || 0} variables configuradas
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={project.status === 'running' ? 'default' : 'secondary'} className="text-xs">
                      {project.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProject(editingProject === project.id ? null : project.id)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {editingProject === project.id ? 'Cerrar' : 'Editar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {project.environment && project.environment.length > 0 ? (
                  <div className="space-y-3">
                    {project.environment.map((envVar, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Label className="text-xs sm:text-sm font-medium text-foreground">
                              {envVar.key}
                            </Label>
                            {isSecretVariable(envVar.key) && (
                              <Badge variant="outline" className="text-xs">
                                Secreto
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <code className="text-xs bg-background px-2 py-1 rounded border flex-1 break-all">
                              {isSecretVariable(envVar.key) && !showSecrets[`${project.id}-${envVar.key}`] 
                                ? '••••••••' 
                                : envVar.value
                              }
                            </code>
                            {isSecretVariable(envVar.key) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSecretVisibility(project.id, envVar.key)}
                                className="p-1"
                              >
                                {showSecrets[`${project.id}-${envVar.key}`] ? (
                                  <EyeOff className="h-3 w-3" />
                                ) : (
                                  <Eye className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {editingProject === project.id && (
                          <div className="flex flex-col sm:flex-row gap-1 mt-2 sm:mt-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newKey = prompt('Nueva clave:', envVar.key);
                                const newValue = prompt('Nuevo valor:', envVar.value);
                                if (newKey && newValue) {
                                  updateVariable(project.id, envVar.key, newKey, newValue);
                                }
                              }}
                              className="w-full sm:w-auto"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteVariable(project.id, envVar.key)}
                              className="text-red-600 hover:bg-red-50 w-full sm:w-auto"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No hay variables de entorno configuradas para este proyecto.</p>
                  </div>
                )}

                {editingProject === project.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          placeholder="Nombre de la variable"
                          value={newVariable.key}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, key: e.target.value }))}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Valor"
                          value={newVariable.value}
                          onChange={(e) => setNewVariable(prev => ({ ...prev, value: e.target.value }))}
                          type={isSecretVariable(newVariable.key) ? 'password' : 'text'}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => addVariable(project.id)}
                          disabled={!newVariable.key.trim() || !newVariable.value.trim()}
                          className="w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Añadir
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
