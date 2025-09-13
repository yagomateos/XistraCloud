import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Download, Star, Database, MessageSquare, Brain, BarChart3, Globe, Code, Palette, ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  downloads: number;
  rating: number;
  tags: string[];
  repository?: string;
  framework: string;
  popular?: boolean;
}

const TEMPLATES: Template[] = [
  // Bases de Datos
  {
    id: 'postgresql-pgadmin',
    name: 'PostgreSQL + pgAdmin',
    description: 'Base de datos PostgreSQL con interfaz de administración pgAdmin para gestión visual.',
    icon: Database,
    category: 'database',
    downloads: 4667,
    rating: 4.8,
    tags: ['Database', 'PostgreSQL', 'SQL', 'pgAdmin'],
    framework: 'docker',
    popular: true
  },
  {
    id: 'wordpress-mysql',
    name: 'WordPress + MySQL',
    description: 'Sitio web WordPress completo con base de datos MySQL integrada.',
    icon: Globe,
    category: 'cms',
    downloads: 5842,
    rating: 4.9,
    tags: ['CMS', 'WordPress', 'MySQL', 'Website'],
    framework: 'docker',
    popular: true
  },
  {
    id: 'portainer',
    name: 'Portainer',
    description: 'Interfaz web intuitiva para gestión y administración de contenedores Docker.',
    icon: Package,
    category: 'management',
    downloads: 3456,
    rating: 4.7,
    tags: ['Docker', 'Management', 'UI', 'Containers'],
    framework: 'docker'
  },

  // AI & Chat (mantenemos algunos para demostración)
  {
    id: 'lobechat',
    name: 'LobeChat',
    description: 'Framework de chatbot de alta performance, open-source para crear aplicaciones de IA conversacional.',
    icon: MessageSquare,
    category: 'ai',
    downloads: 3662,
    rating: 4.8,
    tags: ['AI', 'Chat', 'OpenAI'],
    repository: 'https://github.com/lobehub/lobe-chat',
    framework: 'nextjs'
  },
  {
    id: 'one-api',
    name: 'One-API',
    description: 'Acceso a todos los LLMs a través del formato estándar OpenAI API, todo desde una interfaz.',
    icon: Brain,
    category: 'ai',
    downloads: 3662,
    rating: 4.7,
    tags: ['API', 'OpenAI', 'LLM'],
    repository: 'https://github.com/songquanpeng/one-api',
    framework: 'react'
  },

  // Data & Analytics
  {
    id: 'n8n',
    name: 'n8n',
    description: 'Plataforma de automatización de flujos de trabajo que permite construir integraciones flexibles enfocadas en datos.',
    icon: BarChart3,
    category: 'analytics',
    downloads: 4684,
    rating: 4.7,
    tags: ['Workflow', 'Automation', 'Integration'],
    repository: 'https://github.com/n8n-io/n8n',
    framework: 'nodejs'
  },

  // CMS & Content
  {
    id: 'ghost',
    name: 'Ghost',
    description: 'Plataforma de publicación moderna para crear sitios web, blogs y newsletters.',
    icon: Globe,
    category: 'cms',
    downloads: 2341,
    rating: 4.6,
    tags: ['CMS', 'Blog', 'Publishing'],
    repository: 'https://github.com/TryGhost/Ghost',
    framework: 'nodejs'
  },
  {
    id: 'strapi',
    name: 'Strapi',
    description: 'CMS headless leading que permite desarrollar, desplegar y gestionar contenido en cualquier lugar.',
    icon: Code,
    category: 'cms',
    downloads: 1987,
    rating: 4.5,
    tags: ['CMS', 'Headless', 'API'],
    repository: 'https://github.com/strapi/strapi',
    framework: 'nodejs'
  },

  // E-commerce
  {
    id: 'shopify-hydrogen',
    name: 'Shopify Hydrogen',
    description: 'Framework de React para construir storefronts de e-commerce personalizados.',
    icon: ShoppingCart,
    category: 'ecommerce',
    downloads: 1543,
    rating: 4.4,
    tags: ['E-commerce', 'React', 'Shopify'],
    repository: 'https://github.com/Shopify/hydrogen',
    framework: 'react'
  },

  // Design Tools
  {
    id: 'figma-tokens',
    name: 'Figma Tokens',
    description: 'Sincroniza tokens de diseño entre Figma y tu código para mantener consistencia.',
    icon: Palette,
    category: 'design',
    downloads: 876,
    rating: 4.3,
    tags: ['Design', 'Tokens', 'Figma'],
    repository: 'https://github.com/tokens-studio/figma-plugin',
    framework: 'react'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'Todo', icon: Package },
  { id: 'ai', name: 'AI & Chat', icon: Brain },
  { id: 'database', name: 'Bases de Datos', icon: Database },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'cms', name: 'CMS', icon: Globe },
  { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
  { id: 'design', name: 'Diseño', icon: Palette },
];

