import { loadStripe, Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const STRIPE_PRICE_IDS = {
  pro: 'price_1S9OdZJykbP1P0GJ3X4SSsoR', // Plan Pro - $15/mes
  enterprise: 'price_1S9Oe3JykbP1P0GJ4DbIVNYM', // Plan Enterprise - $50/mes
};

export const STRIPE_PRODUCT_IDS = {
  pro: 'prod_T5ZnNrYYLjxXLb', // Plan Pro Product ID
  enterprise: 'prod_T5ZnRHjU9e03Fw', // Plan Enterprise Product ID
};

export const createCheckoutSession = async (planType: 'pro' | 'enterprise') => {
  try {
    const response = await fetch('http://localhost:3001/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planType,
        priceId: STRIPE_PRICE_IDS[planType],
      }),
    });

    if (!response.ok) {
      throw new Error('Error al crear sesión de checkout');
    }

    const { sessionId } = await response.json();
    return sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

export const redirectToCheckout = async (planType: 'pro' | 'enterprise') => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe no se ha cargado correctamente');
    }

    const sessionId = await createCheckoutSession(planType);
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Error al redirigir a checkout:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en checkout:', error);
    throw error;
  }
};
