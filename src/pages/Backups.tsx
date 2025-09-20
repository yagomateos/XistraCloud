import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Clock, 
  HardDrive, 
  Database, 
  Server,
  Calendar,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Backup {
  id: string;
  name: string;
  type: 'full' | 'database' | 'files';
  projectId: string;
  projectName: string;
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled';
  size: string;
  createdAt: string;
  scheduledAt?: string;
  retentionDays: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  type: string;
}

export default function Backups() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBackup, setNewBackup] = useState({
    name: '',
    projectId: '',
    type: 'full' as 'full' | 'database' | 'files',
    schedule: 'manual' as 'manual' | 'daily' | 'weekly' | 'monthly'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupsResponse, projectsResponse] = await Promise.all([
        fetch(`${getApiUrl()}/backups`),
        fetch(`${getApiUrl()}/deployments`)
      ]);

      if (!backupsResponse.ok) throw new Error('Error al cargar backups');
      if (!projectsResponse.ok) throw new Error('Error al cargar proyectos');

      const backupsData = await backupsResponse.json();
      const projectsData = await projectsResponse.json();
      
      setBackups(backupsData.backups || []);
      setProjects(Array.isArray(projectsData) ? projectsData : (projectsData.deployments || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!newBackup.name.trim() || !newBackup.projectId) return;

    try {
      const response = await fetch(`${getApiUrl()}/backups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBackup)
      });

      if (!response.ok) throw new Error('Error al crear backup');

      await loadData();
      setNewBackup({ name: '', projectId: '', type: 'full', schedule: 'manual' });
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const deleteBackup = async (backupId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este backup?')) return;

    try {
      const response = await fetch(`${getApiUrl()}/backups/${backupId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar backup');

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const restoreBackup = async (backupId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres restaurar este backup? Esto sobrescribirá los datos actuales.')) return;

    try {
      const response = await fetch(`${getApiUrl()}/backups/${backupId}/restore`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Error al restaurar backup');

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'in_progress':
        return 'En progreso';
      case 'failed':
        return 'Error';
      case 'scheduled':
        return 'Programado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full':
        return <Server className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'files':
        return <HardDrive className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full':
        return 'Completo';
      case 'database':
        return 'Base de datos';
      case 'files':
        return 'Archivos';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando backups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-error rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-error-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Error al cargar backups</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadData}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Backups</h1>
          <p className="text-muted-foreground">
            Gestiona backups automáticos y manuales de tus aplicaciones y bases de datos.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Crear Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Backup</DialogTitle>
                <DialogDescription>
                  Crea un backup de tu aplicación o base de datos.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="backup-name">Nombre del Backup</Label>
                  <Input
                    id="backup-name"
                    placeholder="backup-mi-app-2025-01-20"
                    value={newBackup.name}
                    onChange={(e) => setNewBackup(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="project">Proyecto</Label>
                  <Select
                    value={newBackup.projectId}
                    onValueChange={(value) => setNewBackup(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo de Backup</Label>
                  <Select
                    value={newBackup.type}
                    onValueChange={(value: 'full' | 'database' | 'files') => 
                      setNewBackup(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Completo (App + Base de datos)</SelectItem>
                      <SelectItem value="database">Solo Base de datos</SelectItem>
                      <SelectItem value="files">Solo Archivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="schedule">Programación</Label>
                  <Select
                    value={newBackup.schedule}
                    onValueChange={(value: 'manual' | 'daily' | 'weekly' | 'monthly') => 
                      setNewBackup(prev => ({ ...prev, schedule: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual (Una sola vez)</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={createBackup}
                  disabled={!newBackup.name.trim() || !newBackup.projectId}
                >
                  Crear Backup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Uso de Almacenamiento</CardTitle>
          <CardDescription>
            Espacio utilizado por tus backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Espacio utilizado:</span>
              <span className="font-medium">2.3 GB de 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>23% utilizado</span>
              <span>7.7 GB disponibles</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {backups.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <HardDrive className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No hay backups creados</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer backup para proteger tus datos y aplicaciones.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-blue-800 mb-2">Tipos de backup disponibles:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Completo:</strong> Aplicación + Base de datos + Archivos</li>
                <li><strong>Base de datos:</strong> Solo datos de la base de datos</li>
                <li><strong>Archivos:</strong> Solo archivos de la aplicación</li>
              </ul>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear primer backup
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {backups.map((backup) => (
            <Card key={backup.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(backup.type)}
                    <div>
                      <CardTitle className="text-lg">{backup.name}</CardTitle>
                      <CardDescription>
                        {backup.projectName} • {getTypeText(backup.type)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(backup.status)}>
                      {getStatusIcon(backup.status)}
                      <span className="ml-1">{getStatusText(backup.status)}</span>
                    </Badge>
                    {backup.scheduledAt && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Calendar className="h-3 w-3 mr-1" />
                        Programado
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tamaño:</span>
                    <span className="font-medium">{backup.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Creado:</span>
                    <span className="font-medium">
                      {new Date(backup.createdAt).toLocaleString('es-ES')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Retención:</span>
                    <span className="font-medium">{backup.retentionDays} días</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  {backup.status === 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restoreBackup(backup.id)}
                      >
                        <Upload className="h-3 w-3 mr-2" />
                        Restaurar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Download backup logic
                          console.log('Download backup:', backup.id);
                        }}
                      >
                        <Download className="h-3 w-3 mr-2" />
                        Descargar
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteBackup(backup.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
