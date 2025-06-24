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

      // Handle special case for "Add New Trigger" node
      if (nodeData.id === 'add-new-trigger') {
        const newNode: Node = {
          id: `add-trigger-${Date.now()}`,
          type: 'add-trigger',
          position,
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
        position,
        data: {
          ...nodeData,
          label: nodeData.label,
        },
      };

      setNodes((nds) => nds.concat(newNode));
      toast.success(`${nodeData.label} node added to workflow!`);
    },
    [reactFlowInstance, setNodes]
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
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('workflow', JSON.stringify(workflowData));
    toast.success('Workflow saved successfully!');
  }, [workflowName, nodes, edges, isActive]);

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
          >
            <Background gap={20} size={1} color="#e5e7eb" />
            <Controls className="bg-white border border-gray-200 rounded-lg shadow-sm" />
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
