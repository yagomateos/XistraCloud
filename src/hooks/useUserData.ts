import { useState, useEffect } from 'react';
import { userStore, UserData } from '@/lib/user-store';
import { PlanType } from '@/lib/plans';

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(userStore.getUserData());
  const [loading, setLoading] = useState(!userData);

  useEffect(() => {
    const handleUserDataUpdate = (event: CustomEvent) => {
      setUserData(event.detail);
      setLoading(false);
    };

    const handleUserDataLoad = (event: CustomEvent) => {
      setUserData(event.detail);
      setLoading(false);
    };

    const handleUserDataClear = () => {
      setUserData(null);
      setLoading(false);
    };

    window.addEventListener('user-data-updated', handleUserDataUpdate as EventListener);
    window.addEventListener('user-data-loaded', handleUserDataLoad as EventListener);
    window.addEventListener('user-data-cleared', handleUserDataClear as EventListener);

    // Si no hay datos, intentar cargarlos
    if (!userData) {
      // Los datos se cargarán automáticamente cuando el usuario se autentique
      setLoading(true);
    } else {
      setLoading(false);
    }

    return () => {
      window.removeEventListener('user-data-updated', handleUserDataUpdate as EventListener);
      window.removeEventListener('user-data-loaded', handleUserDataLoad as EventListener);
      window.removeEventListener('user-data-cleared', handleUserDataClear as EventListener);
    };
  }, [userData]);

  const updateUserData = async (data: Partial<UserData>) => {
    setLoading(true);
    try {
      await userStore.updateUserData(data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profile: {
    name: string;
    email: string;
    bio: string;
    location: string;
    company: string;
    website: string;
  }) => {
    setLoading(true);
    try {
      await userStore.updateProfile(profile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    setLoading(true);
    try {
      await userStore.updateAvatar(avatarUrl);
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    userData,
    userPlan: userData?.plan as PlanType | undefined,
    loading,
    updateUserData,
    updateProfile,
    updateAvatar,
    isAuthenticated: !!userData,
  };
};
