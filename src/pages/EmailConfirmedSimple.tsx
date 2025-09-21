import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const EmailConfirmedSimple = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters from hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Email confirmation params:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          type 
        });

        if (type === 'signup' && accessToken && refreshToken) {
          // Simulate successful email confirmation
          setStatus('success');
          setMessage('¡Tu email ha sido confirmado exitosamente! Ya puedes acceder a XistraCloud.');
          
          // Clear URL hash
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Enlace de confirmación inválido o expirado.');
        }
      } catch (error) {
        console.error('Error during email confirmation:', error);
        setStatus('error');
        setMessage('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'loading' && (
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-12 w-12 text-green-600" />
            )}
            {status === 'error' && (
              <AlertCircle className="h-12 w-12 text-red-600" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {status === 'loading' && 'Confirmando email...'}
            {status === 'success' && '¡Email confirmado!'}
            {status === 'error' && 'Error de confirmación'}
          </CardTitle>
          
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {status !== 'loading' && (
            <div className="space-y-4">
              <Button 
                onClick={handleContinue}
                className="w-full"
                size="lg"
              >
                {status === 'success' ? 'Ir al Login' : 'Crear nueva cuenta'}
              </Button>
              
              {status === 'success' && (
                <p className="text-center text-sm text-muted-foreground">
                  Serás redirigido automáticamente al login en unos segundos...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmedSimple;
