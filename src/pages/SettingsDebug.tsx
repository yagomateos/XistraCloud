import React from 'react';
import { useAuth } from '@/contexts/AuthContextSimple';
import { useUserDataSimple } from '@/hooks/useUserDataSimple';

const SettingsDebug: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { userData, userPlan, loading: userDataLoading } = useUserDataSimple();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Settings Debug</h1>

      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h2 className="font-bold">Auth Context</h2>
          <pre className="text-xs mt-2">{JSON.stringify({
            user,
            isAuthenticated,
            authLoading
          }, null, 2)}</pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold">User Data Hook</h2>
          <pre className="text-xs mt-2">{JSON.stringify({
            userData,
            userPlan,
            userDataLoading
          }, null, 2)}</pre>
        </div>

        <div className="border p-4 rounded">
          <h2 className="font-bold">localStorage</h2>
          <pre className="text-xs mt-2">{JSON.stringify({
            user: localStorage.getItem('user'),
            isAuthenticated: localStorage.getItem('isAuthenticated'),
            authToken: localStorage.getItem('authToken')
          }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default SettingsDebug;
