
import { useCallback } from 'react';
import { useMediaQuery } from './useMediaQuery';
import { useWorkflowStore, LayoutMode } from './useWorkflowState';
import { toast } from 'sonner';

export const useLayoutModeHandler = () => {
  const {
    nodes,
    setNodes,
    setEdges,
    reactFlowInstance,
  } = useWorkflowStore();

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    toast.success(`Layout mode changed to ${mode === 'freeform' ? 'Free Form' : mode.charAt(0).toUpperCase() + mode.slice(1)}!`);
    
    setNodes(
      nodes.map((node) => ({
        ...node,
        data: { ...node.data, layoutMode: mode },
      }))
    );

    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: mode === 'vertical' ? 'straight' : 'smoothstep',
      }))
    );
    
    // Skip auto-arrangement for freeform mode
    if (mode === 'freeform') {
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: isMobile ? 20 : 50, duration: 800 });
        }
      }, 100);
      return;
    }
    
    setTimeout(() => {
      if (nodes.length > 0) {
        const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
        const actions = nodes.filter(n => n.type === 'action');
        const conditions = nodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

        const horizontalSpacing = isMobile ? 200 : isTablet ? 300 : 350;
        const verticalSpacing = isMobile ? 150 : 200;
        const columnSpacing = isMobile ? 180 : isTablet ? 220 : 280;

        const arrangedNodes = nodes.map((node) => {
          let newPosition = { ...node.position };

          if (mode === 'horizontal') {
            if (triggers.includes(node)) {
              const triggerIndex = triggers.indexOf(node);
              newPosition = { x: 30, y: 50 + triggerIndex * verticalSpacing };
            } else if (conditions.includes(node)) {
              const conditionIndex = conditions.indexOf(node);
              newPosition = { x: horizontalSpacing, y: 50 + conditionIndex * (verticalSpacing + 20) };
            } else if (actions.includes(node)) {
              const actionIndex = actions.indexOf(node);
              newPosition = { x: horizontalSpacing * 2, y: 50 + actionIndex * verticalSpacing };
            }
          } else if (mode === 'vertical') {
            if (triggers.includes(node)) {
              const triggerIndex = triggers.indexOf(node);
              newPosition = { x: 100 + triggerIndex * columnSpacing, y: 30 };
            } else if (conditions.includes(node)) {
              const conditionIndex = conditions.indexOf(node);
              newPosition = { x: 100 + conditionIndex * columnSpacing, y: isMobile ? 250 : 350 };
            } else if (actions.includes(node)) {
              const actionIndex = actions.indexOf(node);
              newPosition = { x: 100 + actionIndex * columnSpacing, y: isMobile ? 450 : 650 };
            }
          }

          return { 
            ...node, 
            position: newPosition,
            data: { ...node.data, layoutMode: mode },
          };
        });

        setNodes(arrangedNodes);
        
        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: isMobile ? 20 : 50, duration: 800 });
          }
        }, 100);
      }
    }, 100);
  }, [nodes, setNodes, setEdges, reactFlowInstance, isMobile, isTablet]);

  return { handleLayoutModeChange };
};
