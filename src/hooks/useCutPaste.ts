import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowStore } from './useWorkflowState';
import { createCutPasteHandler } from '@/utils/cutPasteHandler';
import { toast } from 'sonner';

export const useCutPaste = (openActionModal?: (insertIndex?: number) => void) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    isCut,
    setIsCut,
    cutNodes,
    cutEdges,
    setCutNodes,
    setCutEdges,
    forceResetCutState
  } = useWorkflowStore();

  const handler = createCutPasteHandler(openActionModal);

  /**
   * Cut a single node
   */
  const cutNode = useCallback((nodeId: string) => {
    const result = handler.cutNode(nodeId, nodes, edges);
    setNodes(result.newNodes);
    setEdges(result.newEdges);
    toast.success('Node cut to clipboard');
  }, [nodes, edges, setNodes, setEdges, handler]);

  /**
   * Cut entire flow from a node
   */
  const cutFlowFromNode = useCallback((nodeId: string) => {
    const result = handler.cutFlowFromNode(nodeId, nodes, edges);
    setNodes(result.newNodes);
    setEdges(result.newEdges);
    toast.success('Flow cut to clipboard');
  }, [nodes, edges, setNodes, setEdges, handler]);

  /**
   * Paste cut flow at insertion point
   */
  const pasteCutFlow = useCallback((
    insertIndex: number,
    aboveNodeId: string,
    belowNodeId: string
  ) => {
    console.log('✂️ PasteCutFlow called with:', { insertIndex, aboveNodeId, belowNodeId });
    console.log('✂️ Current nodes count:', nodes.length);
    console.log('✂️ Current edges count:', edges.length);

    const result = handler.pasteCutFlow(insertIndex, aboveNodeId, belowNodeId, nodes, edges);

    console.log('✂️ PasteCutFlow result:', {
      newNodesCount: result.newNodes.length,
      newEdgesCount: result.newEdges.length
    });

    // Fix edge data to have proper onOpenActionModal callbacks
    const fixedEdges = result.newEdges.map(edge => {
      // Fix all flowEdge type edges to have proper onOpenActionModal callbacks
      if (edge.type === 'flowEdge' && openActionModal) {
        return {
          ...edge,
          data: {
            ...edge.data,
            onOpenActionModal: (insertIndex: number) => {
              console.log('✂️ Plus button clicked from pasted cut edge, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            },
            // Preserve existing index if available, otherwise use a default
            index: edge.data?.index ?? 0
          }
        };
      }
      return edge;
    });

    setNodes(result.newNodes);
    setEdges(fixedEdges);

    // Force clear cut state immediately using the force reset function
    forceResetCutState();

    toast.success('Flow moved successfully');
  }, [nodes, edges, setNodes, setEdges, forceResetCutState, handler, openActionModal]);

  /**
   * Clear cut state
   */
  const clearCutState = useCallback(() => {
    setIsCut(false);
    setCutNodes([]);
    setCutEdges([]);
    toast.info('Cut state cleared');
  }, [setIsCut, setCutNodes, setCutEdges]);

  /**
   * Get edge connection info for paste operation
   */
  const getEdgeConnectionInfo = useCallback((edgeId: string) => {
    const edge = edges.find(e => e.id === edgeId);
    if (!edge) return null;

    return {
      aboveNodeId: edge.source,
      belowNodeId: edge.target,
      insertIndex: (edge.data?.index as number) || 0
    };
  }, [edges]);

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
      // Normal flow - open action modal
      onOpenActionModal(connectionInfo.insertIndex);
    } else if (action === 'pasteCutFlow') {
      // Paste cut flow
      pasteCutFlow(
        connectionInfo.insertIndex,
        connectionInfo.aboveNodeId,
        connectionInfo.belowNodeId
      );
    }
  }, [getEdgeConnectionInfo, pasteCutFlow]);

  return {
    // Cut operations
    cutNode,
    cutFlowFromNode,
    
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
