
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Node, Edge } from '@xyflow/react';
import { GraphNode } from '@/store/useGraphStore';

interface WorkflowState {
  // Core workflow state
  selectedNode: GraphNode | null;
  workflowName: string;
  isActive: boolean;
  layoutDirection: 'TB' | 'LR'; // Added layout direction

  // These states are used to store the copied/cut node and edges
  copiedNodes: Node[];
  copiedEdges: Edge[];
  isCopy: boolean;

  // Cut and paste state
  cutNodes: Node[];
  cutEdges: Edge[];
  isCut: boolean;

  // Nodes and edges
  nodes: Node[];
  edges: Edge[];

  // Actions for core state
  setSelectedNode: (node: GraphNode | null) => void;
  setWorkflowName: (name: string) => void;
  setIsActive: (active: boolean) => void;
  setLayoutDirection: (direction: 'TB' | 'LR') => void; // Added setter

  // Actions for the copy and paste functionality
  setCopiedNodes: (nodes: Node[]) => void;
  setCopiedEdges: (edges: Edge[]) => void;
  setIsCopy: (isCopy: boolean) => void;

  // Actions for the cut and paste functionality
  setCutNodes: (nodes: Node[]) => void;
  setCutEdges: (edges: Edge[]) => void;
  setIsCut: (isCut: boolean) => void;

  // Force reset copy/cut state
  forceResetCopyState: () => void;
  forceResetCutState: () => void;

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
        layoutDirection: 'TB', // Default to vertical layout
        nodes: [],
        edges: [],

        // Copy and paste states
        copiedNodes: [],
        copiedEdges: [],
        isCopy: false,

        // Cut and paste states
        cutNodes: [],
        cutEdges: [],
        isCut: false,

        // Core state actions
        setSelectedNode: (node) => set({ selectedNode: node }, false, 'setSelectedNode'),
        setWorkflowName: (name) => set({ workflowName: name }, false, 'setWorkflowName'),
        setIsActive: (active) => set({ isActive: active }, false, 'setIsActive'),
        setLayoutDirection: (direction) => set({ layoutDirection: direction }, false, 'setLayoutDirection'),


        // Copy and paste actions
        setCopiedNodes: (nodes) => set({ copiedNodes: nodes }, false, 'setCopiedNodes'),
        setCopiedEdges: (edges) => set({ copiedEdges: edges }, false, 'setCopiedEdges'),
        setIsCopy: (isCopy) => set({ isCopy: isCopy }, false, 'setIsCopy'),

        // Cut and paste actions
        setCutNodes: (nodes) => set({ cutNodes: nodes }, false, 'setCutNodes'),
        setCutEdges: (edges) => set({ cutEdges: edges }, false, 'setCutEdges'),
        setIsCut: (isCut) => set({ isCut: isCut }, false, 'setIsCut'),

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

        // Force reset copy/cut state
        forceResetCopyState: () => set({
          isCopy: false,
          copiedNodes: [],
          copiedEdges: []
        }, false, 'forceResetCopyState'),

        forceResetCutState: () => set({
          isCut: false,
          cutNodes: [],
          cutEdges: []
        }, false, 'forceResetCutState'),
      }),
      {
        name: 'workflow-storage',
        partialize: (state) => ({
          workflowName: state.workflowName,
          isActive: state.isActive,
          layoutDirection: state.layoutDirection, // Persist layout direction
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
