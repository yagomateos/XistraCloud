import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const EmailConfirmed = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get URL parameters - handle both hash and query params
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        // Try to get tokens from either location
        const accessToken = searchParams.get('access_token') || 
                           urlParams.get('access_token') || 
                           hashParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token') || 
                           urlParams.get('refresh_token') || 
                           hashParams.get('refresh_token');
        const type = searchParams.get('type') || 
                    urlParams.get('type') || 
                    hashParams.get('type');

        console.log('Email confirmation params:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          type 
        });

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('Error setting session:', error);
            setStatus('error');
            setMessage('Error al confirmar el email. Por favor, intenta de nuevo.');
            return;
          }

          if (data.user) {
            setStatus('success');
            setMessage('¡Tu email ha sido confirmado exitosamente! Ya puedes acceder a XistraCloud.');
            
            // Clear URL hash/query params
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          } else {
            setStatus('error');
            setMessage('No se pudo confirmar el usuario. Por favor, intenta de nuevo.');
          }
        } else if (user) {
          // User is already logged in
          setStatus('success');
          setMessage('¡Tu email ya está confirmado! Bienvenido a XistraCloud.');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
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
  }, [searchParams, navigate, user]);

  const handleContinue = () => {
    if (status === 'success') {
      navigate('/dashboard');
    } else {
      navigate('/login');
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
                {status === 'success' ? 'Ir al Dashboard' : 'Ir al Login'}
              </Button>
              
              {status === 'success' && (
                <p className="text-center text-sm text-muted-foreground">
                  Serás redirigido automáticamente en unos segundos...
                </p>
              )}
              
              {status === 'error' && (
                <div className="text-center">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/register')}
                    className="w-full mt-2"
                  >
                    Crear nueva cuenta
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfirmed;
