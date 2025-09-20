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
  UserPlus, 
  Users, 
  Crown, 
  Shield, 
  Eye, 
  Trash2, 
  Mail, 
  CheckCircle,
  AlertCircle,
  Clock,
  Settings,
  User,
  MoreHorizontal
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: string;
  lastActive?: string;
  avatar?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'pending' | 'accepted' | 'expired';
  invitedAt: string;
  invitedBy: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newInvitation, setNewInvitation] = useState({
    email: '',
    role: 'developer' as 'admin' | 'developer' | 'viewer',
    projectAccess: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [membersResponse, invitationsResponse, projectsResponse] = await Promise.all([
        fetch(`${getApiUrl()}/team/members`),
        fetch(`${getApiUrl()}/team/invitations`),
        fetch(`${getApiUrl()}/deployments`)
      ]);

      if (!membersResponse.ok) throw new Error('Error al cargar miembros');
      if (!invitationsResponse.ok) throw new Error('Error al cargar invitaciones');
      if (!projectsResponse.ok) throw new Error('Error al cargar proyectos');

      const membersData = await membersResponse.json();
      const invitationsData = await invitationsResponse.json();
      const projectsData = await projectsResponse.json();
      
      setMembers(membersData.members || []);
      setInvitations(invitationsData.invitations || []);
      setProjects(Array.isArray(projectsData) ? projectsData : (projectsData.deployments || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!newInvitation.email.trim()) return;

    try {
      const response = await fetch(`${getApiUrl()}/team/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvitation)
      });

      if (!response.ok) throw new Error('Error al enviar invitación');

      await loadData();
      setNewInvitation({ email: '', role: 'developer', projectAccess: [] });
      setIsInviteModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) return;

    try {
      const response = await fetch(`${getApiUrl()}/team/members/${memberId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar miembro');

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar esta invitación?')) return;

    try {
      const response = await fetch(`${getApiUrl()}/team/invitations/${invitationId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al cancelar invitación');

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'developer':
        return <User className="h-4 w-4 text-green-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Propietario';
      case 'admin':
        return 'Administrador';
      case 'developer':
        return 'Desarrollador';
      case 'viewer':
        return 'Visualizador';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'suspended':
        return 'Suspendido';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando equipo...</p>
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
        <h3 className="text-lg font-medium text-foreground mb-2">Error al cargar equipo</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadData}>Reintentar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipo</h1>
          <p className="text-muted-foreground">
            Gestiona miembros del equipo, permisos y colaboración en proyectos.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <Users className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invitar Miembro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invitar Miembro al Equipo</DialogTitle>
                <DialogDescription>
                  Envía una invitación por email para unirse al equipo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@ejemplo.com"
                    value={newInvitation.email}
                    onChange={(e) => setNewInvitation(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={newInvitation.role}
                    onValueChange={(value: 'admin' | 'developer' | 'viewer') => 
                      setNewInvitation(prev => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="developer">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-green-500" />
                          Desarrollador
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-500" />
                          Visualizador
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Acceso a Proyectos</Label>
                  <div className="space-y-2 mt-2">
                    {projects.map((project) => (
                      <label key={project.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newInvitation.projectAccess.includes(project.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewInvitation(prev => ({
                                ...prev,
                                projectAccess: [...prev.projectAccess, project.id]
                              }));
                            } else {
                              setNewInvitation(prev => ({
                                ...prev,
                                projectAccess: prev.projectAccess.filter(id => id !== project.id)
                              }));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{project.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={sendInvitation}
                  disabled={!newInvitation.email.trim()}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.filter(m => m.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {members.length} total en el equipo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invitaciones Pendientes</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.filter(i => i.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              Esperando respuesta
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Compartidos</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para colaboración
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Miembros del Equipo</h2>
        <div className="space-y-4">
          {members.map((member) => (
            <Card key={member.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{member.name}</CardTitle>
                      <CardDescription>{member.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(member.role)}>
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{getRoleText(member.role)}</span>
                    </Badge>
                    <Badge className={getStatusColor(member.status)}>
                      {getStatusIcon(member.status)}
                      <span className="ml-1">{getStatusText(member.status)}</span>
                    </Badge>
                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Se unió: {new Date(member.joinedAt).toLocaleDateString('es-ES')}</span>
                  {member.lastActive && (
                    <span>Última actividad: {new Date(member.lastActive).toLocaleDateString('es-ES')}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Invitaciones Pendientes</h2>
          <div className="space-y-4">
            {invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{invitation.email}</CardTitle>
                        <CardDescription>
                          Invitado por {invitation.invitedBy} • {new Date(invitation.invitedAt).toLocaleDateString('es-ES')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(invitation.role)}>
                        {getRoleIcon(invitation.role)}
                        <span className="ml-1">{getRoleText(invitation.role)}</span>
                      </Badge>
                      <Badge className={getStatusColor(invitation.status)}>
                        {getStatusIcon(invitation.status)}
                        <span className="ml-1">{getStatusText(invitation.status)}</span>
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => cancelInvitation(invitation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permisos por Rol</CardTitle>
          <CardDescription>
            Descripción de los permisos disponibles para cada rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">Propietario</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acceso completo a todo</li>
                <li>• Gestionar equipo y facturación</li>
                <li>• Eliminar proyectos</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Administrador</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Desplegar y gestionar apps</li>
                <li>• Invitar miembros</li>
                <li>• Configurar dominios</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-500" />
                <span className="font-medium">Desarrollador</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Desplegar aplicaciones</li>
                <li>• Ver logs y métricas</li>
                <li>• Gestionar variables de entorno</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
