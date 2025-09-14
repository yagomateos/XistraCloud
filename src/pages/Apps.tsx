import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Package, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'category'>('name');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const navigate = useNavigate();

  // Cargar templates desde el backend
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://xistracloud-production.up.railway.app';
        const response = await fetch(`${API_URL}/apps/templates`);
        const data = await response.json();
        
        if (response.ok) {
          setTemplates(data.templates || []);
          setCategories(data.categories || {});
        } else {
          console.error('Error fetching templates:', data.error);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleInstall = (template: Template) => {
    // Redirigir a la página de instalación en lugar de mostrar modal
    navigate(`/dashboard/apps/install/${template.id}`);
  };  const confirmInstall = async () => {
    if (selectedTemplate && !isDeploying) {
      setIsDeploying(true);
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://xistracloud-production.up.railway.app';
        
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
        const response = await fetch(`${API_URL}/apps/deploy`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deploymentData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          const url = result.deployment.accessUrl || result.deployment.urls?.[0] || 'URL no disponible';
          
          alert(`✅ ${selectedTemplate.name} desplegado exitosamente!\\n\\n🌐 URL: ${url}\\n\\n⏱️ Puede tardar unos segundos en estar disponible.`);
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

  // Filtrar y ordenar templates
  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return 0;
  });

  const uniqueCategories = Array.from(new Set(templates.map(t => t.category)));

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
        <h1 className="text-3xl font-bold mb-2">🚀 Apps</h1>
        <p className="text-muted-foreground mb-6">
          Despliega aplicaciones populares con un solo clic. Desde WordPress hasta bases de datos, todo listo en segundos.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'category')}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="category">Ordenar por categoría</option>
        </select>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1 bg-muted/30">
          <TabsTrigger value="todos" className="text-xs px-2 py-1">
            Todos ({templates.length})
          </TabsTrigger>
          {uniqueCategories.slice(0, 7).map(category => {
            const categoryData = categories[category];
            const count = templates.filter(t => t.category === category).length;
            return (
              <TabsTrigger key={category} value={category} className="text-xs px-2 py-1">
                {categoryData?.icon} {categoryData?.name || category} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* All templates */}
        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTemplates.map((template) => (
              <Card key={template.id} className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{template.icon || '📦'}</span>
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
                    🚀 Desplegar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {sortedTemplates.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron apps</h3>
              <p className="text-muted-foreground">
                Intenta cambiar los filtros de búsqueda
              </p>
            </div>
          )}
        </TabsContent>

        {/* Category-specific tabs */}
        {uniqueCategories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.filter(t => t.category === category).map((template) => (
                <Card key={template.id} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="text-2xl">{template.icon || '📦'}</span>
                      {template.name}
                    </CardTitle>
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
                      🚀 Desplegar
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

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