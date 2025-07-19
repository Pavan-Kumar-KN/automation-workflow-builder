// import { Node, Edge } from '@xyflow/react';

// export interface GraphNode {
//   id: string;
//   type: 'trigger' | 'action' | 'condition' | 'placeholder' | 'ghost' | 'end';
//   data: any;
//   position: { x: number; y: number };
// }

// export interface GraphEdge {
//   id: string;
//   source: string;
//   target: string;
//   type?: 'flowEdge' | 'condition';
//   label?: string;
//   sourceHandle?: string;
//   data?: any;
// }

// export interface ConditionalStructure {
//   conditionId: string;
//   yesTarget: string | null;
//   noTarget: string | null;
//   yesBranch: string[];
//   noBranch: string[];    
// }

// /**
//  * WorkflowGraph - Core graph operations for workflow management
//  * Handles all node/edge operations with proper graph algorithms
//  */
// export class WorkflowGraph {
//   private nodes: Map<string, GraphNode>;
//   private edges: Map<string, GraphEdge>;
//   private adjacencyList: Map<string, Set<string>>; // nodeId -> set of connected nodeIds
//   private reverseAdjacencyList: Map<string, Set<string>>; // nodeId -> set of parent nodeIds

//   constructor(nodes: Node[] = [], edges: Edge[] = []) {
//     this.nodes = new Map();
//     this.edges = new Map();
//     this.adjacencyList = new Map();
//     this.reverseAdjacencyList = new Map();

//     // Initialize from React Flow nodes/edges
//     this.initializeFromReactFlow(nodes, edges);
//   }

//   /**
//    * Initialize graph from React Flow data
//    */
//   private initializeFromReactFlow(nodes: Node[], edges: Edge[]): void {
//     // Add all nodes
//     nodes.forEach(node => {
//       this.nodes.set(node.id, {
//         id: node.id,
//         type: node.type as any,
//         data: node.data,
//         position: node.position
//       });
//       this.adjacencyList.set(node.id, new Set());
//       this.reverseAdjacencyList.set(node.id, new Set());
//     });

//     // Add all edges
//     edges.forEach(edge => {
//       this.edges.set(edge.id, {
//         id: edge.id,
//         source: edge.source,
//         target: edge.target,
//         type: edge.type as any,
//         label: edge.label,
//         sourceHandle: edge.sourceHandle,
//         data: edge.data
//       });

//       // Update adjacency lists
//       this.adjacencyList.get(edge.source)?.add(edge.target);
//       this.reverseAdjacencyList.get(edge.target)?.add(edge.source);
//     });
//   }

//   /**
//    * Get all children (downstream nodes) of a given node
//    */
//   getChildren(nodeId: string): string[] {
//     const children = this.adjacencyList.get(nodeId);
//     return children ? Array.from(children) : [];
//   }

//   /**
//    * Get all parents (upstream nodes) of a given node
//    */
//   getParents(nodeId: string): string[] {
//     const parents = this.reverseAdjacencyList.get(nodeId);
//     return parents ? Array.from(parents) : [];
//   }

//   /**
//    * Get all downstream nodes using BFS traversal
//    */
//   getDownstreamNodes(nodeId: string): string[] {
//     const visited = new Set<string>();
//     const queue = [nodeId];
//     const result: string[] = [];

//     while (queue.length > 0) {
//       const current = queue.shift()!;
      
//       if (visited.has(current)) continue;
//       visited.add(current);

//       // Skip the starting node in results
//       if (current !== nodeId) {
//         result.push(current);
//       }

//       // Add children to queue
//       const children = this.getChildren(current);
//       children.forEach(child => {
//         if (!visited.has(child)) {
//           queue.push(child);
//         }
//       });
//     }

//     return result;
//   }

//   /**
//    * Get subtree starting from a node (includes the node itself)
//    */
//   getSubtree(nodeId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
//     const downstreamIds = [nodeId, ...this.getDownstreamNodes(nodeId)];
//     const subtreeNodes: GraphNode[] = [];
//     const subtreeEdges: GraphEdge[] = [];

//     // Collect nodes
//     downstreamIds.forEach(id => {
//       const node = this.nodes.get(id);
//       if (node && !id.includes('end') && node.type !== 'end') {
//         subtreeNodes.push(node);
//       }
//     });

//     // Collect edges within the subtree
//     this.edges.forEach(edge => {
//       if (downstreamIds.includes(edge.source) && 
//           downstreamIds.includes(edge.target) &&
//           !edge.target.includes('end')) {
//         subtreeEdges.push(edge);
//       }
//     });

//     return { nodes: subtreeNodes, edges: subtreeEdges };
//   }

//   /**
//    * Check if a node is a condition node
//    */
//   isConditionNode(nodeId: string): boolean {
//     const node = this.nodes.get(nodeId);
//     return node?.type === 'condition';
//   }

//   /**
//    * Get conditional structure for a condition node
//    */
//   getConditionalStructure(conditionId: string): ConditionalStructure | null {
//     if (!this.isConditionNode(conditionId)) return null;

//     const children = this.getChildren(conditionId);
//     let yesTarget: string | null = null;
//     let noTarget: string | null = null;

//     // Find Yes and No targets based on edge labels/handles
//     this.edges.forEach(edge => {
//       if (edge.source === conditionId) {
//         if (edge.sourceHandle === 'yes' || edge.label === 'Yes') {
//           yesTarget = edge.target;
//         } else if (edge.sourceHandle === 'no' || edge.label === 'No') {
//           noTarget = edge.target;
//         }
//       }
//     });

//     // Get branch nodes
//     const yesBranch = yesTarget ? this.getDownstreamNodes(yesTarget) : [];
//     const noBranch = noTarget ? this.getDownstreamNodes(noTarget) : [];

//     return {
//       conditionId,
//       yesTarget,
//       noTarget,
//       yesBranch,
//       noBranch
//     };
//   }

//   /**
//    * Convert back to React Flow format
//    */
//   toReactFlow(): { nodes: Node[]; edges: Edge[] } {
//     const nodes: Node[] = Array.from(this.nodes.values()).map(node => ({
//       id: node.id,
//       type: node.type,
//       position: node.position,
//       data: node.data
//     }));

//     const edges: Edge[] = Array.from(this.edges.values()).map(edge => ({
//       id: edge.id,
//       source: edge.source,
//       target: edge.target,
//       type: edge.type,
//       label: edge.label,
//       sourceHandle: edge.sourceHandle,
//       data: edge.data
//     }));

//     return { nodes, edges };
//   }

//   /**
//    * Get a node by ID
//    */
//   getNode(nodeId: string): GraphNode | undefined {
//     return this.nodes.get(nodeId);
//   }

//   /**
//    * Get an edge by ID
//    */
//   getEdge(edgeId: string): GraphEdge | undefined {
//     return this.edges.get(edgeId);
//   }

//   /**
//    * Get all nodes as array
//    */
//   getAllNodes(): GraphNode[] {
//     return Array.from(this.nodes.values());
//   }

//   /**
//    * Get all edges as array
//    */
//   getAllEdges(): GraphEdge[] {
//     return Array.from(this.edges.values());
//   }

//   /**
//    * Add a new node to the graph
//    */
//   private addNode(node: GraphNode): void {
//     this.nodes.set(node.id, node);
//     this.adjacencyList.set(node.id, new Set());
//     this.reverseAdjacencyList.set(node.id, new Set());
//   }

//   /**
//    * Remove a node from the graph
//    */
//   private removeNode(nodeId: string): void {
//     // Remove all edges connected to this node
//     const incomingEdges = Array.from(this.edges.values()).filter(e => e.target === nodeId);
//     const outgoingEdges = Array.from(this.edges.values()).filter(e => e.source === nodeId);

//     [...incomingEdges, ...outgoingEdges].forEach(edge => {
//       this.removeEdge(edge.id);
//     });

//     // Remove node
//     this.nodes.delete(nodeId);
//     this.adjacencyList.delete(nodeId);
//     this.reverseAdjacencyList.delete(nodeId);
//   }

//   /**
//    * Add a new edge to the graph
//    */
//   private addEdge(edge: GraphEdge): void {
//     this.edges.set(edge.id, edge);
//     this.adjacencyList.get(edge.source)?.add(edge.target);
//     this.reverseAdjacencyList.get(edge.target)?.add(edge.source);
//   }

//   /**
//    * Remove an edge from the graph
//    */
//   private removeEdge(edgeId: string): void {
//     const edge = this.edges.get(edgeId);
//     if (edge) {
//       this.adjacencyList.get(edge.source)?.delete(edge.target);
//       this.reverseAdjacencyList.get(edge.target)?.delete(edge.source);
//       this.edges.delete(edgeId);
//     }
//   }

//   /**
//    * Insert a node after another node
//    */
//   insertNodeAfter(
//     targetNodeId: string,
//     newNode: Omit<GraphNode, 'id'>,
//     newNodeId: string,
//     openActionModal?: (insertIndex: number) => void
//   ): WorkflowGraph {
//     const newGraph = this.clone();

