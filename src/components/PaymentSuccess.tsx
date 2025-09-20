import React from 'react';
import { CheckCircle, Mail, CreditCard, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface PaymentSuccessProps {
  planType?: string;
  sessionId?: string;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ planType, sessionId }) => {
  const [searchParams] = useSearchParams();
  
  // Obtener el plan desde los parámetros de la URL o usar el prop
  const purchasedPlan = searchParams.get('plan') || planType || 'pro';
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToSettings = () => {
    navigate('/dashboard/settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">
            ¡Pago Exitoso! 🎉
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Tu suscripción al plan <span className="font-semibold text-green-700 capitalize">{purchasedPlan}</span> ha sido activada correctamente
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información del pago */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Detalles del Pago
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Plan:</span>
                <span className="ml-2 font-medium capitalize">{purchasedPlan}</span>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <span className="ml-2 font-medium text-green-600">Activo</span>
              </div>
              {sessionId && (
                <div className="sm:col-span-2">
                  <span className="text-gray-600">ID de Sesión:</span>
                  <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                    {sessionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Próximos pasos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Próximos Pasos
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800">Email de Confirmación</p>
                  <p className="text-sm text-blue-600">
                    Recibirás un email de confirmación con todos los detalles de tu suscripción
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Acceso Inmediato</p>
                  <p className="text-sm text-green-600">
                    Ya puedes disfrutar de todas las funcionalidades del plan {purchasedPlan}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleGoToDashboard}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Ir al Dashboard
            </Button>
            <Button 
              onClick={handleGoToSettings}
              variant="outline"
              className="flex-1"
            >
              Ver Configuración
            </Button>
          </div>

          {/* Información adicional */}
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              ¿Tienes alguna pregunta? Contacta con nuestro{' '}
              <a href="mailto:support@xistracloud.com" className="text-blue-600 hover:underline">
                equipo de soporte
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
