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
import FlowEdge from './edges/FlowEdge';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { NodeData } from '@/data/nodeData';
import EndNode from './nodes/EndNode';
import { getLayoutedElements } from '@/utils/dagreFunction';
import ConditionEdge from './edges/ConditionEdge';
import PlaceHolderNode from './canvas/PlaceHolderNode';

interface SimpleWorkflowCanvasProps {
  nodes: Node[];
  edges?: Edge[]; // Add edges prop
  selectedNodeId?: string;
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onOpenTriggerModal: () => void;
  onOpenActionModal: (insertIndex?: number) => void;
  onInsertNode?: (afterNodeIndex: number, nodeType: string, nodeData: NodeData) => void;
  onDeleteNode?: (nodeId: string | number) => void;
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
  placeholder: PlaceHolderNode,
  end: EndNode
};

const edgeTypes = {
  flowEdge: FlowEdge,
  condition: ConditionEdge,
};

export const WorkFlowCanvas: React.FC<SimpleWorkflowCanvasProps> = ({
  nodes: workflowNodes,
  edges: workflowEdges, // Add edges prop with default empty array
  selectedNodeId,
  onSelectNode,
  onNodeClick,
  onOpenTriggerModal,
  onOpenActionModal,
  onInsertNode,
  onDeleteNode,
  onReplaceTrigger,
  onOpenTriggerConfig,
  zoomLevel = 100,
}) => {

  // Convert workflow nodes to React Flow format and apply layout
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
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
          style: { display: 'none' },
          position: { x: 0, y: 0 }, // Temporary position for layout
        };
      }

      return {
        id: node.id,
        type: node.type,
        position: { x: 0, y: 0 }, // Temporary position, will be set by layout
        data: {
          ...node.data,
          openTriggerModal: node.type === 'trigger' ? onOpenTriggerModal : undefined,
          onReplaceTrigger: node.type === 'trigger' ? onReplaceTrigger : undefined,
          onOpenConfig: node.type === 'trigger' ? onOpenTriggerConfig : undefined,
          // Use the unified delete function for all nodes
          onDelete: onDeleteNode ? () => onDeleteNode(node.id) : undefined,
        },
        selected: node.id === selectedNodeId,
      };
    });

    // Apply dagre layout to all nodes and edges
    const { nodes: finalNodes, edges: finalEdges } = getLayoutedElements(nodes, workflowEdges || []);

    return { layoutedNodes: finalNodes, layoutedEdges: finalEdges };
  }, [workflowNodes, workflowEdges, selectedNodeId, onOpenTriggerModal, onReplaceTrigger, onOpenTriggerConfig, onDeleteNode]);

  const [nodes, setNodes] = useNodesState(layoutedNodes);
  const [edges, setEdges] = useEdgesState(layoutedEdges);


  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const workflowNode = workflowNodes.find(n => n.id === node.id);
    if (workflowNode && onNodeClick) {
      onNodeClick(event, workflowNode);
    }
  }, [workflowNodes, onNodeClick]);

  // Update nodes when layout changes
  useEffect(() => {
    setNodes(layoutedNodes);
  }, [layoutedNodes, setNodes]);

  // Update edges when layout changes
  useEffect(() => {
    setEdges(layoutedEdges);
  }, [layoutedEdges, setEdges]);


  return (
    <div className="flex-1 h-full overflow-auto">
      <div style={{
        backgroundColor: '#f8fafc',
        height: '100%',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}


        defaultViewport={{ x: 500, y: 10, zoom: 1 }}
        >
          <Background variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
    </div>
  );
};