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
import { PlusButton } from './PlusButton';
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

    console.log('🔄 ReactFlow Nodes:', nodes);
    console.log('🔄 Should show end node:', shouldShowEndNode);
    console.log('🔄 Has condition nodes:', hasConditionNodes);
    return nodes;
  }, [workflowNodes, selectedNodeId, onOpenTriggerModal, onReplaceTrigger, onOpenTriggerConfig, onDeleteNode]);

  // Use edges from WorkflowBuilder   
  const reactFlowEdges = useMemo(() => {
    console.log('the edge data from :', workflowEdges);
    return workflowEdges;
  }, [workflowEdges]);

  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(reactFlowNodes, reactFlowEdges);

  const [nodes, setNodes] = useNodesState(layoutedNodes);
  const [edges, setEdges] = useEdgesState(layoutedEdges);

  // Internal node addition handler (migrated from WorkflowBuilder)
  const handleNodeAddition = useCallback((nodeType: string, nodeData: NodeData) => {
    const isConditionNode = nodeType === 'condition';
    const newNodeId = `${nodeType}-${Date.now()}`;

    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: {
        ...nodeData,
        label: nodeData.label,
        openTriggerModal: nodeType === 'trigger' ? onOpenTriggerModal : undefined,
        isConfigured: false,
      },
    };

    setNodes((prevNodes) => {
      const updatedNodes = [...prevNodes, newNode];

      if (isConditionNode) {
        const yesPlaceholder = {
          id: `placeholder-yes-${Date.now()}`,
          type: 'placeholder',
          position: { x: 100, y: 400 },
          width: 100,
          height: 60,
          data: {
            label: 'Add Action',
            isConfigured: false,
            branchType: 'yes' as const,
            conditionNodeId: newNodeId,
            onAddAction: () => {
              console.log('Yes placeholder clicked');
              onOpenActionModal();
            }
          }
        };

        const noPlaceholder = {
          id: `placeholder-no-${Date.now()}`,
          type: 'placeholder',
          position: { x: 500, y: 400 },
          width: 100,
          height: 60,
          data: {
            label: 'Add Action',
            isConfigured: false,
            branchType: 'no' as const,
            conditionNodeId: newNodeId,
            onAddAction: () => {
              console.log('No placeholder clicked');
              onOpenActionModal();
            }
          }
        };

        updatedNodes.push(yesPlaceholder, noPlaceholder);

        // Create condition edges
        const yesEdge = {
          id: `e-yes-${yesPlaceholder.id}`,
          source: newNode.id,
          sourceHandle: 'yes',
          target: yesPlaceholder.id,
          label: "Yes",
          type: "condition",
        };

        const noEdge = {
          id: `e-no-${noPlaceholder.id}`,
          source: newNode.id,
          sourceHandle: 'no',
          target: noPlaceholder.id,
          label: "No",
          type: "condition",
        };

        setEdges((eds) => [...eds, yesEdge, noEdge]);
      }

      // Apply layout to updated nodes and edges
      setTimeout(() => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, workflowEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      }, 0);

      return updatedNodes;
    });
  }, [setNodes, setEdges, onOpenTriggerModal, onOpenActionModal, workflowEdges]);

  // Update nodes when props change
  useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update edges when props change
  useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  // Handle node clicks with dynamic branching (migrated from FlowBuilder reference)
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log("The clicked on node is:", node);

    if (node.type === "condition") {
      let idCounter = Date.now(); // Simple counter for unique IDs
      const yesId = `n${idCounter++}`;
      const noId = `n${idCounter++}`;

      const yesNode = {
        id: yesId,
        position: { x: 0, y: 0 }, // Temporary position, will be calculated by layout
        data: { label: "Yes Branch" },
        type: "action", // Use action type for branches
        width: 360,
        height: 100,
      };

      const noNode = {
        id: noId,
        position: { x: 0, y: 0 }, // Temporary position, will be calculated by layout
        data: { label: "No Branch" },
        type: "action", // Use action type for branches
        width: 360,
        height: 100,
      };

      const newEdges = [
        {
          id: `e-${node.id}-${yesId}`,
          source: node.id,
          target: yesId,
          label: "Yes",
          type: "condition",
        },
        {
          id: `e-${node.id}-${noId}`,
          source: node.id,
          target: noId,
          label: "No",
          type: "condition",
        },
      ];

      // Update nodes and edges with proper layout (exact pattern from reference)
      setNodes((currentNodes) => {
        const updatedNodes = [...currentNodes, yesNode, noNode];
        setEdges((currentEdges) => {
          const updatedEdges = [...currentEdges, ...newEdges];

          // Apply layout to all nodes and edges
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges);

          // Update with layouted positions
          setTimeout(() => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          }, 0);

          return updatedEdges;
        });

        return updatedNodes;
      });

    } else if (node.type === "trigger" || node.type === "action" || node.type === "default") {
      let idCounter = Date.now();
      const newId = `n${idCounter++}`;
      const newNode = {
        id: newId,
        position: { x: 0, y: 0 }, // Temporary position, will be calculated by layout
        data: { label: "Next Node" },
        type: "condition",
        width: 360,
        height: 100,
      };

      const newEdge = {
        id: `e-${node.id}-${newId}`,
        source: node.id,
        target: newId,
        type: "condition",
      };

      // Update nodes and edges with proper layout (exact pattern from reference)
      setNodes((currentNodes) => {
        const updatedNodes = [...currentNodes, newNode];
        setEdges((currentEdges) => {
          const updatedEdges = [...currentEdges, newEdge];

          // Apply layout to all nodes and edges
          const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(updatedNodes, updatedEdges);

          // Update with layouted positions
          setTimeout(() => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          }, 0);

          return updatedEdges;
        });

        return updatedNodes;
      });
    }

    // Call original onNodeClick for other functionality
    const workflowNode = workflowNodes.find(n => n.id === node.id);
    if (workflowNode && onNodeClick) {
      onNodeClick(event, workflowNode);
    }
  }, [workflowNodes, onNodeClick, setNodes, setEdges]);

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
        transformOrigin: 'center top',
        padding: '50px',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        
          // defaultViewport={{ x: 600, y: 10, zoom: 1 }}
        >
          <Background color="#ccc" variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </div>
    </div>
  );
};