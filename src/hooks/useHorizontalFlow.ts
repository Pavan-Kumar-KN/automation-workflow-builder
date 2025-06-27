import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowStore } from './useWorkflowState';
import { useMediaQuery } from './useMediaQuery';
import { toast } from 'sonner';

export const useHorizontalFlow = () => {
  const { nodes, edges, setNodes, reactFlowInstance } = useWorkflowStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const arrangeHorizontalFlow = useCallback(() => {
    if (nodes.length === 0) return;

    // Configuration
    const columnWidth = isMobile ? 280 : isTablet ? 320 : 380;
    const nodeSpacing = isMobile ? 120 : 150;
    const startX = 50;
    const startY = 100;

    // Build connection graph
    const connectionMap = new Map<string, string[]>();
    const incomingMap = new Map<string, string[]>();
    
    edges.forEach(edge => {
      if (!connectionMap.has(edge.source)) {
        connectionMap.set(edge.source, []);
      }
      connectionMap.get(edge.source)!.push(edge.target);
      
      if (!incomingMap.has(edge.target)) {
        incomingMap.set(edge.target, []);
      }
      incomingMap.get(edge.target)!.push(edge.source);
    });

    // Find root nodes (triggers with no incoming connections)
    const rootNodes = nodes.filter(node => 
      (node.type === 'trigger' || node.type === 'add-trigger') && 
      !incomingMap.has(node.id)
    );

    // Calculate levels using BFS
    const levels = new Map<string, number>();
    const queue: { nodeId: string; level: number }[] = [];
    
    // Start with root nodes at level 0
    rootNodes.forEach(node => {
      levels.set(node.id, 0);
      queue.push({ nodeId: node.id, level: 0 });
    });

    // BFS to assign levels
    while (queue.length > 0) {
      const { nodeId, level } = queue.shift()!;
      const children = connectionMap.get(nodeId) || [];
      
      children.forEach(childId => {
        const currentLevel = levels.get(childId);
        const newLevel = level + 1;
        
        if (currentLevel === undefined || newLevel > currentLevel) {
          levels.set(childId, newLevel);
          queue.push({ nodeId: childId, level: newLevel });
        }
      });
    }

    // Handle orphaned nodes (nodes with no connections)
    nodes.forEach(node => {
      if (!levels.has(node.id)) {
        // Place orphaned nodes based on their type
        if (node.type === 'trigger' || node.type === 'add-trigger') {
          levels.set(node.id, 0);
        } else if (node.type === 'condition' || node.type === 'split-condition') {
          levels.set(node.id, 1);
        } else {
          levels.set(node.id, 2);
        }
      }
    });

    // Group nodes by level
    const nodesByLevel = new Map<number, Node[]>();
    nodes.forEach(node => {
      const level = levels.get(node.id) || 0;
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(node);
    });

    // Position nodes
    const arrangedNodes = nodes.map(node => {
      const level = levels.get(node.id) || 0;
      const nodesAtLevel = nodesByLevel.get(level) || [];
      const nodeIndex = nodesAtLevel.indexOf(node);
      
      const x = startX + (level * columnWidth);
      const y = startY + (nodeIndex * nodeSpacing);

      return {
        ...node,
        position: { x, y },
        data: { ...node.data, layoutMode: 'horizontal' },
      };
    });

    setNodes(arrangedNodes);
    
    // Fit view after arrangement
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: isMobile ? 20 : 50, duration: 800 });
      }
    }, 100);

    toast.success('Nodes arranged in horizontal flow!');
  }, [nodes, edges, setNodes, reactFlowInstance, isMobile, isTablet]);

  const getHorizontalPosition = useCallback((nodeType: string, existingNodes?: Node[]) => {
    const nodesToCheck = existingNodes || nodes;
    
    if (nodesToCheck.length === 0) {
      return { x: 50, y: 100 };
    }

    // Configuration
    const columnWidth = isMobile ? 280 : isTablet ? 320 : 380;
    const nodeSpacing = isMobile ? 120 : 150;
    const startX = 50;
    const startY = 100;

    // Determine column based on node type
    let targetColumn = 0;
    if (nodeType === 'trigger' || nodeType === 'add-trigger') {
      targetColumn = 0;
    } else if (nodeType === 'condition' || nodeType === 'split-condition') {
      targetColumn = 1;
    } else if (nodeType === 'action') {
      // For actions, try to place them in the next available column
      const maxLevel = Math.max(...nodesToCheck.map(node => {
        // Estimate level based on x position
        return Math.floor((node.position.x - startX) / columnWidth);
      }), 0);
      targetColumn = Math.max(1, maxLevel + 1);
    }

    // Count existing nodes in target column
    const nodesInColumn = nodesToCheck.filter(node => {
      const nodeColumn = Math.floor((node.position.x - startX + columnWidth/2) / columnWidth);
      return nodeColumn === targetColumn;
    });

    const x = startX + (targetColumn * columnWidth);
    const y = startY + (nodesInColumn.length * nodeSpacing);

    return { x, y };
  }, [nodes, isMobile, isTablet]);

  return {
    arrangeHorizontalFlow,
    getHorizontalPosition,
  };
};
