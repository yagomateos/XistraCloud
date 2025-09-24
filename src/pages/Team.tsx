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
import { Users, Mail, UserPlus, Trash2, Clock, AlertCircle } from 'lucide-react';

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
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Gestión de Equipo</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Invita y gestiona los miembros de tu equipo con diferentes roles y permisos
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Miembros del Equipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Miembros del Equipo
            </CardTitle>
            <CardDescription>
              {members.length} miembro{members.length !== 1 ? 's' : ''} en total
            </CardDescription>
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

        {/* Invitaciones y Formulario */}
        <div className="space-y-6">
          {/* Formulario de Invitación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Invitar Miembro
              </CardTitle>
              <CardDescription>
                Añade nuevos miembros a tu equipo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    type="email"
                    id="email"
                    value={newInviteEmail}
                    onChange={(e) => setNewInviteEmail(e.target.value)}
                    required
                    placeholder="ejemplo@dominio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={newInviteRole} onValueChange={setNewInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Visor - Solo lectura</SelectItem>
                      <SelectItem value="developer">Desarrollador - Puede desplegar</SelectItem>
                      <SelectItem value="admin">Administrador - Acceso completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Invitación
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Invitaciones Pendientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Invitaciones Pendientes
              </CardTitle>
              <CardDescription>
                {invitations.length} invitación{invitations.length !== 1 ? 'es' : ''} pendiente{invitations.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!Array.isArray(invitations) || invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay invitaciones pendientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invitations.map(invitation => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-foreground">{invitation.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {invitation.role}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Invitado el {new Date(invitation.invitedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
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
        </div>
      </div>
    </div>
  );
}
