import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  ExternalLink, 
  Globe, 
  Shield, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Trash2,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { getDomains, createDomain, deleteDomain as apiDeleteDomain, verifyDomain, getProjects, type Domain } from '@/lib/api';

const Domains = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState({
    domain: '',
    projectId: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch domains from API
  const { data: domains = [], isLoading, error, refetch } = useQuery({
    queryKey: ['domains'],
    queryFn: getDomains,
  });

  // Fetch real projects from API
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  // Create domain mutation
  const createDomainMutation = useMutation({
    mutationFn: createDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      setIsAddModalOpen(false);
      setNewDomain({ domain: '', projectId: '' });
      toast({
        title: "Dominio agregado",
        description: "El dominio se ha agregado correctamente. Sigue las instrucciones DNS para verificarlo.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: apiDeleteDomain,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast({
        title: "Dominio eliminado",
        description: "El dominio se ha eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: verifyDomain,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast({
        title: result.success ? "Dominio verificado" : "Verificación fallida",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddDomain = () => {
    if (!newDomain.domain || !newDomain.projectId) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    // Validar formato del dominio
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(newDomain.domain)) {
      toast({
        title: "Error de formato",
        description: "Por favor introduce un dominio válido (ej: ejemplo.com)",
        variant: "destructive",
      });
      return;
    }

    // Verificar que el dominio no exista ya
    const existingDomain = domains?.find(d => d.domain.toLowerCase() === newDomain.domain.toLowerCase());
    if (existingDomain) {
      toast({
        title: "Dominio duplicado",
        description: "Este dominio ya está registrado en tu cuenta",
        variant: "destructive",
      });
      return;
    }

    createDomainMutation.mutate({
      domain: newDomain.domain.toLowerCase(),
      projectId: newDomain.projectId,
    });
  };

  const handleDeleteDomain = (domainId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este dominio?')) {
      deleteDomainMutation.mutate(domainId);
    }
  };

  const handleVerifyDomain = (domainId: string) => {
    verifyDomainMutation.mutate(domainId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado al portapapeles",
    });
  };

  const getStatusIcon = (status: string, ssl: boolean) => {
    if (status === 'verified' && ssl) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'pending') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string, ssl: boolean) => {
    if (status === 'verified' && ssl) {
      return <Badge className="bg-green-100 text-green-800">Verificado + SSL</Badge>;
    } else if (status === 'verified') {
      return <Badge className="bg-yellow-100 text-yellow-800">Verificado</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar dominios</h3>
          <p className="text-gray-600 mb-4">No se pudieron cargar los dominios</p>
          <Button onClick={() => refetch()}>Intentar de nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dominios</h1>
          <p className="text-muted-foreground">
            Gestiona los dominios personalizados de tus proyectos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Agregar dominio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar dominio personalizado</DialogTitle>
                <DialogDescription>
                  Conecta un dominio personalizado a uno de tus proyectos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <p><strong>💡 Tip:</strong> Para pruebas, usa dominios como "mi-test.com" o "demo-app.com".</p>
                  <p>Los dominios reales requieren configuración DNS específica.</p>
                </div>
                <div>
                  <Label htmlFor="domain">Dominio</Label>
                  <Input
                    id="domain"
                    placeholder="mi-proyecto-test.com"
                    value={newDomain.domain}
                    onChange={(e) => setNewDomain(prev => ({ ...prev, domain: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="project">Proyecto</Label>
                  <Select
                    value={newDomain.projectId}
                    onValueChange={(value) => setNewDomain(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un proyecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddDomain}
                    disabled={createDomainMutation.isPending}
                  >
                    {createDomainMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Agregar dominio
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator className="mb-8" />

      {domains.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No tienes dominios configurados
            </h3>
            <p className="text-muted-foreground mb-6">
              Agrega tu primer dominio personalizado para mejorar tu presencia online
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer dominio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(domain.status, domain.ssl)}
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-foreground">{domain.domain}</h3>
                        {getStatusBadge(domain.status, domain.ssl)}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          Proyecto: {domain.projectName}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">
                          Agregado: {new Date(domain.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {domain.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={verifyDomainMutation.isPending}
                      >
                        {verifyDomainMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        )}
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Verificar
                      </Button>
                    )}
                    
                    {domain.status === 'verified' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Visitar
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDomain(domain.id)}
                      disabled={deleteDomainMutation.isPending}
                    >
                      {deleteDomainMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {domain.status === 'pending' && domain.dnsRecords && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800 font-medium">
                        Configuración DNS requerida
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-yellow-800 font-medium mb-1">Registro CNAME:</p>
                        <div className="bg-white p-2 rounded border flex items-center justify-between">
                          <span className="font-mono text-xs">{domain.dnsRecords.cname?.name} → {domain.dnsRecords.cname?.value}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${domain.dnsRecords.cname?.name} CNAME ${domain.dnsRecords.cname?.value}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-yellow-800 font-medium mb-1">Registro TXT (verificación):</p>
                        <div className="bg-white p-2 rounded border flex items-center justify-between">
                          <span className="font-mono text-xs">{domain.dnsRecords.txt?.name} → {domain.dnsRecords.txt?.value}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(`${domain.dnsRecords.txt?.name} TXT ${domain.dnsRecords.txt?.value}`)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-yellow-700 mt-3">
                      Puede tomar hasta 48 horas en propagarse. Haz clic en "Verificar" una vez configurados los registros DNS.
                    </p>
                  </div>
                )}

                {domain.status === 'verified' && domain.ssl && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>SSL/TLS habilitado automáticamente</span>
                  </div>
                )}

                {domain.status === 'failed' && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-800 font-medium">
                        Error en la verificación
                      </span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      No se pudo verificar el dominio. Revisa la configuración DNS y vuelve a intentar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Domains;
