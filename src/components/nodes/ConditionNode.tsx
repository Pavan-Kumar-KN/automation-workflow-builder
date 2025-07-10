import React from 'react';
import { ChevronDown, AlertTriangle, GitBranch, Database, Trash2, MoreVertical, RefreshCw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConnectionCanvas from '../canvas/ConnectCanvas';
import PlaceHolderNode from '../canvas/PlaceHolderNode';

interface BranchNode {
  id: string;
  type: string;
  data: {
    label: string;
    icon?: any;
    description?: string;
    isConfigured?: boolean;
    // For nested conditional nodes
    branchNodes?: {
      branch1: BranchNode[];
      otherwise: BranchNode[];
    };
  };
}


interface BranchConfig {
  branchName: string;
  otherwiseBranchName: string;
}

interface ConditionNodeProps {
  data: {
    id?: string; // Add node id for configuration
    label: string;
    icon?: any;
    description?: string;
    isConfigured?: boolean;
    branchNodes?: {
      branch1: BranchNode[];
      otherwise: BranchNode[];
    };
  };
  isSelected?: boolean;
  onAddBranchNode?: (branchType: BranchConfig, insertIndex?: number) => void;
  onBranchNodeClick?: (branchType: BranchConfig, nodeIndex: number, node: BranchNode) => void;
  onDeleteBranchNode?: (branchType: BranchConfig, nodeIndex: number) => void;
  onReplaceBranchNode?: (branchType: BranchConfig, nodeIndex: number) => void; // Add replace branch node
  onDelete?: () => void;
  onRouterClick?: () => void; // Add router configuration click handler
  onReplaceRouter?: () => void; // Add replace router functionality
}

const ConditionNode: React.FC<ConditionNodeProps> = ({
  data,
  isSelected = false,
  onAddBranchNode,
  onBranchNodeClick,
  onDeleteBranchNode,
  onReplaceBranchNode,
  onDelete,
  onRouterClick,
  onReplaceRouter
}) => {
  // Handle both string icon names and direct icon components
  const IconComponent = React.useMemo(() => {
    if (!data.icon) {
      return LucideIcons.GitBranch as React.ComponentType<any>;
    }

    if (typeof data.icon === 'string') {
      return (LucideIcons[data.icon as keyof typeof LucideIcons] || LucideIcons.GitBranch) as React.ComponentType<any>;
    }

    if (typeof data.icon === 'function') {
      return data.icon as React.ComponentType<any>;
    }

    if (React.isValidElement(data.icon)) {
      // If it's already a React element, wrap it in a component
      return () => data.icon;
    }

    // If it's an object with displayName or name (Lucide icon component)
    if (data.icon && typeof data.icon === 'object' && ((data.icon as any).displayName || (data.icon as any).name)) {
      return data.icon as React.ComponentType<any>;
    }

    return LucideIcons.GitBranch as React.ComponentType<any>;
  }, [data.icon]);

  const handleAddNodeToBranch = (branchType: 'branch1' | 'otherwise', insertIndex?: number) => {
    console.log(`ConditionNode: Adding node to ${branchType} at index ${insertIndex}`);
    if (onAddBranchNode) {
      onAddBranchNode(branchType, insertIndex);
    }
  };

  const handleDeleteBranchNode = (branchType: 'branch1' | 'otherwise', nodeIndex: number) => {
    if (onDeleteBranchNode) {
      onDeleteBranchNode(branchType, nodeIndex);
    }
  };

  // Render individual branch node (supporting nested conditional nodes)
  const renderBranchNode = (node: BranchNode, branchType: 'branch1' | 'otherwise', index: number, totalNodes: number) => {
    // If this is a conditional node, render it as a nested conditional
    if (node.type === 'condition') {
      return renderNestedConditionalNode(node, branchType, index);
    }

    // Regular action node rendering
    const getNodeIcon = () => {
      if (!node.data.icon) return Database;
      if (typeof node.data.icon === 'function') return node.data.icon;
      if (typeof node.data.icon === 'string') {
        return LucideIcons[node.data.icon as keyof typeof LucideIcons] || Database;
      }
      return Database;
    };
    const NodeIconComponent = getNodeIcon();

    return (
      <div
        className="bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 w-[360px] cursor-pointer border-gray-200 hover:border-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          onBranchNodeClick?.(branchType, index, node);
        }}
      >
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            {/* Icon and Step */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <NodeIconComponent className={`w-5 h-5 ${node.data.color || 'text-blue-600'}`} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">
                {node.data.label}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-400" />
              {!node.data.isConfigured && (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}

              {/* Delete Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onReplaceBranchNode) onReplaceBranchNode(branchType, index);
                    }}
                    className="hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replace Action
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBranchNode(branchType, index);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Action
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main condition node (with router delete option)
  const renderMainConditionNode = () => {
    return (
      <div className="bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 w-[360px] border-gray-200 hover:border-gray-300">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            {/* Icon and Step */}
            <div className="flex items-center gap-3">
              <IconComponent className="w-5 h-5 text-blue-600" />
              <div className="text-base font-medium text-gray-700"></div>
            </div>

            {/* Content - Clickable area for router configuration */}
            <div
              className="flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onRouterClick) onRouterClick();
              }}
            >
              <div className="text-base font-semibold text-gray-900">
                {data.label}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-gray-400" />
              {!data.isConfigured && (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              )}

              {/* Router Delete Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onReplaceRouter) onReplaceRouter();
                    }}
                    className="hover:bg-gray-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Replace Router
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onDelete) onDelete();
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Router
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BranchLabel = ({ label, condition, type }: { label: string; condition: string; type: string }) => (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${type === 'branch1'
      ? 'bg-purple-100 text-purple-700 border border-purple-200'
      : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
      {label}
      {condition && <span className="text-xs opacity-75">: {condition}</span>}
    </div>
  );


  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col items-center space-y-0">

        <div className="relative w-full">
          {/* Foreground node */}
          <div className="flex flex-col items-center relative z-10 mt-0 mb-2">
            {renderMainConditionNode()}
          </div>


          <ConnectionCanvas data={data} />
        </div>

        {/* Branching Section */}
        <div className="relative w-full max-w-4xl">
          {/* Branch Content */}
          <div className="flex justify-between items-start pt-8 pb-12 relative z-10">
            {/* Branch 1 */}
            <div className="flex flex-col items-center w-1/2 px-8">
              <BranchLabel
                label="Yes"
                condition=""
                type="branch1"
              />
              <div className="mt-6 space-y-0">

                {/* Initial plus button - only show when nodes exist */}
                {(data.branchNodes?.branch1?.length || 0) > 0 && (
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch('branch1', 0)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                  </div>
                )}

                {(data.branchNodes?.branch1?.length || 0) === 0 ? (
                  <PlaceHolderNode branchType="branch1" handleAddNodeToBranch={handleAddNodeToBranch} />

                ) : (
                  data.branchNodes?.branch1?.map((node, index) => (
                    <div key={node.id} className="flex flex-col items-center">
                      {renderBranchNode(node, 'branch1', index, data.branchNodes?.branch1?.length || 0)}
                      {index < (data.branchNodes?.branch1?.length || 0) - 1 && (
                        <div className="flex flex-col items-center relative">
                          <div className="w-0.5 h-6 bg-gray-400"></div>
                          <div className="relative">
                            <button
                              onClick={() => handleAddNodeToBranch('branch1', index + 1)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                            >
                              <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                            </button>
                          </div>
                          <div className="w-0.5 h-6 bg-gray-400"></div>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {/* Add button at end of branch - only show when nodes exist */}
                {(data.branchNodes?.branch1?.length || 0) > 0 && (
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch('branch1')}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Otherwise Branch */}
            <div className="flex flex-col items-center w-1/2 px-8">
              <BranchLabel
                label="No"
                condition=""
                type="otherwise"
              />
              <div className="mt-6 space-y-0">
                {/* Initial plus button - only show when nodes exist */}
                {(data.branchNodes?.otherwise?.length || 0) > 0 && (
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch('otherwise', 0)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                  </div>
                )}

                {(data.branchNodes?.otherwise?.length || 0) === 0 ? (
                  <PlaceHolderNode branchType="otherwise" handleAddNodeToBranch={handleAddNodeToBranch} />

                ) : (
                  data.branchNodes?.otherwise?.map((node, index) => (
                    <div key={node.id} className="flex flex-col items-center">
                      {renderBranchNode(node, 'otherwise', index, data.branchNodes?.otherwise?.length || 0)}
                      {index < (data.branchNodes?.otherwise?.length || 0) - 1 && (
                        <div className="flex flex-col items-center relative">
                          <div className="w-0.5 h-6 bg-gray-400"></div>
                          <div className="relative">
                            <button
                              onClick={() => handleAddNodeToBranch('otherwise', index + 1)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                            >
                              <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                            </button>
                          </div>
                          <div className="w-0.5 h-6 bg-gray-400"></div>
                        </div>
                      )}
                    </div>
                  ))
                )}




                {/* Add button at end of branch - only show when nodes exist */}
                {(data.branchNodes?.otherwise?.length || 0) > 0 && (
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch('otherwise')}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-6 bg-gray-400"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Simple boxy connections - EXACTLY like your HTML */}

          </div>


        </div>

      </div>
    </div>



  );
};

export default ConditionNode;