import React, { useState, useEffect, useRef } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { Plus, ChevronDown } from 'lucide-react';
import { useGraphStore } from '../../store/useGraphStore';
import { createPortal } from 'react-dom';
import { ActionCategoryModal } from '../ActionCategoryModal';
import { NodeData } from '@/data/types';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useDuplicateMove } from '@/hooks/useDuplicateMove';
import { toast } from 'sonner';
import { useCopyPaste } from '@/hooks/useCopyPaste';

interface FlowEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data?: {
    parentId?: string;
    beforeNodeId?: string;
  };
  sourcePosition?: string;
  targetPosition?: string;
  style?: React.CSSProperties;
}

// Complex paste function for condition nodes with complete tree structure
const handleComplexConditionPaste = (nodesToPaste: any[], parentId: string, beforeNodeId: string) => {
  console.log('🔍 Starting complex condition paste:', {
    nodeCount: nodesToPaste.length,
    parentId,
    beforeNodeId,
    nodes: nodesToPaste.map(n => ({ id: n.id, type: n.type, label: n.data.label }))
  });

  // Find the root condition node (the one being pasted at the insertion point)
  const rootConditionNode = nodesToPaste.find(node =>
    node.type === 'condition' &&
    (!node.parent || !nodesToPaste.find(n => n.id === node.parent))
  );

  if (!rootConditionNode) {
    toast.error('No root condition node found in copied data');
    return;
  }

  console.log('🔍 Root condition node:', rootConditionNode.id);

  // Create ID mapping for all nodes (old ID -> new ID)
  const idMapping: Record<string, string> = {};
  const timestamp = Date.now();

  // Generate new IDs for all nodes
  nodesToPaste.forEach((node, index) => {
    const newId = `${node.type}-${timestamp}-${index}`;
    idMapping[node.id] = newId;
  });

  console.log('🔍 ID mapping created:', Object.keys(idMapping).length, 'nodes');

  // Step 1: Insert the root condition node
  const conditionNodeData = {
    ...rootConditionNode.data,
    // Remove any function properties
    ...(Object.fromEntries(
      Object.entries(rootConditionNode.data).filter(([, value]) => typeof value !== 'function')
    ))
  };

  useGraphStore.getState().insertNode({
    type: 'condition',
    parentId,
    beforeNodeId,
    actionData: conditionNodeData
  });

  console.log('🔍 Root condition node inserted');

  // Step 2: Build the complete tree structure
  setTimeout(() => {
    const updatedNodes = useGraphStore.getState().nodes;

    // Find the newly created condition node
    const newConditionNode = Object.values(updatedNodes).find(node =>
      node.type === 'condition' &&
      node.parent === parentId &&
      node.data.label === conditionNodeData.label
    );

    if (!newConditionNode) {
      toast.error('Failed to find newly created condition node');
      return;
    }

    // Update the ID mapping for the root condition node
    idMapping[rootConditionNode.id] = newConditionNode.id;

    console.log('🔍 Found new condition node:', newConditionNode.id);

    // Step 3: Recursively build the tree structure
    const buildTreeStructure = async () => {
      // Process nodes level by level to maintain proper parent-child relationships
      const processedNodes = new Set<string>();
      processedNodes.add(rootConditionNode.id); // Root is already processed

      let hasMoreNodes = true;
      let attempts = 0;
      const maxAttempts = 10;

      while (hasMoreNodes && attempts < maxAttempts) {
        hasMoreNodes = false;
        attempts++;

        console.log(`🔍 Processing level ${attempts}`);

        for (const originalNode of nodesToPaste) {
          if (processedNodes.has(originalNode.id)) continue;

          // Check if this node's parent has been processed
          const parentProcessed = !originalNode.parent ||
            processedNodes.has(originalNode.parent) ||
            !nodesToPaste.find(n => n.id === originalNode.parent);

          if (!parentProcessed) continue;

          // Process this node
          await processNode(originalNode, idMapping, processedNodes);
          processedNodes.add(originalNode.id);
          hasMoreNodes = true;
        }
      }

      toast.success(`Condition tree pasted successfully (${processedNodes.size} nodes)`);
    };

    buildTreeStructure();

  }, 300);
};

