import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Settings
} from 'lucide-react';

interface Domain {
  id: string;
  domain: string;
  projectName: string;
  projectId: string;
  status: 'verified' | 'pending' | 'failed';
  ssl: boolean;
  createdAt: string;
}

const Domains = () => {
  const [domains, setDomains] = useState<Domain[]>([
    {
      id: '1',
      domain: 'mi-app-web.com',
      projectName: 'mi-app-web',
      projectId: '1',
      status: 'verified',
      ssl: true,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      domain: 'staging.mi-app-web.com',
      projectName: 'mi-app-web',
      projectId: '1',
      status: 'pending',
      ssl: false,
      createdAt: '2024-01-15'
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDomain, setNewDomain] = useState({
    domain: '',
    projectId: ''
  });

  const projects = [
    { id: '1', name: 'mi-app-web' },
    { id: '2', name: 'api-backend' },
    { id: '3', name: 'landing-page' }
  ];

  const getStatusIcon = (status: string, ssl: boolean) => {
    if (status === 'verified' && ssl) {
      return <CheckCircle className="h-4 w-4 text-success" />;
    } else if (status === 'pending') {
      return <AlertCircle className="h-4 w-4 text-warning" />;
    } else {
      return <AlertCircle className="h-4 w-4 text-error" />;
    }
  };

  const getStatusBadge = (status: string, ssl: boolean) => {
    if (status === 'verified' && ssl) {
      return <Badge className="bg-success-bg text-success border-success/20">Verificado + SSL</Badge>;
    } else if (status === 'verified') {
      return <Badge className="bg-warning-bg text-warning border-warning/20">Verificado</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-warning-bg text-warning border-warning/20">Pendiente</Badge>;
    } else {
      return <Badge className="bg-error-bg text-error border-error/20">Error</Badge>;
    }
  };

  const handleAddDomain = () => {
    if (newDomain.domain && newDomain.projectId) {
      const project = projects.find(p => p.id === newDomain.projectId);
      const domain: Domain = {
        id: Date.now().toString(),
        domain: newDomain.domain,
        projectName: project?.name || '',
        projectId: newDomain.projectId,
        status: 'pending',
        ssl: false,
        createdAt: new Date().toISOString().split('T')[0]
      };
      
      setDomains(prev => [domain, ...prev]);
      setNewDomain({ domain: '', projectId: '' });
      setIsAddModalOpen(false);

      // Simulate verification after 3 seconds
      setTimeout(() => {
        setDomains(prev => prev.map(d => 
          d.id === domain.id 
            ? { ...d, status: 'verified' as const, ssl: true }
            : d
        ));
      }, 3000);
    }
  };

  const copyDNSRecord = (record: string) => {
    navigator.clipboard.writeText(record);
  };

  const deleteDomain = (id: string) => {
    setDomains(prev => prev.filter(d => d.id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dominios</h1>
          <p className="text-muted-foreground">
            Administra los dominios personalizados para tus proyectos
          </p>
        </div>
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
              <div>
                <Label htmlFor="domain">Dominio</Label>
                <Input
                  id="domain"
                  placeholder="ejemplo.com"
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
                <Button onClick={handleAddDomain}>
                  Agregar dominio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* DNS Instructions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuración DNS
          </CardTitle>
          <CardDescription>
            Para configurar tu dominio, agrega estos registros DNS en tu proveedor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="font-medium mb-2">Registro A (para dominio raíz):</div>
            <div className="flex items-center justify-between">
              <code className="text-sm">@ → 185.158.133.1</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyDNSRecord('185.158.133.1')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="font-medium mb-2">Registro CNAME (para www):</div>
            <div className="flex items-center justify-between">
              <code className="text-sm">www → tu-dominio.com</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyDNSRecord('tu-dominio.com')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domains List */}
      {domains.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
                      onClick={() => deleteDomain(domain.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {domain.status === 'pending' && (
                  <div className="mt-4 p-3 bg-warning-bg rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-warning mr-2" />
                      <span className="text-sm text-warning font-medium">
                        Esperando verificación DNS
                      </span>
                    </div>
                    <p className="text-sm text-warning/80 mt-1">
                      Puede tomar hasta 48 horas en propagarse. Asegúrate de haber configurado los registros DNS correctamente.
                    </p>
                  </div>
                )}

                {domain.status === 'verified' && domain.ssl && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-success">
                    <Shield className="h-4 w-4" />
                    <span>SSL/TLS habilitado automáticamente</span>
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