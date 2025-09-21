import { useAuth } from '@/contexts/AuthContextSimple';

export const useApi = () => {
  const { user } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add user email to headers if user is logged in
    if (user?.email) {
      headers['x-user-email'] = user.email;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  return { apiCall };
};