// Helper function to process individual nodes in the tree
const processNode = async (originalNode: any, idMapping: Record<string, string>, processedNodes: Set<string>) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      const currentNodes = useGraphStore.getState().nodes;

      if (originalNode.type === 'condition') {
        // For condition nodes, we need to add them to their parent's branch
        const parentNode = Object.values(currentNodes).find(n => n.id === idMapping[originalNode.parent]);

        if (parentNode && parentNode.type === 'condition') {
          // Find which branch this condition belongs to
          const parentOriginal = Object.values(currentNodes).find(n => n.id === originalNode.parent);
          let branchType: 'yes' | 'no' = 'yes';

          if (parentOriginal?.branches?.no?.includes(originalNode.id)) {
            branchType = 'no';
          }

          // Find the placeholder for this branch
          const placeholderNode = Object.values(currentNodes).find(node =>
            node.type === 'placeholder' &&
            node.parent === parentNode.id &&
            node.data.branchType === branchType
          );

          if (placeholderNode) {
            const cleanNodeData = {
              ...originalNode.data,
              ...(Object.fromEntries(
                Object.entries(originalNode.data).filter(([, value]) => typeof value !== 'function')
              ))
            };

            useGraphStore.getState().addNodeToBranch({
              conditionNodeId: parentNode.id,
              branchType,
              placeholderNodeId: placeholderNode.id,
              actionData: {
                type: originalNode.type,
                ...cleanNodeData
              }
            });
          }
        }
      } else {
        // For action nodes, add them to their parent's branch
        const parentNode = Object.values(currentNodes).find(n => n.id === idMapping[originalNode.parent]);

        if (parentNode && parentNode.type === 'condition') {
          // Similar logic for action nodes...
          // This is a simplified version - you may need to expand this
          console.log('🔍 Processing action node in condition branch:', originalNode.id);
        }
      }

      resolve();
    }, 100);
  });
};

