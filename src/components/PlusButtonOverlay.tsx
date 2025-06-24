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
  const { layoutMode, addNode, addEdge, edges } = useWorkflowStore();
  const { x, y, zoom } = useViewport();

  const handleAddNode = (nodeType: string, nodeData: any) => {
    if (!selectedSourceNode) return;

    // Calculate position for new node
    const sourcePosition = selectedSourceNode.position;
    const isVertical = layoutMode === 'vertical';
    
    const newPosition = {
      x: isVertical ? sourcePosition.x : sourcePosition.x + 300,
      y: isVertical ? sourcePosition.y + 200 : sourcePosition.y,
    };
    
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

    // Auto-connect to the source node if it's a valid connection
    if (isValidConnection(selectedSourceNode.type, nodeType)) {
      // CONSTRAINT: Check if trigger already has an action connection
      if (selectedSourceNode.type === 'trigger' && nodeType === 'action') {
        const triggerHasAction = edges.find(
          (edge) =>
            edge.source === selectedSourceNode.id &&
            nodes.find(node => node.id === edge.target)?.type === 'action'
        );

        if (triggerHasAction) {
          const connectedAction = nodes.find(node => node.id === triggerHasAction.target);
          toast.error(
            `This trigger is already connected to "${connectedAction?.data.label || 'an action'}". ` +
            'Each trigger can only connect to ONE action. Disconnect the existing connection first.',
            { duration: 5000 }
          );
          return; // Don't create the node or connection
        }
      }

      const edge = {
        id: `edge-${selectedSourceNode.id}-${newNode.id}`,
        source: selectedSourceNode.id,
        target: newNode.id,
        sourceHandle: getSourceHandle(selectedSourceNode.type),
        targetHandle: getTargetHandle(nodeType),
        type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
        animated: true,
      };
      addEdge(edge);
      toast.success(`Connected ${selectedSourceNode.data.label} to ${nodeData.label}`);
    } else {
      toast.success(`Added ${nodeData.label} to workflow`);
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
    switch (nodeType) {
      case 'trigger': return 'primary-output';
      case 'action': return 'output-right';
      case 'condition': return 'true';
      default: return 'primary-output';
    }
  };

  const getTargetHandle = (nodeType: string): string => {
    switch (nodeType) {
      case 'action': return 'input-left-center';
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
      if (node.type === 'trigger') {
        const triggerHasAction = edges.find(
          (edge) =>
            edge.source === node.id &&
            nodes.find(n => n.id === edge.target)?.type === 'action'
        );
        if (triggerHasAction) return false;
      }

      return true;
    });
  }, [nodes, edges, getValidNodeTypes]);

  const getPlusButtonPosition = (node: Node) => {
    const isVertical = layoutMode === 'vertical';
    const nodeWidth = 200; // Approximate node width
    const nodeHeight = 120; // Approximate node height

    // Calculate the position in flow coordinates (relative to node)
    const offsetX = isVertical ? nodeWidth / 2 : nodeWidth + 20;
    const offsetY = isVertical ? nodeHeight + 20 : nodeHeight / 2;

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
