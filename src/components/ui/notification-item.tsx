import React from 'react';
import { Switch } from '@/components/ui/switch';

interface NotificationItemProps {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  description,
  checked,
  onCheckedChange,
  icon
}) => {
  return (
    <div className="
      flex 
      items-start 
      justify-between 
      p-4 
      rounded-lg 
      border 
      border-gray-100 
      bg-gray-50/50 
      hover:bg-gray-50 
      transition-colors 
      duration-200
      gap-4
    ">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && (
          <div className="flex-shrink-0 mt-0.5 text-gray-500">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm leading-5">
            {title}
          </h4>
          <p className="text-sm text-gray-600 mt-1 leading-5">
            {description}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
        />
      </div>
    </div>
  );
};
