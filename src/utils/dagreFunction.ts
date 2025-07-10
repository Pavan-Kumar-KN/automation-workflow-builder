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

export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  // Create a new dagre graph instance for each layout
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 80,
    ranksep: 120,
    marginx: 20,
    marginy: 20
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

  // Set nodes
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: node.width || nodeWidth,
      height: node.height || nodeHeight
    });
  });

  // Set edges
  validEdges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Apply layout
  dagre.layout(dagreGraph);

  // Position nodes
  const newNodes = nodes.map(node => {
    const nodeWithPosition = dagreGraph.node(node.id);

    // Safety check
    if (!nodeWithPosition) {
      console.error(`Node position not found for: ${node.id}`);
      return node;
    }

    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - (node.width || nodeWidth) / 2,
        y: nodeWithPosition.y - (node.height || nodeHeight) / 2,
      },
    };

    return newNode;
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