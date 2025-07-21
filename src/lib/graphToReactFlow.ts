import type { GraphNode } from '../store/useGraphStore';
import type { Node, Edge } from '@xyflow/react';
import { useGraphStore } from '../store/useGraphStore';

export const graphToReactFlow = (nodeMap: Record<string, GraphNode>) => {
  console.log('🔍 graphToReactFlow input nodes:', Object.keys(nodeMap));

  const stateNodes = Object.values(nodeMap).map((node) => {
    const isDraggable = node.type === 'stickyNote';
    console.log('🔍 Node:', node.id, 'Type:', node.type, 'Draggable:', isDraggable);

    const baseNode = {
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        // Add delete functionality to all nodes
        onDelete: () => {
          useGraphStore.getState().removeNode(node.id);
        },
      },
      // Set draggable based on node type
      draggable: isDraggable,
      selectable: true,
      connectable: false,
    };

    // Add sticky note specific properties
    if (node.type === 'stickyNote') {
      return {
        ...baseNode,
        data: {
          ...baseNode.data, // This preserves the onDelete function
          onChange: (id: string, text: string) => {
            useGraphStore.getState().updateStickyNoteText(id, text);
          },
          onToggleVisibility: (id: string) => {
            // Toggle visibility logic here if needed
            console.log('Toggle visibility for:', id);
          },
        },
      };
    }

    return baseNode;
  });

  console.log('🔍 graphToReactFlow output nodes:', stateNodes.map(n => `${n.id} (${n.type})`));

  const stateEdges = [];

  Object.values(nodeMap).forEach((node) => {
    // Handle condition nodes with branches
    if (node.type === 'condition' && node.branches) {
      // Create Yes branch edges
      if (node.branches.yes) {
        node.branches.yes.forEach((childId) => {
          const childNode = nodeMap[childId];
          if (!childNode) return;

          const edgeId = `${node.id}-${childId}-yes`;
          stateEdges.push({
            id: edgeId,
            source: node.id,
            target: childId,
            type: 'condition',
            sourceHandle: 'yes',
            label: 'Yes',
            data: {
              branchType: 'yes',
              parentId: node.id,
              beforeNodeId: childId,
            },
          });
        });
      }

      // Create No branch edges
      if (node.branches.no) {
        node.branches.no.forEach((childId) => {
          const childNode = nodeMap[childId];
          if (!childNode) return;

          const edgeId = `${node.id}-${childId}-no`;
          stateEdges.push({
            id: edgeId,
            source: node.id,
            target: childId,
            type: 'condition',
            sourceHandle: 'no',
            label: 'No',
            data: {
              branchType: 'no',
              parentId: node.id,
              beforeNodeId: childId,
            },
          });
        });
      }
    } else if (node.children && node.children.length > 0) {
      // Regular nodes with children
      node.children.forEach((childId) => {
        const childNode = nodeMap[childId];
        if (!childNode) return;

        // Regular flow edge
        const edgeId = `${node.id}-${childId}`;
        stateEdges.push({
          id: edgeId,
          source: node.id,
          target: childId,
          type: 'flowEdge',
          data: {
            parentId: node.id,
            beforeNodeId: childId,
          },
        });
      });
    }
  });

  return { stateNodes, stateEdges };
};
