import React, { useCallback, useMemo, useEffect } from 'react';
import {
  Background,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
  Edge,
  BackgroundVariant,
  Controls,
  ReactFlowProvider,
  ControlButton,
  useReactFlow
} from '@xyflow/react';
import { RotateCcw } from 'lucide-react';
import '@xyflow/react/dist/style.css';
import ConditionNode from './nodes/ConditionNode';
import FlowEdge from './edges/FlowEdge';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { NodeData } from '@/data/types';
import EndNode from './nodes/EndNode';
import { GhostNode } from './nodes/GhostNode';
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
  ghost: GhostNode,
  end: EndNode
};

const edgeTypes = {
  flowEdge: FlowEdge,
  condition: ConditionEdge,
};

// Internal component that uses ReactFlow hooks
const WorkFlowCanvasInternal: React.FC<SimpleWorkflowCanvasProps> = ({
  nodes: workflowNodes,
  edges: workflowEdges,
  selectedNodeId,
  onNodeClick,
  onOpenTriggerModal,
  onDeleteNode,
  onReplaceTrigger,
  onOpenTriggerConfig,

}) => {
  const { fitView, zoomIn, zoomOut, setCenter } = useReactFlow();

  // Custom reset function - Reset view position and zoom only
  const handleReset = useCallback(() => {
    // Reset view to default position and zoom
    setCenter(500, 100, { zoom: 1 });
    // Also trigger fit view to properly position all nodes
    setTimeout(() => {
      fitView({ padding: 0.1, duration: 500 });
    }, 100);
  }, [setCenter, fitView]);

  // Convert workflow nodes to React Flow format and apply layout
  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    // Hide end node if there are any condition nodes in the workflow
    const hasConditionNodes = workflowNodes.some(node => node.type === 'condition');
    const shouldShowEndNode = !hasConditionNodes;

    // Convert existing nodes
    const nodes = workflowNodes.map((node) => {
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


  // console.log("The present nodes are : " , nodes);
  // console.log("The present edges are : " , edges);


  nodes.forEach((item, index) => {
    console.log("The node index is : ", index);
    console.log("The node data is the ", item)
  })



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
          nodeTypes={nodeTypes as any}
          edgeTypes={edgeTypes as any}
          minZoom={0.25}
          maxZoom={2}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          panOnScroll={true}
          selectionOnDrag={false}
          panOnDrag={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          preventScrolling={false}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Meta', 'Ctrl']}
          // style={{ backgroundColor: '#f8fafc', width: '100%', height: '100%' }}
          defaultViewport={{ x: 500, y: 70, zoom: 1 }}

        >
          <Controls
            position="bottom-left"
            showZoom={true}
            showFitView={true}
            showInteractive={true}
            fitViewOptions={{
              padding: 0.1,
              includeHiddenNodes: false,
              minZoom: 0.5,
              maxZoom: 2
            }}
          >
            <ControlButton onClick={handleReset} title="Reset View Position & Zoom">
              <RotateCcw size={16} />
            </ControlButton>
          </Controls>
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            color="#cbd5e1"
          />
        </ReactFlow>
      </div>
    </div>

  
  );
};

// Main exported component with ReactFlowProvider
export const WorkFlowCanvas: React.FC<SimpleWorkflowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <WorkFlowCanvasInternal {...props} />
    </ReactFlowProvider>
  );
};