const FlowEdge: React.FC<FlowEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  data,
}) => {
  const { layoutDirection } = useWorkflowStore();
  const isHorizontal = layoutDirection === 'LR';
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Copy-paste and move state
  const { isCopy, isCut, isMoveMode } = useWorkflowStore();
  const { clearCopyState } = useCopyPaste();

  // Move operations
  const { pasteCut } = useDuplicateMove();


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  let edgePath: string;
  let arrowPath: string;
  let centerX: number;
  let centerY: number;

  const parentId = data?.parentId;
  const beforeNodeId = data?.beforeNodeId;
  const hasCopiedContent = isCopy || isCut || isMoveMode;

  // ? Getting insertion node from the graph store
  const insertNode = useGraphStore((state) => state.insertNode);
  const nodes = useGraphStore((state) => state.nodes);

  // Check if source node is a Remove Workflow node
  const sourceNode = parentId ? nodes[parentId] : null;
  const isSourceRemoveWorkflow = (sourceNode?.data as any)?.id === 'remove-workflow-action' ||
    (sourceNode?.data as any)?.id === 'exit-workflow-operation-action';

  // Don't show + button after Remove Workflow nodes
  if (isSourceRemoveWorkflow) {
    console.log('🔍 FlowEdge - Hiding + button after Remove Workflow node:', parentId);
  }

  if (isHorizontal) {
    edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
    centerX = (sourceX + targetX) / 2;
    centerY = (sourceY + targetY) / 2;
    const arrowSize = 6;
    arrowPath = `M ${targetX - arrowSize},${targetY - arrowSize} L ${targetX},${targetY} L ${targetX - arrowSize},${targetY + arrowSize}`;
  } else {
    edgePath = `M ${sourceX},${sourceY} L ${sourceX},${targetY}`;
    centerX = sourceX;
    centerY = (sourceY + targetY) / 2;
    const arrowSize = 6;
    arrowPath = `M ${sourceX - arrowSize},${targetY - arrowSize} L ${sourceX},${targetY} L ${sourceX + arrowSize},${targetY - arrowSize}`;
  }

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (hasCopiedContent) {
      // Toggle dropdown with paste option
      setShowDropdown(prev => !prev);
    } else {
      // Normal behavior - show action modal
      setShowActionModal(true);
    }
  };

  const handleAddNode = () => {
    setShowDropdown(false);
    setShowActionModal(true);
  };

  const handlePasteFlow = () => {
    if (!parentId || !beforeNodeId) {
      console.error('Missing parentId or beforeNodeId for paste operation');
      return;
    }

    console.log('🔍 Pasting flow at edge:', { parentId, beforeNodeId });

    // Handle move operation
    if (isMoveMode) {
      pasteCut(parentId, beforeNodeId);
      setShowDropdown(false);
      return;
    }

    // Handle copy/cut operations
    if (isCopy || isCut) {
      // Get copied data from workflow store
      const { copiedNodes, cutNodes } = useWorkflowStore.getState();
      const nodesToPaste = isCut ? cutNodes : copiedNodes;

      if (nodesToPaste && nodesToPaste.length > 0) {
        const firstNode = nodesToPaste[0];

        if (firstNode.type === 'condition' && nodesToPaste.length > 1) {
          // Handle condition node with complete tree structure
          useGraphStore.getState().pasteConditionTree({
            nodesToPaste,
            parentId,
            beforeNodeId
          });
          toast.success('Condition tree pasted successfully');
        } else {
          // Handle single node paste
          insertNode({
            type: firstNode.type || 'action',
            parentId,
            beforeNodeId,
            actionData: firstNode.data
          });
        }

        // Clear copy/cut state
        if (isCut) {
          useWorkflowStore.getState().forceResetCutState();
        } else {
          useWorkflowStore.getState().forceResetCopyState();
        }
      }
    }

    setShowDropdown(false);
  };

  const handleActionSelection = (action: NodeData) => {
    if (!parentId || !beforeNodeId) {
      console.error('Missing parentId or beforeNodeId:', { parentId, beforeNodeId });
      return;
    }

    console.log('Adding action:', action.label, 'before:', beforeNodeId, 'with parent:', parentId);

    // Determine node type from action
    const nodeType = action.type === 'condition' ? 'condition' : 'action';

    insertNode({
      type: nodeType,
      parentId,
      beforeNodeId,
      actionData: action
    });

    // Trigger event for auto-opening config panel
    window.dispatchEvent(new CustomEvent('nodeInserted'));

    setShowActionModal(false); // Close modal after inserting node
  };

  return (
    <>
      {/* Line */}
      <path
        id={id}
        d={edgePath}
        stroke="#9CA3AF"
        strokeWidth={1.5}
        fill="none"
        style={style}
      />

      {/* Arrow */}
      <path
        d={arrowPath}
        stroke="#9CA3AF"
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Plus Button - Hide after Remove Workflow nodes */}
      {!isSourceRemoveWorkflow && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-auto absolute z-10"
            style={{
              transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
            }}
          >
            {hasCopiedContent ? (
              // Dropdown button when there's copied content
              <div className="relative" ref={dropdownRef}>
                <button
                  className="w-8 h-5 bg-blue-500 border border-blue-600 rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
                  onClick={handlePlusClick}
                  onMouseDown={(e) => e.stopPropagation()}
                  onMouseUp={(e) => e.stopPropagation()}
                >
                  <ChevronDown className="w-4 h-4 text-white stroke-[2.5]" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-xl z-50 min-w-[140px] text-sm">
                    <button
                      onClick={handleAddNode}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 border-b border-gray-200"
                    >
                      Add Node
                    </button>

                    <button
                      onClick={handlePasteFlow}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-blue-600 border-b border-gray-200"
                    >
                      {isMoveMode || isCut ? ' Move Here' : ' Paste Flow'}
                    </button>
                      <button
                        onClick={clearCopyState}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                      >
                        Discard actions
                      </button>
                  
                  </div>

                )}
              </div>
            ) : (
              // Normal plus button
              <button
                className="w-6 h-5 bg-gray-400 border border-gray-500 rounded-md flex items-center justify-center hover:bg-gray-500 transition-colors shadow-sm cursor-pointer"
                onClick={handlePlusClick}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                <Plus className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Action Category Modal */}
      {showActionModal && createPortal(
        <ActionCategoryModal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          onSelectAction={handleActionSelection}
        />,
        document.body
      )}
    </>
  );
};

export default FlowEdge;