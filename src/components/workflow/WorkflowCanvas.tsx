
import React, { useCallback } from 'react';
import {
  ReactFlow,
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
import { GotoNode } from '../nodes/GotoNode';
import { EndNode } from '../nodes/EndNode';
import { Plus } from 'lucide-react';
// import { PlusButtonOverlay } from '../PlusButtonOverlay'; // Now using embedded plus buttons
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LayoutMode } from '@/hooks/useWorkflowState';
import { JSONDebugPanel } from '../JSONDebugPanel';

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  // 'split-condition': SplitNode,
  'add-trigger': AddTriggerNode,
  // 'goto-node': GotoNode,
  end: EndNode,
};

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: any;
  onEdgesChange: any;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onInit: (instance: any) => void;
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  onConnect: (params: Connection) => void;
  openNodeModal: (sourceNode: Node) => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onInit,
  reactFlowWrapper,
  onConnect,
  openNodeModal,
}) => {

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50" ref={reactFlowWrapper}>
      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <button
              onClick={() => openNodeModal({ id: 'empty-state', type: 'trigger', position: { x: 0, y: 0 }, data: {} })}
              className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center group shadow-sm hover:shadow-md"
              title="Add your first step"
            >
              <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
            </button>
            <p className="text-sm text-gray-500 mt-3">Click to add your first step</p>
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes.map(node => ({ ...node, data: { ...node.data, openNodeModal } }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onInit={onInit}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        connectOnClick={false}
        deleteKeyCode={['Backspace', 'Delete']}
        nodesDraggable={false}
        nodesConnectable={true}
        elementsSelectable={true}
        className="bg-gray-50"
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#6366f1' },
          type: 'smoothstep',
          animated: false,
        }}
        snapToGrid={false}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        minZoom={0.5}
        maxZoom={1.5}
        fitView
      >
        {/* Clean minimal background */}
        <Background
          gap={20}
          size={1}
          color="#f3f4f6"
          variant="dots"
        />
      </ReactFlow>
    </div>
  );
};
