
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
import { Menu, X } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Media queries for responsive design
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

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

  // Enhanced smart positioning logic based on layout mode and device size
  const getSmartPosition = (type: string, existingNodes: Node[]) => {
    if (existingNodes.length === 0) {
      return isMobile ? { x: 50, y: 50 } : { x: 250, y: 100 };
    }

    if (layoutMode === 'freeform') {
      const rightmostX = Math.max(...existingNodes.map(n => n.position.x + (isMobile ? 180 : 220)));
      const bottommostY = Math.max(...existingNodes.map(n => n.position.y));
      return { 
        x: rightmostX + (isMobile ? 30 : 50), 
        y: bottommostY - (isMobile ? 30 : 50) + Math.random() * (isMobile ? 50 : 100) 
      };
    }

    const triggers = existingNodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = existingNodes.filter(n => n.type === 'action');
    const conditions = existingNodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    // Adjust spacing based on device size
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
      // Vertical layout
      if (type === 'trigger' || type === 'add-trigger') {
        return { x: 100 + triggers.length * columnSpacing, y: 30 };
      } else if (type === 'condition' || type === 'split-condition') {
        return { x: 100 + conditions.length * columnSpacing, y: isMobile ? 250 : 350 };
      } else {
        return { x: 100 + actions.length * columnSpacing, y: isMobile ? 450 : 650 };
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

      const finalPosition = layoutMode === 'freeform' 
        ? position 
        : getSmartPosition(type, nodes);

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
        // Auto-close sidebar on mobile after adding node
        if (isMobile) {
          setSidebarOpen(false);
        }
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
      
      // Auto-close sidebar on mobile after adding node
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [reactFlowInstance, setNodes, nodes, layoutMode, isMobile]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
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
  }, [setNodes, layoutMode]);

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  const autoArrangeNodes = useCallback(() => {
    if (nodes.length === 0) return;

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
    
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: isMobile ? 20 : 50, duration: 800 });
      }
    }, 100);
    
    toast.success(`Nodes auto-arranged in ${layoutMode} layout!`);
  }, [nodes, setNodes, layoutMode, reactFlowInstance, isMobile, isTablet]);

  const handleLayoutModeChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    toast.success(`Layout mode changed to ${mode.charAt(0).toUpperCase() + mode.slice(1)}!`);
    
    setNodes((nds) => 
      nds.map((node) => ({
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

  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first!');
      return;
    }

    toast.success('Workflow execution started!');
    console.log('Executing workflow with nodes:', nodes);
    console.log('Workflow edges:', edges);
    
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
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar toggle button */}
        {isMobile && (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 z-20 bg-white shadow-lg md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        )}

        {/* Sidebar - responsive behavior */}
        <div className={`
          ${isMobile 
            ? `absolute inset-y-0 left-0 z-10 transform transition-transform duration-300 ease-in-out
               ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative'
          }
          ${isMobile ? 'w-80' : 'w-64 lg:w-80'}
        `}>
          <Sidebar />
        </div>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-5"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
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
              type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
            }}
            snapToGrid={layoutMode !== 'freeform'}
            snapGrid={layoutMode === 'vertical' ? [40, 40] : [20, 20]}
            // Touch-friendly settings
            panOnDrag={!isMobile || !sidebarOpen}
            zoomOnScroll={!isMobile}
            zoomOnPinch={true}
            zoomOnDoubleClick={false}
            minZoom={0.1}
            maxZoom={2}
          >
            <Background 
              gap={layoutMode === 'vertical' ? 40 : 20} 
              size={1} 
              color="#e5e7eb" 
            />
            <Controls 
              className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
                isMobile ? 'scale-110' : ''
              }`}
              showZoom={true}
              showFitView={true}
              showInteractive={true}
              position={isMobile ? 'bottom-left' : 'bottom-right'}
            />
            <MiniMap
              className={`bg-white border border-gray-200 rounded-lg shadow-sm ${
                isMobile ? 'w-24 h-16' : 'w-32 h-20'
              }`}
              position={isMobile ? 'top-right' : 'bottom-left'}
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
          
          {/* Layout controls - responsive positioning */}
          <div className={`absolute z-10 flex items-center gap-2 ${
            isMobile 
              ? 'top-16 right-4 flex-col'
              : 'top-4 right-4 flex-row gap-3'
          }`}>
            <LayoutModeSelector
              layoutMode={layoutMode}
              onLayoutModeChange={handleLayoutModeChange}
            />
            <Button
              onClick={autoArrangeNodes}
              className={`bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-colors flex items-center gap-2 ${
                isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
              }`}
              disabled={nodes.length === 0}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {!isMobile && 'Auto Arrange'}
            </Button>
          </div>
        </div>

        {/* Node config panel - responsive */}
        {selectedNode && (
          <div className={`
            ${isMobile 
              ? 'absolute inset-x-0 bottom-0 h-1/2 z-20' 
              : 'relative w-80 lg:w-96'
            }
          `}>
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onUpdate={updateNodeData}
            />
          </div>
        )}
      </div>
    </div>
  );
};
