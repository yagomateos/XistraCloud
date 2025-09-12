import React from 'react';
import { Navigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanType, canUserPerformAction, PLAN_NAMES } from '@/lib/plans';
import { Crown, Lock, AlertTriangle } from 'lucide-react';

interface PlanProtectedRouteProps {
  children: React.ReactNode;
  userPlan: PlanType;
  requiredFeature?: keyof typeof import('@/lib/plans').PLAN_FEATURES.free;
  requiredPlan?: PlanType;
  fallback?: React.ReactNode;
}

export const PlanProtectedRoute: React.FC<PlanProtectedRouteProps> = ({
  children,
  userPlan,
  requiredFeature,
  requiredPlan,
  fallback
}) => {
  // Verificar por característica específica
  if (requiredFeature && !canUserPerformAction(userPlan, requiredFeature)) {
    return fallback || <PlanUpgradePrompt feature={requiredFeature} userPlan={userPlan} />;
  }

  // Verificar por plan mínimo requerido
  if (requiredPlan) {
    const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
    if (planHierarchy[userPlan] < planHierarchy[requiredPlan]) {
      return fallback || <PlanUpgradePrompt requiredPlan={requiredPlan} userPlan={userPlan} />;
    }
  }

  return <>{children}</>;
};

interface PlanUpgradePromptProps {
  feature?: keyof typeof import('@/lib/plans').PLAN_FEATURES.free;
  requiredPlan?: PlanType;
  userPlan: PlanType;
}

const PlanUpgradePrompt: React.FC<PlanUpgradePromptProps> = ({
  feature,
  requiredPlan,
  userPlan
}) => {
  const getFeatureName = (feature?: string) => {
    const featureNames: Record<string, string> = {
      customDomains: 'Dominios Personalizados',
      prioritySupport: 'Soporte Prioritario',
      advancedSecurity: 'Seguridad Avanzada',
      analytics: 'Análisis Avanzado'
    };
    return feature ? featureNames[feature] || feature : 'esta característica';
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Lock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Función Premium
          </CardTitle>
          <CardDescription>
            {requiredPlan ? (
              <>Necesitas el plan {PLAN_NAMES[requiredPlan]} para acceder a esta sección.</>
            ) : (
              <>La función "{getFeatureName(feature)}" no está disponible en tu plan actual.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              Tu plan actual: <strong>{PLAN_NAMES[userPlan]}</strong>
              {requiredPlan && (
                <>
                  <br />
                  Plan requerido: <strong>{PLAN_NAMES[requiredPlan]}</strong>
                </>
              )}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col gap-2">
            <Button className="w-full">
              Actualizar Plan
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente para mostrar límites alcanzados
interface LimitReachedProps {
  title: string;
  description: string;
  currentCount: number;
  limit: number;
  upgradeAction?: () => void;
}

export const LimitReached: React.FC<LimitReachedProps> = ({
  title,
  description,
  currentCount,
  limit,
  upgradeAction
}) => {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-orange-700">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
          <span className="font-medium">Uso actual</span>
          <span className="text-orange-600 font-bold">
            {currentCount} / {limit}
          </span>
        </div>
        
        {upgradeAction && (
          <Button onClick={upgradeAction} className="w-full">
            Actualizar Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