const Apps = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'downloads' | 'rating'>('popular');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);

  // Filtrar templates
  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesSearch = searchTerm === '' || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Ordenar templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'downloads':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return b.downloads - a.downloads;
    }
  });

  const handleInstallTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsInstallDialogOpen(true);
  };

  const confirmInstall = async () => {
    if (selectedTemplate) {
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
          // Despliegue exitoso - redirigir a deployments o mostrar URL
          alert(`✅ ${selectedTemplate.name} desplegado exitosamente!\\n\\nURL: ${result.deployment.urls[0]}`);
          
          // Redirigir a la página de proyectos para ver el deployment
          navigate('/dashboard/projects');
        } else {
          throw new Error(result.error || result.message || 'Error en el despliegue');
        }
        
      } catch (error) {
        console.error('Error desplegando app:', error);
        alert(`❌ Error desplegando ${selectedTemplate.name}: ${error.message}`);
      }
    }
    setIsInstallDialogOpen(false);
    setSelectedTemplate(null);
  };

  const formatDownloads = (downloads: number) => {
    if (downloads >= 1000) {
      return `${(downloads / 1000).toFixed(1)}k`;
    }
    return downloads.toString();
  };

  return (
    <div className="pt-6 px-4 pb-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Apps</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Despliega aplicaciones populares con un solo clic
          </p>
        </div>
      </div>

      {/* Search y Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'popular' | 'downloads' | 'rating')}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
        >
          <option value="popular">Más populares</option>
          <option value="downloads">Más descargados</option>
          <option value="rating">Mejor valorados</option>
        </select>
      </div>

      {/* Categories Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
        <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-1 h-auto p-1">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col items-center gap-1 p-2 text-xs"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        {CATEGORIES.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <Card key={template.id} className="relative hover:shadow-md transition-shadow">
                    {template.popular && (
                      <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-white z-10">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Download className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDownloads(template.downloads)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-muted-foreground">
                                {template.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <CardDescription className="text-sm mb-3 line-clamp-3">
                        {template.description}
                      </CardDescription>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-0">
                      <Button 
                        className="w-full"
                        onClick={() => handleInstallTemplate(template)}
                      >
                        Instalar App
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            
            {sortedTemplates.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron apps</h3>
                <p className="text-muted-foreground">
                  Intenta cambiar los filtros de búsqueda o categoría
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Install Confirmation Dialog */}
      <Dialog open={isInstallDialogOpen} onOpenChange={setIsInstallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🚀 Desplegar {selectedTemplate?.name}</DialogTitle>
            <DialogDescription>
              Se desplegará <strong>{selectedTemplate?.name}</strong> usando Docker.
              <br />
              <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                <strong>Qué incluye:</strong>
                <ul className="mt-1 space-y-1">
                  {selectedTemplate?.id === 'postgresql-pgadmin' && (
                    <>
                      <li>• PostgreSQL Database (Puerto 5432)</li>
                      <li>• pgAdmin Web Interface (Puerto 5050)</li>
                      <li>• Credenciales por defecto configuradas</li>
                    </>
                  )}
                  {selectedTemplate?.id === 'wordpress-mysql' && (
                    <>
                      <li>• WordPress Site (Puerto 80)</li>
                      <li>• MySQL Database incluida</li>
                      <li>• Configuración automática</li>
                    </>
                  )}
                  {selectedTemplate?.id === 'portainer' && (
                    <>
                      <li>• Portainer Web UI (Puerto 9000)</li>
                      <li>• Gestión de contenedores Docker</li>
                      <li>• Interface de administración</li>
                    </>
                  )}
                  {!['postgresql-pgadmin', 'wordpress-mysql', 'portainer'].includes(selectedTemplate?.id || '') && (
                    <li>• {selectedTemplate?.description}</li>
                  )}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ⏱️ El despliegue tomará unos segundos. Se abrirá automáticamente la URL cuando esté listo.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInstallDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmInstall}>
              ✨ Desplegar Ahora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Apps;
