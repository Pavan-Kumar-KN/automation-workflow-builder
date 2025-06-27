import React, { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Node, useViewport } from '@xyflow/react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { NodeSelectionModal } from './NodeSelectionModal';
import { toast } from 'sonner';

interface PlusButtonOverlayProps {
  nodes: Node[];
}

export const PlusButtonOverlay: React.FC<PlusButtonOverlayProps> = ({ nodes }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSourceNode, setSelectedSourceNode] = useState<Node | null>(null);
  const { layoutMode, addNode, addEdge, removeEdge, edges } = useWorkflowStore();
  const { x, y, zoom } = useViewport();

  const handleAddNode = (nodeType: string, nodeData: any) => {
    if (!selectedSourceNode) return;

    // Check if source node has an existing outgoing connection
    const existingOutgoingEdge = edges.find(edge => edge.source === selectedSourceNode.id);

    // Calculate position for new node
    const sourcePosition = selectedSourceNode.position;
    const isVertical = layoutMode === 'vertical' || layoutMode === 'freeform';

    let newPosition;
    if (existingOutgoingEdge) {
      // If there's an existing connection, position the new node between source and target
      const targetNode = nodes.find(node => node.id === existingOutgoingEdge.target);
      if (targetNode) {
        const targetPosition = targetNode.position;
        newPosition = {
          x: (sourcePosition.x + targetPosition.x) / 2,
          y: (sourcePosition.y + targetPosition.y) / 2,
        };
      } else {
        // Fallback if target node not found
        newPosition = {
          x: isVertical ? sourcePosition.x : sourcePosition.x + 300,
          y: isVertical ? sourcePosition.y + 200 : sourcePosition.y,
        };
      }
    } else {
      // No existing connection, use standard positioning
      newPosition = {
        x: isVertical ? sourcePosition.x : sourcePosition.x + 300,
        y: isVertical ? sourcePosition.y + 200 : sourcePosition.y,
      };
    }

    // Create new node
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: newPosition,
      data: {
        ...nodeData,
        layoutMode,
      },
    };

    addNode(newNode);

    // Handle connections based on whether there's an existing outgoing edge
    if (existingOutgoingEdge) {
      // INLINE INSERTION: Remove existing edge and create two new ones

      // Store original target info before removing edge
      const originalTarget = existingOutgoingEdge.target;
      const originalTargetHandle = existingOutgoingEdge.targetHandle;
      const originalSourceHandle = existingOutgoingEdge.sourceHandle;

      // Remove the existing edge first
      removeEdge(existingOutgoingEdge.id);

      // Wait a bit for the edge removal to process
      setTimeout(() => {
        // Create edge from source to new node
        const sourceToNewEdge = {
          id: `edge-${selectedSourceNode.id}-${newNode.id}-${Date.now()}`,
          source: selectedSourceNode.id,
          target: newNode.id,
          sourceHandle: originalSourceHandle,
          targetHandle: getTargetHandle(nodeType),
          type: (layoutMode === 'vertical' || layoutMode === 'freeform') ? 'straight' : 'smoothstep',
          animated: true,
        };

        // Create edge from new node to original target
        const newToTargetEdge = {
          id: `edge-${newNode.id}-${originalTarget}-${Date.now() + 1}`,
          source: newNode.id,
          target: originalTarget,
          sourceHandle: getSourceHandle(nodeType),
          targetHandle: originalTargetHandle,
          type: (layoutMode === 'vertical' || layoutMode === 'freeform') ? 'straight' : 'smoothstep',
          animated: true,
        };

        addEdge(sourceToNewEdge);
        addEdge(newToTargetEdge);

        const targetNode = nodes.find(node => node.id === originalTarget);
        toast.success(`Inserted ${nodeData.label} between ${selectedSourceNode.data.label} and ${targetNode?.data.label || 'target node'}`);
      }, 50);
    } else {
      // No existing connection, create normal connection if valid
      if (isValidConnection(selectedSourceNode.type, nodeType)) {
        const edge = {
          id: `edge-${selectedSourceNode.id}-${newNode.id}-${Date.now()}`,
          source: selectedSourceNode.id,
          target: newNode.id,
          sourceHandle: getSourceHandle(selectedSourceNode.type),
          targetHandle: getTargetHandle(nodeType),
          type: (layoutMode === 'vertical' || layoutMode === 'freeform') ? 'straight' : 'smoothstep',
          animated: true,
        };
        addEdge(edge);
        toast.success(`Connected ${selectedSourceNode.data.label} to ${nodeData.label}`);
      } else {
        toast.success(`Added ${nodeData.label} to workflow`);
      }
    }

    setShowModal(false);
    setSelectedSourceNode(null);
  };

  const isValidConnection = (sourceType: string, targetType: string): boolean => {
    if (sourceType === 'trigger' && targetType === 'action') return true;
    if (sourceType === 'action' && (targetType === 'condition' || targetType === 'action')) return true;
    if (sourceType === 'condition' && targetType === 'action') return true;
    return false;
  };

  const getSourceHandle = (nodeType: string): string => {
    const isVertical = layoutMode === 'vertical' || layoutMode === 'freeform';
    switch (nodeType) {
      case 'trigger': return isVertical ? 'output-right' : 'output-bottom';
      case 'action': return isVertical ? 'output-right' : 'output-bottom';
      case 'condition': return 'true';
      default: return isVertical ? 'output-right' : 'output-bottom';
    }
  };

  const getTargetHandle = (nodeType: string): string => {
    const isVertical = layoutMode === 'vertical' || layoutMode === 'freeform';
    switch (nodeType) {
      case 'action': return isVertical ? 'input-left-center' : 'input-top-center';
      case 'condition': return 'input';
      case 'split-condition': return 'input';
      default: return 'input';
    }
  };

  const getValidNodeTypes = useCallback((sourceNode: Node): string[] => {
    switch (sourceNode.type) {
      case 'trigger':
        return ['action'];
      case 'action':
        return ['action', 'condition', 'split-condition'];
      case 'condition':
        return ['action'];
      case 'split-condition':
        return ['action'];
      default:
        return [];
    }
  }, []);

  const openModal = useCallback((sourceNode: Node) => {
    setSelectedSourceNode(sourceNode);
    setShowModal(true);
  }, []);

  // Memoize nodes that should have plus buttons to avoid recalculating on every render
  const nodesWithPlusButtons = useMemo(() => {
    return nodes.filter(node => {
      const validTypes = getValidNodeTypes(node);
      if (validTypes.length === 0) return false;

      // Hide plus button for triggers that already have an action connection
      // (Triggers can only connect to ONE action)
      if (node.type === 'trigger') {
        const triggerHasAction = edges.find(
          (edge) =>
            edge.source === node.id &&
            nodes.find(n => n.id === edge.target)?.type === 'action'
        );
        if (triggerHasAction) return false;
      }

      // Action nodes can always show plus buttons (supports inline insertion)
      // Other node types can show plus buttons if they have valid connections
      return true;
    });
  }, [nodes, edges, getValidNodeTypes]);

  const getPlusButtonPosition = (node: Node) => {
    const isVertical = layoutMode === 'vertical' || layoutMode === 'freeform';
    const nodeWidth = 200; // Approximate node width
    const nodeHeight = 120; // Approximate node height

    // Calculate the position in flow coordinates (relative to node)
    // Vertical layout: plus button to the RIGHT of node
    // Horizontal layout: plus button BELOW the node
    const offsetX = isVertical ? nodeWidth + 20 : nodeWidth / 2;
    const offsetY = isVertical ? nodeHeight / 2 : nodeHeight + 20;

    // Apply viewport transformation: (position + offset) * zoom + viewport offset
    const screenX = (node.position.x + offsetX) * zoom + x;
    const screenY = (node.position.y + offsetY) * zoom + y;

    return {
      left: screenX,
      top: screenY,
    };
  };

  return (
    <>
      {/* Plus buttons for each node */}
      {nodesWithPlusButtons.map((node) => {
        const position = getPlusButtonPosition(node);

        return (
          <div
            key={`plus-${node.id}`}
            className="absolute z-50 pointer-events-auto"
            style={{
              left: position.left - 16, // Center the 32px button
              top: position.top - 16,
              transform: `scale(${Math.max(0.7, Math.min(1, zoom))})`, // More conservative scaling
            }}
          >
            <button
              onClick={() => openModal(node)}
              className="group relative w-8 h-8 bg-white border border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center hover:scale-105 hover:bg-blue-50"
              title="Add next node"
            >
              <Plus className="w-4 h-4 stroke-2" />

              {/* Subtle ring effect on hover */}
              <div className="absolute inset-0 rounded-full border-2 border-blue-500 opacity-0 group-hover:opacity-30 scale-110 group-hover:scale-125 transition-all duration-300"></div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap pointer-events-none shadow-lg">
                Add next node
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </button>
          </div>
        );
      })}

      {/* Node Selection Modal */}
      {showModal && selectedSourceNode && (
        <NodeSelectionModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedSourceNode(null);
          }}
          onSelectNode={handleAddNode}
          validNodeTypes={getValidNodeTypes(selectedSourceNode)}
          sourceNode={selectedSourceNode}
        />
      )}
    </>
  );
};
