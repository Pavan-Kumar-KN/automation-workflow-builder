// ConditionNode.tsx
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

interface Branch {
  label: string;
  branchType: string;
}

interface ConditionNodeProps {
  id : string; 
  data: {
    label: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    color?: string;
    openNodeModal?: (node: any) => void;

    // New props for tree structure
    branches?: Branch[];  // e.g. [{ label: 'Yes', branchType: 'yes' }]
    handleAddNodeToBranch?: (branchType: string) => void;

    // Props for embedded placeholder functionality
    onAddYesAction?: () => void;
    onAddNoAction?: () => void;
    showPlaceholders?: boolean;

    // New props for replace and delete functionality
    onReplace?: (conditionId: string) => void;
    onDelete?: (conditionId: string) => void;
  };
  isSelected?: boolean;
}


const ConditionNode: React.FC<ConditionNodeProps> = ({ id , data, isSelected = false }) => {

  const IconComponent = (data.icon && LucideIcons[data.icon] as React.ComponentType<any>) || LucideIcons.GitBranch;

  
  return (
    <div className="relative">
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Node Content */}
      <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${isSelected
        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
        : 'border-gray-200 hover:border-gray-300'
        }`}>
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${data.color || 'text-gray-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.label}
            </div>
          </div>

          {/* 3-Dot Menu */}
          <div className="flex-shrink-0 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="More options"
                >
                  <LucideIcons.MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Replace Option */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      if (data.onReplace) {
                        data.onReplace(id);
                        console.log('✅ Replace function called successfully with ID:', id);
                      }
                    } catch (error) {
                      console.error('❌ Error calling replace handler:', error);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <LucideIcons.RefreshCw className="w-4 h-4 mr-2" />
                  Replace Condition
                </DropdownMenuItem>

                {/* Delete Option */}
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      if (data.onDelete) {
                        data.onDelete(id);
                        console.log('✅ Delete function called successfully with ID:', id);
                      }
                    } catch (error) {
                      console.error('❌ Error calling delete handler:', error);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
                  Delete Condition
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>


      {/* No handle - positioned for right branch */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="w-3 h-3 bg-red-500 border-2 border-white"
        style={{ left: '50%', bottom: '-6px', visibility: 'hidden' }}
      />

      {/* Bottom Handles for Yes/No branches */}
      {/* Yes handle - positioned for left branch */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '50%', bottom: '-6px', visibility: 'hidden' }}
      />





    </div>
  );
};

export default ConditionNode;
