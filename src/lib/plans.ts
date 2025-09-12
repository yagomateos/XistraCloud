// Sistema de planes y características
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanFeatures {
  maxProjects: number;
  maxDeployments: number;
  customDomains: boolean;
  customDomainsLimit: number;
  prioritySupport: boolean;
  advancedSecurity: boolean;
  analytics: boolean;
  collaborators: number;
  bandwidth: string;
  storage: string;
  buildMinutes: number;
}

export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  free: {
    maxProjects: 1,
    maxDeployments: 5,
    customDomains: false,
    customDomainsLimit: 0,
    prioritySupport: false,
    advancedSecurity: false,
    analytics: false,
    collaborators: 0,
    bandwidth: '100 GB',
    storage: '1 GB',
    buildMinutes: 100
  },
  pro: {
    maxProjects: -1, // ilimitado
    maxDeployments: -1, // ilimitado
    customDomains: true,
    customDomainsLimit: -1, // ilimitado
    prioritySupport: true,
    advancedSecurity: false,
    analytics: true,
    collaborators: 5,
    bandwidth: '1 TB',
    storage: '100 GB',
    buildMinutes: 1000
  },
  enterprise: {
    maxProjects: -1, // ilimitado
    maxDeployments: -1, // ilimitado
    customDomains: true,
    customDomainsLimit: -1, // ilimitado
    prioritySupport: true,
    advancedSecurity: true,
    analytics: true,
    collaborators: -1, // ilimitado
    bandwidth: 'Ilimitado',
    storage: '1 TB',
    buildMinutes: 5000
  }
};

export const PLAN_PRICES = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 20, yearly: 200 },
  enterprise: { monthly: 99, yearly: 990 }
};

export const PLAN_NAMES = {
  free: 'Hobby',
  pro: 'Pro',
  enterprise: 'Enterprise'
};

// Función para verificar si el usuario puede realizar una acción
export function canUserPerformAction(
  userPlan: PlanType,
  action: keyof PlanFeatures,
  currentCount?: number
): boolean {
  const features = PLAN_FEATURES[userPlan];
  const limit = features[action];
  
  if (typeof limit === 'boolean') {
    return limit;
  }
  
  if (typeof limit === 'number') {
    if (limit === -1) return true; // ilimitado
    if (currentCount === undefined) return true;
    return currentCount < limit;
  }
  
  return false;
}

// Función para obtener límite de una característica
export function getFeatureLimit(userPlan: PlanType, feature: keyof PlanFeatures): number | boolean | string {
  return PLAN_FEATURES[userPlan][feature];
}

// Función para verificar límites específicos
export function checkProjectLimit(userPlan: PlanType, currentProjects: number): {
  canCreate: boolean;
  limit: number;
  remaining: number;
} {
  const limit = PLAN_FEATURES[userPlan].maxProjects;
  
  if (limit === -1) {
    return {
      canCreate: true,
      limit: -1,
      remaining: -1
    };
  }
  
  return {
    canCreate: currentProjects < limit,
    limit,
    remaining: Math.max(0, limit - currentProjects)
  };
}

export function checkDomainLimit(userPlan: PlanType, currentDomains: number): {
  canCreate: boolean;
  limit: number;
  remaining: number;
} {
  if (!PLAN_FEATURES[userPlan].customDomains) {
    return {
      canCreate: false,
      limit: 0,
      remaining: 0
    };
  }
  
  const limit = PLAN_FEATURES[userPlan].customDomainsLimit;
  
  if (limit === -1) {
    return {
      canCreate: true,
      limit: -1,
      remaining: -1
    };
  }
  
  return {
    canCreate: currentDomains < limit,
    limit,
    remaining: Math.max(0, limit - currentDomains)
  };
}
