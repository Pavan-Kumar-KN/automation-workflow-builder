import dagre from '@dagrejs/dagre';

// Simplified function to calculate child counts for edge width
export function calculateChildCounts(nodes, edges) {
  const childCounts = {};

  // Initialize all nodes with 0 children
  nodes.forEach(node => {
    childCounts[node.id] = 0;
  });

  // Count direct children for each node
  edges.forEach(edge => {
    if (childCounts[edge.source] !== undefined) {
      childCounts[edge.source] += 1;
    }
  });

  return childCounts;
}

// const dagreGraph = new dagre.graphlib.Graph();
// dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  // Create a new dagre graph instance for each layout
  const nodeWidth = 360;
  const nodeHeight = 80;
  
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  
  // Enhanced graph configuration for better conditional branch handling
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 140 : 180, // Increased horizontal spacing for branches
    ranksep: isHorizontal ? 180 : 160, // Increased vertical spacing
    marginx: 50,
    marginy: 50,
    acyclicer: 'greedy', // Better cycle handling
    ranker: 'tight-tree' // Better for tree-like structures
  });

  console.log('🔍 Dagre Layout Analysis:', {
    totalNodes: nodes.length,
    allNodes: nodes.map(n => ({ id: n.id, type: n.type }))
  });

  // Validate that all nodes and edges are valid
  const nodeIds = new Set(nodes.map(n => n.id));
  const validEdges = edges.filter(edge => {
    const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
    if (!isValid) {
      console.warn(`Invalid edge: ${edge.source} -> ${edge.target}`);
    }
    return isValid;
  });

  // Calculate child counts for dynamic edge width
  const childCounts = calculateChildCounts(nodes, validEdges);

  // Identify conditional nodes and their branches for special handling
  const conditionalNodes = nodes.filter(node => node.type === 'condition');
  const branchNodes = new Map(); // Map condition nodes to their branch children
  
  conditionalNodes.forEach(conditionNode => {
    const branches = validEdges.filter(edge => edge.source === conditionNode.id);
    branchNodes.set(conditionNode.id, branches);
  });

  // Set ALL nodes in dagre (including placeholders)
  nodes.forEach(node => {
    let width = node.width || nodeWidth;
    let height = node.height || nodeHeight;
    
    // Special handling for placeholder nodes to make them smaller
    if (node.type === 'placeholder') {
      width = 120;
      height = 80;
    }
    
    dagreGraph.setNode(node.id, {
      width,
      height
    });
  });

  // Set ALL edges in dagre with enhanced conditional branch handling
  validEdges.forEach(edge => {
    // Add edge weight for conditional branches to influence layout
    const edgeConfig: any = {};
    
    if (edge.type === 'condition') {
      // Higher weight for conditional edges to keep branches closer
      edgeConfig.weight = 2;
      edgeConfig.minlen = 1; // Minimum edge length
    } else {
      edgeConfig.weight = 1;
    }
    
    dagreGraph.setEdge(edge.source, edge.target, edgeConfig);
  });

  // Apply layout
  dagre.layout(dagreGraph);

  // Position ALL nodes using dagre layout (including placeholders)
  const newNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Safety check
    if (!nodeWithPosition) {
      console.error(`Node position not found for: ${node.id}`);
      return node;
    }

    const finalPosition = {
      x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
      y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
    };

    console.log(`🔍 Dagre positioned ${node.id} (${node.type}):`, finalPosition);

    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: finalPosition,
    };
  });

  // Update edges with dynamic widths
  const newEdges = validEdges.map(edge => {
    const sourceChildCount = childCounts[edge.source] || 1;
    const edgeWidth = Math.max(2, Math.min(8, sourceChildCount * 2));

    return {
      ...edge,
      style: {
        ...edge.style,
        strokeWidth: edgeWidth,
        stroke: `hsl(${Math.min(sourceChildCount * 40, 240)}, 70%, 50%)`
      }
    };
  });

  return { nodes: newNodes, edges: newEdges };
};