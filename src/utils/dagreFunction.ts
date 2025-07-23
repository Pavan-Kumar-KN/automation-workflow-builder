import dagre from "@dagrejs/dagre";
import { Position } from "@xyflow/react";

// Simplified function to calculate child counts for edge width
export function calculateChildCounts(nodes, edges) {
  const childCounts = {};

  // Initialize all nodes with 0 children
  nodes.forEach((node) => {
    childCounts[node.id] = 0;
  });

  // Count direct children for each node
  edges.forEach((edge) => {
    if (childCounts[edge.source] !== undefined) {
      childCounts[edge.source] += 1;
    }
  });

  return childCounts;
}

export const getLayoutedElements = (nodes, edges, direction = "TB") => {
  // Create a new dagre graph instance for each layout
  const nodeWidth = 260;
  const nodeHeight = 50;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === "LR";

  // Enhanced graph configuration with much larger spacing
  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 150 : 110, // Horizontal spacing between nodes
    ranksep: isHorizontal ? 120 : 90, // INCREASED: Vertical spacing between ranks (this is key!)
    marginx: 10,
    marginy: 10,
    acyclicer: "greedy",
    ranker: "longest-path",
    // ranker: "network-simplex",
    // ranker: "tight-tree", // Use tight-tree for better hierarchical layout
  });

  // Validate that all nodes and edges are valid
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((edge) => {
    const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
    if (!isValid) {
      console.warn(`Invalid edge: ${edge.source} -> ${edge.target}`);
    }
    return isValid;
  });

  // Note: childCounts calculation removed since we use consistent edge styling

  // Identify conditional nodes and their branches for special handling
  const conditionalNodes = nodes.filter((node) => node.type === "condition");
  const branchNodes = new Map(); // Map condition nodes to their branch children

  conditionalNodes.forEach((conditionNode) => {
    const branches = validEdges.filter(
      (edge) => edge.source === conditionNode.id
    );
    branchNodes.set(conditionNode.id, branches);
  });

  // Set workflow nodes in dagre (exclude sticky notes)
  nodes.forEach((node) => {
    // Skip sticky notes - they should not be affected by Dagre layout
    if (node.type === 'stickyNote') {
      return;
    }

    let width = node.width || nodeWidth;
    let height = node.height || nodeHeight;

    dagreGraph.setNode(node.id, {
      width,
      height,
    });
  });

  // Set ALL edges in dagre with enhanced conditional branch handling
  validEdges.forEach((edge) => {
    // Add edge weight for conditional branches to influence layout
    const edgeConfig: any = {};

    if (edge.type === "condition") {
      // Special handling for condition edges to ensure proper branching
      edgeConfig.weight = 1;
      edgeConfig.minlen = 2; // Minimum edge length for better separation

      // Add label information to help with positioning
      if (edge.label === "Yes") {
        edgeConfig.labelpos = "l"; // Left side
      } else if (edge.label === "No") {
        edgeConfig.labelpos = "r"; // Right side
      }
    } else {
      edgeConfig.weight = 1;
      edgeConfig.minlen = 1;
    }

    dagreGraph.setEdge(edge.source, edge.target, edgeConfig);
  });




  // Apply layout
  dagre.layout(dagreGraph);
  // Position workflow nodes using dagre layout (preserve sticky note positions)
  const newNodes = nodes.map((node) => {
    // Skip sticky notes - preserve their original positions and dimensions
    if (node.type === 'stickyNote') {
      console.log(`🔍 Preserving sticky note position for: ${node.id}`, node.position);
      return node; // Return unchanged
    }

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
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: finalPosition,
    };
  });

  // Update edges with consistent styling and handle positions
  const newEdges = validEdges.map((edge) => {
    return {
      ...edge,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      style: {
        ...edge.style,
        // strokeWidth: 2, // Consistent width
        opacity: 0.8, // Consistent opacity
      },
    };
  });

  return { nodes: newNodes, edges: newEdges };
};


