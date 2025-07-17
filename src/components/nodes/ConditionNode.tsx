// ConditionNode.tsx
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCopyPaste } from '@/hooks/useCopyPaste';
import { useCutPaste } from '@/hooks/useCutPaste';

interface Branch {
  label: string;
  branchType: string;
}

interface ConditionNodeProps {
  id: string;
  data: {
    label: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    color?: string;
    subtitle?: string;
    showWarning?: boolean;
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
    onDuplicate?: (conditionId: string) => void;
  };
  isSelected?: boolean;
}

// ConditionNode Component
const ConditionNode = ({
  id,
  data,
  isSelected = false,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { copyNode, copyFlowFromNode } = useCopyPaste();
  const { cutNode, cutFlowFromNode } = useCutPaste();

  const IconComponent = React.useMemo(() => {
    if (!data.icon) return LucideIcons.GitBranch;
    if (typeof data.icon === 'string') return LucideIcons[data.icon] || LucideIcons.GitBranch;
    if (typeof data.icon === 'function') return data.icon;
    if (React.isValidElement(data.icon)) return () => data.icon;
    if (typeof data.icon === 'object') return data.icon;
    return LucideIcons.GitBranch;
  }, [data.icon]);

  return (
    <div className="relative">
      {/* Input Handle */}
      <Handle
        type="target"
        position={targetPosition}
        id="in"
        className="w-3 bg-white border-2 border-white"
        style={{
          left: targetPosition === Position.Top || targetPosition === Position.Bottom ? '50%' : undefined,
          top: targetPosition === Position.Left || targetPosition === Position.Right ? '50%' : undefined,
          bottom: targetPosition === Position.Top ? '-12px' : undefined,
          right: targetPosition === Position.Left ? '-12px' : undefined
        }}
      />

      {/* Node Box - ActivePieces Style */}
      <div
        className={`relative bg-white rounded-xl border-2 px-4 py-3 w-[280px] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top colored border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-xl"></div>

        <div className="flex items-center gap-3">
          {/* Icon with background */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className={`w-8 h-8 ${data.color || 'text-blue-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm truncate">
                  {data.customLabel || data.label}
                </h3>
                {/* Warning icon positioned at the end of title */}
                {data.showWarning && (
                  <LucideIcons.AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {data.subtitle || 'Condition'}
              </p>
            </div>

            {/* Menu Button */}
            <div className="flex-shrink ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`p-1.5 rounded-md transition-all duration-200`}
                  >
                    <LucideIcons.ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  sideOffset={30}
                  className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-1"
                >

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        copyNode(id);
                      } catch (err) {
                        console.error('Copy error:', err);
                      }
                    }}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md cursor-pointer transition-colors"
                  >
                    <LucideIcons.Copy className="w-4 h-4 mr-3" />
                    <span className="font-medium">Copy Condition</span>
                  </DropdownMenuItem>


                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        copyFlowFromNode(id);
                      } catch (err) {
                        console.error('Copy error:', err);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <LucideIcons.GitBranch className="w-4 h-4 mr-2" />
                    Copy From Here
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        cutNode(id);
                      } catch (err) {
                        console.error('Cut error:', err);
                      }
                    }}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <LucideIcons.Scissors className="w-4 h-4 mr-2" />
                    Move Condition
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        cutFlowFromNode(id);
                      } catch (err) {
                        console.error('Cut error:', err);
                      }
                    }}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  >
                    <LucideIcons.Move className="w-4 h-4 mr-2" />
                    Move From Here
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        if (data.onDuplicate) {
                          data.onDuplicate(id);
                        }
                      } catch (err) {
                        console.error('Duplicate error:', err);
                      }
                    }}
                    className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md cursor-pointer transition-colors"
                  >
                    <LucideIcons.Copy className="w-4 h-4 mr-3" />
                    <span className="font-medium">Duplicate</span>
                  </DropdownMenuItem>

                  {/* Divider */}
                  <div className="h-px bg-gray-200 my-1 mx-2"></div>

                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        if (data.onReplace) {
                          data.onReplace(id);
                        }
                      } catch (error) {
                        console.error('Error calling replace handler:', error);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <LucideIcons.RefreshCw className="w-4 h-4 mr-2" />
                    Replace Condition
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        if (data.onDelete) {
                          data.onDelete(id);
                        }
                      } catch (error) {
                        console.error('Error calling delete handler:', error);
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
      </div>

      {/* Output Handles for Yes/No branches */}
      <Handle
        type="source"
        position={sourcePosition}
        id="yes"
        className="w-3 bg-white border-2 border-white"
        style={{
          left: sourcePosition === Position.Bottom ? '50%' : undefined,
          top: sourcePosition === Position.Right ? '50%' : undefined,
          bottom: sourcePosition === Position.Bottom ? '-6px' : undefined,
          right: sourcePosition === Position.Right ? '-6px' : undefined
        }}
      />
      <Handle
        type="source"
        position={sourcePosition}
        id="no"
        className="w-3 bg-white border-2 border-white"
        style={{
          left: sourcePosition === Position.Bottom ? '50%' : undefined,
          top: sourcePosition === Position.Right ? '50%' : undefined,
          bottom: sourcePosition === Position.Bottom ? '-6px' : undefined,
          right: sourcePosition === Position.Right ? '-6px' : undefined
        }}
      />
    </div>
  );
};

export default ConditionNode;