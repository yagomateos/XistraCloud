import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Github, 
  Webhook, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Zap,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface WebhookConfig {
  id: string;
  repository: string;
  webhookUrl: string;
  secret: string;
  events: string[];
  isActive: boolean;
  lastTriggered?: string;
}

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([
    {
      id: '1',
      repository: 'https://github.com/usuario/mi-app-web.git',
      webhookUrl: 'https://xistracloud.com/api/webhooks/github',
      secret: 'webhook-secret-123',
      events: ['push', 'pull_request'],
      isActive: true,
      lastTriggered: '2024-01-15T10:30:00Z'
    }
  ]);

  const [newWebhook, setNewWebhook] = useState({
    repository: '',
    secret: '',
    events: ['push', 'pull_request']
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  const generateSecret = () => {
    const secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setNewWebhook(prev => ({ ...prev, secret }));
  };

  const addWebhook = () => {
    if (!newWebhook.repository || !newWebhook.secret) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    const webhook: WebhookConfig = {
      id: Date.now().toString(),
      repository: newWebhook.repository,
      webhookUrl: 'https://xistracloud.com/api/webhooks/github',
      secret: newWebhook.secret,
      events: newWebhook.events,
      isActive: true
    };

    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ repository: '', secret: '', events: ['push', 'pull_request'] });
    toast.success('Webhook configurado exitosamente');
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(prev => 
      prev.map(webhook => 
        webhook.id === id 
          ? { ...webhook, isActive: !webhook.isActive }
          : webhook
      )
    );
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
    toast.success('Webhook eliminado');
  };

  return (
    <div className="pt-8 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2 flex items-center gap-3">
          <Webhook className="h-6 w-6 lg:h-8 lg:w-8 text-primary" />
          GitHub Webhooks
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Configura despliegues automáticos desde GitHub
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div></div>
        <Button onClick={() => window.open('https://github.com/new', '_blank')} className="w-full sm:w-auto">
          <Github className="h-4 w-4 mr-2" />
          Crear Repositorio
        </Button>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Settings className="h-5 w-5" />
            Configuración de Webhooks
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sigue estos pasos para configurar despliegues automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="space-y-2">
                <p className="font-medium text-sm sm:text-base">Ve a tu repositorio en GitHub</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  GitHub → Tu repositorio → Settings → Webhooks → Add webhook
                </p>
                <p className="text-xs text-muted-foreground">
                  ⚠️ No uses la configuración general de GitHub, debe ser en el repositorio específico
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="space-y-3">
                <p className="font-medium text-sm sm:text-base">Configura el webhook en GitHub</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Payload URL:</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <code className="px-3 py-2 bg-muted rounded text-xs sm:text-sm break-all flex-1">
                        https://xistracloud.com/api/webhooks/github
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard('https://xistracloud.com/api/webhooks/github')}
                        className="w-full sm:w-auto"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Content type:</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      application/json
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Cambia de "application/x-www-form-urlencoded" a "application/json"
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Events:</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs">Push</Badge>
                      <Badge variant="secondary" className="text-xs">Pull Request</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Selecciona "Let me select individual events" y marca Push + Pull Request
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Secret:</p>
                    <p className="text-xs text-muted-foreground">
                      Genera un secreto aleatorio o usa el generador de abajo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Webhook */}
      <Card className="mt-8">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Zap className="h-5 w-5" />
            Añadir Nuevo Webhook
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Registra un repositorio para despliegues automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-2">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="repository">URL del Repositorio</Label>
              <Input
                id="repository"
                placeholder="https://github.com/usuario/mi-repo.git"
                value={newWebhook.repository}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, repository: e.target.value }))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="secret">Secreto del Webhook</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  id="secret"
                  placeholder="webhook-secret-123"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                  className="flex-1"
                />
                <Button variant="outline" onClick={generateSecret} className="w-full sm:w-auto">
                  Generar
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Eventos</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant={newWebhook.events.includes('push') ? 'default' : 'outline'} className="text-xs">
                  Push
                </Badge>
                <Badge variant={newWebhook.events.includes('pull_request') ? 'default' : 'outline'} className="text-xs">
                  Pull Request
                </Badge>
              </div>
            </div>
            
            <Button onClick={addWebhook} className="w-full">
              <Webhook className="h-4 w-4 mr-2" />
              Añadir Webhook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhooks List */}
      <div className="space-y-6 mt-10">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Webhooks Configurados</h2>
        
        {webhooks.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay webhooks configurados</h3>
              <p className="text-muted-foreground text-center text-sm sm:text-base">
                Añade tu primer webhook para habilitar despliegues automáticos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8 mt-6">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base sm:text-lg">
                          {webhook.repository.split('/').pop()?.replace('.git', '')}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm break-all">
                          {webhook.repository}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={webhook.isActive}
                          onCheckedChange={() => toggleWebhook(webhook.id)}
                        />
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {webhook.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteWebhook(webhook.id)}
                        className="w-full sm:w-auto text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">URL del Webhook</Label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <code className="px-3 py-2 bg-muted rounded text-xs sm:text-sm flex-1 break-all">
                          {webhook.webhookUrl}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(webhook.webhookUrl)}
                          className="w-full sm:w-auto"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Secreto</Label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <code className="px-3 py-2 bg-muted rounded text-xs sm:text-sm flex-1 break-all">
                          {webhook.secret}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(webhook.secret)}
                          className="w-full sm:w-auto"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copiar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Eventos</Label>
                    <div className="flex flex-wrap gap-2">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {webhook.lastTriggered && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4" />
                      Último trigger: {new Date(webhook.lastTriggered).toLocaleString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Features */}
      <Card className="mt-10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Funcionalidades de Webhooks</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Lo que puedes hacer con los webhooks configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Despliegue Automático
              </h3>
              <p className="text-sm text-muted-foreground">
                Cada push a la rama main/master despliega automáticamente a producción
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Preview Deployments
              </h3>
              <p className="text-sm text-muted-foreground">
                Los PRs y branches crean URLs temporales para testing
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Limpieza Automática
              </h3>
              <p className="text-sm text-muted-foreground">
                Los previews se eliminan automáticamente al cerrar PRs
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Seguridad
              </h3>
              <p className="text-sm text-muted-foreground">
                Verificación de firmas para asegurar que los webhooks son legítimos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Webhooks;
