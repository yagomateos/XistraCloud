import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-between items-center border-b">
        <h1 className="text-2xl font-bold">XistraCloud</h1>
        <nav>
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/dashboard/projects">
            <Button>Ir a la App</Button>
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-5xl font-bold mb-4">La forma más fácil de desplegar tus apps.</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          XistraCloud es una plataforma de despliegue que simplifica poner tus proyectos online. Conecta tu repositorio de Git y nosotros nos encargamos del resto.
        </p>
        <Link to="/dashboard/projects">
          <Button size="lg">Empezar Gratis</Button>
        </Link>
      </main>
      <footer className="p-4 text-center text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} XistraCloud. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Landing;