
import { useCallback, useEffect, useState, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, Background, ReactFlow, BackgroundVariant, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ActionNode } from './nodes/ActionNode';
import FlowEdge from './edges/FlowEdge';
import { TriggerNode } from './nodes/TriggerNode';
import EndNode from './nodes/EndNode';
import ConditionNode from './nodes/ConditionNode';
import { useGraphStore } from '../store/useGraphStore';
import { graphToReactFlow } from '../lib/graphToReactFlow';
import ConditionEdge from './edges/ConditionEdge';
import PlaceholderNode from './nodes/PlaceHolderNode';
import { GhostNode } from './nodes/GhostNode';
import { getLayoutedElements } from '../utils/dagreFunction';
import { ArrowDown, ArrowRight, RotateCcw, Plus, Minus, Lock, Unlock } from 'lucide-react';
import StickyNoteNode from './nodes/StickyNoteNode';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

export const initializeGraph = () => {
  const triggerId = 'trigger-1';
  const endId = 'end-1';

  useGraphStore.getState().reset();

  useGraphStore.getState().addNode({
    id: triggerId,
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: {
      label: 'Select Trigger',
      isConfigured: false,
    },
    children: [endId],
    parent: undefined,
  });

  useGraphStore.getState().addNode({
    id: endId,
    type: 'endNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'End',
    },
    children: [],
    parent: triggerId,
  });

  console.log('Graph initialized with trigger and end nodes');
};

const nodeTypes = {
  action: ActionNode,
  trigger: TriggerNode,
  endNode: EndNode,
  condition: ConditionNode,
  placeholder: PlaceholderNode,
  ghost: GhostNode,
  stickyNote: StickyNoteNode
};

const edgeTypes = {
  flowEdge: FlowEdge,
  condition: ConditionEdge,
};

