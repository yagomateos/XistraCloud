import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAppTemplates, deployApp } from '@/lib/api';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  ports: number[];
  env_required: string[];
  icon?: string;
  features?: string[];
}

interface Category {
  name: string;
  icon: string;
}

const Apps = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Record<string, Category>>({});
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const navigate = useNavigate();

  // Cargar templates desde el backend o mock data
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getAppTemplates();
        // Filtrar WordPress y n8n
        const filteredTemplates = (data.templates || []).filter(template => 
          template.id === 'wordpress-mysql' || 
          template.id === 'n8n' ||
          template.name.toLowerCase().includes('wordpress') ||
          template.name.toLowerCase().includes('n8n')
        );
        
        console.log('🚀 Filtered templates:', filteredTemplates);
        console.log('🚀 Filtered template IDs:', filteredTemplates.map(t => t.id));
        
        setTemplates(data.templates || []);
        setCategories(data.categories || {});
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Fallback: crear templates de WordPress y n8n manualmente
        const fallbackTemplates = [
          {
            id: 'wordpress-mysql',
            name: 'WordPress',
            description: 'CMS popular para blogs y webs. Incluye MySQL.',
            category: 'cms',
            ports: [80],
            env_required: ['DB_PASSWORD', 'DB_ROOT_PASSWORD'],
            icon: '📝',
            features: ['CMS completo', 'MySQL incluida', 'Panel de admin', 'Temas y plugins']
          },
          {
            id: 'n8n',
            name: 'n8n (Free)',
            description: 'Automatización de flujos con editor visual. Base de datos incluida.',
            category: 'automation',
            ports: [5678],
            env_required: [],
            icon: '⚡',
            features: ['Editor visual de workflows', '200+ integraciones', 'Base de datos PostgreSQL']
          }
        ];
        
        setTemplates(fallbackTemplates);
        setCategories({
          cms: { name: 'CMS & Websites', icon: '📝' },
          automation: { name: 'Automatización', icon: '⚡' }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleInstall = (template: Template) => {
    // Redirigir a la página de instalación en lugar de mostrar modal
    navigate(`/dashboard/apps/install/${template.id}`);
  };

  const confirmInstall = async () => {
    if (selectedTemplate && !isDeploying) {
      setIsDeploying(true);
      try {
        // Preparar datos para el despliegue
        const deploymentData = {
          templateId: selectedTemplate.id,
          name: selectedTemplate.name,
          environment: {
            // Variables por defecto para algunos templates
            ...(selectedTemplate.id === 'postgresql-pgadmin' && {
              POSTGRES_USER: 'admin',
              POSTGRES_PASSWORD: 'admin123',
              POSTGRES_DB: 'myapp',
              PGADMIN_MAIL: 'admin@example.com',
              PGADMIN_PW: 'admin123'
            })
          }
        };
        
        // Llamar al API de despliegue
        const result = await deployApp(deploymentData);
        
        if (result.success) {
          const url = result.deployment.accessUrl || result.deployment.urls?.[0] || 'URL no disponible';
          
          alert(`✅ ${selectedTemplate.name} desplegado exitosamente!\n\n🌐 URL: ${url}\n\n⏱️ Puede tardar unos segundos en estar disponible.`);
          navigate('/dashboard/projects');
        } else {
          throw new Error(result.error || result.message || 'Error en el despliegue');
        }
        
      } catch (error) {
        console.error('Error desplegando app:', error);
        alert(`❌ Error desplegando ${selectedTemplate.name}: ${error.message}`);
      } finally {
        setIsDeploying(false);
      }
    }
    setIsInstallDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando apps...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Apps Marketplace</h1>
        <p className="text-muted-foreground mb-6">
          Despliega aplicaciones y servicios con un solo clic.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{template.icon || '📝'}</span>
                  {template.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {categories[template.category]?.name || template.category}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-wrap gap-1 mb-3">
                {template.ports.map((port, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    Puerto {port}
                  </Badge>
                ))}
              </div>
              {template.env_required.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Requiere configuración de variables de entorno
                </p>
              )}
            </CardContent>
            
            <CardFooter className="pt-0">
              <Button 
                className="w-full"
                onClick={() => handleInstall(template)}
              >
                🚀 Desplegar {template.name}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {templates.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay apps disponibles</h3>
          <p className="text-muted-foreground">
            No se encontraron aplicaciones para desplegar en este momento.
          </p>
        </div>
      )}

      {/* Install Confirmation Dialog */}
      <Dialog open={isInstallDialogOpen} onOpenChange={setIsInstallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTemplate?.icon} Desplegar {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Instalar {selectedTemplate?.name} en tu espacio de hosting
            </DialogDescription>
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-2">Características incluidas:</h4>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {selectedTemplate?.features?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-current rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">Instalación automática</span>
                </div>
                <p>La aplicación estará lista en unos segundos con toda la configuración automática.</p>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsInstallDialogOpen(false)}
              disabled={isDeploying}
            >
              Cancelar
            </Button>
            <Button onClick={confirmInstall} disabled={isDeploying}>
              {isDeploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desplegando...
                </>
              ) : (
                '✨ Desplegar Ahora'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Apps;