//     console.log('🔍 WorkflowGraph.insertNodeAfter:', { targetNodeId, newNodeId, currentNodes: newGraph.getAllNodes().length });

//     // Create the new node (without position - let dagre handle it)
//     const nodeToInsert: GraphNode = {
//       id: newNodeId,
//       ...newNode,
//       position: { x: 0, y: 0 } // Temporary position - dagre will override
//     };

//     // Get all edges that currently have targetNodeId as source
//     const targetOutgoingEdges = Array.from(newGraph.edges.values()).filter(edge => edge.source === targetNodeId);

//     console.log('🔍 Target outgoing edges:', targetOutgoingEdges.map(e => `${e.source} -> ${e.target}`));

//     // Add the new node
//     newGraph.addNode(nodeToInsert);

//     // Create edge from target to new node
//     const targetToNewEdge: GraphEdge = {
//       id: `edge-${targetNodeId}-${newNodeId}`,
//       source: targetNodeId,
//       target: newNodeId,
//       type: 'flowEdge',
//       data: {
//         onOpenActionModal: openActionModal || ((insertIndex: number) => {
//           console.log('🔍 Plus button clicked after inserted node, no handler provided');
//         }),
//         index: 0 // Will be recalculated by dagre
//       }
//     };
//     newGraph.addEdge(targetToNewEdge);

//     // Reconnect all downstream edges to go through the new node
//     targetOutgoingEdges.forEach(edge => {
//       if (edge.target !== 'virtual-end') {
//         console.log('🔍 Reconnecting edge:', `${edge.source} -> ${edge.target}` + ' through new node');

//         // Remove the old edge
//         newGraph.removeEdge(edge.id);

//         // Create new edge from new node to the original target
//         const newToDownstreamEdge: GraphEdge = {
//           id: `edge-${newNodeId}-${edge.target}`,
//           source: newNodeId,
//           target: edge.target,
//           type: edge.type || 'flowEdge',
//           data: {
//             onOpenActionModal: openActionModal || ((insertIndex: number) => {
//               console.log('🔍 Plus button clicked after reconnected edge, no handler provided');
//             }),
//             index: 0 // Will be recalculated by dagre
//           }
//         };
//         newGraph.addEdge(newToDownstreamEdge);
//       } else {
//         // If target was virtual-end, remove that edge and create new one from new node to virtual-end
//         console.log('🔍 Reconnecting to virtual-end through new node');
//         newGraph.removeEdge(edge.id);

//         const newToEndEdge: GraphEdge = {
//           id: `edge-${newNodeId}-virtual-end`,
//           source: newNodeId,
//           target: 'virtual-end',
//           type: 'flowEdge',
//           data: {
//             onOpenActionModal: openActionModal || ((insertIndex: number) => {
//               console.log('🔍 Plus button clicked at end after new node, no handler provided');
//             }),
//             index: 0 // Will be recalculated by dagre
//           }
//         };
//         newGraph.addEdge(newToEndEdge);
//       }
//     });

//     console.log('✅ Node insertion complete:', {
//       newNodeId,
//       totalNodes: newGraph.getAllNodes().length,
//       totalEdges: newGraph.getAllEdges().length
//     });

//     return newGraph;
//   }

//   /**
//    * Insert a condition node after another node with branch selection
//    */
//   insertConditionNodeAfter(
//     targetNodeId: string,
//     newConditionNode: Omit<GraphNode, 'id'>,
//     newNodeId: string,
//     moveActionTo: 'yes' | 'no',
//     openActionModal?: (insertIndex: number) => void
//   ): WorkflowGraph {
//     const newGraph = this.clone();

//     console.log('🔍 WorkflowGraph.insertConditionNodeAfter:', {
//       targetNodeId,
//       newNodeId,
//       moveActionTo,
//       currentNodes: newGraph.getAllNodes().length
//     });

//     // Create the condition node
//     const conditionNode: GraphNode = {
//       id: newNodeId,
//       ...newConditionNode,
//       position: { x: 0, y: 0 } // Temporary position - dagre will override
//     };

//     // Get all edges that currently have targetNodeId as source (downstream nodes)
//     const targetOutgoingEdges = Array.from(newGraph.edges.values()).filter(edge => edge.source === targetNodeId);

//     console.log('🔍 Target outgoing edges (downstream):', targetOutgoingEdges.map(e => `${e.source} -> ${e.target}`));

//     // Add the condition node
//     newGraph.addNode(conditionNode);

//     // Create edge from target to condition node
//     const targetToConditionEdge: GraphEdge = {
//       id: `edge-${targetNodeId}-${newNodeId}`,
//       source: targetNodeId,
//       target: newNodeId,
//       type: 'flowEdge',
//       data: {
//         onOpenActionModal: openActionModal || ((insertIndex: number) => {
//           console.log('🔍 Plus button clicked after condition node, no handler provided');
//         }),
//         index: 0
//       }
//     };
//     newGraph.addEdge(targetToConditionEdge);

//     // Create placeholder nodes for Yes and No branches
//     const yesPlaceholderId = `placeholder-yes-${Date.now()}`;
//     const noPlaceholderId = `placeholder-no-${Date.now()}`;

//     // Create Yes branch edge
//     const yesEdge: GraphEdge = {
//       id: `edge-${newNodeId}-yes`,
//       source: newNodeId,
//       target: yesPlaceholderId,
//       sourceHandle: 'yes',
//       type: 'condition',
//       label: 'Yes',
//       data: { branchType: 'yes' }
//     };

//     // Create No branch edge
//     const noEdge: GraphEdge = {
//       id: `edge-${newNodeId}-no`,
//       source: newNodeId,
//       target: noPlaceholderId,
//       sourceHandle: 'no',
//       type: 'condition',
//       label: 'No',
//       data: { branchType: 'no' }
//     };

//     // Handle downstream nodes based on moveActionTo selection
//     if (targetOutgoingEdges.length > 0) {
//       targetOutgoingEdges.forEach(edge => {
//         // Remove the old edge
//         newGraph.removeEdge(edge.id);

//         if (moveActionTo === 'yes') {
//           // Move downstream to Yes branch
//           const newYesEdge: GraphEdge = {
//             id: `edge-${newNodeId}-${edge.target}`,
//             source: newNodeId,
//             target: edge.target,
//             sourceHandle: 'yes',
//             type: 'condition',
//             label: 'Yes',
//             data: { branchType: 'yes' }
//           };
//           newGraph.addEdge(newYesEdge);

//           // Keep No branch as placeholder
//           newGraph.addEdge(noEdge);
//         } else {
//           // Move downstream to No branch
//           const newNoEdge: GraphEdge = {
//             id: `edge-${newNodeId}-${edge.target}`,
//             source: newNodeId,
//             target: edge.target,
//             sourceHandle: 'no',
//             type: 'condition',
//             label: 'No',
//             data: { branchType: 'no' }
//           };
//           newGraph.addEdge(newNoEdge);

//           // Keep Yes branch as placeholder
//           newGraph.addEdge(yesEdge);
//         }
//       });
//     } else {
//       // No downstream nodes, create both placeholder branches
//       newGraph.addEdge(yesEdge);
//       newGraph.addEdge(noEdge);
//     }

//     console.log('✅ Condition node insertion complete:', {
//       newNodeId,
//       moveActionTo,
//       totalNodes: newGraph.getAllNodes().length,
//       totalEdges: newGraph.getAllEdges().length
//     });

//     return newGraph;
//   }

//   /**
//    * Delete a node and its subtree
//    */
//   deleteSubtree(nodeId: string): WorkflowGraph {
//     const newGraph = this.clone();

//     // Get all nodes to delete (node + downstream)
//     const nodesToDelete = [nodeId, ...newGraph.getDownstreamNodes(nodeId)];

//     // Get parent nodes before deletion
//     const parentNodes = newGraph.getParents(nodeId);

//     // Get the first downstream node that won't be deleted (for reconnection)
//     let reconnectionTarget: string | null = null;
//     const children = newGraph.getChildren(nodeId);

//     // Find a child that's not in the deletion list
//     for (const child of children) {
//       if (!nodesToDelete.includes(child)) {
//         reconnectionTarget = child;
//         break;
//       }
//     }

//     // Remove all nodes in the subtree
//     nodesToDelete.forEach(id => {
//       newGraph.removeNode(id);
//     });

//     // Reconnect parent nodes to reconnection target if it exists
//     if (reconnectionTarget && parentNodes.length > 0) {
//       parentNodes.forEach(parentId => {
//         const reconnectEdge: GraphEdge = {
//           id: `edge-${parentId}-${reconnectionTarget}`,
//           source: parentId,
//           target: reconnectionTarget!,
//           type: 'flowEdge'
//         };
//         newGraph.addEdge(reconnectEdge);
//       });
//     }

//     return newGraph;
//   }

//   /**
//    * Create a deep copy of the graph
//    */
//   clone(): WorkflowGraph {
//     const { nodes, edges } = this.toReactFlow();
//     return new WorkflowGraph(nodes, edges);
//   }
// }


import { Node, Edge } from '@xyflow/react';