// Custom Controls Component
const CustomControls = ({
  onZoomIn,
  onZoomOut,
  onReset,
  onToggleLock,
  isLocked,
  layoutDirection,
  onLayoutChange
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onToggleLock: () => void;
  isLocked: boolean;
  layoutDirection: string;
  onLayoutChange: (direction: string) => void;
}) => {
  return (
    <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 p-2 bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Layout Direction Controls */}
      <button
        onClick={() => onLayoutChange('TB')}
        title="Vertical Layout"
        className={`p-2 rounded transition-all duration-200 ${layoutDirection === 'TB'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
      >
        <ArrowDown size={16} />
      </button>

      <button
        onClick={() => onLayoutChange('LR')}
        title="Horizontal Layout"
        className={`p-2 rounded transition-all duration-200 ${layoutDirection === 'LR'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
      >
        <ArrowRight size={16} />
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1" />

      {/* Zoom Controls */}
      <button
        onClick={onZoomIn}
        disabled={isLocked}
        title="Zoom In"
        className={`p-2 rounded transition-all duration-200 ${isLocked
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
      >
        <Plus size={16} />
      </button>

      <button
        onClick={onZoomOut}
        disabled={isLocked}
        title="Zoom Out"
        className={`p-2 rounded transition-all duration-200 ${isLocked
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
      >
        <Minus size={16} />
      </button>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-1" />

      {/* Lock/Unlock Control */}
      <button
        onClick={onToggleLock}
        title={isLocked ? "Unlock Controls" : "Lock Controls"}
        className={`p-2 rounded transition-all duration-200 ${isLocked
            ? 'bg-red-500 text-white shadow-md'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
      >
        {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
      </button>

      {/* Reset Control */}
      <button
        onClick={onReset}
        title="Reset View Position & Zoom"
        className="p-2 rounded transition-all duration-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
};

// Main Component Wrapper
const WorkFlowCanvasInner = ({ onNodeClick, openTriggerModal }: any) => {
  const reactFlowInstance = useReactFlow();
  const nodeMap = useGraphStore((state) => state.nodes);
  const addNode = useGraphStore((state) => state.addNode);
  const { setSelectedNode } = useWorkflowStore();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState('TB');
  const [isLocked, setIsLocked] = useState(false);
  const [draggedNodePositions, setDraggedNodePositions] = useState<Record<string, { x: number, y: number }>>({});


  // Update local state when store changes and apply Dagre layout
  useEffect(() => {
    try {
      const { stateNodes, stateEdges } = graphToReactFlow(nodeMap, openTriggerModal);

      const nodesInBranches = new Set();

      Object.values(nodeMap).forEach(node => {
        if (node.type === 'condition' && node.branches) {
          node.branches.yes?.forEach(id => nodesInBranches.add(id));
          node.branches.no?.forEach(id => nodesInBranches.add(id));
        }
      });

      const mainFlowNodes = stateNodes.filter(node =>
        node.type !== 'endNode' &&
        node.type !== 'placeholder' &&
        !nodesInBranches.has(node.id)
      );

      const lastMainFlowNode = mainFlowNodes.find(node => {
        const graphNode = nodeMap[node.id];
        return graphNode && (!graphNode.children || graphNode.children.length === 0 ||
          (graphNode.children.length === 1 && graphNode.children[0] === 'end-1'));
      });

      const shouldHideEndNode = lastMainFlowNode?.type === 'condition';
      const filteredNodes = shouldHideEndNode
        ? stateNodes.filter(node => node.id !== 'end-1')
        : stateNodes;

      const filteredEdges = shouldHideEndNode
        ? stateEdges.filter(edge => edge.target !== 'end-1')
        : stateEdges;


      // Separate sticky notes from workflow nodes for layout
      const workflowNodes = filteredNodes.filter(node => node.type !== 'stickyNote');
      const stickyNoteNodes = filteredNodes.filter(node => node.type === 'stickyNote');

      console.log('🔍 Workflow nodes for layout:', workflowNodes.length);
      console.log('🔍 Sticky notes (excluded from layout):', stickyNoteNodes.length);

      // Only layout workflow nodes, not sticky notes
      const { nodes: layoutedWorkflowNodes, edges: layoutedEdges } = getLayoutedElements(
        workflowNodes,
        filteredEdges,
        layoutDirection
      );

      // Combine layouted workflow nodes with unchanged sticky notes
      const layoutedNodes = [...layoutedWorkflowNodes, ...stickyNoteNodes];

      // Preserve positions of dragged sticky notes
      const finalNodes = layoutedNodes.map(node => {
        if (node.id.startsWith('sticky-') && draggedNodePositions[node.id]) {
          console.log('🔍 Preserving dragged position for:', node.id, draggedNodePositions[node.id]);
          return {
            ...node,
            position: draggedNodePositions[node.id]
          };
        }
        return node;
      });

      setNodes(finalNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error('Error in graphToReactFlow:', error);
    }
  }, [nodeMap, layoutDirection, draggedNodePositions]);

  const onNodesChange = useCallback((changes: any[]) => {
    console.log('Node changes:', changes);

    // Filter out position changes for non-draggable nodes
    const filteredChanges = changes.filter(change => {
      if (change.type === 'position') {
        // Allow position changes only for sticky notes
        if (change.id.startsWith('sticky-')) {
          console.log('✅ Allowing position change for sticky note:', change.id);
          return true;
        } else {
          console.log('❌ Blocking position change for workflow node:', change.id);
          return false;
        }
      }

      // Log selection changes for debugging
      if (change.type === 'select') {
        console.log('🔍 Selection change:', change.id, 'selected:', change.selected);
      }

      return true; // Allow all other changes (including selection)
    });

    // Apply changes to local state immediately (for smooth dragging)
    setNodes((nodesSnapshot) => applyNodeChanges(filteredChanges, nodesSnapshot));
  }, []);

  // Handle drag end to update graph store
  const onNodeDragStop = useCallback((event: any, node: any) => {
    console.log('🔍 Node drag stopped:', node.id, 'Position:', node.position);

    if (node.id.startsWith('sticky-')) {
      // Store the dragged position to preserve it during re-renders
      setDraggedNodePositions(prev => ({
        ...prev,
        [node.id]: node.position
      }));

      // Update the graph store with new position
      const { nodes, addNode } = useGraphStore.getState();
      const existingNode = nodes[node.id];
      if (existingNode) {
        console.log('🔍 Updating graph store with final position:', node.position);
        console.log('🔍 Previous position was:', existingNode.position);

        addNode({
          ...existingNode,
          position: node.position
        });

        console.log('🔍 Graph store updated successfully');
      }
    }
  }, []);

  const onEdgesChange = useCallback((changes: any[]) => {
    console.log('Edge changes:', changes);
    setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
  }, []);

  // Custom control handlers
  const handleZoomIn = () => {
    if (!isLocked) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (!isLocked) {
      reactFlowInstance.zoomOut();
    }
  };

  const handleReset = () => {
    // Reset to center position with appropriate zoom
    reactFlowInstance.fitView({
      padding: 0.1,
      includeHiddenNodes: false,
      minZoom: 0.5,
      maxZoom: 1.2,
    });
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
  };

  // Sticky note handling is now done externally

  return (
    <div className='flex-1 h-full overflow-auto'>
      <div className="h-full relative">
        <ReactFlow
          nodeTypes={nodeTypes as any}
          edgeTypes={edgeTypes as any}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStop={onNodeDragStop}
          nodesDraggable={true}
          nodesConnectable={false}
          noDragClassName="nodrag"
          onlyRenderVisibleElements={false}
          fitView
          fitViewOptions={{
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.5,
            maxZoom: 1.2,
          }}
          minZoom={0.25}
          maxZoom={2}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          panOnScroll={!isLocked}
          selectionOnDrag={false}
          panOnDrag={!isLocked}
          zoomOnPinch={!isLocked}
          zoomOnScroll={!isLocked}
          zoomOnDoubleClick={!isLocked}
          preventScrolling={false}
          deleteKeyCode={['Backspace', 'Delete']}
          multiSelectionKeyCode={['Meta', 'Ctrl']}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }} // Center position by default
        >
          {/* Sticky Note Panel is now handled externally */}

          {/* Custom Controls */}
          <CustomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
            onToggleLock={handleToggleLock}
            isLocked={isLocked}
            layoutDirection={layoutDirection}
            onLayoutChange={setLayoutDirection}
          />

          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#E2E8F0"
            style={{ opacity: 0.5 }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

interface WorkFlowCanvasProps {
  onNodeClick?: (event: React.MouseEvent, node: any) => void;
  openTriggerModal?: () => void;
}

const WorkFlowCanvas = ({ onNodeClick, openTriggerModal }: WorkFlowCanvasProps) => {
  useEffect(() => {
    initializeGraph();
  }, []);

  return (
    <ReactFlowProvider>
      <WorkFlowCanvasInner
        onNodeClick={onNodeClick}
        openTriggerModal={openTriggerModal}
      />
    </ReactFlowProvider>
  );
};

export default WorkFlowCanvas;