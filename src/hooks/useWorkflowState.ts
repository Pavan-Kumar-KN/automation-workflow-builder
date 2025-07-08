
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';

interface WorkflowState {
  // Core workflow state
  selectedNode: Node | null;
  workflowName: string;
  isActive: boolean;

  // Nodes and edges
  nodes: Node[];
  edges: Edge[];

  // Actions for core state
  setSelectedNode: (node: Node | null) => void;
  setWorkflowName: (name: string) => void;
  setIsActive: (active: boolean) => void;

  // Actions for nodes and edges
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;



  // Utility actions
  clearWorkflow: () => void;
  resetUI: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        selectedNode: null,
        workflowName: 'My workflow',
        isActive: false,
        nodes: [],
        edges: [],

        // Core state actions
        setSelectedNode: (node) => set({ selectedNode: node }, false, 'setSelectedNode'),
        setWorkflowName: (name) => set({ workflowName: name }, false, 'setWorkflowName'),
        setIsActive: (active) => set({ isActive: active }, false, 'setIsActive'),

        // Nodes and edges actions
        setNodes: (nodes) => set((state) => ({
          nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes
        }), false, 'setNodes'),

        setEdges: (edges) => set((state) => ({
          edges: typeof edges === 'function' ? edges(state.edges) : edges
        }), false, 'setEdges'),

        addNode: (node) => set((state) => ({
          nodes: [...state.nodes, node]
        }), false, 'addNode'),

        updateNode: (nodeId, data) => set((state) => ({
          nodes: state.nodes.map(node =>
            node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
          ),
          // Update selected node if it's the one being updated
          selectedNode: state.selectedNode?.id === nodeId
            ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...data } }
            : state.selectedNode
        }), false, 'updateNode'),

        removeNode: (nodeId) => set((state) => ({
          nodes: state.nodes.filter(node => node.id !== nodeId),
          edges: state.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
          selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
        }), false, 'removeNode'),

        addEdge: (edge) => set((state) => ({
          edges: [...state.edges, edge]
        }), false, 'addEdge'),

        removeEdge: (edgeId) => set((state) => ({
          edges: state.edges.filter(edge => edge.id !== edgeId)
        }), false, 'removeEdge'),



        // Utility actions
        clearWorkflow: () => set({
          nodes: [],
          edges: [],
          selectedNode: null,
          workflowName: 'My workflow',
          isActive: false
        }, false, 'clearWorkflow'),

        resetUI: () => set({
          selectedNode: null,
        }, false, 'resetUI'),
      }),
      {
        name: 'workflow-storage',
        partialize: (state) => ({
          workflowName: state.workflowName,
          isActive: state.isActive,
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    ),
    { name: 'workflow-store' }
  )
);

// Legacy hook for backward compatibility during migration
export const useWorkflowState = () => {
  const store = useWorkflowStore();
  return store;
};
