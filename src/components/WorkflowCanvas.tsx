
import React, { useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  ConnectionMode,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { ConditionNode } from './nodes/ConditionNode';
import { SplitNode } from './nodes/SplitNode';
import { AddTriggerNode } from './nodes/AddTriggerNode';
import { LayoutMode } from './LayoutModeSelector';

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
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onInit: (instance: any) => void;
  layoutMode: LayoutMode;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDrop,
  onDragOver,
  onInit,
  layoutMode,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

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
      >
        <Background 
          gap={layoutMode === 'vertical' ? 40 : 20} 
          size={1} 
          color="#e5e7eb" 
        />
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
    </div>
  );
};
