import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CatalogApp = { id: string; name: string; description: string; icon: string };

const CATALOG: CatalogApp[] = [
  // CMS y apps web
  { id: 'wordpress', name: 'WordPress', description: 'CMS líder con MySQL', icon: '📝' },

  // Automatización
  { id: 'n8n', name: 'n8n', description: 'Automatización visual', icon: '⚡' },

  // Gaming
  { id: 'minecraft', name: 'Minecraft Server', description: 'Servidor Java Edition', icon: '🎮' },
];

const Apps = () => {
  const panelUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_APP_PANEL_URL) || 'https://panel.xistracloud.com';

  const openPanel = () => window.open(panelUrl, '_blank');

  return (
    <div className="pt-8 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Apps Marketplace</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Gestiona e instala tus apps desde el panel
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div></div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={openPanel} className="w-full sm:w-auto">Abrir panel de apps</Button>
          <Button variant="outline" onClick={() => (window.location.href = panelUrl)} className="w-full sm:w-auto">Ir en esta pestaña</Button>
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