import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DeploymentStatus, DomainStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getStatusBadgeClassName = (
  status: DeploymentStatus | DomainStatus,
): string => {
  switch (status) {
    case 'deployed':
    case 'success':
    case 'verified':
      return 'bg-success-bg text-success border-success/20';
    case 'building':
    case 'pending':
      return 'bg-warning-bg text-warning border-warning/20';
    case 'failed':
      return 'bg-error-bg text-error border-error/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
