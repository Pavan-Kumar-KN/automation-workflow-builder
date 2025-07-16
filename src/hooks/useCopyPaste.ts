import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowStore } from './useWorkflowState';
import { createCopyPasteHandler } from '@/utils/copyPasteHandler';
import { toast } from 'sonner';

export const useCopyPaste = (
  openActionModal?: (insertIndex?: number) => void,
  onConditionalPasteRequest?: (insertIndex: number, aboveNodeId: string, belowNodeId: string, downstreamCount: number) => void
) => {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    isCopy,
    setIsCopy,
    copiedNodes,
    copiedEdges,
    setCopiedNodes,
    setCopiedEdges,
    forceResetCopyState
  } = useWorkflowStore();

  const handler = createCopyPasteHandler(openActionModal, onConditionalPasteRequest);

  /**
   * Copy a single node
   */
  const copyNode = useCallback((nodeId: string) => {
    handler.copyNode(nodeId, nodes, edges);
    toast.success('Node copied to clipboard');
  }, [nodes, edges, handler]);

  /**
   * Copy entire flow from a node
   */
  const copyFlowFromNode = useCallback((nodeId: string) => {
    handler.copyFlowFromNode(nodeId, nodes, edges);
    toast.success('Flow copied to clipboard');
  }, [nodes, edges, handler]);

  /**
   * Paste flow at insertion point
   */
  const pasteFlow = useCallback((
    insertIndex: number,
    aboveNodeId: string,
    belowNodeId: string
  ) => {
    console.log('🔍 PasteFlow called with:', { insertIndex, aboveNodeId, belowNodeId });
    console.log('🔍 Current nodes count:', nodes.length);
    console.log('🔍 Current edges count:', edges.length);

    const result = handler.pasteFlow(insertIndex, aboveNodeId, belowNodeId, nodes, edges);

    console.log('🔍 PasteFlow result:', {
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
              console.log('🔍 Plus button clicked from pasted edge, insertIndex:', insertIndex);
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

    // Force clear copy state immediately using the force reset function
    forceResetCopyState();

    toast.success('Flow pasted successfully');
  }, [nodes, edges, setNodes, setEdges, forceResetCopyState, handler]);

  /**
   * Paste conditional flow with branch selection
   */
  const pasteConditionalFlow = useCallback((
    insertIndex: number,
    aboveNodeId: string,
    belowNodeId: string,
    selectedBranch: 'yes' | 'no'
  ) => {
    console.log('🔍 PasteConditionalFlow called with:', { insertIndex, aboveNodeId, belowNodeId, selectedBranch });

    const result = handler.pasteConditionalFlow(insertIndex, aboveNodeId, belowNodeId, selectedBranch, nodes, edges);

    // Fix edge data to have proper onOpenActionModal callbacks
    const fixedEdges = result.newEdges.map(edge => {
      if (edge.type === 'flowEdge' && openActionModal) {
        return {
          ...edge,
          data: {
            ...edge.data,
            onOpenActionModal: (insertIndex: number) => {
              console.log('🔍 Plus button clicked from pasted conditional edge, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            },
            index: edge.data?.index ?? 0
          }
        };
      }
      return edge;
    });

    setNodes(result.newNodes);
    setEdges(fixedEdges);

    // Force clear copy state after conditional pasting using force reset
    forceResetCopyState();

    toast.success('Conditional flow pasted successfully');
  }, [nodes, edges, setNodes, setEdges, forceResetCopyState, handler]);

  /**
   * Clear copy state
   */
  const clearCopyState = useCallback(() => {
    setIsCopy(false);
    setCopiedNodes([]);
    setCopiedEdges([]);
    toast.info('Copy state cleared');
  }, [setIsCopy, setCopiedNodes, setCopiedEdges]);

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
   * Handle plus icon dropdown selection
   */
  const handleDropdownSelection = useCallback((
    action: 'addNode' | 'pasteFlow',
    edgeId: string,
    onOpenActionModal: (index: number) => void
  ) => {
    const connectionInfo = getEdgeConnectionInfo(edgeId);
    if (!connectionInfo) return;

    if (action === 'addNode') {
      // Normal flow - open action modal
      onOpenActionModal(connectionInfo.insertIndex);
    } else if (action === 'pasteFlow') {
      // Paste flow
      pasteFlow(
        connectionInfo.insertIndex,
        connectionInfo.aboveNodeId,
        connectionInfo.belowNodeId
      );
    }
  }, [getEdgeConnectionInfo, pasteFlow]);

  return {
    // Copy operations
    copyNode,
    copyFlowFromNode,

    // Paste operations
    pasteFlow,
    pasteConditionalFlow,

    // State
    isCopy,
    copiedNodes,
    copiedEdges,

    // Utilities
    clearCopyState,
    getEdgeConnectionInfo,
    handleDropdownSelection
  };
};
