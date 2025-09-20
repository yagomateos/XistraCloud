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
import { useUserData } from '@/hooks/useUserData';
import { checkDomainLimit } from '@/lib/plans';
import { showPlanLimitToast } from '@/lib/toast-helpers';

const Domains = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState({
    domain: '',
    projectId: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userData, userPlan } = useUserData();

  // Fetch domains from API
  const { data: domainsData = [], isLoading, error, refetch } = useQuery({
    queryKey: ['domains'],
    queryFn: getDomains,
  });

  // Ensure domains is always an array
  const domains = Array.isArray(domainsData) ? domainsData : [];

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
        title: "Verificación iniciada",
        description: "Se está verificando el dominio. Esto puede tomar unos minutos.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo verificar el dominio",
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

    // Check domain limit before creating
    const canCreate = checkDomainLimit(userPlan, domains?.length || 0);
    if (!canCreate) {
      showPlanLimitToast.domainLimit(userPlan, domains?.length || 0);
      return;
    }

    // Limpiar y validar formato del dominio
    let cleanDomain = newDomain.domain.trim();
    
    // Eliminar protocolo si existe (http:// o https://)
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
    
    // Eliminar trailing slash si existe
    cleanDomain = cleanDomain.replace(/\/$/, '');
    
    // Actualizar el valor limpio
    setNewDomain(prev => ({ ...prev, domain: cleanDomain }));
    
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(cleanDomain)) {
      toast({
        title: "Error de formato",
        description: "Por favor introduce un dominio válido (ej: ejemplo.com)",
        variant: "destructive",
      });
      return;
    }

    // Verificar que el dominio no exista ya
    const existingDomain = domains?.find(d => d.domain.toLowerCase() === cleanDomain.toLowerCase());
    if (existingDomain) {
      toast({
        title: "Dominio duplicado",
        description: "Este dominio ya está registrado en tu cuenta",
        variant: "destructive",
      });
      return;
    }

    createDomainMutation.mutate({
      domain: cleanDomain.toLowerCase(),
      project_id: newDomain.projectId,
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

  const getStatusIcon = (status: string, sslStatus: string) => {
    if (status === 'verified' && sslStatus === 'active') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'pending') {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string, sslStatus: string) => {
    if (status === 'verified' && sslStatus === 'active') {
      return <Badge className="bg-green-100 text-green-800">Verificado + SSL</Badge>;
    } else if (status === 'verified') {
      return <Badge className="bg-green-100 text-green-800">Verificado</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Error</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse">
          <div className="h-6 lg:h-8 bg-gray-200 rounded w-1/2 lg:w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 lg:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-8 lg:py-12">
          <AlertCircle className="h-10 w-10 lg:h-12 lg:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error al cargar dominios</h3>
          <p className="text-gray-600 mb-4 text-sm lg:text-base px-4">No se pudieron cargar los dominios</p>
          <Button onClick={() => refetch()} className="w-full sm:w-auto">Intentar de nuevo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-4 pb-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Dominios</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Gestiona dominios del sistema y dominios personalizados de tus proyectos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Agregar dominio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-4 sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-lg lg:text-xl">Agregar dominio personalizado</DialogTitle>
                <DialogDescription className="text-sm lg:text-base">
                  Conecta un dominio personalizado a uno de tus proyectos
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs lg:text-sm text-blue-800">
                  <p><strong>💡 Tip:</strong> Para pruebas, usa dominios como "mi-test.com" o "demo-app.com".</p>
                  <p className="mt-1">Los dominios reales requieren configuración DNS específica.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain" className="text-sm font-medium">Dominio</Label>
                  <Input
                    id="domain"
                    placeholder="ejemplo.com o https://ejemplo.com"
                    value={newDomain.domain}
                    onChange={(e) => setNewDomain(prev => ({ ...prev, domain: e.target.value }))}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground">Puedes incluir https:// si quieres, se eliminará automáticamente</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project" className="text-sm font-medium">Proyecto</Label>
                  <Select
                    value={newDomain.projectId}
                    onValueChange={(value) => setNewDomain(prev => ({ ...prev, projectId: value }))}
                  >
                    <SelectTrigger className="h-10">
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
                <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleAddDomain}
                    disabled={createDomainMutation.isPending}
                    className="w-full sm:w-auto"
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

      <Separator className="mb-6 lg:mb-8" />

      {/* System Domains Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Dominios del Sistema</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subdominios Automáticos</CardTitle>
            <CardDescription>
              Cada aplicación desplegada recibe automáticamente un subdominio único
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">*.xistracloud.com</p>
                    <p className="text-sm text-green-600">Subdominios automáticos activos</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Activo
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="mb-2"><strong>Ejemplos de subdominios generados:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>mi-app-abc123.xistracloud.com</li>
                  <li>wordpress-xyz789.xistracloud.com</li>
                  <li>react-portfolio-def456.xistracloud.com</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Domains Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Dominios Personalizados</h2>
      </div>

      {domains.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 lg:py-12 px-4">
            <div className="flex justify-center mb-4">
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              No tienes dominios personalizados configurados
            </h3>
            <p className="text-muted-foreground mb-4 text-sm lg:text-base">
              Conecta tu propio dominio (ej: mi-app.com) a tus aplicaciones desplegadas
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-blue-800 mb-2">¿Cómo funciona?</h4>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Añade tu dominio personalizado</li>
                <li>Configura el registro DNS en tu proveedor</li>
                <li>Verifica la propiedad del dominio</li>
                <li>SSL automático con Let's Encrypt</li>
              </ol>
            </div>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar primer dominio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start lg:items-center space-x-4">
                    {getStatusIcon(domain.status, domain.ssl_status)}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-3 gap-2">
                        <h3 className="font-semibold text-foreground break-all lg:break-normal">{domain.domain}</h3>
                        {getStatusBadge(domain.status, domain.ssl_status)}
                      </div>
                      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-2 mt-1 gap-1 lg:gap-0">
                        <span className="text-sm text-muted-foreground">
                          Proyecto: {domain.project_name}
                        </span>
                        <span className="text-muted-foreground hidden lg:inline">•</span>
                        <span className="text-sm text-muted-foreground">
                          Agregado: {new Date(domain.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-start lg:justify-end">
                    {domain.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerifyDomain(domain.id)}
                        disabled={verifyDomainMutation.isPending}
                        className="h-8 px-2 lg:px-3"
                      >
                        {verifyDomainMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        )}
                        <RefreshCw className="h-4 w-4 lg:mr-1" />
                        <span className="hidden sm:inline">Verificar</span>
                      </Button>
                    )}
                    
                    {domain.status === 'verified' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://${domain.domain}`, '_blank')}
                        className="h-8 px-2 lg:px-3"
                      >
                        <ExternalLink className="h-4 w-4 lg:mr-1" />
                        <span className="hidden sm:inline">Visitar</span>
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDomain(domain.id)}
                      disabled={deleteDomainMutation.isPending}
                      className="h-8 w-8 lg:w-auto lg:px-3"
                    >
                      {deleteDomainMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {domain.status === 'pending' && (
                  <div className="mt-4 p-3 lg:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-3">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm text-yellow-800 font-medium">
                        Configuración DNS requerida
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-yellow-800 font-medium mb-1">Registro CNAME:</p>
                        <div className="bg-white p-2 lg:p-3 rounded border text-xs lg:text-sm">
                          <span className="font-mono break-all">
                            {domain.domain} → xistracloud.com
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-yellow-800 font-medium mb-1">Registro TXT (verificación):</p>
                        <div className="bg-white p-2 lg:p-3 rounded border text-xs lg:text-sm">
                          <span className="font-mono break-all">
                            _xistracloud-verification.{domain.domain} → xistracloud-verify-{domain.id.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs lg:text-sm text-yellow-700 mt-3">
                      Puede tomar hasta 48 horas en propagarse. Haz clic en "Verificar" una vez configurados los registros DNS.
                    </p>
                  </div>
                )}

                {domain.status === 'verified' && domain.ssl_status === 'active' && (
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
