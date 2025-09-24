import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useApi } from '@/hooks/useApi';

interface UserData {
  id: string;
  email: string;
  name: string;
  plan_type: string;
  bio?: string;
  location?: string;
  company?: string;
  website?: string;
  avatar?: string;
  notifications?: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

export const useUserDataSimple = () => {
  const { user, isAuthenticated } = useAuth();
  const { apiCall } = useApi();
  const [userData, setUserData] = useState<UserData | null>(user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUserData(user);
    }
  }, [user]);

  // Cargar perfil real desde backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await apiCall('/user/profile', { method: 'GET' });
        const profile = (res as any)?.profile || {};
        const merged = {
          ...(userData || user || {}),
          name: profile.fullName || (userData || user || {}).name || '',
          email: (userData || user || {}).email || '',
          bio: profile.bio || (userData || user || {}).bio || '',
          plan_type: profile.plan_type || (userData || user || {}).plan_type || 'free',
          avatar: profile.avatarUrl || (userData || user || {}).avatar || '',
        } as UserData;
        setUserData(merged);
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {
        // ignora en dev
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateProfile = async (profile: {
    name: string;
    email: string;
    bio?: string;
    location?: string;
    company?: string;
    website?: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      // Persistir en backend
      const resp = await apiCall('/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.name,
          bio: profile.bio,
        })
      });

      const saved = (resp as any)?.profile || {};
      const updatedUser = {
        ...user,
        ...profile,
        name: saved.fullName || profile.name,
        bio: saved.bio ?? profile.bio,
        plan_type: saved.plan_type || user.plan_type,
        avatar: saved.avatarUrl || user.avatar,
      } as UserData;
      setUserData(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Persistir avatar si hay endpoint; por ahora solo local
      const updatedUser = { ...user, avatar: avatarUrl };
      setUserData(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Avatar updated:', updatedUser);
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    userPlan: userData?.plan_type,
    loading,
    updateProfile,
    updateAvatar,
    isAuthenticated,
  };
};
