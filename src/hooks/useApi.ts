import { useAuth } from '@/contexts/AuthContextSimple';

export const useApi = () => {
  const { user } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    // Attach user email from context or localStorage fallback
    let email = user?.email as string | undefined;
    if (!email && typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          email = parsed?.email;
        }
      } catch {}
    }

    // Fallback para desarrollo - usar email por defecto si no hay usuario
    if (!email && typeof window !== 'undefined') {
      email = 'yagomateos@hotmail.com';
      console.warn('Using default email for development');
    }

    if (email) {
      headers['x-user-email'] = email;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  return { apiCall };
};
