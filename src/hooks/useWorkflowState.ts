
import { useState, useCallback } from 'react';
import { Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { LayoutMode } from '@/components/LayoutModeSelector';

export const useWorkflowState = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('My workflow');
  const [isActive, setIsActive] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isActive,
    setIsActive,
    layoutMode,
    setLayoutMode,
    reactFlowInstance,
    setReactFlowInstance,
    updateNodeData,
  };
};
