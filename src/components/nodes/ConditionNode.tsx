import React from 'react';
import { ChevronDown, AlertTriangle, GitBranch, Database, Key, Trash2, MoreVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

interface ConditionNodeProps {
  data: {
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
  onAddBranchNode?: (branchType: 'branch1' | 'otherwise', insertIndex?: number) => void;
  onBranchNodeClick?: (branchType: 'branch1' | 'otherwise', nodeIndex: number, node: BranchNode) => void;
  onDeleteBranchNode?: (branchType: 'branch1' | 'otherwise', nodeIndex: number) => void;
  onDelete?: () => void;
}

const ConditionNode: React.FC<ConditionNodeProps> = ({
  data,
  isSelected = false,
  onAddBranchNode,
  onBranchNodeClick,
  onDeleteBranchNode,
  onDelete
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
    if (onAddBranchNode) {
      onAddBranchNode(branchType, insertIndex);
    }
  };

  const handleDeleteBranchNode = (branchType: 'branch1' | 'otherwise', nodeIndex: number) => {
    if (onDeleteBranchNode) {
      onDeleteBranchNode(branchType, nodeIndex);
    }
  };

  // Render nested conditional node (smaller version for sub-branches)
  const renderNestedConditionalNode = (node: BranchNode, parentBranchType: 'branch1' | 'otherwise', nodeIndex: number) => {
    const getNodeIcon = () => {
      if (!node.data.icon) return GitBranch;
      if (typeof node.data.icon === 'function') return node.data.icon;
      if (typeof node.data.icon === 'string') {
        return LucideIcons[node.data.icon as keyof typeof LucideIcons] || GitBranch;
      }
      return GitBranch;
    };
    const NodeIconComponent = getNodeIcon();

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center space-y-0">
          {/* Nested Router Node */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-72 cursor-pointer">
            <div className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-orange-50 flex items-center justify-center">
                  <NodeIconComponent className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-xs">
                    {node.data.label}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                  {!node.data.isConfigured && (
                    <AlertTriangle className="w-3 h-3 text-orange-500" />
                  )}
                  {/* Delete Menu for nested router */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical className="w-3 h-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBranchNode(parentBranchType, nodeIndex);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 mr-2" />
                        Delete Router
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Nested Branching Section */}
          <div className="relative w-full max-w-3xl">
            <div className="flex justify-between items-start pt-4 pb-6 relative z-10">
              {/* Sub-Branch 1 */}
              <div className="flex flex-col items-center w-1/2 px-4">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  Sub-Branch 1
                </div>
                <div className="mt-3 space-y-0">
                  {/* Initial connection */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-8 bg-gray-400 relative"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch(parentBranchType, 0)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-2 h-2 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-400"></div>
                  </div>

                  {/* Render sub-branch nodes */}
                  {node.data.branchNodes?.branch1?.map((subNode, subIndex) => (
                    <div key={subNode.id} className="flex flex-col items-center">
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-64 cursor-pointer">
                        <div className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Database className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-xs">
                                {subNode.data.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {subIndex < (node.data.branchNodes?.branch1?.length || 0) - 1 && (
                        <div className="flex flex-col items-center relative">
                          <div className="w-0.5 h-6 bg-gray-400 relative"></div>
                          <div className="relative">
                            <button
                              onClick={() => handleAddNodeToBranch(parentBranchType, subIndex + 1)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                            >
                              <LucideIcons.Plus className="w-2 h-2 text-gray-600 hover:text-blue-600" />
                            </button>
                          </div>
                          <div className="w-0.5 h-4 bg-gray-400"></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* End plus button */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-6 bg-gray-400 relative"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch(parentBranchType)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-2 h-2 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-Otherwise Branch */}
              <div className="flex flex-col items-center w-1/2 px-4">
                <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  Sub-Otherwise
                </div>
                <div className="mt-3 space-y-0">
                  {/* Initial connection */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-8 bg-gray-400 relative"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch(parentBranchType, 0)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-2 h-2 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                    <div className="w-0.5 h-4 bg-gray-400"></div>
                  </div>

                  {/* Render sub-otherwise nodes */}
                  {node.data.branchNodes?.otherwise?.map((subNode, subIndex) => (
                    <div key={subNode.id} className="flex flex-col items-center">
                      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-64 cursor-pointer">
                        <div className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Database className="w-3 h-3 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 text-xs">
                                {subNode.data.label}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {subIndex < (node.data.branchNodes?.otherwise?.length || 0) - 1 && (
                        <div className="flex flex-col items-center relative">
                          <div className="w-0.5 h-6 bg-gray-400 relative"></div>
                          <div className="relative">
                            <button
                              onClick={() => handleAddNodeToBranch(parentBranchType, subIndex + 1)}
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                            >
                              <LucideIcons.Plus className="w-2 h-2 text-gray-600 hover:text-blue-600" />
                            </button>
                          </div>
                          <div className="w-0.5 h-4 bg-gray-400"></div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* End plus button */}
                  <div className="flex flex-col items-center relative">
                    <div className="w-0.5 h-6 bg-gray-400 relative"></div>
                    <div className="relative">
                      <button
                        onClick={() => handleAddNodeToBranch(parentBranchType)}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                      >
                        <LucideIcons.Plus className="w-2 h-2 text-gray-600 hover:text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-80 cursor-pointer">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Icon and Step */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <NodeIconComponent className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0" onClick={() => onBranchNodeClick?.(branchType, index, node)}>
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
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteBranchNode(branchType, index);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Node
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
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 w-80 cursor-pointer">
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Icon and Step */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">
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

  const ConnectionLine = () => (
    <div className="absolute top-0 left-0 w-full h-[300px] ">
      <svg
        className="w-full h-full pointer-events-none"
        viewBox="0 0 800 300"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path d="M 400 100 V 140 H 200 V 220" stroke="#9ca3af" strokeWidth="2" />
        <path d="M 400 100 V 140 H 600 V 220" stroke="#9ca3af" strokeWidth="2" />
      </svg>
    </div>
  );


  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col items-center space-y-0">

        <div className="relative w-full">
          {/* Foreground node */}
          <div className="flex flex-col items-center relative z-10 mt-6 mb-6">
            {renderMainConditionNode()}
          </div>

          <ConnectionLine />

        </div>

        {/* Branching Section */}
        <div className="relative w-full max-w-4xl">
          {/* Branch Content */}
          <div className="flex justify-between items-start pt-8 pb-12 relative z-10">
            {/* Branch 1 */}
            <div className="flex flex-col items-center w-1/2 px-8">
              <BranchLabel
                label="Branch 1"
                condition=""
                type="branch1"
              />
              <div className="mt-6 space-y-0">
                <div className="flex flex-col items-center relative">
                  <div className="w-0.5 h-12 bg-gray-400 relative"></div>

                  <div className="relative">
                    <button
                      onClick={() => handleAddNodeToBranch('branch1', 0)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                    >
                      <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                    </button>
                  </div>
                  <div className="w-0.5 h-6 bg-gray-400"></div>

                </div>

                {data.branchNodes?.branch1?.map((node, index) => (
                  <div key={node.id} className="flex flex-col items-center">
                    {renderBranchNode(node, 'branch1', index, data.branchNodes?.branch1?.length || 0)}
                    {index < (data.branchNodes?.branch1?.length || 0) - 1 && (
                      <div className="flex flex-col items-center relative">
                        <div className="w-0.5 h-12 bg-gray-400 relative"></div>
                        <div className="relative">
                          <button
                            onClick={() => handleAddNodeToBranch('branch1', index + 1)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                          >
                            <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                          </button>
                        </div>
                        <div className="w-0.5 h-6 bg-gray-400"></div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Add button at end of branch */}
                <div className="flex flex-col items-center relative">
                  <div className="w-0.5 h-12 bg-gray-400 relative"></div>
                  <div className="relative">
                    <button
                      onClick={() => handleAddNodeToBranch('branch1')}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                    >
                      <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                    </button>
                  </div>
                  <div className="w-0.5 h-6 bg-gray-400"></div>

                </div>
              </div>
            </div>

            {/* Otherwise Branch */}
            <div className="flex flex-col items-center w-1/2 px-8">
              <BranchLabel
                label="Otherwise"
                condition=""
                type="otherwise"
              />
              <div className="mt-6 space-y-0">
                <div className="flex flex-col items-center relative">
                  <div className="w-0.5 h-12 bg-gray-400 relative"></div>
                  <div className="relative">
                    <button
                      onClick={() => handleAddNodeToBranch('otherwise', 0)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                    >
                      <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                    </button>
                  </div>
                  <div className="w-0.5 h-6 bg-gray-400"></div>
                </div>

                {data.branchNodes?.otherwise?.map((node, index) => (
                  <div key={node.id} className="flex flex-col items-center">
                    {renderBranchNode(node, 'otherwise', index, data.branchNodes?.otherwise?.length || 0)}
                    {index < (data.branchNodes?.otherwise?.length || 0) - 1 && (
                      <div className="flex flex-col items-center relative">
                        <div className="w-0.5 h-6 bg-gray-400"></div>
                        <div className="relative">
                          <button
                            onClick={() => handleAddNodeToBranch('otherwise', index + 1)}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                          >
                            <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                          </button>
                        </div>
                        <div className="w-0.5 h-6 bg-gray-400"></div>
                      </div>
                    )}
                  </div>
                ))}
                {/* Add button at end of branch */}
                <div className="flex flex-col items-center relative">
                  <div className="w-0.5 h-6 bg-gray-400"></div>
                  <div className="relative">
                    <button
                      onClick={() => handleAddNodeToBranch('otherwise')}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
                    >
                      <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
                    </button>
                  </div>
                  <div className="w-0.5 h-6 bg-gray-400"></div>

                </div>
              </div>
            </div>

            {/* Simple boxy connections - EXACTLY like your HTML */}

          </div>


        </div>

        {/* Final Connection and End - Simple Box Design */}
        <div className="flex flex-col items-center">


          <div className="bg-gray-100 border border-gray-200 rounded-lg px-4 py-2 mt-4">
            <span className="text-sm font-medium text-gray-600">End</span>
          </div>
        </div>


      </div>
    </div>



  );
};

export default ConditionNode;