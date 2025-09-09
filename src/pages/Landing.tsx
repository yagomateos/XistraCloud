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
      price: "Gratis",
      pricePeriod: "para siempre",
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
      price: "Personalizado",
      pricePeriod: "",
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
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex items-center">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">X</span>
              </div>
              <span className="font-bold">XistraCloud</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a href="#features" className="transition-colors hover:text-foreground/80 text-foreground/60">Características</a>
              <a href="#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">Precios</a>
              <a href="#docs" className="transition-colors hover:text-foreground/80 text-foreground/60">Docs</a>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Empezar Gratis <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
              Despliega tu código, no tu paciencia.
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
              XistraCloud es la plataforma de despliegue que te permite pasar del `git push` a producción en segundos. Concéntrate en tu código, nosotros nos encargamos del resto.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register">
                <Button size="lg">Empieza a desplegar gratis</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/40">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Todo lo que necesitas para triunfar</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                Herramientas potentes y sencillas para que tus proyectos cobren vida.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="p-6 bg-card rounded-lg border">
                  {feature.icon}
                  <h3 className="text-xl font-bold mt-4 mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Precios para cada escala</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                Empieza gratis y escala a medida que tu proyecto crece. Sin sorpresas.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan) => (
                <Card key={plan.name} className={`flex flex-col ${plan.primary ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-4xl font-bold">{plan.price} <span className="text-sm font-normal text-muted-foreground">{plan.pricePeriod}</span></p>
                    <p className="text-muted-foreground h-12">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={plan.link} className="w-full mt-auto">
                      <Button className="w-full" variant={plan.primary ? 'default' : 'outline'}>{plan.cta}</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="docs" className="py-20 bg-primary/5">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para desplegar?</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
              Crea tu cuenta en segundos y pon tu primer proyecto online. Es más fácil de lo que crees.
            </p>
            <Link to="/register">
              <Button size="lg">Empezar Gratis Ahora <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="container grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
          <div className="col-span-2 md:col-span-2 space-y-2">
            <h3 className="font-bold text-lg">XistraCloud</h3>
            <p className="text-muted-foreground">© {new Date().getFullYear()} XistraCloud. Despliega tu código, no tu paciencia.</p>
             <div className="flex gap-2 pt-2">
              <a href="#" className="text-muted-foreground hover:text-foreground"><Github className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Producto</h4>
            <ul className="space-y-1"><a href="#features" className="text-muted-foreground hover:text-foreground"><li>Características</li></a><a href="#pricing" className="text-muted-foreground hover:text-foreground"><li>Precios</li></a><a href="#docs" className="text-muted-foreground hover:text-foreground"><li>Documentación</li></a></ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Compañía</h4>
            <ul className="space-y-1"><a href="#" className="text-muted-foreground hover:text-foreground"><li>Sobre nosotros</li></a><a href="#" className="text-muted-foreground hover:text-foreground"><li>Contacto</li></a></ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">Legal</h4>
            <ul className="space-y-1"><a href="#" className="text-muted-foreground hover:text-foreground"><li>Términos de Servicio</li></a><a href="#" className="text-muted-foreground hover:text-foreground"><li>Política de Privacidad</li></a></ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;