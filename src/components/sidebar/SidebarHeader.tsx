
import React from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const SidebarHeader: React.FC = () => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-gray-900 ml-[30px] mt-1">Workflow Builder</h2>

      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 mt-1 ">
        <Plus className="w-3 h-3 mr-1" />
        Drag to add
      </Badge>
    </div>
  );
};
