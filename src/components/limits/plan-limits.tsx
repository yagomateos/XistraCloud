import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PLAN_FEATURES, 
  canUserPerformAction, 
  checkProjectLimit, 
  checkDomainLimit,
  PLAN_NAMES,
  PlanType 
} from '@/lib/plans';
import { Crown, AlertTriangle, Check, X } from 'lucide-react';

interface PlanLimitProps {
  userPlan: PlanType;
  currentProjects?: number;
  currentDomains?: number;
}

export const PlanLimitCard: React.FC<PlanLimitProps> = ({
  userPlan,
  currentProjects = 0,
  currentDomains = 0
}) => {
  const projectLimit = checkProjectLimit(userPlan, currentProjects);
  const domainLimit = checkDomainLimit(userPlan, currentDomains);
  const features = PLAN_FEATURES[userPlan];

  const formatLimit = (limit: number) => {
    return limit === -1 ? 'Ilimitado' : limit.toString();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Plan {PLAN_NAMES[userPlan]}
            </CardTitle>
            <CardDescription>
              Límites y características de tu plan actual
            </CardDescription>
          </div>
          <Badge variant={userPlan === 'free' ? 'secondary' : 'default'}>
            {PLAN_NAMES[userPlan]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Límite de Proyectos */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {projectLimit.canCreate ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">Proyectos</span>
          </div>
          <span className="text-sm text-gray-600">
            {currentProjects} / {formatLimit(projectLimit.limit)}
          </span>
        </div>

        {/* Límite de Dominios */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {domainLimit.canCreate ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-red-500" />
            )}
            <span className="font-medium">Dominios Personalizados</span>
          </div>
          <span className="text-sm text-gray-600">
            {features.customDomains ? (
              `${currentDomains} / ${formatLimit(domainLimit.limit)}`
            ) : (
              'No disponible'
            )}
          </span>
        </div>

        {/* Otras Características */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 text-sm">
            <span>Ancho de banda</span>
            <span className="font-medium">{features.bandwidth}</span>
          </div>
          <div className="flex items-center justify-between p-2 text-sm">
            <span>Almacenamiento</span>
            <span className="font-medium">{features.storage}</span>
          </div>
          <div className="flex items-center justify-between p-2 text-sm">
            <span>Minutos de construcción</span>
            <span className="font-medium">{features.buildMinutes}/mes</span>
          </div>
          <div className="flex items-center justify-between p-2 text-sm">
            <span>Colaboradores</span>
            <span className="font-medium">
              {formatLimit(features.collaborators)}
            </span>
          </div>
        </div>

        {/* Alerta si está cerca del límite */}
        {!projectLimit.canCreate && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Has alcanzado el límite de proyectos de tu plan. 
              <Button variant="link" className="p-0 ml-1">
                Actualiza tu plan
              </Button> para crear más proyectos.
            </AlertDescription>
          </Alert>
        )}

        {userPlan === 'free' && (
          <div className="pt-2 border-t">
            <Button className="w-full" variant="outline">
              Actualizar a Plan Pro
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook para verificar límites
export const usePlanLimits = (userPlan: PlanType) => {
  return {
    canCreateProject: (currentProjects: number) => 
      checkProjectLimit(userPlan, currentProjects).canCreate,
    
    canAddDomain: (currentDomains: number) => 
      checkDomainLimit(userPlan, currentDomains).canCreate,
    
    hasFeature: (feature: keyof typeof PLAN_FEATURES.free) => 
      canUserPerformAction(userPlan, feature),
    
    getFeatureValue: (feature: keyof typeof PLAN_FEATURES.free) => 
      PLAN_FEATURES[userPlan][feature]
  };
};
