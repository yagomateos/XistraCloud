import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserData } from '@/hooks/useUserData';
import { 
  PLAN_FEATURES, 
  PLAN_PRICES, 
  PLAN_NAMES, 
  PlanType,
  getFeatureLimit 
} from '@/lib/plans';
import { Check, Crown, Zap, Shield, BarChart, X } from 'lucide-react';

const PricingPage: React.FC = () => {
  const { userData, userPlan } = useUserData();

  const plans: Array<{
    type: PlanType;
    name: string;
    price: number;
    description: string;
    features: string[];
    popular?: boolean;
  }> = [
    {
      type: 'free',
      name: 'Hobby',
      price: 0,
      description: 'Ideal para proyectos personales y prototipos',
      features: [
        '1 Proyecto',
        'Despliegues desde Git',
        'Dominio .xistra.app',
        'SSL automático',
        '100 GB de ancho de banda',
        '1 GB de almacenamiento'
      ]
    },
    {
      type: 'pro',
      name: 'Pro',
      price: 20,
      description: 'Para startups y aplicaciones con más potencia',
      features: [
        'Proyectos ilimitados',
        'Dominios personalizados ilimitados',
        'Soporte prioritario',
        'Análisis avanzado',
        '1 TB de ancho de banda',
        '100 GB de almacenamiento',
        'Hasta 5 colaboradores'
      ],
      popular: true
    },
    {
      type: 'enterprise',
      name: 'Enterprise',
      price: 99,
      description: 'Para grandes empresas con necesidades avanzadas',
      features: [
        'Todo lo del plan Pro',
        'Seguridad avanzada',
        'Soporte 24/7 dedicado',
        'SLA de disponibilidad',
        'Colaboradores ilimitados',
        '1 TB de almacenamiento',
        'Compliance y auditorías'
      ]
    }
  ];

  const handleUpgrade = async (planType: PlanType) => {
    // TODO: Implementar lógica de upgrade
    console.log(`Upgrading to ${planType} plan`);
  };

  const handleDowngrade = async (planType: PlanType) => {
    // TODO: Implementar lógica de downgrade
    console.log(`Downgrading to ${planType} plan`);
  };

  const isPlanActive = (planType: PlanType) => {
    return userPlan === planType;
  };

  const canUpgrade = (planType: PlanType) => {
    if (!userPlan) return true;
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    return planHierarchy[planType] > planHierarchy[userPlan];
  };

  const canDowngrade = (planType: PlanType) => {
    if (!userPlan) return false;
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    return planHierarchy[planType] < planHierarchy[userPlan];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Elige el plan perfecto para ti
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Escala tu infraestructura según tus necesidades. Cambia de plan en cualquier momento.
        </p>
        {userData && (
          <div className="mt-6">
            <Badge variant="outline" className="text-sm">
              Plan actual: {PLAN_NAMES[userPlan as PlanType] || 'No definido'}
            </Badge>
          </div>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => (
          <Card 
            key={plan.type} 
            className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''} ${isPlanActive(plan.type) ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-600 text-white">
                  <Crown className="h-3 w-3 mr-1" />
                  Más Popular
                </Badge>
              </div>
            )}
            
            {isPlanActive(plan.type) && (
              <div className="absolute -top-4 right-4">
                <Badge variant="default">
                  Plan Actual
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <CardDescription className="mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                {isPlanActive(plan.type) ? (
                  <Button className="w-full" disabled>
                    Plan Actual
                  </Button>
                ) : canUpgrade(plan.type) ? (
                  <Button 
                    className="w-full"
                    onClick={() => handleUpgrade(plan.type)}
                  >
                    Actualizar a {plan.name}
                  </Button>
                ) : canDowngrade(plan.type) ? (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDowngrade(plan.type)}
                  >
                    Cambiar a {plan.name}
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    No disponible
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Comparación detallada</CardTitle>
          <CardDescription className="text-center">
            Todas las características incluidas en cada plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Características</th>
                  <th className="text-center py-3 px-4">Hobby</th>
                  <th className="text-center py-3 px-4">Pro</th>
                  <th className="text-center py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Proyectos máximos</td>
                  <td className="text-center py-3 px-4">1</td>
                  <td className="text-center py-3 px-4">Ilimitado</td>
                  <td className="text-center py-3 px-4">Ilimitado</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Dominios personalizados</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Soporte prioritario</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4 font-medium">Análisis avanzado</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Seguridad avanzada</td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <X className="h-4 w-4 text-red-500 mx-auto" />
                  </td>
                  <td className="text-center py-3 px-4">
                    <Check className="h-4 w-4 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Preguntas Frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Puedo cambiar de plan en cualquier momento?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sí, puedes actualizar o downgrader tu plan en cualquier momento. 
                Los cambios se aplican inmediatamente y se prorratean en tu siguiente factura.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Hay contratos o compromisos?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No hay contratos ni compromisos a largo plazo. Puedes cancelar tu suscripción 
                en cualquier momento desde tu panel de configuración.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Qué pasa si excedo los límites?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Te notificaremos cuando te acerques a los límites. Para límites estrictos como 
                número de proyectos, necesitarás actualizar tu plan para continuar.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Ofrecen descuentos anuales?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Sí, ofrecemos 2 meses gratis al elegir facturación anual. 
                Contacta con ventas para más información sobre descuentos empresariales.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
