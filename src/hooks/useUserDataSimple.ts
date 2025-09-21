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
      // For now, just update local state
      // In the future, this would make an API call to update the user profile
      const updatedUser = { ...user, ...profile };
      setUserData(updatedUser);
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Profile updated:', updatedUser);
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
