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
  Zap
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
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            <Webhook className="h-8 w-8 text-primary" />
            GitHub Webhooks
          </h1>
          <p className="text-muted-foreground mt-1">
            Configura despliegues automáticos desde GitHub
          </p>
        </div>
        <Button onClick={() => window.open('https://github.com/new', '_blank')}>
          <Github className="h-4 w-4 mr-2" />
          Crear Repositorio
        </Button>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Webhooks
          </CardTitle>
          <CardDescription>
            Sigue estos pasos para configurar despliegues automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium">Ve a tu repositorio en GitHub</p>
                <p className="text-sm text-muted-foreground">
                  GitHub → Tu repositorio → Settings → Webhooks → Add webhook
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ⚠️ No uses la configuración general de GitHub, debe ser en el repositorio específico
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium">Configura el webhook en GitHub</p>
                <div className="space-y-2 mt-2">
                  <div>
                    <p className="text-sm font-medium">Payload URL:</p>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        https://xistracloud.com/api/webhooks/github
                      </code>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard('https://xistracloud.com/api/webhooks/github')}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Content type:</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      application/json
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      ⚠️ Cambia de "application/x-www-form-urlencoded" a "application/json"
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Events:</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">Push</Badge>
                      <Badge variant="secondary">Pull Request</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Selecciona "Let me select individual events" y marca Push + Pull Request
                    </p>
                  </div>
                  
                  <div>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Añadir Nuevo Webhook
          </CardTitle>
          <CardDescription>
            Registra un repositorio para despliegues automáticos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="repository">URL del Repositorio</Label>
              <Input
                id="repository"
                placeholder="https://github.com/usuario/mi-repo.git"
                value={newWebhook.repository}
                onChange={(e) => setNewWebhook(prev => ({ ...prev, repository: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="secret">Secreto del Webhook</Label>
              <div className="flex gap-2">
                <Input
                  id="secret"
                  placeholder="webhook-secret-123"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, secret: e.target.value }))}
                />
                <Button variant="outline" onClick={generateSecret}>
                  Generar
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Eventos</Label>
              <div className="flex gap-2 mt-2">
                <Badge variant={newWebhook.events.includes('push') ? 'default' : 'outline'}>
                  Push
                </Badge>
                <Badge variant={newWebhook.events.includes('pull_request') ? 'default' : 'outline'}>
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
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Webhooks Configurados</h2>
        
        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No hay webhooks configurados</h3>
              <p className="text-muted-foreground text-center">
                Añade tu primer webhook para habilitar despliegues automáticos
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Github className="h-5 w-5" />
                      <div>
                        <CardTitle className="text-base">
                          {webhook.repository.split('/').pop()?.replace('.git', '')}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {webhook.repository}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.isActive}
                        onCheckedChange={() => toggleWebhook(webhook.id)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">URL del Webhook</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-2 py-1 bg-muted rounded text-sm flex-1">
                          {webhook.webhookUrl}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(webhook.webhookUrl)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Secreto</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-2 py-1 bg-muted rounded text-sm flex-1">
                          {webhook.secret}
                        </code>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(webhook.secret)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Eventos</Label>
                    <div className="flex gap-2 mt-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="secondary">
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
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades de Webhooks</CardTitle>
          <CardDescription>
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
