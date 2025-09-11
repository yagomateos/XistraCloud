import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SettingsCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <div className={`
      bg-white 
      border 
      border-gray-200 
      rounded-xl 
      shadow-sm 
      p-6 
      transition-all 
      duration-200 
      hover:shadow-md
      ${className}
    `}>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {children && (
          <div className="space-y-4">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
