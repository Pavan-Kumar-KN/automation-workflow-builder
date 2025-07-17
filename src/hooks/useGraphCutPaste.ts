import { useCallback } from 'react';
import { useWorkflowStore } from './useWorkflowState';
import { useWorkflowGraph } from './useWorkflowGraph';
import { toast } from 'sonner';

/**
 * Graph-based cut-paste hook that replaces the old array-based approach
 */
export const useGraphCutPaste = (openActionModal?: (insertIndex?: number) => void) => {
  const {
    nodes,
    edges,
    isCut,
    setIsCut,
    cutNodes,
    cutEdges,
    setCutNodes,
    setCutEdges,
    forceResetCutState
  } = useWorkflowStore();

  const { cutNode, cutFlowFromNode, pasteNodes } = useWorkflowGraph();

  /**
   * Cut a single node using graph-based approach
   */
  const cutSingleNode = useCallback((nodeId: string) => {
    console.log('Graph-based cut single node:', nodeId);
    
    const result = cutNode(nodeId);
    
    // Store cut data in global state
    setCutNodes(result.cutNodes);
    setCutEdges(result.cutEdges);
    setIsCut(true);
    
    toast.success('Node cut to clipboard');
  }, [cutNode, setCutNodes, setCutEdges, setIsCut]);

  /**
   * Cut entire flow from a node using graph-based approach
   */
  const cutFlow = useCallback((nodeId: string) => {
    console.log('✂️ Graph-based cut flow from node:', nodeId);
    
    const result = cutFlowFromNode(nodeId);
    
    // Store cut data in global state
    setCutNodes(result.cutNodes);
    setCutEdges(result.cutEdges);
    setIsCut(true);
    
    toast.success('Flow cut to clipboard');
  }, [cutFlowFromNode, setCutNodes, setCutEdges, setIsCut]);

  /**
   * Paste cut nodes using graph-based approach
   */
  const pasteCutFlow = useCallback((
    insertIndex: number,
    aboveNodeId: string,
    belowNodeId: string
  ) => {
    console.log('✂️ Graph-based paste cut flow:', {
      insertIndex,
      aboveNodeId,
      belowNodeId,
      cutNodesCount: cutNodes.length
    });

    if (!isCut || cutNodes.length === 0) {
      console.log('❌ No cut data to paste');
      return;
    }

    // Use the graph-based paste method
    pasteNodes(cutNodes, cutEdges, aboveNodeId, openActionModal);

    // Clear cut state
    forceResetCutState();
    
    toast.success('Flow moved successfully');
  }, [cutNodes, cutEdges, isCut, pasteNodes, openActionModal, forceResetCutState]);

  /**
   * Get edge connection info for plus button clicks
   */
  const getEdgeConnectionInfo = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;

    // Calculate insertion index dynamically
    const flowNodes = nodes.filter(node => 
      node.type !== 'placeholder' && 
      node.id !== 'virtual-end' && 
      !node.id.startsWith('placeholder-')
    );
    
    const sourceNodeIndex = flowNodes.findIndex(node => node.id === edge.source);
    const insertIndex = sourceNodeIndex >= 0 ? sourceNodeIndex : 0;

    return {
      insertIndex,
      aboveNodeId: edge.source,
      belowNodeId: edge.target
    };
  }, [edges, nodes]);

  /**
   * Handle plus icon dropdown selection for cut operations
   */
  const handleDropdownSelection = useCallback((
    action: 'addNode' | 'pasteCutFlow',
    edgeId: string,
    onOpenActionModal: (index: number) => void
  ) => {
    const connectionInfo = getEdgeConnectionInfo(edgeId);
    if (!connectionInfo) return;

    if (action === 'addNode') {
      console.log('✂️ Graph-based handleDropdownSelection addNode:', {
        edgeId,
        insertIndex: connectionInfo.insertIndex
      });
      onOpenActionModal(connectionInfo.insertIndex);
    } else if (action === 'pasteCutFlow') {
      pasteCutFlow(
        connectionInfo.insertIndex,
        connectionInfo.aboveNodeId,
        connectionInfo.belowNodeId
      );
    }
  }, [getEdgeConnectionInfo, pasteCutFlow]);

  /**
   * Clear cut state
   */
  const clearCutState = useCallback(() => {
    setIsCut(false);
    setCutNodes([]);
    setCutEdges([]);
    toast.info('Cut state cleared');
  }, [setIsCut, setCutNodes, setCutEdges]);

  return {
    // Cut operations
    cutNode: cutSingleNode,
    cutFlowFromNode: cutFlow,
    
    // Paste operations
    pasteCutFlow,
    
    // State
    isCut,
    cutNodes,
    cutEdges,
    
    // Utilities
    clearCutState,
    getEdgeConnectionInfo,
    handleDropdownSelection
  };
};
