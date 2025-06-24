
import { useState, useRef } from 'react';
import { Node, Edge } from '@xyflow/react';

export type LayoutMode = 'horizontal' | 'vertical' | 'freeform';

export const useWorkflowState = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('My workflow');
  const [isActive, setIsActive] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  return {
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isActive,
    setIsActive,
    layoutMode,
    setLayoutMode,
    sidebarOpen,
    setSidebarOpen,
    reactFlowWrapper,
    reactFlowInstance,
    setReactFlowInstance,
  };
};
