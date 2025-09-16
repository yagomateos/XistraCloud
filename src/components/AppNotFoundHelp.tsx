import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Clock } from "lucide-react";

interface AppNotFoundHelpProps {
  appUrl: string;
  appName: string;
}

export const AppNotFoundHelp = ({ appUrl, appName }: AppNotFoundHelpProps) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const handleOpenInNewTab = () => {
    window.open(appUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Alert>
        <AlertTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Aplicación no encontrada
        </AlertTitle>
        <AlertDescription>
          La aplicación <strong>{appName}</strong> está iniciándose. Esto es normal y puede tardar unos segundos.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">¿Qué puedes hacer?</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold">1</span>
            </div>
            <div>
              <h3 className="font-medium">Espera unos segundos</h3>
              <p className="text-sm text-muted-foreground">
                Las aplicaciones necesitan tiempo para inicializarse completamente. 
                WordPress especialmente puede tardar 10-30 segundos en estar listo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold">2</span>
            </div>
            <div>
              <h3 className="font-medium">Recarga la página</h3>
              <p className="text-sm text-muted-foreground">
                Si la aplicación sigue sin cargar, recarga la página para intentar nuevamente.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar página
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 border rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-semibold">3</span>
            </div>
            <div>
              <h3 className="font-medium">Abre en nueva pestaña</h3>
              <p className="text-sm text-muted-foreground">
                A veces abrir la aplicación en una nueva pestaña puede ayudar.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleOpenInNewTab}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir en nueva pestaña
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Información técnica:</h3>
          <p className="text-sm text-muted-foreground">
            <strong>URL:</strong> <code className="bg-background px-1 rounded">{appUrl}</code>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <strong>Estado:</strong> La aplicación está desplegada pero aún inicializándose
          </p>
        </div>
      </div>
    </div>
  );
};
