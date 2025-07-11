import React, { useCallback, useMemo, useEffect } from 'react';
import {
  Background,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  Edge,
  ConnectionMode,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ConditionNode from './nodes/ConditionNode';
import PlaceholderNode from './nodes/PlaceholderNode';
import SimpleConditionPlaceholder from './nodes/SimpleConditionPlaceholder';
import { PlusButton } from './PlusButton';
import FlowEdge from './edges/FlowEdge';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { NodeData } from '@/data/nodeData';
import EndNode from './nodes/EndNode';
import { getLayoutedElements } from '@/utils/dagreFunction';
import ConditionEdge from './edges/ConditionEdge';

interface SimpleWorkflowCanvasProps {
  nodes: Node[];
  edges?: Edge[]; // Add edges prop
  selectedNodeId?: string;
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onOpenTriggerModal: () => void;
  onOpenActionModal: (insertIndex?: number) => void;
  onInsertNode?: (afterNodeIndex: number, nodeType: string, nodeData: NodeData) => void;
  onDeleteNode?: (nodeIndex: number) => void;
  onReplaceTrigger?: () => void;
  onOpenTriggerConfig?: (node: Node) => void;
  // Removed complex branch handlers - simplified approach
  zoomLevel?: number;
}


// Custom Edge that uses your FlowEdge component
const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  placeholder: SimpleConditionPlaceholder, // Use the simple placeholder
  end: EndNode
};

const edgeTypes = {
  flowEdge: FlowEdge,
  condition: ConditionEdge,
};

export const SimpleWorkflowCanvas: React.FC<SimpleWorkflowCanvasProps> = ({
  nodes: workflowNodes,
  edges: workflowEdges, // Add edges prop with default empty array
  selectedNodeId,
  onSelectNode,
  onNodeClick,
  onOpenTriggerModal,
  onOpenActionModal,
  onDeleteNode,
  onReplaceTrigger,
  onOpenTriggerConfig,
  zoomLevel = 100,
}) => {

  // Convert workflow nodes to React Flow format - SIMPLE VERSION
  const reactFlowNodes = useMemo(() => {

    // Hide end node if there are any condition nodes in the workflow
    const hasConditionNodes = workflowNodes.some(node => node.type === 'condition');
    const shouldShowEndNode = !hasConditionNodes;

    // Convert existing nodes
    const nodes = workflowNodes.map((node, index) => {
      // Hide end node if last node is condition
      if (node.id === 'virtual-end' && !shouldShowEndNode) {
        return {
          ...node,
          hidden: true,
          style: { display: 'none' }
        };
      }

      return {
        id: node.id,
        type: node.type,
        position: { x: 100, y: 50 + (index * 200) },
        data: {
          ...node.data,
          openTriggerModal: node.type === 'trigger' ? onOpenTriggerModal : undefined,
          onReplaceTrigger: node.type === 'trigger' ? onReplaceTrigger : undefined,
          onOpenConfig: node.type === 'trigger' ? onOpenTriggerConfig : undefined,
          onDelete: node.type === 'action' ? () => {
            console.log('🔍 Delete handler called for index:', index, 'onDeleteNode:', onDeleteNode);
            if (onDeleteNode) {
              onDeleteNode(index);
            } else {
              console.error('❌ onDeleteNode is not available in SimpleWorkflowCanvas');
            }
          } : undefined,
        },
        selected: node.id === selectedNodeId,
      };
    });

    return nodes;
  }, [workflowNodes, selectedNodeId, onOpenTriggerModal, onReplaceTrigger, onOpenTriggerConfig, onDeleteNode]);

  // Use edges from WorkflowBuilder
  const reactFlowEdges = useMemo(() => {
    console.log('🔍 Converting workflow edges:', workflowEdges.map(e => ({ id: e.id, source: e.source, target: e.target, type: e.type })));
    return workflowEdges;
  }, [workflowEdges]);

  // Only apply layout when both nodes and edges are consistent
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    // Validate that all edges reference existing nodes
    const nodeIds = new Set(reactFlowNodes.map(n => n.id));
    const invalidEdges = reactFlowEdges.filter(edge =>
      !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
    );

    if (invalidEdges.length > 0) {
      console.log('🚨 Skipping layout due to invalid edges:', invalidEdges.map(e => `${e.source} -> ${e.target}`));
      console.log('🔍 Available nodes:', Array.from(nodeIds));
      return { nodes: reactFlowNodes, edges: reactFlowEdges };
    }

    console.log('✅ All edges valid, applying layout...');
    return getLayoutedElements(reactFlowNodes, reactFlowEdges);
  }, [reactFlowNodes, reactFlowEdges]);

  const [nodes, setNodes] = useNodesState(layoutedNodes);
  const [edges, setEdges] = useEdgesState(layoutedEdges);

  // Update nodes when props change
  useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update edges when props change
  useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  // Handle node clicks
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const workflowNode = workflowNodes.find(n => n.id === node.id);
    if (workflowNode && onNodeClick) {
      onNodeClick(event, workflowNode);
    }
  }, [workflowNodes, onNodeClick]);

  const onConnect = useCallback(() => { }, []);

  // Empty state fallback
  if (workflowNodes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}>
        <div className="text-center">
          <PlusButton onSelectNode={onSelectNode} validNodeTypes={['trigger']} position="center" />
          <p className="text-sm text-gray-500 mt-4">Click to add your first step</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-auto">
      <div style={{
        backgroundColor: '#f8fafc',
        backgroundImage: `radial-gradient(circle, #cbd5e1 1px, transparent 1px)`,
        backgroundSize: '20px 20px',
        height: '100%',
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'center top',
        padding: '50px',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={() => { }}
          onEdgesChange={() => { }}
          onNodeClick={handleNodeClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionMode={ConnectionMode.Loose}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={true}
          panOnScroll={true}
          fitView={false}
          defaultViewport={{ x: 600, y: 10, zoom: 1 }}
        >
          <Background color="#ccc" variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
    </div>
  );
};
