import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type CatalogApp = { id: string; name: string; description: string; icon: string };

// ids must match the backend's APP_TEMPLATES keys exactly.
const CATALOG: CatalogApp[] = [
  { id: 'wordpress-mysql', name: 'WordPress', description: 'CMS líder con MySQL', icon: '📝' },
  { id: 'n8n', name: 'n8n', description: 'Automatización visual', icon: '⚡' },
  { id: 'minecraft', name: 'Minecraft Server', description: 'Servidor Java Edition', icon: '🎮' },
  { id: 'nextcloud-postgres', name: 'Nextcloud', description: 'Almacenamiento en la nube', icon: '☁️' },
  { id: 'gitea-postgres', name: 'Gitea', description: 'Servicio Git auto-hospedado', icon: '🦊' },
  { id: 'portainer', name: 'Portainer', description: 'Gestión visual de contenedores Docker', icon: '🐳' },
];

const Apps = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-8 px-4 pb-4 lg:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-3 mt-2">Apps Marketplace</h1>
        <p className="text-sm lg:text-base text-muted-foreground">
          Instala apps con un clic, cada una con su propio subdominio
        </p>
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
              <Button className="w-full" onClick={() => navigate(`/dashboard/apps/install/${app.id}`)}>
                Instalar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Apps;