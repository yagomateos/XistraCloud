import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { GitBranch, ShieldCheck, Globe, Server, Github, Twitter, Linkedin, ArrowRight, Check } from "lucide-react";

const Landing = () => {
  const features = [
    {
      icon: <GitBranch className="h-8 w-8 text-primary" />,
      title: "Despliegue desde Git",
      description: "Conecta tu repositorio de GitHub y despliega con un solo push.",
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-primary" />,
      title: "SSL Automático",
      description: "Obtén certificados SSL gratuitos para todos tus dominios, renovados automáticamente.",
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Dominios Personalizados",
      description: "Añade tus propios dominios fácilmente y gestiona los registros DNS sin complicaciones.",
    },
    {
      icon: <Server className="h-8 w-8 text-primary" />,
      title: "Infraestructura Escalable",
      description: "Nuestra infraestructura se adapta a tu tráfico, desde un blog hasta una aplicación a gran escala.",
    },
  ];

  const pricingPlans = [
    {
      name: "Hobby",
      price: "$0",
      pricePeriod: "/mes",
      description: "Ideal para proyectos personales, prototipos y experimentos.",
      features: [
        "1 Proyecto",
        "Despliegues desde Git",
        "Dominio `.xistra.app`",
        "SSL Automático",
      ],
      cta: "Empezar Gratis",
      link: "/register",
      primary: false,
    },
    {
      name: "Pro",
      price: "$20",
      pricePeriod: "/mes",
      description: "Para startups y aplicaciones que necesitan más potencia y dominios personalizados.",
      features: [
        "Proyectos ilimitados",
        "Mayor ancho de banda y memoria",
        "Dominios personalizados ilimitados",
        "Soporte prioritario por email",
      ],
      cta: "Elegir Plan Pro",
      link: "/register",
      primary: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      pricePeriod: "/mes",
      description: "Para grandes empresas que necesitan seguridad, escalabilidad y soporte dedicado.",
      features: [
        "Todo lo del plan Pro",
        "Soporte 24/7 dedicado",
        "SLA de disponibilidad",
        "Seguridad y compliance avanzados",
      ],
      cta: "Contactar Ventas",
      link: "/contact",
      primary: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 lg:h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center">
            <Link to="/" className="mr-4 sm:mr-6 lg:mr-8 flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">X</span>
              </div>
              <span className="font-bold text-sm lg:text-base">XistraCloud</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 text-sm font-medium">
              <a href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Características</a>
              <a href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Precios</a>
              <a href="#docs" className="transition-colors hover:text-foreground/80 text-foreground/60">Docs</a>
            </nav>
          </div>
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm px-3">Login</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="text-sm pl-3 pr-2 lg:px-6 py-2 h-9">
                Empezar Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 md:py-20 lg:py-32 px-3 sm:px-4 lg:px-6">
          <div className="container text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 lg:mb-6 leading-tight px-2">
              Despliega tu código, no tu paciencia.
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground mb-8 lg:mb-10 px-3 sm:px-4 lg:px-0">
              XistraCloud es la plataforma de despliegue que te permite pasar del `git push` a producción en segundos. Concéntrate en tu código, nosotros nos encargamos del resto.
            </p>
            <div className="flex justify-center gap-4 px-3 sm:px-6">
              <Link to="/register" className="w-full sm:w-auto max-w-xs">
                <Button size="lg" className="w-full h-12 sm:h-14 text-sm sm:text-base font-semibold px-6 sm:px-8">
                  Empieza a desplegar gratis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 lg:py-20 bg-muted/40 px-4 lg:px-6">
          <div className="container">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 lg:mb-0">Todo lo que necesitas para triunfar</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-2 lg:mt-4 text-sm sm:text-base px-4 lg:px-0">
                Herramientas potentes y sencillas para que tus proyectos cobren vida.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-4 lg:p-6 bg-card rounded-lg border">
                  {feature.icon}
                  <h3 className="text-lg lg:text-xl font-bold mt-3 lg:mt-4 mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm lg:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 lg:py-20 px-4 lg:px-6">
          <div className="container">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 lg:mb-0">Precios para cada escala</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-2 lg:mt-4 text-sm sm:text-base px-4 lg:px-0">
                Empieza gratis y escala a medida que tu proyecto crece. Sin sorpresas.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`flex flex-col ${plan.primary ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader className="pb-4">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                        {plan.price}
                      </span>
                      <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                        {plan.pricePeriod}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm lg:text-base h-auto lg:h-12 leading-5">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0">
                    <ul className="space-y-2 lg:space-y-3 mb-6 lg:mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center text-sm lg:text-base">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={plan.link} className="w-full mt-auto">
                      <Button 
                        className="w-full h-10 lg:h-11" 
                        variant={plan.primary ? 'default' : 'outline'}
                        size="sm"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="docs" className="py-12 lg:py-20 bg-primary/5 px-4 lg:px-6">
          <div className="container text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 lg:mb-4">¿Listo para desplegar?</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-6 lg:mb-8 text-sm sm:text-base px-4 lg:px-0">
              Crea tu cuenta en segundos y pon tu primer proyecto online. Es más fácil de lo que crees.
            </p>
            <Link to="/register" className="inline-block">
              <Button size="lg" className="h-14 px-8 lg:px-10 text-base font-semibold">
                Empezar Gratis Ahora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 lg:py-12 border-t bg-muted/20 px-4 lg:px-6">
        <div className="container grid grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-8 text-sm">
          <div className="col-span-2 space-y-3">
            <h3 className="font-bold text-base lg:text-lg">XistraCloud</h3>
            <p className="text-muted-foreground text-xs lg:text-sm leading-5">
              © {new Date().getFullYear()} XistraCloud. Despliega tu código, no tu paciencia.
            </p>
             <div className="flex gap-3 pt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-4 w-4 lg:h-5 lg:w-5" />
              </a>
            </div>
          </div>
          <div className="space-y-2 lg:space-y-3">
            <h4 className="font-semibold text-sm lg:text-base">Producto</h4>
            <ul className="space-y-1 lg:space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Características</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Precios</a></li>
              <li><a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Documentación</a></li>
            </ul>
          </div>
          <div className="space-y-2 lg:space-y-3">
            <h4 className="font-semibold text-sm lg:text-base">Compañía</h4>
            <ul className="space-y-1 lg:space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Sobre nosotros</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Contacto</a></li>
            </ul>
          </div>
          <div className="space-y-2 lg:space-y-3 col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-sm lg:text-base">Legal</h4>
            <ul className="space-y-1 lg:space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Términos de Servicio</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors text-xs lg:text-sm">Política de Privacidad</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;