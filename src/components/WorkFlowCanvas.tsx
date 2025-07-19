import { useCallback, useEffect, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges, Background, Controls, ReactFlow, BackgroundVariant, ControlButton, ReactFlowProvider } from '@xyflow/react';
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
import { ArrowDown, ArrowRight, RotateCcw } from 'lucide-react';

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
};

const edgeTypes = {
  flowEdge: FlowEdge,
  condition: ConditionEdge,
};

const WorkFlowCanvas = () => {
  const nodeMap = useGraphStore((state) => state.nodes);
  const addNode = useGraphStore((state) => state.addNode);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showActionModal, setShowActionModal] = useState(false);
  const [layoutDirection, setLayoutDirection] = useState('TB');

  useEffect(() => {
    initializeGraph();
  }, []);

  // Simple node addition function
  const handleAddNode = useCallback((nodeData: any) => {
    const newNodeId = `action-${Date.now()}`;

    // Find the trigger node to connect after it
    const triggerNode = Object.values(nodeMap).find(node => node.type === 'trigger');
    const endNode = Object.values(nodeMap).find(node => node.type === 'endNode');

    if (triggerNode && endNode) {
      // Add the new action node
      addNode({
        id: newNodeId,
        type: 'action',
        position: { x: 0, y: 0 }, // Between trigger and end
        data: {
          label: nodeData.label || 'New Action',
          isConfigured: false,
        },
        children: [endNode.id],
        parent: triggerNode.id,
      });

      // Update trigger to point to new node instead of end
      const updatedTrigger = {
        ...triggerNode,
        children: [newNodeId]
      };

      // Update the trigger node
      useGraphStore.getState().removeNode(triggerNode.id);
      addNode(updatedTrigger);
    }

    setShowActionModal(false);
  }, [nodeMap, addNode]);

  // Update local state when store changes and apply Dagre layout
  useEffect(() => {
    try {
      const { stateNodes, stateEdges } = graphToReactFlow(nodeMap);

      // Find the last node in the main flow (not in branches)
      // Look for nodes that are not in any condition branch
      const nodesInBranches = new Set();
      Object.values(nodeMap).forEach(node => {
        if (node.type === 'condition' && node.branches) {
          node.branches.yes?.forEach(id => nodesInBranches.add(id));
          node.branches.no?.forEach(id => nodesInBranches.add(id));
        }
      });

      // Find the last node in main flow (has no children and not in branches)
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

      console.log('🔍 Last main flow node:', lastMainFlowNode?.type, lastMainFlowNode?.id);

      const shouldHideEndNode = lastMainFlowNode?.type === 'condition';
      console.log('🔍 Should hide end node:', shouldHideEndNode);

      const filteredNodes = shouldHideEndNode
        ? stateNodes.filter(node => node.id !== 'end-1')
        : stateNodes;

      const filteredEdges = shouldHideEndNode
        ? stateEdges.filter(edge => edge.target !== 'end-1')
        : stateEdges;

      // Apply Dagre layout
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        filteredNodes,
        filteredEdges,
        layoutDirection // Use state variable for layout direction
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error('Error in graphToReactFlow:', error);
    }
  }, [nodeMap, layoutDirection]);

  const onNodesChange = useCallback((changes: any[]) => {
    console.log('Node changes:', changes);
    setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
  }, []);

  const onEdgesChange = useCallback((changes: any[]) => {
    console.log('Edge changes:', changes);
    setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot));
  }, []);

  const handleReset = () => {
    // Reset to top-aligned viewport with proper positioning
    const reactFlowInstance = document.querySelector('.react-flow__renderer');
    if (reactFlowInstance) {
      // Set viewport to show nodes at the top
      const event = new CustomEvent('reactflow-reset', {
        detail: { x: 0, y: -200, zoom: 0.75 }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <>
      <ReactFlowProvider>
        <div className='flex-1 h-full overflow-auto'>
          <div className="h-full">
            <ReactFlow
              nodeTypes={nodeTypes as any}
              edgeTypes={edgeTypes as any}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodesDraggable={false}
              fitView
              fitViewOptions={{
                padding: 0.1, // Reduced padding for top alignment
                includeHiddenNodes: false,
                minZoom: 0.5,
                maxZoom: 1.2,
                position: [0.5, 0.2] // Position nodes towards top center (x: center, y: top 20%)
              }}
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
              defaultViewport={{ x: 100, y: -200, zoom: 0.75 }} // Shift viewport up to show nodes at top
            >
              <Controls 
                className="react-flow-controls-custom"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  padding: '4px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(0, 0, 0, 0.05)'
                }}
              >
                {/* Layout Direction Controls */}
                <ControlButton
                  onClick={() => setLayoutDirection('TB')}
                  title="Vertical Layout"
                  style={{
                    backgroundColor: layoutDirection === 'TB' ? '#3B82F6' : 'rgba(255, 255, 255, 0.95)',
                    color: layoutDirection === 'TB' ? 'white' : '#374151',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '6px',
                    transition: 'all 0.2s ease',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <ArrowDown size={14} />
                </ControlButton>
                
                <ControlButton
                  onClick={() => setLayoutDirection('LR')}
                  title="Horizontal Layout"
                  style={{
                    backgroundColor: layoutDirection === 'LR' ? '#3B82F6' : 'rgba(255, 255, 255, 0.95)',
                    color: layoutDirection === 'LR' ? 'white' : '#374151',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '6px',
                    transition: 'all 0.2s ease',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <ArrowRight size={14} />
                </ControlButton>

                {/* Reset Control */}
                <ControlButton 
                  onClick={handleReset} 
                  title="Reset View Position & Zoom"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    color: '#374151',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '4px',
                    padding: '6px',
                    transition: 'all 0.2s ease',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  <RotateCcw size={14} />
                </ControlButton>
              </Controls>

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
      </ReactFlowProvider>

      <style jsx global>{`
        .react-flow-controls-custom button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .react-flow-controls-custom button:active {
          transform: translateY(0px);
        }
        
        /* Custom scrollbar for the canvas */
        .react-flow__renderer {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
        }
        
        .react-flow__renderer::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        .react-flow__renderer::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .react-flow__renderer::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        
        .react-flow__renderer::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </>
  );
};

export default WorkFlowCanvas;