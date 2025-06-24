import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Sidebar } from './Sidebar';
import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { LayoutModeSelector, LayoutMode } from './LayoutModeSelector';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { SplitNode } from './nodes/SplitNode';
import { AddTriggerNode } from './nodes/AddTriggerNode';
import { toast } from 'sonner';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  'split-condition': SplitNode,
  'add-trigger': AddTriggerNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export const WorkflowBuilder = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState('My workflow');
  const [isActive, setIsActive] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('horizontal');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        source: params.source!,
        target: params.target!,
      };
      setEdges((eds) => addEdge(edge, eds));
      toast.success('Nodes connected successfully!');
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Enhanced smart positioning logic based on layout mode
  const getSmartPosition = (type: string, existingNodes: Node[]) => {
    if (existingNodes.length === 0) {
      return { x: 250, y: 100 };
    }

    if (layoutMode === 'freeform') {
      // For freeform, use basic positioning
      const rightmostX = Math.max(...existingNodes.map(n => n.position.x + 200));
      const bottommostY = Math.max(...existingNodes.map(n => n.position.y));
      return { x: rightmostX + 50, y: bottommostY - 50 };
    }

    // Calculate positions based on layout mode
    const triggers = existingNodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = existingNodes.filter(n => n.type === 'action');
    const conditions = existingNodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    if (layoutMode === 'horizontal') {
      // Horizontal layout: flows left to right
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 50, y: 100 + triggers.length * 180 };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: 400, y: 100 + conditions.length * 200 };
      } else {
        const row = Math.floor(actions.length / 2);
        const col = actions.length % 2;
        return { x: 750 + col * 220, y: 100 + row * 180 };
      }
    } else {
      // Vertical layout: flows top to bottom
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 100 + triggers.length * 250, y: 50 };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: 100 + conditions.length * 250, y: 300 };
      } else {
        const col = Math.floor(actions.length / 2);
        const row = actions.length % 2;
        return { x: 100 + col * 250, y: 550 + row * 150 };
      }
    }
  };

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

      // Use smart positioning based on layout mode, unless explicitly dropped in a specific position
      const finalPosition = layoutMode === 'freeform' || (event.clientX > 100 && event.clientY > 100)
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
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`${nodeData.label} node added to workflow!`);
    },
    [reactFlowInstance, setNodes, nodes, layoutMode]
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
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  // Enhanced auto-arrange nodes based on layout mode
  const autoArrangeNodes = useCallback(() => {
    if (nodes.length === 0) return;

    const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = nodes.filter(n => n.type === 'action');
    const conditions = nodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    const arrangedNodes = nodes.map((node) => {
      let newPosition = { ...node.position };

      if (layoutMode === 'horizontal') {
        // Horizontal arrangement
        if (triggers.includes(node)) {
          const triggerIndex = triggers.indexOf(node);
          newPosition = { x: 50, y: 100 + triggerIndex * 180 };
        } else if (conditions.includes(node)) {
          const conditionIndex = conditions.indexOf(node);
          newPosition = { x: 400, y: 100 + conditionIndex * 200 };
        } else if (actions.includes(node)) {
          const actionIndex = actions.indexOf(node);
          const row = Math.floor(actionIndex / 2);
          const col = actionIndex % 2;
          newPosition = { x: 750 + col * 220, y: 100 + row * 180 };
        }
      } else if (layoutMode === 'vertical') {
        // Vertical arrangement
        if (triggers.includes(node)) {
          const triggerIndex = triggers.indexOf(node);
          newPosition = { x: 100 + triggerIndex * 250, y: 50 };
        } else if (conditions.includes(node)) {
          const conditionIndex = conditions.indexOf(node);
          newPosition = { x: 100 + conditionIndex * 250, y: 300 };
        } else if (actions.includes(node)) {
          const actionIndex = actions.indexOf(node);
          const col = Math.floor(actionIndex / 2);
          const row = actionIndex % 2;
          newPosition = { x: 100 + col * 250, y: 550 + row * 150 };
        }
      }
      // For freeform, keep existing positions

      return { ...node, position: newPosition };
    });

    setNodes(arrangedNodes);
    toast.success(`Nodes auto-arranged in ${layoutMode} layout!`);
  }, [nodes, setNodes, layoutMode]);

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    toast.success(`Layout mode changed to ${mode.charAt(0).toUpperCase() + mode.slice(1)}!`);
  }, []);

  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first!');
      return;
    }

    toast.success('Workflow execution started!');
    console.log('Executing workflow with nodes:', nodes);
    console.log('Workflow edges:', edges);
    
    // Simulate workflow execution
    setTimeout(() => {
      toast.success('Workflow completed successfully! ✨');
    }, 2000);
  }, [nodes, edges]);

  const saveWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
      isActive,
      layoutMode,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('workflow', JSON.stringify(workflowData));
    toast.success('Workflow saved successfully!');
  }, [workflowName, nodes, edges, isActive, layoutMode]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <WorkflowHeader
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        isActive={isActive}
        setIsActive={setIsActive}
        onSave={saveWorkflow}
        onExecute={executeWorkflow}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 relative overflow-hidden" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            fitView
            className="bg-gray-100"
            defaultEdgeOptions={{
              style: { strokeWidth: 2, stroke: '#6366f1' },
              type: 'smoothstep',
            }}
            snapToGrid={layoutMode !== 'freeform'}
            snapGrid={[20, 20]}
          >
            <Background gap={20} size={1} color="#e5e7eb" />
            <Controls 
              className="bg-white border border-gray-200 rounded-lg shadow-sm" 
              showZoom={true}
              showFitView={true}
              showInteractive={true}
            />
            <MiniMap
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
              nodeColor={(node) => {
                switch (node.type) {
                  case 'trigger': return '#ef4444';
                  case 'action': return '#3b82f6';
                  case 'condition': return '#f59e0b';
                  case 'split-condition': return '#f59e0b';
                  case 'add-trigger': return '#3b82f6';
                  default: return '#6b7280';
                }
              }}
            />
          </ReactFlow>
          
          {/* Layout controls */}
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <LayoutModeSelector
              layoutMode={layoutMode}
              onLayoutModeChange={handleLayoutModeChange}
            />
            <button
              onClick={autoArrangeNodes}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
              disabled={nodes.length === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Auto Arrange
            </button>
          </div>
        </div>

        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onClose={() => setSelectedNode(null)}
            onUpdate={updateNodeData}
          />
        )}
      </div>
    </div>
  );
};
