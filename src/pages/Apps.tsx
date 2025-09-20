import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CatalogApp = { id: string; name: string; description: string; icon: string };

const CATALOG: CatalogApp[] = [
  // Infra/gestión
  { id: 'portainer', name: 'Portainer', description: 'Gestión Docker', icon: '📦' },
  { id: 'sourcegraph', name: 'Sourcegraph', description: 'Búsqueda de código', icon: '🔎' },
  { id: 'sonarqube', name: 'SonarQube', description: 'Análisis estático', icon: '🧪' },

  // Bases de datos
  { id: 'postgres', name: 'PostgreSQL', description: 'Base de datos SQL', icon: '🐘' },
  { id: 'redis', name: 'Redis', description: 'Cache y cola en memoria', icon: '🧠' },
  { id: 'rethinkdb', name: 'RethinkDB', description: 'DB tiempo real', icon: '🌀' },
  { id: 'verdaccio', name: 'Verdaccio', description: 'Registro privado NPM', icon: '📦' },

  // Mensajería/colas
  { id: 'rabbitmq', name: 'RabbitMQ', description: 'Mensajería AMQP', icon: '🐇' },

  // DevOps/utilidades
  { id: 'ssh-container', name: 'SSH Container', description: 'Contenedor con SSH', icon: '🖥️' },
  { id: 'sentry', name: 'Sentry', description: 'Error tracking', icon: '🪲' },

  // CMS y apps web
  { id: 'wordpress', name: 'WordPress', description: 'CMS líder con MySQL', icon: '📝' },
  { id: 'strapi', name: 'Strapi', description: 'Headless CMS', icon: '🧱' },
  { id: 'shopware', name: 'Shopware', description: 'Ecommerce', icon: '🛒' },
  { id: 'nextcloud', name: 'Nextcloud', description: 'Colaboración y archivos', icon: '☁️' },

  // Automatización
  { id: 'n8n', name: 'n8n', description: 'Automatización visual', icon: '⚡' },

  // Multimedia / bots / chat
  { id: 'sinusbot', name: 'SinusBot', description: 'Music bot TS3/Discord', icon: '🎵' },
  { id: 'thelounge', name: 'The Lounge', description: 'IRC web client', icon: '💬' },
  { id: 'rainloop', name: 'Rainloop', description: 'Webmail', icon: '📮' },

  // Sync / herramientas
  { id: 'syncthing', name: 'Syncthing', description: 'Sync de archivos', icon: '🔁' },
  { id: 'resilio', name: 'Resilio Sync', description: 'Sync P2P', icon: '🔗' },

  // Gaming / voz
  { id: 'minecraft', name: 'Minecraft Server', description: 'Servidor Java Edition', icon: '🎮' },
  { id: 'teamspeak', name: 'TeamSpeak', description: 'Servidor de voz', icon: '🎙️' },
  { id: 'spigot', name: 'Spigot', description: 'Servidor MC optimizado', icon: '🛠️' },
];

const Apps = () => {
  const panelUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_PANEL_URL) || 'https://panel.xistracloud.com';

  const openPanel = () => window.open(panelUrl, '_blank');

  return (
    <div className="pt-6 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Apps Marketplace</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Gestiona e instala tus apps desde el panel
        </p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div></div>
        <div className="flex gap-2">
          <Button onClick={openPanel}>Abrir panel de apps</Button>
          <Button variant="outline" onClick={() => (window.location.href = panelUrl)}>Ir en esta pestaña</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {CATALOG.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-base sm:text-lg">
                <span className="text-2xl sm:text-3xl">{app.icon}</span>
                {app.name}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{app.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={openPanel}>Gestionar en panel</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Panel: {panelUrl}</p>
        </div>
  );
};

export default Apps;