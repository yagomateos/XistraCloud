import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CatalogApp = { id: string; name: string; description: string; icon: string };

const CATALOG: CatalogApp[] = [
  { id: 'wordpress', name: 'WordPress', description: 'CMS líder con MySQL', icon: '📝' },
  { id: 'n8n', name: 'n8n', description: 'Automatización visual', icon: '⚡' },
  { id: 'minecraft', name: 'Minecraft Server', description: 'Servidor Java Edition', icon: '🎮' },
  { id: 'postgres', name: 'PostgreSQL', description: 'Base de datos SQL', icon: '🐘' },
  { id: 'redis', name: 'Redis', description: 'Cache y cola en memoria', icon: '🧠' },
  { id: 'portainer', name: 'Portainer', description: 'Gestión Docker', icon: '📦' },
  { id: 'nextcloud', name: 'Nextcloud', description: 'Almacenamiento y colaboración', icon: '☁️' },
];

const Apps = () => {
  const panelUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_PANEL_URL) || 'https://panel.xistracloud.com';

  const openPanel = () => window.open(panelUrl, '_blank');

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Apps Marketplace</h1>
          <p className="text-muted-foreground mt-1">Gestiona e instala tus apps desde el panel.</p>
        </div>
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