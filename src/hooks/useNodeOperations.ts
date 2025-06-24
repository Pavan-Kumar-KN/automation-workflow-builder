
import { useCallback } from 'react';
import { Node, useNodesState, useEdgesState } from '@xyflow/react';
import { useMediaQuery } from './useMediaQuery';
import { LayoutMode } from './useWorkflowState';
import { toast } from 'sonner';

const initialNodes: Node[] = [];
const initialEdges: any[] = [];

export const useNodeOperations = (layoutMode: LayoutMode) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const getSmartPosition = useCallback((type: string, existingNodes: Node[]) => {
    if (existingNodes.length === 0) {
      return isMobile ? { x: 50, y: 50 } : { x: 250, y: 100 };
    }

    // For freeform mode, use a simple offset approach
    if (layoutMode === 'freeform') {
      const lastNode = existingNodes[existingNodes.length - 1];
      return {
        x: lastNode.position.x + (isMobile ? 50 : 100),
        y: lastNode.position.y + (isMobile ? 50 : 100),
      };
    }

    const triggers = existingNodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = existingNodes.filter(n => n.type === 'action');
    const conditions = existingNodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    const horizontalSpacing = isMobile ? 200 : isTablet ? 300 : 350;
    const verticalSpacing = isMobile ? 150 : 200;
    const columnSpacing = isMobile ? 180 : isTablet ? 220 : 280;

    if (layoutMode === 'horizontal') {
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 30, y: 50 + triggers.length * verticalSpacing };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: horizontalSpacing, y: 50 + conditions.length * (verticalSpacing + 20) };
      } else {
        return { x: horizontalSpacing * 2, y: 50 + actions.length * verticalSpacing };
      }
    } else {
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 100 + triggers.length * columnSpacing, y: 30 };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: 100 + conditions.length * columnSpacing, y: isMobile ? 250 : 350 };
      } else {
        return { x: 100 + actions.length * columnSpacing, y: isMobile ? 450 : 650 };
      }
    }
  }, [layoutMode, isMobile, isTablet]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const autoArrangeNodes = useCallback(() => {
    if (nodes.length === 0) return;

    // Skip auto-arrangement for freeform mode
    if (layoutMode === 'freeform') {
      toast.info('Auto-arrange is not available in Free Form mode. Nodes can be positioned manually.');
      return;
    }

    const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = nodes.filter(n => n.type === 'action');
    const conditions = nodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    const horizontalSpacing = isMobile ? 200 : isTablet ? 300 : 350;
    const verticalSpacing = isMobile ? 150 : 200;
    const columnSpacing = isMobile ? 180 : isTablet ? 220 : 280;

    const arrangedNodes = nodes.map((node) => {
      let newPosition = { ...node.position };

      if (layoutMode === 'horizontal') {
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
      } else if (layoutMode === 'vertical') {
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
        data: { ...node.data, layoutMode: layoutMode },
      };
    });

    setNodes(arrangedNodes);
    toast.success(`Nodes auto-arranged in ${layoutMode} layout!`);
  }, [nodes, setNodes, layoutMode, isMobile, isTablet]);

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    getSmartPosition,
    updateNodeData,
    autoArrangeNodes,
  };
};
