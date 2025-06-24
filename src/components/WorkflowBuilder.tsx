
import React, { useCallback } from 'react';
import { Node, Connection, addEdge } from '@xyflow/react';
import { Menu, X } from 'lucide-react';

import { Sidebar } from './Sidebar';
import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowCanvas } from './workflow/WorkflowCanvas';
import { WorkflowControls } from './workflow/WorkflowControls';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useNodeOperations } from '@/hooks/useNodeOperations';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';
import { useLayoutModeHandler } from '@/hooks/useLayoutModeHandler';
import { toast } from 'sonner';

export const WorkflowBuilder = () => {
  const {
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
  } = useWorkflowState();

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    getSmartPosition,
    updateNodeData,
    autoArrangeNodes,
  } = useNodeOperations(layoutMode);

  const { executeWorkflow, saveWorkflow } = useWorkflowActions(
    workflowName,
    nodes,
    edges,
    isActive,
    layoutMode
  );

  const { handleLayoutModeChange } = useLayoutModeHandler(
    nodes,
    setNodes,
    setEdges,
    reactFlowInstance
  );

  const isMobile = useMediaQuery('(max-width: 768px)');

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
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

  const onLayoutModeChangeWrapper = useCallback((mode: any) => {
    setLayoutMode(mode);
    handleLayoutModeChange(mode);
  }, [setLayoutMode, handleLayoutModeChange]);

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

      const finalPosition = getSmartPosition(type, nodes);

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
      
      if (isMobile) {
        setSidebarOpen(false);
      }
    },
    [reactFlowInstance, setNodes, nodes, layoutMode, isMobile, getSmartPosition, setSidebarOpen]
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
  }, [setNodes, layoutMode, setSelectedNode]);

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

        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 z-5"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          layoutMode={layoutMode}
          sidebarOpen={sidebarOpen}
          reactFlowWrapper={reactFlowWrapper}
          onConnect={onConnect}
        />
        
        <WorkflowControls
          layoutMode={layoutMode}
          onLayoutModeChange={onLayoutModeChangeWrapper}
          autoArrangeNodes={autoArrangeNodes}
          nodes={nodes}
        />

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
