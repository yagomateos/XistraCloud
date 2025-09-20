import React from 'react';
import { Button } from '@/components/ui/button';
import { redirectToCheckout, createCheckoutSession } from '@/lib/stripe';
import { toast } from 'sonner';

interface CheckoutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  planType: 'pro' | 'enterprise';
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({ planType, children, ...props }) => {
  const handleCheckout = async () => {
    try {
      // Usar Stripe real directamente
      await redirectToCheckout(planType);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Error al iniciar el proceso de pago. Inténtalo de nuevo.');
    }
  };

  return (
    <Button onClick={handleCheckout} {...props}>
      {children}
    </Button>
  );
};
