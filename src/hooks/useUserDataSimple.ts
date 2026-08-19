import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useApi } from '@/hooks/useApi';
import { API_URL } from '@/lib/api';

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
    if (!user) return;

    const loadProfile = async () => {
      try {
        const res = await apiCall(`${API_URL}/user/profile`, { method: 'GET' });
        if (!res.ok) return;
        const data = await res.json();
        const profile = data?.profile || {};
        const merged = {
          ...user,
          name: profile.fullName || user.name || '',
          email: user.email || '',
          bio: profile.bio ?? user.bio ?? '',
          plan_type: profile.plan_type || user.plan_type || 'free',
          avatar: profile.avatarUrl || user.avatar || '',
        } as UserData;
        setUserData(merged);
        localStorage.setItem('user', JSON.stringify(merged));
      } catch {
        // ignora en dev
      }
    };
    loadProfile();
  }, [user]);

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
      const resp = await apiCall(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profile.name,
          bio: profile.bio,
        })
      });

      const respData = resp.ok ? await resp.json() : null;
      const saved = respData?.profile || {};
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
