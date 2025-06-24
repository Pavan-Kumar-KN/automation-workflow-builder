
import { useCallback } from 'react';
import { Node, addEdge, Connection, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { LayoutMode } from '@/components/LayoutModeSelector';

interface UseNodeOperationsProps {
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: Node | null) => void;
  layoutMode: LayoutMode;
  reactFlowInstance: any;
}

export const useNodeOperations = ({
  nodes,
  setNodes,
  setEdges,
  setSelectedNode,
  layoutMode,
  reactFlowInstance,
}: UseNodeOperationsProps) => {
  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
        animated: true,
        source: params.source!,
        target: params.target!,
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success('Nodes connected successfully!');
    },
    [setEdges, layoutMode]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Enhanced smart positioning logic based on layout mode
  const getSmartPosition = useCallback((type: string, existingNodes: Node[]) => {
    if (existingNodes.length === 0) {
      return { x: 250, y: 100 };
    }

    if (layoutMode === 'freeform') {
      // For freeform, use basic positioning with some randomness
      const rightmostX = Math.max(...existingNodes.map(n => n.position.x + 220));
      const bottommostY = Math.max(...existingNodes.map(n => n.position.y));
      return { x: rightmostX + 50, y: bottommostY - 50 + Math.random() * 100 };
    }

    // Calculate positions based on layout mode
    const triggers = existingNodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = existingNodes.filter(n => n.type === 'action');
    const conditions = existingNodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    if (layoutMode === 'horizontal') {
      // Horizontal layout: flows left to right in columns
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 50, y: 100 + triggers.length * 200 };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: 400, y: 100 + conditions.length * 220 };
      } else {
        return { x: 750, y: 100 + actions.length * 200 };
      }
    } else {
      // Vertical layout: flows top to bottom in rows
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 200 + triggers.length * 280, y: 50 };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: 200 + conditions.length * 280, y: 350 };
      } else {
        return { x: 200 + actions.length * 280, y: 650 };
      }
    }
  }, [layoutMode]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance) return;

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeData = JSON.parse(event.dataTransfer.getData('application/nodedata'));

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Use smart positioning for organized layouts, screen position for freeform
      const finalPosition = layoutMode === 'freeform' 
        ? position 
        : getSmartPosition(type, nodes);

      // Handle special case for "Add New Trigger" node
      if (nodeData.id === 'add-new-trigger') {
        const newNode: Node = {
          id: `add-trigger-${Date.now()}`,
          type: 'add-trigger',
          position: finalPosition,
          data: {
            ...nodeData,
            label: nodeData.label,
            layoutMode,
          },
        };
        setNodes((nds) => nds.concat(newNode));
        toast.success(`${nodeData.label} placeholder added! Click to convert to a trigger.`);
        return;
      }

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position: finalPosition,
        data: {
          ...nodeData,
          label: nodeData.label,
          layoutMode,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`${nodeData.label} node added to workflow!`);
    },
    [reactFlowInstance, setNodes, nodes, layoutMode, getSmartPosition]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Special handling for add-trigger nodes - convert them to regular trigger nodes
    if (node.type === 'add-trigger') {
      const updatedNode: Node = {
        ...node,
        type: 'trigger',
        data: {
          ...node.data,
          label: 'New Trigger',
          description: 'Configure this trigger',
          layoutMode,
        },
      };
      
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? updatedNode : n))
      );
      
      setSelectedNode(updatedNode);
      toast.success('Add Trigger converted to Trigger node!');
      return;
    }
    
    setSelectedNode(node);
  }, [setNodes, layoutMode, setSelectedNode]);

  return {
    onConnect,
    onDragOver,
    onDrop,
    onNodeClick,
    getSmartPosition,
  };
};
