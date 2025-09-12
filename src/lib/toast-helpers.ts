import { toast } from 'sonner';
import { PlanType, PLAN_NAMES, checkProjectLimit, checkDomainLimit } from '@/lib/plans';

interface ToastOptions {
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const showPlanLimitToast = {
  projectLimit: (userPlan: PlanType, currentCount: number, options?: ToastOptions) => {
    const limit = checkProjectLimit(userPlan, currentCount);
    
    if (!limit.canCreate) {
      toast.error('Límite de proyectos alcanzado', {
        description: `Has alcanzado el límite de ${limit.limit} proyectos en tu plan ${PLAN_NAMES[userPlan]}.`,
        action: options?.action || {
          label: 'Ver planes',
          onClick: () => {
            window.location.href = '/dashboard/pricing';
          }
        }
      });
      return false;
    }
    
    // Advertencia cuando queda 1 proyecto
    if (limit.remaining <= 1 && limit.remaining > 0) {
      toast.warning('Cerca del límite', {
        description: `Te queda ${limit.remaining} proyecto más en tu plan ${PLAN_NAMES[userPlan]}.`,
        action: options?.action || {
          label: 'Actualizar plan',
          onClick: () => {
            window.location.href = '/dashboard/pricing';
          }
        }
      });
    }
    
    return true;
  },

  domainLimit: (userPlan: PlanType, currentCount: number, options?: ToastOptions) => {
    const limit = checkDomainLimit(userPlan, currentCount);
    
    if (!limit.canCreate) {
      if (limit.limit === 0) {
        toast.error('Función no disponible', {
          description: `Los dominios personalizados no están disponibles en tu plan ${PLAN_NAMES[userPlan]}.`,
          action: options?.action || {
            label: 'Ver planes',
            onClick: () => {
              window.location.href = '/dashboard/pricing';
            }
          }
        });
      } else {
        toast.error('Límite de dominios alcanzado', {
          description: `Has alcanzado el límite de ${limit.limit} dominios en tu plan ${PLAN_NAMES[userPlan]}.`,
          action: options?.action || {
            label: 'Actualizar plan',
            onClick: () => {
              window.location.href = '/dashboard/pricing';
            }
          }
        });
      }
      return false;
    }

    // Advertencia cuando quedan pocos dominios
    if (limit.remaining <= 2 && limit.remaining > 0 && limit.limit !== -1) {
      toast.warning('Cerca del límite', {
        description: `Te quedan ${limit.remaining} dominios más en tu plan ${PLAN_NAMES[userPlan]}.`,
        action: options?.action || {
          label: 'Ver planes',
          onClick: () => {
            window.location.href = '/dashboard/pricing';
          }
        }
      });
    }
    
    return true;
  },

  success: (message: string, description?: string) => {
    toast.success(message, {
      description
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description
    });
  },

  planUpgraded: (newPlan: PlanType) => {
    toast.success('¡Plan actualizado!', {
      description: `Has actualizado exitosamente a ${PLAN_NAMES[newPlan]}. Los nuevos límites están disponibles inmediatamente.`
    });
  },

  welcome: (plan: PlanType) => {
    toast.success('¡Bienvenido a XistraCloud!', {
      description: `Tu cuenta con plan ${PLAN_NAMES[plan]} está lista. Comienza creando tu primer proyecto.`,
      duration: 5000
    });
  }
};
