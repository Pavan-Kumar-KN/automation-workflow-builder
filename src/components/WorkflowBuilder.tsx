
import React, { useCallback } from 'react';
import { Node, Connection } from '@xyflow/react';
import { Menu, X } from 'lucide-react';

import { Sidebar } from './Sidebar';
import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowCanvas } from './workflow/WorkflowCanvas';
import { WorkflowControls } from './workflow/WorkflowControls';
import { ConnectionRulesHelp } from './ConnectionRulesHelp';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWorkflowStore, useReactFlowWrapper, LayoutMode } from '@/hooks/useWorkflowState';
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
    reactFlowInstance,
    setReactFlowInstance,
    nodes,
    edges,
    setNodes,
    setEdges,
  } = useWorkflowStore();

  const reactFlowWrapper = useReactFlowWrapper();

  const {
    onNodesChange,
    onEdgesChange,
    getSmartPosition,
    updateNodeData,
    autoArrangeNodes,
  } = useNodeOperations();



  const { executeWorkflow, saveWorkflow } = useWorkflowActions();

  const { handleLayoutModeChange } = useLayoutModeHandler();

  const isMobile = useMediaQuery('(max-width: 768px)');

  const onConnect = useCallback(
    (params: Connection) => {
      // Validate connection parameters
      if (!params.source || !params.target) {
        toast.error('Invalid connection parameters');
        return;
      }

      // Get source and target nodes to check their types
      const sourceNode = nodes.find(node => node.id === params.source);
      const targetNode = nodes.find(node => node.id === params.target);

      if (!sourceNode || !targetNode) {
        toast.error('Source or target node not found');
        return;
      }

      // Check if connection already exists between the same source handle and target handle
      const existingConnection = edges.find(
        (edge) =>
          edge.source === params.source &&
          edge.target === params.target &&
          edge.sourceHandle === params.sourceHandle &&
          edge.targetHandle === params.targetHandle
      );

      if (existingConnection) {
        toast.warning('Connection already exists between these handles');
        return;
      }

      // CONSTRAINT: One trigger can only connect to ONE action
      if (sourceNode.type === 'trigger' && targetNode.type === 'action') {
        // Check if this trigger already has an action connection
        const triggerHasAction = edges.find(
          (edge) =>
            edge.source === params.source &&
            nodes.find(node => node.id === edge.target)?.type === 'action'
        );

        if (triggerHasAction) {
          const connectedAction = nodes.find(node => node.id === triggerHasAction.target);
          toast.error(
            `This trigger is already connected to "${connectedAction?.data.label || 'an action'}". ` +
            'Each trigger can only connect to ONE action. Disconnect the existing connection first.',
            { duration: 5000 }
          );
          return;
        }
      }

      // CONSTRAINT: Prevent trigger-to-trigger connections
      if (sourceNode.type === 'trigger' && targetNode.type === 'trigger') {
        toast.error('Triggers cannot connect directly to other triggers');
        return;
      }

      // CONSTRAINT: Prevent action-to-trigger connections (actions should lead to conditions or other actions)
      if (sourceNode.type === 'action' && targetNode.type === 'trigger') {
        toast.error('Actions cannot connect back to triggers');
        return;
      }

      // Create unique edge ID including handle IDs for better tracking
      const edgeId = `edge-${params.source}-${params.sourceHandle || 'default'}-${params.target}-${params.targetHandle || 'default'}`;

      const edge = {
        ...params,
        id: edgeId,
        type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
        animated: true,
        source: params.source!,
        target: params.target!,
        sourceHandle: params.sourceHandle || null,
        targetHandle: params.targetHandle || null,
      };

      setEdges((eds) => [...eds, edge]);

      // Success message based on connection type
      if (sourceNode.type === 'trigger' && targetNode.type === 'action') {
        toast.success(`Trigger "${sourceNode.data.label}" connected to action "${targetNode.data.label}"`);
      } else {
        toast.success('Nodes connected successfully!');
      }
    },
    [setEdges, layoutMode, edges, nodes]
  );

  const onLayoutModeChangeWrapper = useCallback((mode: LayoutMode) => {
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

        {/* Connection Rules Help */}
        <ConnectionRulesHelp />
      </div>
    </div>
  );
};