export interface GraphNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'placeholder' | 'ghost' | 'end';
  data: any;
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type?: 'flowEdge' | 'condition';
  label?: string;
  sourceHandle?: string;
  data?: any;
}

export interface ConditionalStructure {
  conditionId: string;
  yesTarget: string | null;
  noTarget: string | null;
  yesBranch: string[];
  noBranch: string[];    
}

/**
 * WorkflowGraph - Core graph operations for workflow management
 * Handles all node/edge operations with proper graph algorithms
 */
export class WorkflowGraph {
  private nodes: Map<string, GraphNode>;
  private edges: Map<string, GraphEdge>;
  private adjacencyList: Map<string, Set<string>>; // nodeId -> set of connected nodeIds
  private reverseAdjacencyList: Map<string, Set<string>>; // nodeId -> set of parent nodeIds

  constructor(nodes: Node[] = [], edges: Edge[] = []) {
    this.nodes = new Map();
    this.edges = new Map();
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();

    // Initialize from React Flow nodes/edges
    this.initializeFromReactFlow(nodes, edges);
  }

  /**
   * Initialize graph from React Flow data
   */
  private initializeFromReactFlow(nodes: Node[], edges: Edge[]): void {
    // Add all nodes
    nodes.forEach(node => {
      this.nodes.set(node.id, {
        id: node.id,
        type: node.type as any,
        data: node.data,
        position: node.position
      });
      this.adjacencyList.set(node.id, new Set());
      this.reverseAdjacencyList.set(node.id, new Set());
    });

    // Add all edges
    edges.forEach(edge => {
      this.edges.set(edge.id, {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type as any,
        label: edge.label,
        sourceHandle: edge.sourceHandle,
        data: edge.data
      });

      // Update adjacency lists
      this.adjacencyList.get(edge.source)?.add(edge.target);
      this.reverseAdjacencyList.get(edge.target)?.add(edge.source);
    });
  }

  /**
   * Get all children (downstream nodes) of a given node
   */
  getChildren(nodeId: string): string[] {
    const children = this.adjacencyList.get(nodeId);
    return children ? Array.from(children) : [];
  }

  /**
   * Get all parents (upstream nodes) of a given node
   */
  getParents(nodeId: string): string[] {
    const parents = this.reverseAdjacencyList.get(nodeId);
    return parents ? Array.from(parents) : [];
  }

  /**
   * Get all downstream nodes using BFS traversal
   */
  getDownstreamNodes(nodeId: string): string[] {
    const visited = new Set<string>();
    const queue = [nodeId];
    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      
      if (visited.has(current)) continue;
      visited.add(current);

      // Skip the starting node in results
      if (current !== nodeId) {
        result.push(current);
      }

      // Add children to queue
      const children = this.getChildren(current);
      children.forEach(child => {
        if (!visited.has(child)) {
          queue.push(child);
        }
      });
    }

