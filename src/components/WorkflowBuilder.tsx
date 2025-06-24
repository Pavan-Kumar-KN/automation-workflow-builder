
import React from 'react';

import { Sidebar } from './Sidebar';
import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { WorkflowCanvas } from './WorkflowCanvas';
import { WorkflowControls } from './WorkflowControls';
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';
import { useNodeOperations } from '@/hooks/useNodeOperations';
import { useLayoutModeHandler } from '@/hooks/useLayoutModeHandler';

export const WorkflowBuilder = () => {
  const {
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
  } = useWorkflowState();

  const { executeWorkflow, saveWorkflow } = useWorkflowActions({
    nodes,
    edges,
    workflowName,
    isActive,
    layoutMode,
  });

  const { onConnect, onDragOver, onDrop, onNodeClick } = useNodeOperations({
    nodes,
    setNodes,
    setEdges,
    setSelectedNode,
    layoutMode,
    reactFlowInstance,
  });

  const { handleLayoutModeChange } = useLayoutModeHandler({
    nodes,
    setNodes,
    setEdges,
    setLayoutMode,
    reactFlowInstance,
  });

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
        
        <WorkflowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onInit={setReactFlowInstance}
          layoutMode={layoutMode}
        />

        <WorkflowControls
          layoutMode={layoutMode}
          onLayoutModeChange={handleLayoutModeChange}
          nodes={nodes}
          setNodes={setNodes}
          reactFlowInstance={reactFlowInstance}
        />

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
