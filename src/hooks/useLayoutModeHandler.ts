import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { LayoutMode } from '@/components/LayoutModeSelector';

interface UseLayoutModeHandlerProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  reactFlowInstance: any;
}

export const useLayoutModeHandler = ({
  nodes,
  setNodes,
  setEdges,
  setLayoutMode,
  reactFlowInstance,
}: UseLayoutModeHandlerProps) => {
  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    toast.success(`Layout mode changed to ${mode.charAt(0).toUpperCase() + mode.slice(1)}!`);
    
    // Update all nodes with the new layout mode and update edge types
    setNodes((nds) => 
      nds.map((node) => ({
        ...node,
        data: { ...node.data, layoutMode: mode },
      }))
    );

    // Update all edges to use appropriate type for the layout
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: mode === 'vertical' ? 'straight' : 'smoothstep',
      }))
    );
    
    // Auto-arrange nodes when layout mode changes for better UX
    setTimeout(() => {
      if (nodes.length > 0) {
        const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
        const actions = nodes.filter(n => n.type === 'action');
        const conditions = nodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

        const arrangedNodes = nodes.map((node) => {
          let newPosition = { ...node.position };

          if (mode === 'horizontal') {
            // Horizontal arrangement: left to right flow
            if (triggers.includes(node)) {
              const triggerIndex = triggers.indexOf(node);
              newPosition = { x: 50, y: 100 + triggerIndex * 200 };
            } else if (conditions.includes(node)) {
              const conditionIndex = conditions.indexOf(node);
              newPosition = { x: 400, y: 100 + conditionIndex * 220 };
            } else if (actions.includes(node)) {
              const actionIndex = actions.indexOf(node);
              newPosition = { x: 750, y: 100 + actionIndex * 200 };
            }
          } else if (mode === 'vertical') {
            // Vertical arrangement: top to bottom flow
            if (triggers.includes(node)) {
              const triggerIndex = triggers.indexOf(node);
              newPosition = { x: 200 + triggerIndex * 280, y: 50 };
            } else if (conditions.includes(node)) {
              const conditionIndex = conditions.indexOf(node);
              newPosition = { x: 200 + conditionIndex * 280, y: 350 };
            } else if (actions.includes(node)) {
              const actionIndex = actions.indexOf(node);
              newPosition = { x: 200 + actionIndex * 280, y: 650 };
            }
          }

          return { 
            ...node, 
            position: newPosition,
            data: { ...node.data, layoutMode: mode },
          };
        });

        setNodes(arrangedNodes);
        
        // Fit view after layout change
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 50, duration: 800 });
          }
        }, 100);
      }
    }, 100);
  }, [nodes, setNodes, setEdges, setLayoutMode, reactFlowInstance]);

  return {
    handleLayoutModeChange,
  };
};