    return result;
  }

  /**
   * Get subtree starting from a node (includes the node itself)
   */
  getSubtree(nodeId: string): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const downstreamIds = [nodeId, ...this.getDownstreamNodes(nodeId)];
    const subtreeNodes: GraphNode[] = [];
    const subtreeEdges: GraphEdge[] = [];

    // 🎯 FIX: Collect nodes but EXCLUDE ghost nodes from cut/paste operations
    downstreamIds.forEach(id => {
      const node = this.nodes.get(id);
      if (node &&
          !id.includes('end') &&
          node.type !== 'end' &&
          node.type !== 'ghost') { // 🎯 EXCLUDE ghost nodes
        subtreeNodes.push(node);
        console.log('🔍 Including node in subtree:', id, node.type);
      } else if (node?.type === 'ghost') {
        console.log('🔍 Excluding ghost node from subtree:', id);
      }
    });

    // Collect edges within the subtree (only between non-ghost nodes)
    this.edges.forEach(edge => {
      const sourceNode = this.nodes.get(edge.source);
      const targetNode = this.nodes.get(edge.target);

      if (downstreamIds.includes(edge.source) &&
          downstreamIds.includes(edge.target) &&
          !edge.target.includes('end') &&
          sourceNode?.type !== 'ghost' && // 🎯 EXCLUDE edges from/to ghost nodes
          targetNode?.type !== 'ghost') {
        subtreeEdges.push(edge);
        console.log('🔍 Including edge in subtree:', `${edge.source}->${edge.target}`);
      }
    });

    console.log('🔍 Subtree result:', { nodes: subtreeNodes.length, edges: subtreeEdges.length });
    return { nodes: subtreeNodes, edges: subtreeEdges };
  }

  /**
   * Check if a node is a condition node
   */
  isConditionNode(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    return node?.type === 'condition';
  }

  /**
   * Get conditional structure for a condition node
   */
  getConditionalStructure(conditionId: string): ConditionalStructure | null {
    if (!this.isConditionNode(conditionId)) return null;

    const children = this.getChildren(conditionId);
    let yesTarget: string | null = null;
    let noTarget: string | null = null;

    // Find Yes and No targets based on edge labels/handles
    this.edges.forEach(edge => {
      if (edge.source === conditionId) {
        if (edge.sourceHandle === 'yes' || edge.label === 'Yes') {
          yesTarget = edge.target;
        } else if (edge.sourceHandle === 'no' || edge.label === 'No') {
          noTarget = edge.target;
        }
      }
    });

    // Get branch nodes
    const yesBranch = yesTarget ? this.getDownstreamNodes(yesTarget) : [];
    const noBranch = noTarget ? this.getDownstreamNodes(noTarget) : [];

    return {
      conditionId,
      yesTarget,
      noTarget,
      yesBranch,
      noBranch
    };
  }

  /**
   * Convert back to React Flow format
   */
  toReactFlow(): { nodes: Node[]; edges: Edge[] } {
    const nodes: Node[] = Array.from(this.nodes.values()).map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }));

    const edges: Edge[] = Array.from(this.edges.values()).map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type,
      label: edge.label,
      sourceHandle: edge.sourceHandle,
      data: edge.data
    }));

    return { nodes, edges };
  }

  /**
   * Get a node by ID
   */
  getNode(nodeId: string): GraphNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Get an edge by ID
   */
  getEdge(edgeId: string): GraphEdge | undefined {
    return this.edges.get(edgeId);
  }

  /**
   * Get all nodes as array
   */
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges as array
   */
  getAllEdges(): GraphEdge[] {
    return Array.from(this.edges.values());
  }

  /**
   * Check if node exists
   */
  private nodeExists(nodeId: string): boolean {
    return this.nodes.has(nodeId);
  }

  /**
   * Generate unique edge ID
   */
  private generateEdgeId(source: string, target: string, suffix?: string): string {
    let baseId = `edge-${source}-${target}`;
    if (suffix) {
      baseId += `-${suffix}`;
    }
    
    // Ensure uniqueness
    let counter = 0;
    let edgeId = baseId;
    while (this.edges.has(edgeId)) {
      counter++;
      edgeId = `${baseId}-${counter}`;
    }
    
    return edgeId;
  }

  /**
   * Add a new node to the graph
   */
  private addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    this.adjacencyList.set(node.id, new Set());
    this.reverseAdjacencyList.set(node.id, new Set());
  }

  /**
   * Remove a node from the graph
   */
  private removeNode(nodeId: string): void {
    // Remove all edges connected to this node
    const incomingEdges = Array.from(this.edges.values()).filter(e => e.target === nodeId);
    const outgoingEdges = Array.from(this.edges.values()).filter(e => e.source === nodeId);

    [...incomingEdges, ...outgoingEdges].forEach(edge => {
      this.removeEdge(edge.id);
    });

    // Remove node
    this.nodes.delete(nodeId);
    this.adjacencyList.delete(nodeId);
    this.reverseAdjacencyList.delete(nodeId);
  }

  /**
   * Add a new edge to the graph
   */
  private addEdge(edge: GraphEdge): void {
    // Validate that both nodes exist
    if (!this.nodeExists(edge.source) || !this.nodeExists(edge.target)) {
      console.error(`Cannot add edge: nodes ${edge.source} or ${edge.target} do not exist`);
      return;
    }

    this.edges.set(edge.id, edge);
    this.adjacencyList.get(edge.source)?.add(edge.target);
    this.reverseAdjacencyList.get(edge.target)?.add(edge.source);
  }

  /**
   * Remove an edge from the graph
   */
  private removeEdge(edgeId: string): void {
    const edge = this.edges.get(edgeId);
    if (edge) {
      this.adjacencyList.get(edge.source)?.delete(edge.target);
      this.reverseAdjacencyList.get(edge.target)?.delete(edge.source);
      this.edges.delete(edgeId);
    }
  }

  /**
   * Insert a node after another node
   */
  insertNodeAfter(
    targetNodeId: string,
    newNode: Omit<GraphNode, 'id'>,
    newNodeId: string,
    openActionModal?: (insertIndex: number) => void
  ): WorkflowGraph {
    const newGraph = this.clone();

    console.log('🔍 WorkflowGraph.insertNodeAfter:', { targetNodeId, newNodeId, currentNodes: newGraph.getAllNodes().length });

    // Validate target node exists
    if (!newGraph.nodeExists(targetNodeId)) {
      console.error(`Target node ${targetNodeId} does not exist`);
      return newGraph;
    }

    console.log('🔍 WorkflowGraph.insertNodeAfter - using dynamic index calculation in FlowEdge');

    // Create the new node
    const nodeToInsert: GraphNode = {
      id: newNodeId,
      ...newNode,
      position: { x: 0, y: 0 } // Temporary position - dagre will override
    };

    // Get all edges that currently have targetNodeId as source
    const targetOutgoingEdges = Array.from(newGraph.edges.values()).filter(edge => edge.source === targetNodeId);

    console.log('🔍 Target outgoing edges:', targetOutgoingEdges.map(e => `${e.source} -> ${e.target}`));

    // Add the new node
    newGraph.addNode(nodeToInsert);

    // Create edge from target to new node
    const targetToNewEdge: GraphEdge = {
      id: newGraph.generateEdgeId(targetNodeId, newNodeId),
      source: targetNodeId,
      target: newNodeId,
      type: 'flowEdge',
      data: {
        onOpenActionModal: openActionModal || ((insertIndex: number) => {
          console.log('🔍 Plus button clicked after inserted node, no handler provided');
        }),
        // Index will be calculated dynamically in FlowEdge component
      }
    };
    newGraph.addEdge(targetToNewEdge);

    // Check if this is a condition node - if so, create Yes/No branches
    const isConditionNode = nodeToInsert.type === 'condition';

    if (isConditionNode) {
      console.log('🔍 Creating Yes/No branches for condition node:', newNodeId);

      // Create placeholder nodes for Yes and No branches
      const yesPlaceholderId = `placeholder-yes-${Date.now()}`;
      const noPlaceholderId = `placeholder-no-${Date.now()}`;

      // Create the actual placeholder NODES first - match the old working structure
      const yesPlaceholder: GraphNode = {
        id: yesPlaceholderId,
        type: 'placeholder',
        position: { x: 0, y: 0 },
        width: 280, // Add width like the old code
        height: 280, // Add height like the old code
        data: {
          label: 'Add Action',
          isConfigured: false,
          branchType: 'yes' as const,
          conditionNodeId: newNodeId,
          handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
            console.log('🔍 Yes placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId });
            // This will be properly set when the graph is converted to React Flow nodes
          },
        }
      };

      const noPlaceholder: GraphNode = {
        id: noPlaceholderId,
        type: 'placeholder',
        position: { x: 0, y: 0 },
        width: 280, // Add width like the old code
        height: 280, // Add height like the old code
        data: {
          label: 'Add Action',
          isConfigured: false,
          branchType: 'no' as const,
          conditionNodeId: newNodeId,
          handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
            console.log('🔍 No placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId });
            // This will be properly set when the graph is converted to React Flow nodes
          },
        }
      };

      // Add the placeholder nodes to the graph
      console.log('🔍 Adding Yes placeholder node:', yesPlaceholderId);
      newGraph.addNode(yesPlaceholder);
      console.log('🔍 Adding No placeholder node:', noPlaceholderId);
      newGraph.addNode(noPlaceholder);

      // Create Yes branch edge
      const yesEdge: GraphEdge = {
        id: `edge-${newNodeId}-yes`,
        source: newNodeId,
        target: yesPlaceholderId,
        sourceHandle: 'yes',
        type: 'condition',
        label: 'Yes',
        data: { branchType: 'yes' }
      };

      // Create No branch edge
      const noEdge: GraphEdge = {
        id: `edge-${newNodeId}-no`,
        source: newNodeId,
        target: noPlaceholderId,
        sourceHandle: 'no',
        type: 'condition',
        label: 'No',
        data: { branchType: 'no' }
      };

      // Always create both Yes and No placeholder edges first
      console.log('🔍 Creating Yes placeholder edge:', yesEdge.id);
      newGraph.addEdge(yesEdge);
      console.log('🔍 Creating No placeholder edge:', noEdge.id);
      newGraph.addEdge(noEdge);

      // ✅ Check if we should move downstream flow to Yes branch or create empty placeholders
      // 🎯 FOR CONDITIONAL NODES: Only move REAL nodes (action/condition), NOT ghost nodes
      const hasRealDownstreamNodes = targetOutgoingEdges.some(edge => {
        const targetNode = this.nodes.get(edge.target);
        return targetNode &&
               !edge.target.startsWith('placeholder-') &&
               edge.target !== 'virtual-end' &&
               targetNode.type !== 'placeholder' &&
               // 🎯 CONDITIONAL NODES: Ghost nodes should be DELETED, not moved
               // Only move real action/condition nodes to Yes branch
               (targetNode.type === 'action' || targetNode.type === 'condition');
      });

      if (hasRealDownstreamNodes) {
        console.log('🔍 Condition inserted in middle of flow - moving REAL downstream to Yes branch');

        // Move only REAL downstream nodes (action/condition) to Yes branch
        targetOutgoingEdges.forEach(edge => {
          const downstreamNode = this.nodes.get(edge.target);

          if (downstreamNode && (downstreamNode.type === 'action' || downstreamNode.type === 'condition')) {
            console.log('🔍 Moving REAL downstream node to Yes branch:', `${edge.source} -> ${edge.target}`);

            // Remove the old edge from target node
            newGraph.removeEdge(edge.id);

            // Create new edge from Yes placeholder to the downstream target
            const yesToDownstreamEdge: GraphEdge = {
              id: newGraph.generateEdgeId(yesPlaceholderId, edge.target),
              source: yesPlaceholderId,
              target: edge.target,
              type: edge.type || 'flowEdge',
              label: edge.label,
              sourceHandle: edge.sourceHandle,
              data: edge.data
            };
            newGraph.addEdge(yesToDownstreamEdge);
          }
        });
      }

      // 🎯 ALWAYS remove ghost nodes and placeholder connections for conditional nodes
      console.log('🔍 Conditional node: Deleting ghost nodes and placeholder connections');

      targetOutgoingEdges.forEach(edge => {
        const downstreamNode = this.nodes.get(edge.target);

        if (downstreamNode && (downstreamNode.type === 'ghost' || downstreamNode.type === 'placeholder' || edge.target === 'virtual-end')) {
          console.log('🔍 Deleting ghost/placeholder node:', edge.target);

          // Remove the edge
          newGraph.removeEdge(edge.id);

          // Delete ghost nodes completely
          if (downstreamNode.type === 'ghost') {
            newGraph.removeNode(edge.target);
          }
        }
      });
    } else {
      // Regular node - reconnect all downstream edges to go through the new node
      targetOutgoingEdges.forEach(edge => {
        console.log('🔍 Processing edge:', `${edge.source} -> ${edge.target}`);

        // Remove the old edge
        newGraph.removeEdge(edge.id);

        // Create new edge from new node to the original target
        const newToDownstreamEdge: GraphEdge = {
          id: newGraph.generateEdgeId(newNodeId, edge.target),
          source: newNodeId,
          target: edge.target,
          type: edge.type || 'flowEdge',
          label: edge.label,
          sourceHandle: edge.sourceHandle,
          data: {
            onOpenActionModal: openActionModal || ((insertIndex: number) => {
              console.log('🔍 Plus button clicked after reconnected edge, no handler provided');
            }),
            // Index will be calculated dynamically in FlowEdge component
          }
        };
        newGraph.addEdge(newToDownstreamEdge);
      });
    }

    console.log('✅ Node insertion complete:', {
      newNodeId,
      totalNodes: newGraph.getAllNodes().length,
      totalEdges: newGraph.getAllEdges().length
    });

    return newGraph;
  }

  /**
   * Insert a condition node after another node with branch selection
   */
  insertConditionNodeAfter(
    targetNodeId: string,
    newConditionNode: Omit<GraphNode, 'id'>,
    newNodeId: string,
    moveActionTo: 'yes' | 'no',
    openActionModal?: (insertIndex: number) => void
  ): WorkflowGraph {
    const newGraph = this.clone();

    console.log('🔍 WorkflowGraph.insertConditionNodeAfter:', {
      targetNodeId,
      newNodeId,
      moveActionTo,
      currentNodes: newGraph.getAllNodes().length
    });

    // Validate target node exists
    if (!newGraph.nodeExists(targetNodeId)) {
      console.error(`Target node ${targetNodeId} does not exist`);
      return newGraph;
    }

    // Create the condition node
    const conditionNode: GraphNode = {
      id: newNodeId,
      ...newConditionNode,
      position: { x: 0, y: 0 } // Temporary position - dagre will override
    };

    // Get all edges that currently have targetNodeId as source (downstream nodes)
    const targetOutgoingEdges = Array.from(newGraph.edges.values()).filter(edge => edge.source === targetNodeId);

    console.log('🔍 Target outgoing edges (downstream):', targetOutgoingEdges.map(e => `${e.source} -> ${e.target}`));

    // Add the condition node
    newGraph.addNode(conditionNode);

    // Create edge from target to condition node
    const targetToConditionEdge: GraphEdge = {
      id: newGraph.generateEdgeId(targetNodeId, newNodeId),
      source: targetNodeId,
      target: newNodeId,
      type: 'flowEdge',
      data: {
        onOpenActionModal: openActionModal || ((insertIndex: number) => {
          console.log('🔍 Plus button clicked after condition node, no handler provided');
        }),
        // Index will be calculated dynamically in FlowEdge component
      }
    };
    newGraph.addEdge(targetToConditionEdge);

    // Create placeholder nodes for branches
    const yesPlaceholderId = `placeholder-yes-${newNodeId}`;
    const noPlaceholderId = `placeholder-no-${newNodeId}`;

    // Create placeholder nodes
    const yesPlaceholderNode: GraphNode = {
      id: yesPlaceholderId,
      type: 'placeholder',
      data: { branchType: 'yes' },
      position: { x: 0, y: 0 }
    };

    const noPlaceholderNode: GraphNode = {
      id: noPlaceholderId,
      type: 'placeholder',
      data: { branchType: 'no' },
      position: { x: 0, y: 0 }
    };

    // Handle downstream nodes based on moveActionTo selection
    if (targetOutgoingEdges.length > 0) {
      // Group all downstream nodes and move them to the selected branch
      const downstreamTargets = targetOutgoingEdges.map(edge => edge.target);
      
      // Remove all old edges
      targetOutgoingEdges.forEach(edge => {
        newGraph.removeEdge(edge.id);
      });

      if (moveActionTo === 'yes') {
        // Move all downstream to Yes branch
        downstreamTargets.forEach(target => {
          const newYesEdge: GraphEdge = {
            id: newGraph.generateEdgeId(newNodeId, target, 'yes'),
            source: newNodeId,
            target: target,
            sourceHandle: 'yes',
            type: 'condition',
            label: 'Yes',
            data: { branchType: 'yes' }
          };
          newGraph.addEdge(newYesEdge);
        });

        // Create No branch placeholder
        newGraph.addNode(noPlaceholderNode);
        const noEdge: GraphEdge = {
          id: newGraph.generateEdgeId(newNodeId, noPlaceholderId, 'no'),
          source: newNodeId,
          target: noPlaceholderId,
          sourceHandle: 'no',
          type: 'condition',
          label: 'No',
          data: { branchType: 'no' }
        };
        newGraph.addEdge(noEdge);
      } else {
        // Move all downstream to No branch
        downstreamTargets.forEach(target => {
          const newNoEdge: GraphEdge = {
            id: newGraph.generateEdgeId(newNodeId, target, 'no'),
            source: newNodeId,
            target: target,
            sourceHandle: 'no',
            type: 'condition',
            label: 'No',
            data: { branchType: 'no' }
          };
          newGraph.addEdge(newNoEdge);
        });

        // Create Yes branch placeholder
        newGraph.addNode(yesPlaceholderNode);
        const yesEdge: GraphEdge = {
          id: newGraph.generateEdgeId(newNodeId, yesPlaceholderId, 'yes'),
          source: newNodeId,
          target: yesPlaceholderId,
          sourceHandle: 'yes',
          type: 'condition',
          label: 'Yes',
          data: { branchType: 'yes' }
        };
        newGraph.addEdge(yesEdge);
      }
    } else {
      // No downstream nodes, create both placeholder branches
      newGraph.addNode(yesPlaceholderNode);
      newGraph.addNode(noPlaceholderNode);

      const yesEdge: GraphEdge = {
        id: newGraph.generateEdgeId(newNodeId, yesPlaceholderId, 'yes'),
        source: newNodeId,
        target: yesPlaceholderId,
        sourceHandle: 'yes',
        type: 'condition',
        label: 'Yes',
        data: { branchType: 'yes' }
      };

      const noEdge: GraphEdge = {
        id: newGraph.generateEdgeId(newNodeId, noPlaceholderId, 'no'),
        source: newNodeId,
        target: noPlaceholderId,
        sourceHandle: 'no',
        type: 'condition',
        label: 'No',
        data: { branchType: 'no' }
      };

      newGraph.addEdge(yesEdge);
      newGraph.addEdge(noEdge);
    }

    console.log('✅ Condition node insertion complete:', {
      newNodeId,
      moveActionTo,
      totalNodes: newGraph.getAllNodes().length,
      totalEdges: newGraph.getAllEdges().length
    });

    return newGraph;
  }

  /**
   * Delete a node and its subtree
   */
  deleteSubtree(nodeId: string): WorkflowGraph {
    const newGraph = this.clone();

    // Validate node exists
    if (!newGraph.nodeExists(nodeId)) {
      console.error(`Node ${nodeId} does not exist`);
      return newGraph;
    }

    // Get all nodes to delete (node + downstream)
    const nodesToDelete = [nodeId, ...newGraph.getDownstreamNodes(nodeId)];

    // Get parent nodes and their edges to the deleted node
    const parentEdges = Array.from(newGraph.edges.values()).filter(edge => edge.target === nodeId);

    // Find reconnection targets (children of deleted node that won't be deleted)
    const reconnectionTargets: string[] = [];
    const immediateChildren = newGraph.getChildren(nodeId);
    
    immediateChildren.forEach(child => {
      if (!nodesToDelete.includes(child)) {
        reconnectionTargets.push(child);
      }
    });

    // Remove all nodes in the subtree
    nodesToDelete.forEach(id => {
      newGraph.removeNode(id);
    });

    // Reconnect parent nodes to reconnection targets
    // ✅ BUT ONLY if the parent node is NOT a conditional node
    if (reconnectionTargets.length > 0 && parentEdges.length > 0) {
      parentEdges.forEach(parentEdge => {
        // ✅ Check if the parent node should connect to End node
        const parentNode = newGraph.nodes.get(parentEdge.source);

        if (parentNode && parentNode.type === 'condition') {
          console.log('🔍 Skipping reconnection - parent node is condition:', parentEdge.source, parentNode.type);
          // Only ACTION and TRIGGER nodes should connect to End node
          // CONDITION nodes should NOT connect to End node
          return;
        }

        // ✅ Only reconnect if parent is NOT a conditional node
        reconnectionTargets.forEach(target => {
          console.log('🔍 Reconnecting non-conditional parent:', parentEdge.source, '->', target);
          const reconnectEdge: GraphEdge = {
            id: newGraph.generateEdgeId(parentEdge.source, target),
            source: parentEdge.source,
            target: target,
            type: parentEdge.type || 'flowEdge',
            label: parentEdge.label,
            sourceHandle: parentEdge.sourceHandle,
            data: parentEdge.data
          };
          newGraph.addEdge(reconnectEdge);
        });
      });
    } else if (reconnectionTargets.length === 0 && parentEdges.length > 0) {
      // ✅ Special case: If there are no reconnection targets (e.g., deleting a condition node)
      // but there are parent edges, we should connect the parent to virtual-end
      parentEdges.forEach(parentEdge => {
        const parentNode = newGraph.nodes.get(parentEdge.source);

        if (parentNode && parentNode.type === 'condition') {
          console.log('🔍 Skipping virtual-end reconnection - parent node is condition:', parentEdge.source);
          return;
        }

        // Connect parent to virtual-end if it's an action or trigger node
        if (parentNode && (parentNode.type === 'action' || parentNode.type === 'trigger')) {
          console.log('🔍 Reconnecting parent to virtual-end after condition deletion:', parentEdge.source, '-> virtual-end');
          const reconnectToEndEdge: GraphEdge = {
            id: newGraph.generateEdgeId(parentEdge.source, 'virtual-end'),
            source: parentEdge.source,
            target: 'virtual-end',
            type: 'flowEdge',
            data: parentEdge.data
          };
          newGraph.addEdge(reconnectToEndEdge);
        }
      });
    }

    return newGraph;
  }

  /**
   * Cut a single node from the graph
   */
  cutNode(nodeId: string): { cutNodes: GraphNode[], cutEdges: GraphEdge[], newGraph: WorkflowGraph } {
    console.log('🔍 WorkflowGraph.cutNode:', nodeId);

    const newGraph = this.clone();
    const nodeToCut = newGraph.nodes.get(nodeId);

    if (!nodeToCut) {
      console.error('❌ Node not found for cutting:', nodeId);
      return { cutNodes: [], cutEdges: [], newGraph: this };
    }

    // Get all edges connected to this node
    const connectedEdges = Array.from(newGraph.edges.values()).filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );

    // Find incoming and outgoing edges for reconnection
    const incomingEdge = connectedEdges.find(edge => edge.target === nodeId);
    const outgoingEdge = connectedEdges.find(edge => edge.source === nodeId);

    // Remove the node and its edges
    newGraph.removeNode(nodeId);
    connectedEdges.forEach(edge => newGraph.removeEdge(edge.id));

    // If the node was in the middle of a flow, reconnect the edges
    // ✅ BUT ONLY if the source node is NOT a conditional node
    if (incomingEdge && outgoingEdge) {
      // ✅ Check if the source node should connect to End node
      const sourceNode = newGraph.nodes.get(incomingEdge.source);

      if (sourceNode && sourceNode.type === 'condition') {
        console.log('🔍 Skipping reconnection in cutNode - source node is condition:', incomingEdge.source, sourceNode.type);
        // Only ACTION and TRIGGER nodes should connect to End node
        // CONDITION nodes should NOT connect to End node
        return {
          cutNodes: [nodeToCut],
          cutEdges: connectedEdges,
          newGraph
        };
      }

      // ✅ Only reconnect if source is NOT a conditional node
      const reconnectionEdge: GraphEdge = {
        id: `reconnect-${Date.now()}`,
        source: incomingEdge.source,
        target: outgoingEdge.target,
        type: 'flowEdge',
        data: {
          onOpenActionModal: incomingEdge.data?.onOpenActionModal || outgoingEdge.data?.onOpenActionModal || (() => {}),
          index: incomingEdge.data?.index || outgoingEdge.data?.index || 0,
        }
      };
      newGraph.addEdge(reconnectionEdge);
      console.log('🔍 Reconnected flow in cutNode (non-conditional source):', incomingEdge.source, '->', outgoingEdge.target);
    }

    console.log('✅ Node cut successfully:', nodeId);
    return {
      cutNodes: [nodeToCut],
      cutEdges: connectedEdges,
      newGraph
    };
  }

  /**
   * Delete a single node and reconnect the flow (not the entire subtree)
   */
  deleteSingleNode(nodeId: string): WorkflowGraph {
    console.log('🔍 WorkflowGraph.deleteSingleNode:', nodeId);

    const newGraph = this.clone();
    const nodeToDelete = newGraph.nodes.get(nodeId);

    if (!nodeToDelete) {
      console.error('❌ Node not found for deletion:', nodeId);
      return this;
    }

    // Special handling for condition nodes - remove their placeholder children
    if (nodeToDelete.type === 'condition') {
      console.log('🔍 Deleting condition node - cleaning up placeholders');

      // Find all edges from this condition node
      const conditionEdges = Array.from(newGraph.edges.values()).filter(
        edge => edge.source === nodeId
      );

      // Remove placeholder nodes connected to this condition
      conditionEdges.forEach(edge => {
        const targetNode = newGraph.nodes.get(edge.target);
        if (targetNode && targetNode.type === 'placeholder') {
          console.log('🔍 Removing placeholder child:', edge.target);
          newGraph.removeNode(edge.target);
        }
      });
    }

    // Get all edges connected to this node
    const connectedEdges = Array.from(newGraph.edges.values()).filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );

    // Find incoming and outgoing edges for reconnection
    const incomingEdge = connectedEdges.find(edge => edge.target === nodeId);
    const outgoingEdge = connectedEdges.find(edge => edge.source === nodeId);

    // Remove the node and its edges
    newGraph.removeNode(nodeId);
    connectedEdges.forEach(edge => newGraph.removeEdge(edge.id));

    // If the node was in the middle of a flow, reconnect the edges
    // ✅ BUT ONLY if the source node is NOT a conditional node
    if (incomingEdge && outgoingEdge) {
      // ✅ Check if the source node should connect to End node
      const sourceNode = newGraph.nodes.get(incomingEdge.source);

      if (sourceNode && sourceNode.type === 'condition') {
        console.log('🔍 Skipping reconnection in deleteSingleNode - source node is condition:', incomingEdge.source, sourceNode.type);
        // Only ACTION and TRIGGER nodes should connect to End node
        // CONDITION nodes should NOT connect to End node
        return newGraph;
      }

      // ✅ Only reconnect if source is NOT a conditional node
      const reconnectionEdge: GraphEdge = {
        id: `reconnect-${Date.now()}`,
        source: incomingEdge.source,
        target: outgoingEdge.target,
        type: 'flowEdge',
        data: {
          onOpenActionModal: incomingEdge.data?.onOpenActionModal || outgoingEdge.data?.onOpenActionModal || (() => {}),
          index: incomingEdge.data?.index || outgoingEdge.data?.index || 0,
        }
      };
      newGraph.addEdge(reconnectionEdge);
      console.log('🔍 Reconnected flow after single node deletion (non-conditional source):', incomingEdge.source, '->', outgoingEdge.target);
    }

    console.log('✅ Single node deleted successfully:', nodeId);
    return newGraph;
  }

  /**
   * Delete a node from a conditional branch using comprehensive graph-based cleanup
   */
  deleteConditionalBranchNode(
    nodeId: string,
    conditionNodeId: string,
    branchType: 'yes' | 'no',
    handleAddNodeToBranch?: (insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: unknown) => void
  ): WorkflowGraph {
    console.log('🔍 🎯 GRAPH-BASED DELETION:', { nodeId, conditionNodeId, branchType });

    const newGraph = this.clone();
    const nodeToDelete = newGraph.nodes.get(nodeId);

    if (!nodeToDelete) {
      console.error('❌ Node not found for deletion:', nodeId);
      return this;
    }

    // 🎯 STEP 1: Find ALL edges connected to this node
    const allEdges = Array.from(this.edges.values());
    const incomingEdges = allEdges.filter(edge => edge.target === nodeId);
    const outgoingEdges = allEdges.filter(edge => edge.source === nodeId);

    console.log('🔍 Edge analysis:', {
      incoming: incomingEdges.map(e => `${e.source}->${e.target}`),
      outgoing: outgoingEdges.map(e => `${e.source}->${e.target}`)
    });

    // 🎯 STEP 2: Remove the node and ALL its edges completely
    newGraph.removeNode(nodeId);
    [...incomingEdges, ...outgoingEdges].forEach(edge => {
      newGraph.removeEdge(edge.id);
      console.log('🔍 Removed edge:', `${edge.source}->${edge.target}`);
    });

    // 🎯 STEP 3: Smart reconnection logic - ALWAYS CREATE PLACEHOLDER FOR BRANCH
    if (outgoingEdges.length > 0 && incomingEdges.length > 0) {
      // Case 1: Node has both incoming and outgoing - direct reconnection
      console.log('🔍 Case 1: Direct reconnection (bypass placeholder)');
      incomingEdges.forEach(incomingEdge => {
        outgoingEdges.forEach(outgoingEdge => {
          const directEdge: GraphEdge = {
            ...incomingEdge,
            id: `${incomingEdge.source}-${outgoingEdge.target}`,
            target: outgoingEdge.target
          };
          newGraph.addEdge(directEdge);
          console.log('🔍 ✅ Direct edge created:', `${directEdge.source}->${directEdge.target}`);
        });
      });
    } else {
      // Case 2: ALWAYS create placeholder when deleting branch nodes
      console.log('🔍 Case 2: Create placeholder for branch (incoming:', incomingEdges.length, 'outgoing:', outgoingEdges.length, ')');

      const nodePosition = nodeToDelete.position;
      const newPlaceholderId = `placeholder-${branchType}-${Date.now()}`;
      const newPlaceholder: GraphNode = {
        id: newPlaceholderId,
        type: 'placeholder',
        position: nodePosition,
        width: 280,
        height: 280,
        data: {
          label: 'Add Node',
          isConfigured: false,
          branchType: branchType,
          conditionNodeId: conditionNodeId,
          handleAddNodeToBranch: handleAddNodeToBranch ?
            (branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
              console.log('🔍 Placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId });
              handleAddNodeToBranch(0, branchType as 'yes' | 'no', conditionNodeId, placeholderNodeId, {});
            } : undefined,
        }
      };

      newGraph.addNode(newPlaceholder);

      // 🎯 CRITICAL FIX: Always connect condition to placeholder, regardless of incoming edges
      if (incomingEdges.length > 0) {
        // Connect existing incoming edges to placeholder
        incomingEdges.forEach(incomingEdge => {
          const placeholderEdge: GraphEdge = {
            ...incomingEdge,
            id: `${incomingEdge.source}-${newPlaceholderId}`,
            target: newPlaceholderId
          };
          newGraph.addEdge(placeholderEdge);
          console.log('🔍 ✅ Placeholder edge created:', `${placeholderEdge.source}->${placeholderEdge.target}`);
        });
      } else {
        // 🎯 CRITICAL: Create direct edge from condition to placeholder
        const conditionToPlaceholderEdge: GraphEdge = {
          id: `edge-${conditionNodeId}-${branchType}-${newPlaceholderId}`,
          source: conditionNodeId,
          target: newPlaceholderId,
          sourceHandle: branchType,
          type: 'condition',
          label: branchType === 'yes' ? 'Yes' : 'No',
          data: { branchType: branchType }
        };
        newGraph.addEdge(conditionToPlaceholderEdge);
        console.log('🔍 ✅ Direct condition->placeholder edge created:', `${conditionNodeId}->${newPlaceholderId}`);
      }
    }

    // 🎯 STEP 4: Ensure the other branch always has a placeholder
    this.ensureBothBranchesHavePlaceholders(newGraph, conditionNodeId, branchType, handleAddNodeToBranch);

    // 🎯 STEP 5: Clean up any orphaned edges or nodes
    this.cleanupOrphanedElements(newGraph);

    console.log('✅ GRAPH-BASED: Branch node deletion completed');
    return newGraph;
  }

  /**
   * Ensure both branches of a condition node have placeholders when needed
   * This implements the array-based approach logic for stable branch management
   */
  private ensureBothBranchesHavePlaceholders(
    graph: WorkflowGraph,
    conditionNodeId: string,
    deletedBranchType: 'yes' | 'no',
    handleAddNodeToBranch?: (insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: unknown) => void
  ): void {
    console.log('🔍 🎯 ENSURING BOTH BRANCHES HAVE PLACEHOLDERS:', { conditionNodeId, deletedBranchType });

    const conditionNode = graph.nodes.get(conditionNodeId);
    if (!conditionNode || conditionNode.type !== 'condition') {
      console.log('🔍 Condition node not found or not a condition:', conditionNodeId);
      return;
    }

    // Find existing edges from the condition node
    const conditionEdges = Array.from(graph.edges.values()).filter(edge => edge.source === conditionNodeId);
    const yesEdge = conditionEdges.find(edge => edge.sourceHandle === 'yes' || edge.label === 'Yes');
    const noEdge = conditionEdges.find(edge => edge.sourceHandle === 'no' || edge.label === 'No');

    console.log('🔍 Current condition edges:', {
      yesEdge: yesEdge ? `${yesEdge.source} -> ${yesEdge.target}` : 'none',
      noEdge: noEdge ? `${noEdge.source} -> ${noEdge.target}` : 'none'
    });

    // 🎯 CRITICAL FIX: Check BOTH branches and create placeholders for ANY empty branch
    const branchesToCheck: Array<'yes' | 'no'> = ['yes', 'no'];

    branchesToCheck.forEach(branchType => {
      const branchEdge = branchType === 'yes' ? yesEdge : noEdge;
      const needsPlaceholder = !branchEdge ||
                              branchEdge.target === 'virtual-end' ||
                              !graph.nodes.has(branchEdge.target);

      if (needsPlaceholder) {
        console.log('🔍 🎯 Creating placeholder for', branchType, 'branch (missing or invalid edge)');

        const placeholderId = `placeholder-${branchType}-${Date.now()}`;
        const placeholder: GraphNode = {
          id: placeholderId,
          type: 'placeholder',
          position: { x: 0, y: 0 },
          width: 280,
          height: 280,
          data: {
            label: 'Add Node',
            isConfigured: false,
            branchType: branchType,
            conditionNodeId: conditionNodeId,
            handleAddNodeToBranch: handleAddNodeToBranch ?
              (branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
                console.log('🔍 Branch placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId });
                handleAddNodeToBranch(0, branchType as 'yes' | 'no', conditionNodeId, placeholderNodeId, {});
              } :
              undefined,
          }
        };

        // Add the placeholder node
        graph.addNode(placeholder);

        // Remove existing edge if it exists
        if (branchEdge) {
          graph.removeEdge(branchEdge.id);
        }

        // Create edge from condition to placeholder
        const placeholderEdge: GraphEdge = {
          id: `edge-${conditionNodeId}-${branchType}-${Date.now()}`,
          source: conditionNodeId,
          target: placeholderId,
          sourceHandle: branchType,
          type: 'condition',
          label: branchType === 'yes' ? 'Yes' : 'No',
          data: { branchType: branchType }
        };
        graph.addEdge(placeholderEdge);

        console.log('✅ Created placeholder for', branchType, 'branch:', placeholderId);
      }
    });
  }

  /**
   * Clean up orphaned edges and nodes that are no longer connected
   */
  private cleanupOrphanedElements(graph: WorkflowGraph): void {
    console.log('🔍 Cleaning up orphaned elements');

    // Find edges that point to non-existent nodes
    const orphanedEdges: string[] = [];
    graph.edges.forEach((edge, edgeId) => {
      const sourceExists = graph.nodes.has(edge.source);
      const targetExists = graph.nodes.has(edge.target);

      if (!sourceExists || !targetExists) {
        orphanedEdges.push(edgeId);
        console.log('🔍 Found orphaned edge:', `${edge.source}->${edge.target}`, { sourceExists, targetExists });
      }
    });

    // Remove orphaned edges
    orphanedEdges.forEach(edgeId => {
      graph.removeEdge(edgeId);
      console.log('🔍 ✅ Removed orphaned edge:', edgeId);
    });

    // Find nodes that have no connections (except virtual-end and triggers)
    const orphanedNodes: string[] = [];
    graph.nodes.forEach((node, nodeId) => {
      if (node.type === 'trigger' || nodeId === 'virtual-end') {
        return; // Skip triggers and virtual-end
      }

      const hasIncoming = Array.from(graph.edges.values()).some(edge => edge.target === nodeId);
      const hasOutgoing = Array.from(graph.edges.values()).some(edge => edge.source === nodeId);

      if (!hasIncoming && !hasOutgoing) {
        orphanedNodes.push(nodeId);
        console.log('🔍 Found orphaned node:', nodeId, node.type);
      }
    });

    // Remove orphaned nodes
    orphanedNodes.forEach(nodeId => {
      graph.removeNode(nodeId);
      console.log('🔍 ✅ Removed orphaned node:', nodeId);
    });

    console.log('✅ Cleanup completed:', { orphanedEdges: orphanedEdges.length, orphanedNodes: orphanedNodes.length });
  }

  /**
   * Add a conditional node at the end of the flow (before virtual-end)
   */
  addConditionalNodeAtEnd(
    conditionNode: GraphNode,
    handleAddNodeToBranch?: (insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: unknown) => void
  ): WorkflowGraph {
    console.log('🔍 WorkflowGraph.addConditionalNodeAtEnd:', conditionNode.id);

    const newGraph = this.clone();

    // Find the node that currently connects to virtual-end
    const edgeToEnd = Array.from(this.edges.values()).find(edge => edge.target === 'virtual-end');

    if (!edgeToEnd) {
      console.error('❌ No edge to virtual-end found');
      return this;
    }

    const lastNodeId = edgeToEnd.source;
    console.log('🔍 Last node before virtual-end:', lastNodeId);

    // Remove the edge to virtual-end
    newGraph.removeEdge(edgeToEnd.id);

    // Create Yes and No placeholders FIRST
    const timestamp = Date.now();
    const yesPlaceholderId = `placeholder-yes-${timestamp}`;
    const noPlaceholderId = `placeholder-no-${timestamp}`;

    const yesPlaceholder: GraphNode = {
      id: yesPlaceholderId,
      type: 'placeholder',
      position: { x: 0, y: 0 },
      width: 280,
      height: 280,
      data: {
        label: 'Add Action',
        isConfigured: false,
        branchType: 'yes' as const,
        conditionNodeId: conditionNode.id,
        handleAddNodeToBranch: () => {
          console.log('🔍 Yes placeholder clicked - handleAddNodeToBranch not properly set');
        },
      }
    };

    const noPlaceholder: GraphNode = {
      id: noPlaceholderId,
      type: 'placeholder',
      position: { x: 0, y: 0 },
      width: 280,
      height: 280,
      data: {
        label: 'Add Action',
        isConfigured: false,
        branchType: 'no' as const,
        conditionNodeId: conditionNode.id,
        handleAddNodeToBranch: () => {
          console.log('🔍 No placeholder clicked - handleAddNodeToBranch not properly set');
        },
      }
    };

    // Add ALL nodes first before creating edges
    console.log('🔍 Adding condition node:', conditionNode.id);
    newGraph.addNode(conditionNode);

    console.log('🔍 Adding Yes placeholder:', yesPlaceholderId);
    newGraph.addNode(yesPlaceholder);

    console.log('🔍 Adding No placeholder:', noPlaceholderId);
    newGraph.addNode(noPlaceholder);

    // Connect last node to condition node
    const lastToConditionEdge: GraphEdge = {
      id: `edge-${lastNodeId}-${conditionNode.id}`,
      source: lastNodeId,
      target: conditionNode.id,
      type: 'flowEdge',
      data: edgeToEnd.data // Preserve the original edge data
    };
    newGraph.addEdge(lastToConditionEdge);

    // Verify all nodes exist before creating edges
    if (!newGraph.nodes.has(conditionNode.id)) {
      console.error('❌ Condition node not found in graph:', conditionNode.id);
      return this;
    }
    if (!newGraph.nodes.has(yesPlaceholderId)) {
      console.error('❌ Yes placeholder not found in graph:', yesPlaceholderId);
      return this;
    }
    if (!newGraph.nodes.has(noPlaceholderId)) {
      console.error('❌ No placeholder not found in graph:', noPlaceholderId);
      return this;
    }

    // Connect condition node to Yes placeholder
    const conditionToYesEdge: GraphEdge = {
      id: `edge-${conditionNode.id}-yes`,
      source: conditionNode.id,
      sourceHandle: 'yes',
      target: yesPlaceholderId,
      type: 'condition',
      label: 'Yes',
      data: { branchType: 'yes' }
    };
    console.log('🔍 Adding Yes edge:', conditionToYesEdge.id);
    newGraph.addEdge(conditionToYesEdge);

    // Connect condition node to No placeholder
    const conditionToNoEdge: GraphEdge = {
      id: `edge-${conditionNode.id}-no`,
      source: conditionNode.id,
      sourceHandle: 'no',
      target: noPlaceholderId,
      type: 'condition',
      label: 'No',
      data: { branchType: 'no' }
    };
    console.log('🔍 Adding No edge:', conditionToNoEdge.id);
    newGraph.addEdge(conditionToNoEdge);

    console.log('✅ Conditional node added at end with Yes/No placeholders');
    return newGraph;
  }

  /**
   * Cut entire flow from a node using BFS traversal
   */
  cutFlowFromNode(nodeId: string): { cutNodes: GraphNode[], cutEdges: GraphEdge[], newGraph: WorkflowGraph } {
    console.log('🔍 🎯 ENHANCED cutFlowFromNode:', nodeId);

    const newGraph = this.clone();
    const { nodes: subNodes, edges: subEdges } = this.getSubtree(nodeId);

    // Find incoming edge to the start node for branch analysis
    const incomingEdge = Array.from(this.edges.values()).find(edge => edge.target === nodeId);

    // 🎯 BRANCH ANALYSIS: Check if this is a branch node
    let isBranchNode = false;
    let conditionNodeId = '';
    let branchType: 'yes' | 'no' = 'yes';

    if (incomingEdge) {
      const sourceNode = this.nodes.get(incomingEdge.source);
      if (sourceNode?.type === 'condition') {
        isBranchNode = true;
        conditionNodeId = incomingEdge.source;
        branchType = (incomingEdge.sourceHandle as 'yes' | 'no') ||
                    (incomingEdge.label?.toLowerCase() === 'no' ? 'no' : 'yes');
        console.log('🔍 Cutting from branch:', { conditionNodeId, branchType });
      }
    }

    // Remove all nodes and edges in the subtree
    subNodes.forEach(node => newGraph.removeNode(node.id));
    subEdges.forEach(edge => newGraph.removeEdge(edge.id));

    // 🎯 BRANCH PLACEHOLDER: If cutting from a branch, create placeholder
    if (isBranchNode && incomingEdge) {
      console.log('🔍 Creating placeholder for cut branch:', branchType);

      const placeholderId = `placeholder-${branchType}-${Date.now()}`;
      const placeholder: GraphNode = {
        id: placeholderId,
        type: 'placeholder',
        position: { x: 0, y: 0 },
        width: 280,
        height: 280,
        data: {
          label: 'Add Node',
          isConfigured: false,
          branchType: branchType,
          conditionNodeId: conditionNodeId,
          handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
            console.log('🔍 Cut branch placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId });
          },
        }
      };

      newGraph.addNode(placeholder);

      // Create edge from condition to placeholder
      const placeholderEdge: GraphEdge = {
        id: `edge-${conditionNodeId}-${branchType}-${Date.now()}`,
        source: conditionNodeId,
        target: placeholderId,
        sourceHandle: branchType,
        type: 'condition',
        label: branchType === 'yes' ? 'Yes' : 'No',
        data: { branchType: branchType }
      };
      newGraph.addEdge(placeholderEdge);
      console.log('🔍 ✅ Created placeholder for cut branch:', placeholderId);

    } else if (incomingEdge) {
      // 🎯 MAIN FLOW: Reconnect to End node if needed
      const edgeToEnd = subEdges.find(edge => edge.target === 'virtual-end' || edge.target.includes('end'));
      if (edgeToEnd) {
        const reconnectionEdge: GraphEdge = {
          id: `reconnect-end-${Date.now()}`,
          source: incomingEdge.source,
          target: 'virtual-end',
          type: 'flowEdge',
          data: {
            onOpenActionModal: incomingEdge.data?.onOpenActionModal || (() => {}),
          }
        };
        newGraph.addEdge(reconnectionEdge);
        console.log('🔍 Reconnected to End:', incomingEdge.source, '-> virtual-end');
      }
    }

    console.log('✅ Enhanced flow cut completed:', { nodeId, nodes: subNodes.length, isBranchNode });
    return {
      cutNodes: subNodes,
      cutEdges: subEdges,
      newGraph
    };
  }

  /**
   * Paste cut nodes at a specific position
   */
  pasteNodes(
    cutNodes: GraphNode[],
    cutEdges: GraphEdge[],
    afterNodeId: string,
    openActionModal?: (insertIndex: number) => void
  ): WorkflowGraph {
    console.log('🔍 WorkflowGraph.pasteNodes after:', afterNodeId, 'nodes:', cutNodes.length);

    const newGraph = this.clone();

    if (cutNodes.length === 0) {
      console.log('❌ No nodes to paste');
      return newGraph;
    }

    // For single node paste - use proper insertion logic
    if (cutNodes.length === 1) {
      const nodeToInsert = cutNodes[0];
      console.log('🔍 Pasting single node:', nodeToInsert.id);

      // Find the outgoing edges from afterNodeId
      const outgoingEdges = Array.from(newGraph.edges.values()).filter(edge => edge.source === afterNodeId);

      // Add the cut node to the graph
      newGraph.addNode(nodeToInsert);

      // Remove existing outgoing edges from afterNodeId
      outgoingEdges.forEach(edge => newGraph.removeEdge(edge.id));

      // Calculate proper indices for the edges
      const flowNodes = Array.from(newGraph.nodes.values()).filter(node =>
        node.type !== 'placeholder' &&
        node.id !== 'virtual-end' &&
        !node.id.startsWith('placeholder-')
      );

      const afterNodeIndex = flowNodes.findIndex(node => node.id === afterNodeId);
      const insertIndex = afterNodeIndex >= 0 ? afterNodeIndex + 1 : flowNodes.length;

      // Connect afterNodeId to the cut node
      const connectionEdge: GraphEdge = {
        id: `paste-${afterNodeId}-${nodeToInsert.id}`,
        source: afterNodeId,
        target: nodeToInsert.id,
        type: 'flowEdge',
        data: {
          onOpenActionModal: openActionModal || (() => {}),
          index: insertIndex,
        }
      };
      newGraph.addEdge(connectionEdge);

      // Reconnect the cut node to the original targets
      outgoingEdges.forEach(edge => {
        // Calculate index for the outgoing edge
        let edgeIndex = insertIndex + 1;
        if (edge.target === 'virtual-end') {
          edgeIndex = flowNodes.length; // Use total flow nodes for virtual-end
        }

        const reconnectEdge: GraphEdge = {
          id: `reconnect-${nodeToInsert.id}-${edge.target}`,
          source: nodeToInsert.id,
          target: edge.target,
          type: edge.type,
          label: edge.label,
          data: {
            ...edge.data,
            index: edgeIndex,
            onOpenActionModal: edge.data?.onOpenActionModal || openActionModal || (() => {}),
          }
        };
        newGraph.addEdge(reconnectEdge);
      });

      console.log('✅ Single node pasted successfully');
      return newGraph;
    }

    // For multiple nodes (flow paste) - simplified approach
    console.log('🔍 Pasting multiple nodes as flow');

    // Add all cut nodes
    cutNodes.forEach(node => newGraph.addNode(node));

    // Add internal edges between cut nodes
    cutEdges.forEach(edge => {
      if (cutNodes.some(n => n.id === edge.source) && cutNodes.some(n => n.id === edge.target)) {
        newGraph.addEdge(edge);
      }
    });

    // Find the first node in the cut flow (node with no incoming edges from within the cut)
    const firstNode = cutNodes.find(node =>
      !cutEdges.some(edge => edge.target === node.id && cutNodes.some(n => n.id === edge.source))
    );

    if (firstNode) {
      // Connect afterNode to the first cut node
      const targetOutgoingEdges = Array.from(newGraph.edges.values()).filter(edge => edge.source === afterNodeId);

      // Remove existing outgoing edges from afterNode
      targetOutgoingEdges.forEach(edge => newGraph.removeEdge(edge.id));

      // Connect afterNode to first cut node
      const connectionEdge: GraphEdge = {
        id: `paste-${Date.now()}`,
        source: afterNodeId,
        target: firstNode.id,
        type: 'flowEdge',
        data: {
          onOpenActionModal: openActionModal || (() => {}),
        }
      };
      newGraph.addEdge(connectionEdge);

      // Find the last node in the cut flow and reconnect to original targets
      const lastNode = cutNodes.find(node =>
        !cutEdges.some(edge => edge.source === node.id && cutNodes.some(n => n.id === edge.target))
      );

      if (lastNode) {
        targetOutgoingEdges.forEach(edge => {
          const newEdge: GraphEdge = {
            id: `reconnect-${Date.now()}`,
            source: lastNode.id,
            target: edge.target,
            type: edge.type,
            label: edge.label,
            data: edge.data
          };
          newGraph.addEdge(newEdge);
        });
      }
    }

    console.log('✅ Multiple nodes pasted successfully');
    return newGraph;
  }





  /**
   * Create a deep copy of the graph
   */
  clone(): WorkflowGraph {
    const { nodes, edges } = this.toReactFlow();
    return new WorkflowGraph(nodes, edges);
  }
}