
import React, { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  ConnectionMode,
  Node,
  Edge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from '../nodes/TriggerNode';
import { ActionNode } from '../nodes/ActionNode';
import { ConditionNode } from '../nodes/ConditionNode';
import { SplitNode } from '../nodes/SplitNode';
import { AddTriggerNode } from '../nodes/AddTriggerNode';
import { toast } from 'sonner';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LayoutMode } from '@/hooks/useWorkflowState';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  'split-condition': SplitNode,
  'add-trigger': AddTriggerNode,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onInit: (instance: any) => void;
  layoutMode: LayoutMode;
  sidebarOpen: boolean;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  onConnect: (params: Connection) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onDrop,
  onDragOver,
  onInit,
  layoutMode,
  sidebarOpen,
  reactFlowWrapper,
  onConnect,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
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
        onInit={onInit}
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
        panOnDrag={!isMobile || !sidebarOpen}
        zoomOnScroll={!isMobile}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={2}
      >
        <Background 
          gap={layoutMode === 'freeform' ? 15 : layoutMode === 'vertical' ? 40 : 20} 
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
    </div>
  );
};
