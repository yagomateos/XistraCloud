import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/lib/api';
import { useApi } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Mail, UserPlus, Trash2, Clock, AlertCircle, RefreshCw, Crown, Shield, Code } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string;
}

export default function Team() {
  const navigate = useNavigate();
  const { apiCall } = useApi();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [newInviteEmail, setNewInviteEmail] = useState('');
  const [newInviteRole, setNewInviteRole] = useState('viewer');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTeamData() {
      try {
        const [membersResponse, invitationsResponse] = await Promise.all([
          apiCall(`${API_URL}/team/members`),
          apiCall(`${API_URL}/team/invitations`)
        ]);

        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(Array.isArray(membersData) ? membersData : []);
        } else {
          setMembers([]);
        }

        if (invitationsResponse.ok) {
          const invitationsData = await invitationsResponse.json();
          setInvitations(Array.isArray(invitationsData) ? invitationsData : []);
        } else {
          setInvitations([]);
        }
      } catch (err) {
        console.error('Error fetching team data:', err);
        setError('No se pudieron cargar los datos del equipo');
        setMembers([]);
        setInvitations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTeamData();
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiCall(`${API_URL}/team/invitations`, {
        method: 'POST',
        body: JSON.stringify({ 
          email: newInviteEmail, 
          role: newInviteRole 
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Añadir la nueva invitación a la lista
        setInvitations(prev => [...prev, data.invitation]);
        setNewInviteEmail('');
        setNewInviteRole('viewer');
      } else {
        setError(data.error || 'No se pudo enviar la invitación');
      }
    } catch (err) {
      console.error('Error inviting team member:', err);
      setError('Hubo un problema al invitar al miembro');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await apiCall(`${API_URL}/team/members/${memberId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Eliminar miembro de la lista
        setMembers(prev => prev.filter(m => m.id !== memberId));
      } else {
        const data = await response.json();
        setError(data.error || 'No se pudo eliminar el miembro');
      }
    } catch (err) {
      console.error('Error removing team member:', err);
      setError('Hubo un problema al eliminar el miembro');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await apiCall(`${API_URL}/team/invitations/${invitationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        // Eliminar invitación de la lista
        setInvitations(prev => prev.filter(i => i.id !== invitationId));
      } else {
        const data = await response.json();
        setError(data.error || 'No se pudo cancelar la invitación');
      }
    } catch (err) {
      console.error('Error canceling invitation:', err);
      setError('Hubo un problema al cancelar la invitación');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando datos del equipo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-8 px-4 pb-4 lg:p-6">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Equipo</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gestiona miembros del equipo, permisos y colaboración en proyectos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Miembro
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Métricas del Equipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
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
            <div className="text-2xl font-bold">{invitations.length}</div>
            <p className="text-xs text-muted-foreground">
              Esperando respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos Compartidos</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para colaboración
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Miembros del Equipo */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          {!Array.isArray(members) || members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No hay miembros en el equipo</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permisos por Rol */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos por Rol</CardTitle>
          <CardDescription>
            Descripción de los permisos disponibles para cada rol
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Propietario */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                <h3 className="font-semibold">Propietario</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Acceso completo a todo</li>
                <li>• Gestionar equipo y facturación</li>
                <li>• Eliminar proyectos</li>
              </ul>
            </div>

            {/* Administrador */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Administrador</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Desplegar y gestionar apps</li>
                <li>• Invitar miembros</li>
                <li>• Configurar dominios</li>
              </ul>
            </div>

            {/* Desarrollador */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Desarrollador</h3>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
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
