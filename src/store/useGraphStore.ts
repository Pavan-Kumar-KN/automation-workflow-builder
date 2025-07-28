import { create } from "zustand";
import { useWorkflowStore } from "@/hooks/useWorkflowState";

export type NodeType =
  | "trigger"
  | "endNode"
  | "condition"
  | "action"
  | "placeholder"
  | "ghost"
  | "stickyNote";

type GraphNode = {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    icon?: string;
    color?: string;
    customLabel?: string;
    config?: Record<string, any>;
    isConfigured?: boolean;
    branchType?: "yes" | "no";
    conditionNodeId?: string;
    yesPlaceholderId?: string;
    noPlaceholderId?: string;
    notes?: string;
    // Sticky note specific properties
    text?: string;
    isVisible?: boolean;
    width?: number;
    height?: number;
  };
  parent?: string;
  children?: string[]; // for linear flow
  branchType?: "yes" | "no"; // <- added
  branches?: {
    yes: string[]; // <- new
    no: string[];
  };
  draggable?: boolean; // for sticky notes
};

interface GraphState {
  nodes: Record<string, GraphNode>;
  
  replacingConditionId: string | null;
  clipboard: {
    type: 'action' | 'condition' | 'flow' | null;
    data: GraphNode | GraphNode[] | null;
  };

  // ? this function is adding initial nodes
  addNode: (node: GraphNode) => void;

  removeNode: (id: string) => void;

  // Sticky note methods
  addStickyNote: (color: string) => string;
  updateStickyNoteText: (id: string, text: string) => void;
  updateStickyNoteDimensions: (id: string, dimensions: { width: number; height: number }) => void;

  insertNode: (params: {
    type: NodeType;
    parentId: string;
    beforeNodeId: string;
    actionData?: Record<string, unknown>;
  }) => void;

  addNodeToBranch: (params: {
    conditionNodeId: string;
    branchType: "yes" | "no";
    placeholderNodeId: string;
    actionData: Record<string, unknown>;
  }) => void;


  // Duplicate operations
  duplicateNode?: (nodeId: string) => string | null;

  // Move operations
  moveNode: (params: {
    nodeId: string;
    targetParentId: string;
    targetBeforeNodeId: string;
  }) => void;
  moveFlow: (params: {
    startNodeId: string;
    targetParentId: string;
    targetBeforeNodeId: string;
  }) => void;

  ensureConditionalPlaceholders: () => void;
  cleanupDuplicatePlaceholders: () => void;
  cleanupOrphanedNodes: () => void;

  reset?: () => void;


  // ? This function is used for handling of the shifting of the branch of condition of the node 
  handleBranchShift?: (nodeId: string) => void;

  // ? This function is used update the notes attribute of the notes 
  updateNodeData?: (nodid: string, data: Partial<GraphNode['data']>) => void;

  // ? this function is used to handle the permission based deletion of the condtion node 
  handleDeleteConditionNode?: (nodeid: string, option: 'yes' | 'no' | 'all') => void;

  // * Helper function to the above function
  deleteSubtree?: (nodeId: string) => void;

  pasteConditionTree: (params: {
    nodesToPaste: GraphNode[];
    parentId: string;
    beforeNodeId: string;
  }) => void;

  // Copy/Paste operations for single nodes
  copyNode: (nodeId: string) => void;
  copyFlow: (startNodeId: string) => void;
  pasteNode: (params: {
    parentId: string;
    beforeNodeId: string;
  }) => void;
  pasteSingleNode: (nodeToPaste: GraphNode, parentId: string, beforeNodeId: string) => void;
  pasteFlow: (nodesToPaste: GraphNode[], parentId: string, beforeNodeId: string) => void;
  clearClipboard: () => void;
  hasClipboardData: () => boolean;

  // Replace condition functionality
  setReplacingConditionId: (nodeId: string | null) => void;
  replaceCondition: (newConditionData: any) => void;
}


export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: {},
  replacingConditionId: null,
  clipboard: {
    type: null,
    data: null,
  },

  addNode: (node) =>
    set((state) => ({ nodes: { ...state.nodes, [node.id]: node } })),

  // Add sticky note to graph
  addStickyNote: (color: string) => {
    const id = `sticky-${Date.now()}`;

    // Calculate position to stack notes visibly at the top-left
    const existingStickyNotes = Object.values(get().nodes).filter(node => node.type === 'stickyNote');
    const noteCount = existingStickyNotes.length;

    // Start at top-left and offset each new note slightly
    const baseX = 50;
    const baseY = 50;
    const offsetX = (noteCount % 3) * 220; // 3 notes per row, 220px apart
    const offsetY = Math.floor(noteCount / 3) * 140; // New row every 3 notes, 140px apart

    const stickyNote: GraphNode = {
      id,
      type: 'stickyNote',
      position: {
        x: baseX + offsetX,
        y: baseY + offsetY
      },
      data: {
        label: '',
        text: '',
        color,
        isVisible: true,
        width: 200,
        height: 120,
      },
      children: [],
      parent: null,
      draggable: true,
    };

    set((state) => ({
      nodes: { ...state.nodes, [id]: stickyNote }
    }));

    return id;
  },

  // Update sticky note text
  updateStickyNoteText: (id: string, text: string) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: {
          ...state.nodes[id],
          data: {
            ...state.nodes[id].data,
            text,
          }
        }
      }
    }));
  },

  // Update sticky note dimensions
  updateStickyNoteDimensions: (id: string, dimensions: { width: number; height: number }) => {
    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: {
          ...state.nodes[id],
          data: {
            ...state.nodes[id].data,
            width: dimensions.width,
            height: dimensions.height,
          }
        }
      }
    }));
  },

  insertNode: ({ type, parentId, beforeNodeId, actionData }) => {
    const id = `${type}-${Date.now()}`;
    const graph = get().nodes;

    // Check if this is a Remove Workflow node
    const isRemoveWorkflowNode = (actionData as any)?.id === 'remove-workflow-action' ||
      (actionData as any)?.id === 'exit-workflow-operation-action';

    // Validate Remove Workflow node placement
    if (isRemoveWorkflowNode) {
      const beforeNode = graph[beforeNodeId];

      // Remove Workflow nodes can only be placed before the End node
      if (beforeNode?.type !== 'endNode') {
        console.error('❌ Remove Workflow node can only be placed before the End node');
        throw new Error('Remove Workflow nodes can only be placed at the end of the workflow or branch');
      }

      console.log('✅ Remove Workflow node placement validated - before End node');
    }

    // Create a deep copy without functions to avoid structuredClone issues
    const updatedGraph: Record<string, GraphNode> = {};

    Object.entries(graph).forEach(([nodeId, node]) => {
      updatedGraph[nodeId] = {
        ...node,
        data: {
          ...node.data,
          // Filter out function properties that can't be cloned
          ...(Object.fromEntries(
            Object.entries(node.data).filter(([key, value]) => typeof value !== 'function')
          ))
        }
      };
    });

    const parentNode = updatedGraph[parentId];
    const beforeNode = updatedGraph[beforeNodeId];

    if (!parentNode || !beforeNode) {
      console.error("Parent or before node not found:", {
        parentId,
        beforeNodeId,
      });
      return;
    }

    // Check if this node is being added inside a branch
    let branchType: 'yes' | 'no' | '' = '';
    let conditionNodeId = '';

    // Search all condition nodes to see if the parent is in any branch
    for (const [nodeId, node] of Object.entries(updatedGraph)) {
      if (node.type === 'condition' && node.branches) {
        if (node.branches.yes && node.branches.yes.includes(parentId)) {
          branchType = 'yes';
          conditionNodeId = nodeId;
          break;
        } else if (node.branches.no && node.branches.no.includes(parentId)) {
          branchType = 'no';
          conditionNodeId = nodeId;
          break;
        }
      }
    }

    // Clean actionData to remove functions
    const cleanActionData = actionData ? Object.fromEntries(
      Object.entries(actionData).filter(([key, value]) => typeof value !== 'function')
    ) : {};

    // Create the new node with action data
    const newNode: GraphNode = {
      id,
      type,
      data: {
        ...cleanActionData,
        label: (actionData?.label as string) || (type === "action" ? "New Action" : "New Condition"),
        isConfigured: false,
        // Add branch metadata if this node is in a branch
        ...(branchType && conditionNodeId ? { branchType, conditionNodeId } : {}),
      },
      position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
      children: [beforeNodeId], // New node points to the original target
      parent: parentId,
    };

    // Handle conditional nodes differently
    if (type === 'condition') {
      // Create Yes and No placeholder nodes
      const timestamp = Date.now();
      const yesPlaceholderId = `placeholder-yes-${timestamp}`;
      const noPlaceholderId = `placeholder-no-${timestamp}`;

      // For condition nodes, handle end node and ghost node deletion (same approach)
      let yesChildren = [yesPlaceholderId];
      const noChildren = [noPlaceholderId];

      if (beforeNodeId && beforeNodeId === 'end-1') {
        // If inserting before end node, delete the end node
        console.log('🔍 Deleting end node because condition is now last');
        delete updatedGraph['end-1'];

        // Both branches get placeholders
        yesChildren = [yesPlaceholderId];
      } else if (beforeNodeId && beforeNode?.type === 'ghost') {
        // If inserting before ghost node, delete the ghost node (same as end node approach)
        console.log('🔍 Deleting ghost node because condition is now last in branch');
        delete updatedGraph[beforeNodeId];

        // Both branches get placeholders
        yesChildren = [yesPlaceholderId];
      } else if (beforeNodeId) {
        // Move the entire downstream flow to Yes branch
        yesChildren = [beforeNodeId];

        // Update the downstream node's parent to be the condition node
        if (beforeNode) {
          beforeNode.parent = id;
        }

        // Fix termination of moved flow: if last node is action connected to end, create ghost
        const fixFlowTermination = (nodeId: string) => {
          const node = graph[nodeId];
          if (!node) return;

          // If this is an action node
          if (node.type === 'action') {
            const children = node.children || [];

            // Check if it's connected to end node
            const hasEndChild = children.some(childId => {
              const child = graph[childId];
              return child && child.type === 'endNode';
            });

            if (hasEndChild) {
              console.log('🔍 Fixing action node termination:', nodeId, 'replacing end with ghost');

              // Remove end node connection
              node.children = node.children?.filter(childId => {
                const child = graph[childId];
                return !(child && child.type === 'endNode');
              }) || [];

              // Create ghost node for this action
              const timestamp = Date.now();
              const ghostNodeId = `ghost-${timestamp}`;
              const newGhostNode: GraphNode = {
                id: ghostNodeId,
                type: 'ghost',
                position: { x: 0, y: 0 },
                data: { label: 'Ghost' },
                children: [],
                parent: nodeId,
              };

              // Add ghost to graph and connect
              graph[ghostNodeId] = newGhostNode;
              node.children.push(ghostNodeId);
            }
          }

          // Recursively fix children
          (node.children || []).forEach(childId => fixFlowTermination(childId));
        };

        // Fix the moved subtree
        fixFlowTermination(beforeNodeId);
      }

      const yesPlaceholder: GraphNode = {
        id: yesPlaceholderId,
        type: 'placeholder',
        position: { x: 0, y: 0 }, // Let Dagre handle positioning
        data: {
          label: 'Add Action',
          branchType: 'yes',
          conditionNodeId: id,
        },
        parent: id,
        children: [],
      };

      const noPlaceholder: GraphNode = {
        id: noPlaceholderId,
        type: 'placeholder',
        position: { x: 0, y: 0 }, // Let Dagre handle positioning
        data: {
          label: 'Add Action',
          branchType: 'no',
          conditionNodeId: id,
        },
        parent: id,
        children: [],
      };

      // Update the condition node to have branches
      newNode.branches = {
        yes: yesChildren,
        no: noChildren,
      };
      delete newNode.children; // Remove children for condition nodes

      console.log('✅ Created condition node with branches:', {
        id,
        yesChildren,
        noChildren,
        yesPlaceholder: yesPlaceholderId,
        noPlaceholder: noPlaceholderId
      });

      // Add placeholders to graph (only if they're actually used)
      if (yesChildren.includes(yesPlaceholderId)) {
        updatedGraph[yesPlaceholderId] = yesPlaceholder;
        console.log('✅ Created Yes placeholder:', yesPlaceholderId);
      }
      if (noChildren.includes(noPlaceholderId)) {
        updatedGraph[noPlaceholderId] = noPlaceholder;
        console.log('✅ Created No placeholder:', noPlaceholderId);
      }

      // Store placeholder IDs in condition node data for edge creation
      newNode.data.yesPlaceholderId = yesPlaceholderId;
      newNode.data.noPlaceholderId = noPlaceholderId;
    } else {
      // Regular node handling
      newNode.children = [beforeNodeId];

      // Update beforeNode's parent
      if (beforeNode.parent) {
        beforeNode.parent = id;
      }
    }

    // Add new node to graph
    updatedGraph[id] = newNode;

    // Update parent's children: replace beforeNodeId with new node id
    const siblings = parentNode.children || [];
    const insertIndex = siblings.findIndex((cid) => cid === beforeNodeId);

    if (insertIndex === -1) {
      console.error("beforeNodeId not found in parent children:", {
        beforeNodeId,
        siblings,
      });
      return;
    }

    parentNode.children = [
      ...siblings.slice(0, insertIndex),
      id,
      ...siblings.slice(insertIndex + 1),
    ];

    // Reposition nodes to maintain vertical flow
    const baseX = parentNode.position.x;
    let currentY = parentNode.position.y + 150;

    const repositionChildren = (nodeId: string, depth: number = 0) => {
      const node = updatedGraph[nodeId];
      if (!node) return;

      node.position = { x: baseX, y: currentY };
      currentY += 150;

      if (node.children) {
        node.children.forEach((childId) =>
          repositionChildren(childId, depth + 1)
        );
      }
    };

    // Reposition all children starting from the new node
    repositionChildren(id);

    set({ nodes: updatedGraph });
  },


  // ? Version 2 code 
  // insertNode: ({ type, parentId, beforeNodeId, actionData }) => {
  //   const id = `${type}-${Date.now()}`;
  //   const graph = get().nodes;

  //   // Create a deep copy without functions to avoid structuredClone issues
  //   const updatedGraph = {};

  //   Object.entries(graph).forEach(([nodeId, node]) => {
  //     updatedGraph[nodeId] = {
  //       ...node,
  //       data: {
  //         ...node.data,
  //         // Filter out function properties that can't be cloned
  //         ...Object.fromEntries(
  //           Object.entries(node.data).filter(
  //             ([key, value]) => typeof value !== "function"
  //           )
  //         ),
  //       },
  //     };
  //   });

  //   const parentNode = updatedGraph[parentId];
  //   const beforeNode = updatedGraph[beforeNodeId];

  //   if (!parentNode || !beforeNode) {
  //     console.error("Parent or before node not found:", {
  //       parentId,
  //       beforeNodeId,
  //     });
  //     return;
  //   }

  //   // Check if this node is being added inside a branch
  //   let branchType = "";
  //   let conditionNodeId = "";

  //   // Search all condition nodes to see if the parent is in any branch
  //   for (const [nodeId, node] of Object.entries(updatedGraph)) {
  //     if (node.type === "condition" && node.branches) {
  //       if (node.branches.yes && node.branches.yes.includes(parentId)) {
  //         branchType = "yes";
  //         conditionNodeId = nodeId;
  //         break;
  //       } else if (node.branches.no && node.branches.no.includes(parentId)) {
  //         branchType = "no";
  //         conditionNodeId = nodeId;
  //         break;
  //       }
  //     }
  //   }

  //   // Clean actionData to remove functions
  //   const cleanActionData = actionData
  //     ? Object.fromEntries(
  //         Object.entries(actionData).filter(
  //           ([key, value]) => typeof value !== "function"
  //         )
  //       )
  //     : {};

  //   // Create the new node with action data
  //   const newNode = {
  //     id,
  //     type,
  //     data: {
  //       ...cleanActionData,
  //       label:
  //         actionData?.label ||
  //         (type === "action" ? "New Action" : "New Condition"),
  //       isConfigured: false,
  //       // Add branch metadata if this node is in a branch
  //       ...(branchType && conditionNodeId
  //         ? { branchType, conditionNodeId }
  //         : {}),
  //     },
  //     position: { x: parentNode.position.x, y: parentNode.position.y + 150 },
  //     children: [beforeNodeId], // New node points to the original target
  //     parent: parentId,
  //   };

  //   // Handle conditional nodes differently
  //   if (type === "condition") {
  //     // Create Yes and No placeholder nodes
  //     const timestamp = Date.now();
  //     const yesPlaceholderId = `placeholder-yes-${timestamp}`;
  //     const noPlaceholderId = `placeholder-no-${timestamp}`;

  //     let yesChildren = [];
  //     const noChildren = [noPlaceholderId];

  //     // FIXED: Properly handle end node and downstream flow
  //     if (
  //       beforeNodeId &&
  //       (beforeNodeId === "end-1" || beforeNode?.type === "endNode")
  //     ) {
  //       // If inserting before end node, remove the end node completely
  //       console.log("🔍 Removing end node because condition is now last");
  //       delete updatedGraph[beforeNodeId];

  //       // Both branches get placeholders (no downstream flow)
  //       yesChildren = [yesPlaceholderId];
  //     } else if (beforeNode?.type === "ghost") {
  //       // If inserting before ghost node, remove the ghost node
  //       console.log(
  //         "🔍 Removing ghost node because condition is now last in branch"
  //       );
  //       delete updatedGraph[beforeNodeId];

  //       // Both branches get placeholders
  //       yesChildren = [yesPlaceholderId];
  //     } else if (beforeNodeId) {
  //       // Move the entire downstream flow to Yes branch
  //       yesChildren = [beforeNodeId];

  //       // Update the downstream node's parent to be the condition node
  //       if (beforeNode) {
  //         beforeNode.parent = id;
  //       }
  //     } else {
  //       // No beforeNode, just use placeholder
  //       yesChildren = [yesPlaceholderId];
  //     }

  //     const yesPlaceholder = {
  //       id: yesPlaceholderId,
  //       type: "placeholder",
  //       position: { x: 0, y: 0 }, // Let Dagre handle positioning
  //       data: {
  //         label: "Add Action",
  //         branchType: "yes",
  //         conditionNodeId: id,
  //       },
  //       parent: id,
  //       children: [],
  //     };

  //     const noPlaceholder = {
  //       id: noPlaceholderId,
  //       type: "placeholder",
  //       position: { x: 0, y: 0 }, // Let Dagre handle positioning
  //       data: {
  //         label: "Add Action",
  //         branchType: "no",
  //         conditionNodeId: id,
  //       },
  //       parent: id,
  //       children: [],
  //     };

  //     // Update the condition node to have branches
  //     newNode.branches = {
  //       yes: yesChildren,
  //       no: noChildren,
  //     };
  //     delete newNode.children; // Remove children for condition nodes

  //     console.log("✅ Created condition node with branches:", {
  //       id,
  //       yesChildren,
  //       noChildren,
  //     });

  //     // Add placeholders to graph only if they're used
  //     if (yesChildren.includes(yesPlaceholderId)) {
  //       updatedGraph[yesPlaceholderId] = yesPlaceholder;
  //     }
  //     if (noChildren.includes(noPlaceholderId)) {
  //       updatedGraph[noPlaceholderId] = noPlaceholder;
  //     }

  //     // Store placeholder IDs in condition node data for edge creation
  //     newNode.data.yesPlaceholderId = yesPlaceholderId;
  //     newNode.data.noPlaceholderId = noPlaceholderId;
  //   } else {
  //     // Regular node handling
  //     newNode.children = [beforeNodeId];

  //     // Update beforeNode's parent
  //     if (beforeNode) {
  //       beforeNode.parent = id;
  //     }
  //   }

  //   // Add new node to graph
  //   updatedGraph[id] = newNode;

  //   // Update parent's children: replace beforeNodeId with new node id
  //   const siblings = parentNode.children || [];
  //   const insertIndex = siblings.findIndex((cid) => cid === beforeNodeId);

  //   if (insertIndex === -1) {
  //     console.error("beforeNodeId not found in parent children:", {
  //       beforeNodeId,
  //       siblings,
  //     });
  //     return;
  //   }

  //   parentNode.children = [
  //     ...siblings.slice(0, insertIndex),
  //     id,
  //     ...siblings.slice(insertIndex + 1),
  //   ];

  //   setSelectedNode();
  //   set({ nodes: updatedGraph });
  // },

  // removeNode: (id) => {
  //   const graph = structuredClone(get().nodes);
  //   const nodeToRemove = graph[id];

  //   if (!nodeToRemove) return;

  //   console.log("🔍 Removing node:", id, "type:", nodeToRemove.type);

  //   // Helper function to recursively delete all descendants
  //   const recursivelyDeleteNode = (nodeId, visited = new Set()) => {
  //     if (visited.has(nodeId)) return;
  //     visited.add(nodeId);

  //     const node = graph[nodeId];
  //     if (!node) return;

  //     // If it's a condition node, delete all its branch nodes first
  //     if (node.type === "condition" && node.branches) {
  //       const allBranchNodes = [
  //         ...(node.branches.yes || []),
  //         ...(node.branches.no || []),
  //       ];
  //       allBranchNodes.forEach((branchNodeId) => {
  //         recursivelyDeleteNode(branchNodeId, visited);
  //       });
  //     }

  //     // Delete all children recursively
  //     if (node.children) {
  //       node.children.forEach((childId) => {
  //         if (graph[childId] && graph[childId].type !== "endNode") {
  //           recursivelyDeleteNode(childId, visited);
  //         }
  //       });
  //     }

  //     delete graph[nodeId];
  //   };

  //   // PRIORITY 1: Handle condition nodes
  //   if (nodeToRemove.type === "condition") {
  //     console.log("🔍 Handling condition node removal");

  //     // Delete all branch nodes recursively
  //     if (nodeToRemove.branches) {
  //       const allBranchNodes = [
  //         ...(nodeToRemove.branches.yes || []),
  //         ...(nodeToRemove.branches.no || []),
  //       ];
  //       allBranchNodes.forEach((branchNodeId) => {
  //         recursivelyDeleteNode(branchNodeId);
  //       });
  //     }

  //     // Handle parent reconnection
  //     const parent = nodeToRemove.parent;
  //     if (parent) {
  //       const parentNode = graph[parent];
  //       if (parentNode) {
  //         // Check if we're in a branch or main flow
  //         const isInBranch = nodeToRemove.data?.branchType;

  //         if (isInBranch) {
  //           // Create ghost node for branch termination
  //           const timestamp = Date.now();
  //           const ghostNodeId = `ghost-${timestamp}`;
  //           const newGhostNode = {
  //             id: ghostNodeId,
  //             type: "ghost",
  //             position: { x: 0, y: 0 },
  //             data: {
  //               label: "Ghost",
  //               branchType: nodeToRemove.data.branchType,
  //               conditionNodeId: nodeToRemove.data.conditionNodeId,
  //             },
  //             children: [],
  //             parent: parent,
  //           };

  //           graph[ghostNodeId] = newGhostNode;
  //           parentNode.children = [ghostNodeId];
  //         } else {
  //           // Main flow - connect to end node or create one
  //           const endNode = Object.values(graph).find(
  //             (node) => node.type === "endNode"
  //           );

  //           if (!endNode) {
  //             const endNodeId = "end-1";
  //             const newEndNode = {
  //               id: endNodeId,
  //               type: "endNode",
  //               position: { x: 100, y: 250 },
  //               data: { label: "End" },
  //               children: [],
  //               parent: parent,
  //             };
  //             graph[endNodeId] = newEndNode;
  //             parentNode.children = [endNodeId];
  //           } else {
  //             parentNode.children = [endNode.id];
  //             endNode.parent = parent;
  //           }
  //         }
  //       }
  //     }

  //     delete graph[id];
  //     set({ nodes: graph });
  //     return;
  //   }

  //   // PRIORITY 2: Handle nodes in condition branches
  //   const isInBranch =
  //     nodeToRemove.data?.branchType && nodeToRemove.data?.conditionNodeId;

  //   if (isInBranch) {
  //     console.log("🔍 Node is in a condition branch");

  //     const conditionNodeId = nodeToRemove.data.conditionNodeId;
  //     const branchType = nodeToRemove.data.branchType;
  //     const conditionNode = graph[conditionNodeId];

  //     if (conditionNode && conditionNode.branches) {
  //       const branchArray = conditionNode.branches[branchType];
  //       const nodeIndex = branchArray.findIndex((nodeId) => nodeId === id);

  //       if (nodeIndex !== -1) {
  //         // Get children that should be reconnected
  //         const nodeChildren = nodeToRemove.children || [];

  //         // Filter out ghost and end nodes - they shouldn't be reconnected
  //         const reconnectableChildren = nodeChildren.filter((childId) => {
  //           const childNode = graph[childId];
  //           return (
  //             childNode &&
  //             childNode.type !== "ghost" &&
  //             childNode.type !== "endNode"
  //           );
  //         });

  //         // Delete ghost and end nodes
  //         nodeChildren.forEach((childId) => {
  //           const childNode = graph[childId];
  //           if (
  //             childNode &&
  //             (childNode.type === "ghost" || childNode.type === "endNode")
  //           ) {
  //             console.log("🔍 Deleting", childNode.type, "node:", childId);
  //             delete graph[childId];
  //           }
  //         });

  //         // FIXED: Proper reconnection logic
  //         if (reconnectableChildren.length > 0) {
  //           // Replace the removed node with its children in the branch
  //           branchArray.splice(nodeIndex, 1, ...reconnectableChildren);

  //           // Update parent relationships
  //           reconnectableChildren.forEach((childId) => {
  //             const childNode = graph[childId];
  //             if (childNode) {
  //               if (nodeIndex > 0) {
  //                 // Connect to previous node in branch
  //                 const prevNodeId = branchArray[nodeIndex - 1];
  //                 childNode.parent = prevNodeId;
  //                 const prevNode = graph[prevNodeId];
  //                 if (prevNode) {
  //                   prevNode.children = [childId];
  //                 }
  //               } else {
  //                 // First node in branch - parent is condition node
  //                 childNode.parent = conditionNodeId;
  //               }
  //             }
  //           });
  //         } else {
  //           // No reconnectable children - just remove the node from branch
  //           branchArray.splice(nodeIndex, 1);
  //         }

  //         // Create placeholder if branch is empty
  //         if (branchArray.length === 0) {
  //           console.log("🔍 Branch is empty, creating placeholder");

  //           const timestamp = Date.now();
  //           const placeholderId = `placeholder-${branchType}-${timestamp}`;

  //           const placeholder = {
  //             id: placeholderId,
  //             type: "placeholder",
  //             position: { x: 0, y: 0 },
  //             data: {
  //               label: "Add Action",
  //               branchType: branchType,
  //               conditionNodeId: conditionNodeId,
  //             },
  //             parent: conditionNodeId,
  //             children: [],
  //           };

  //           graph[placeholderId] = placeholder;
  //           branchArray.push(placeholderId);
  //         }

  //         conditionNode.branches[branchType] = branchArray;
  //       }
  //     }

  //     delete graph[id];
  //     set({ nodes: graph });
  //     return;
  //   }

  //   // PRIORITY 3: Handle regular nodes in main flow
  //   console.log("🔍 Handling regular node removal");

  //   const parent = nodeToRemove.parent;
  //   const children = nodeToRemove.children || [];

  //   // Update parent's children array
  //   if (parent) {
  //     const parentNode = graph[parent];
  //     if (parentNode && parentNode.children) {
  //       const updatedChildren = [];
  //       for (const childId of parentNode.children) {
  //         if (childId === id) {
  //           // Replace removed node with its children
  //           updatedChildren.push(...children);
  //         } else {
  //           updatedChildren.push(childId);
  //         }
  //       }
  //       parentNode.children = updatedChildren;
  //     }
  //   }

  //   // Update children's parent
  //   children.forEach((childId) => {
  //     const childNode = graph[childId];
  //     if (childNode) {
  //       childNode.parent = parent;
  //     }
  //   });

  //   delete graph[id];
  //   set({ nodes: graph });

  //   console.log("✅ Node removal complete");
  // },
 
 
  removeNode: (id) => {
    const graph = { ...get().nodes };

    const nodeToRemove = graph[id];

    if (!nodeToRemove) return;

    // Helper function to recursively delete all descendants of a node
    const recursivelyDeleteNode = (nodeId: string, visited = new Set<string>()) => {
      if (visited.has(nodeId)) return; // Prevent infinite loops
      visited.add(nodeId);

      const node = graph[nodeId];
      if (!node) return;

      // If it's a condition node, delete all its branch nodes first
      if (node.type === 'condition' && node.branches) {
        const allBranchNodes = [
          ...(node.branches.yes || []),
          ...(node.branches.no || [])
        ];

        allBranchNodes.forEach(branchNodeId => {
          recursivelyDeleteNode(branchNodeId, visited);
        });
      }

      // Delete all children recursively
      if (node.children) {
        node.children.forEach(childId => {
          if (graph[childId] && graph[childId].type !== 'endNode') {
            recursivelyDeleteNode(childId, visited);
          }
        });
      }

      // Finally delete the node itself
      delete graph[nodeId];
    };

    // PRIORITY 1: Handle condition nodes first (regardless of where they are)
    if (nodeToRemove.type === 'condition') {

      if (nodeToRemove.branches) {
        // Collect all branch node IDs to delete with destructure method
        const allBranchNodes = [
          ...(nodeToRemove.branches.yes || []),
          ...(nodeToRemove.branches.no || [])
        ];

        // Recursively delete all branch nodes and their descendants
        allBranchNodes.forEach(branchNodeId => {
          recursivelyDeleteNode(branchNodeId);
        });
      }

      // Handle parent reconnection for condition nodes
      const parent = nodeToRemove.parent;
      const children = nodeToRemove.children || [];

      if (parent) {
        const parentNode = graph[parent];
        if (parentNode) {

          // For condition nodes being deleted, handle termination based on context
          const isInBranch = nodeToRemove.data?.branchType ||
            (parentNode && parentNode.type === 'action');

          if (isInBranch && parentNode.type === 'action') {
            // Condition is in a branch and parent is action -> create ghost node

            const timestamp = Date.now();
            const ghostNodeId = `ghost-${timestamp}`;
            const newGhostNode: GraphNode = {
              id: ghostNodeId,
              type: 'ghost',
              position: { x: 0, y: 0 },
              data: { label: 'Ghost' },
              children: [],
              parent: parent,
            };

            // Add ghost node to graph
            graph[ghostNodeId] = newGhostNode;

            // Connect parent action to ghost node
            parentNode.children = [ghostNodeId];
          } else {
            // Condition is in main flow -> connect to end node
            const endNode = Object.values(graph).find(node => node.type === 'endNode');

            if (!endNode) {
              // No end node exists, create one
              console.log('🔍 Recreating end node after condition deletion (no end node exists)');

              const endNodeId = 'end-1';
              const newEndNode: GraphNode = {
                id: endNodeId,
                type: 'endNode',
                position: { x: 100, y: 250 },
                data: { label: 'End' },
                children: [],
                parent: parent,
              };

              graph[endNodeId] = newEndNode;
              parentNode.children = [endNodeId];
            } else {
              // End node exists, connect parent to it
              parentNode.children = [endNode.id];
              endNode.parent = parent;
            }
          }
        }
      }

      // Delete the condition node itself
      delete graph[id];
      set({ nodes: graph });

      // Close config panel if the deleted node was selected
      const currentSelectedNode = useWorkflowStore.getState().selectedNode;
      if (currentSelectedNode && currentSelectedNode.id === id) {
        useWorkflowStore.getState().setSelectedNode(null);
      }

      return;
    }

    // PRIORITY 2: Check if this node is in a condition branch (has branchType in data)
    const isInBranch = nodeToRemove.data?.branchType && nodeToRemove.data?.conditionNodeId;

    if (isInBranch) {

      // Find the condition node that owns this branch
      const conditionNodeId = nodeToRemove.data.conditionNodeId;
      const branchType = nodeToRemove.data.branchType;
      const conditionNode = graph[conditionNodeId];

      if (conditionNode && conditionNode.branches) {
        const branchArray = conditionNode.branches[branchType];
        const nodeIndex = branchArray.indexOf(id);

        if (nodeIndex !== -1) {
          // Get the node's children (what comes after it in the branch)
          const nodeChildren = nodeToRemove.children || [];

          // Filter out ghost nodes - they should be deleted, not reconnected
          const realChildren = nodeChildren.filter(childId => {
            const childNode = graph[childId];
            return childNode && childNode.type !== 'ghost';
          });

          // Delete any ghost children
          nodeChildren.forEach(childId => {
            const childNode = graph[childId];
            if (childNode && childNode.type === 'ghost') {
              console.log('🔍 Deleting ghost node:', childId, 'when deleting action in branch');
              delete graph[childId];
            }
          });

          // Remove the node from the branch array and insert only real children
          branchArray.splice(nodeIndex, 1, ...realChildren);

          // Update parent-child relationships for the real children
          realChildren.forEach(childId => {
            const childNode = graph[childId];
            if (childNode) {
              // Find what should be the new parent (previous node in branch or condition node)
              if (nodeIndex > 0) {
                // Previous node in branch becomes parent
                const prevNodeId = branchArray[nodeIndex - 1];
                childNode.parent = prevNodeId;

                // Update previous node's children
                const prevNode = graph[prevNodeId];
                if (prevNode) {
                  prevNode.children = [childId];
                }
              } else {
                // Condition node becomes parent (first node in branch)
                childNode.parent = conditionNodeId;
              }
            }
          });

          // If branch becomes empty, recreate placeholder
          if (branchArray.length === 0) {

            const placeholderId = `placeholder-${branchType}-${conditionNodeId}`;

            const placeholder: GraphNode = {
              id: placeholderId,
              type: 'placeholder',
              position: { x: 0, y: 0 },
              data: {
                label: 'Add Action',
                branchType: branchType as 'yes' | 'no',
                conditionNodeId: conditionNodeId,
              },
              parent: conditionNodeId,
              children: [],
            };

            graph[placeholderId] = placeholder;
            branchArray.push(placeholderId);

          } else {
            console.log(`🔍 Branch not empty, length: ${branchArray.length}, contents:`, branchArray);
          }

          // Update the condition node's branch data with the modified array
          conditionNode.branches[branchType] = branchArray;
        }
      }

      // For branch nodes, we handle reconnection above, so skip the main flow logic
      delete graph[id];
      set({ nodes: graph });

      // Close config panel if the deleted node was selected
      const currentSelectedNode = useWorkflowStore.getState().selectedNode;
      if (currentSelectedNode && currentSelectedNode.id === id) {
        useWorkflowStore.getState().setSelectedNode(null);
        console.log("✅ Config panel closed for deleted node:", id);
      }

      return;
    }

    const parent = nodeToRemove.parent;
    const children = nodeToRemove.children || [];

    // Step 1: Handle parent reconnection
    if (parent) {
      const parentNode = graph[parent];
      if (parentNode) {
        console.log('🔍 Reconnecting parent:', parent, 'to children:', children);

        // For regular nodes, update children array normally
        if (parentNode.children) {
          // For regular nodes, update children array normally
          if (parentNode.children) {
            const updatedChildren = [];
            for (const childId of parentNode.children) {
              if (childId === id) {
                updatedChildren.push(...children);
              } else {
                updatedChildren.push(childId);
              }
            }
            parentNode.children = updatedChildren;
          }
        }
      }
    }

    // Step 2: Update children's parent (only for non-condition deletions)
    if (nodeToRemove.type !== 'condition') {
      children.forEach((childId) => {
        const childNode = graph[childId];
        if (childNode) {
          childNode.parent = parent;
        }
      });
    }

    // Step 3: Delete the main node
    console.log('🔍 Deleting main node:', id);
    delete graph[id];

    // Step 4: Recreate placeholders for empty branches (same approach as end node recreation)
    if (isInBranch && nodeToRemove.data?.conditionNodeId && nodeToRemove.data?.branchType) {
      const conditionNodeId = nodeToRemove.data.conditionNodeId;
      const branchType = nodeToRemove.data.branchType;
      const conditionNode = graph[conditionNodeId];

      if (conditionNode && conditionNode.branches) {
        const branchArray = conditionNode.branches[branchType];

        // Check if branch is now empty (no real nodes, only placeholders or nothing)
        const realNodes = branchArray.filter(nodeId =>
          graph[nodeId] && graph[nodeId].type !== 'placeholder'
        );

        if (realNodes.length === 0) {
          console.log(`🔍 ${branchType} branch is empty, checking for action nodes that need ghost nodes`);

          // Check if there are any action nodes in the branch that need ghost nodes
          const actionNodesInBranch = branchArray.filter(nodeId => {
            const node = graph[nodeId];
            return node && node.type === 'action';
          });

          if (actionNodesInBranch.length > 0) {
            // If there are action nodes, they should point to ghost nodes
            console.log(`🔍 Found ${actionNodesInBranch.length} action nodes, creating ghost nodes`);

            actionNodesInBranch.forEach(actionNodeId => {
              const actionNode = graph[actionNodeId];
              if (actionNode && (!actionNode.children || actionNode.children.length === 0)) {
                // Create ghost node for this action
                const timestamp = Date.now();
                const ghostNodeId = `ghost-${actionNodeId}-${timestamp}`;

                const ghostNode: GraphNode = {
                  id: ghostNodeId,
                  type: 'ghost',
                  position: { x: 0, y: 0 },
                  data: {
                    label: 'Ghost',
                    branchType,
                    conditionNodeId,
                  },
                  parent: actionNodeId,
                  children: [],
                };

                // Add ghost node to graph
                graph[ghostNodeId] = ghostNode;

                // Connect action to ghost node
                actionNode.children = [ghostNodeId];

                // Add ghost node to branch array
                branchArray.push(ghostNodeId);

                console.log(`✅ Created ghost node ${ghostNodeId} for action ${actionNodeId}`);
              }
            });

            // Update the condition node's branch data
            conditionNode.branches[branchType] = branchArray;
          } else {
            // No action nodes, create placeholder
            console.log(`🔍 No action nodes found, recreating placeholder`);

            const timestamp = Date.now();
            const placeholderId = `placeholder-${branchType}-${timestamp}`;

            const placeholder: GraphNode = {
              id: placeholderId,
              type: 'placeholder',
              position: { x: 0, y: 0 },
              data: {
                label: 'Add Action',
                branchType,
                conditionNodeId,
              },
              parent: conditionNodeId,
              children: [],
            };

            // Add placeholder to graph
            graph[placeholderId] = placeholder;

            // Update branch array to only contain the new placeholder
            conditionNode.branches[branchType] = [placeholderId];

            console.log(`✅ Recreated placeholder for empty ${branchType} branch`);
          }
        }
      }
    }

    console.log('✅ Node removal complete');
    set({ nodes: graph });

    // Close config panel if the deleted node was selected
    const currentSelectedNode = useWorkflowStore.getState().selectedNode;
    if (currentSelectedNode && currentSelectedNode.id === id) {
      useWorkflowStore.getState().setSelectedNode(null);
      console.log("✅ Config panel closed for deleted node:", id);
    }

    // Ensure conditional branches have placeholders after deletion
    get().ensureConditionalPlaceholders();
  },
  
  /**
   * Adds a new node to a condition branch, replacing a placeholder
   *
   * Same approach as end node management:
   * 1. Delete the clicked placeholder node
   * 2. Create the new user-selected node
   * 3. If new node is action: create a ghost placeholder for continuation
   * 4. If new node is condition: create Yes/No branch placeholders
   * 5. Update the condition's branch array to point to new node
   *
   * When all nodes in a branch are deleted → recreate placeholder
   * When user adds node to placeholder → delete placeholder, add real node
   */
  addNodeToBranch: ({
    conditionNodeId,
    branchType,
    placeholderNodeId,
    actionData,
  }) => {
    const id = `${actionData.type || "action"}-${Date.now()}`;
    const graph = get().nodes;

    // Create a deep copy without functions to avoid structuredClone issues
    const updatedGraph: Record<string, GraphNode> = {};
    Object.entries(graph).forEach(([nodeId, node]) => {
      updatedGraph[nodeId] = {
        ...node,
        data: {
          ...node.data,
          // Filter out function properties that can't be cloned
          ...Object.fromEntries(
            Object.entries(node.data).filter(
              ([, value]) => typeof value !== "function"
            )
          ),
        },
      };
    });

    const conditionNode = updatedGraph[conditionNodeId];
    const placeholderNode = updatedGraph[placeholderNodeId];

    if (!conditionNode || !placeholderNode) {
      console.error("❌ Condition or placeholder node not found:", {
        conditionNodeId,
        placeholderNodeId,
      });
      return;
    }

    console.log("🔍 Adding node to branch:", {
      conditionNodeId,
      branchType,
      placeholderNodeId,
      actionType: actionData.type,
    });

    const isConditionNode = actionData.type === "condition";
    const timestamp = Date.now();

    // Clean actionData to remove functions
    const cleanActionData = actionData
      ? Object.fromEntries(
        Object.entries(actionData).filter(
          ([, value]) => typeof value !== "function"
        )
      )
      : {};

    // Step 1: Create the new node that will replace the placeholder
    const newNode: GraphNode = {
      id,
      type: isConditionNode ? "condition" : "action",
      data: {
        ...cleanActionData,
        label: (actionData?.label as string) || "New Action",
        isConfigured: false,
        branchType,
        conditionNodeId,
      },
      position: { x: 0, y: 0 }, // Let Dagre handle positioning
      parent: conditionNodeId,
    };

    // Step 2: Handle different node types
    if (isConditionNode) {
      // For condition nodes: Create Yes/No branch placeholders
      const yesPlaceholderId = `placeholder-yes-${timestamp}`;
      const noPlaceholderId = `placeholder-no-${timestamp}`;

      const yesPlaceholder: GraphNode = {
        id: yesPlaceholderId,
        type: "placeholder",
        position: { x: 0, y: 0 },
        data: {
          label: "Add Action",
          branchType: "yes",
          conditionNodeId: id,
        },
        parent: id,
        children: [],
      };

      const noPlaceholder: GraphNode = {
        id: noPlaceholderId,
        type: "placeholder",
        position: { x: 0, y: 0 },
        data: {
          label: "Add Action",
          branchType: "no",
          conditionNodeId: id,
        },
        parent: id,
        children: [],
      };

      // Condition nodes use branches instead of children
      newNode.branches = {
        yes: [yesPlaceholderId],
        no: [noPlaceholderId],
      };
      newNode.data.yesPlaceholderId = yesPlaceholderId;
      newNode.data.noPlaceholderId = noPlaceholderId;

      // Add branch placeholders to graph
      updatedGraph[yesPlaceholderId] = yesPlaceholder;
      updatedGraph[noPlaceholderId] = noPlaceholder;

      console.log("✅ Created condition node with Yes/No placeholders");
    } else {
      // For action nodes: Create a ghost node for flow continuation
      // Exception: Remove Workflow nodes are terminal and don't need ghost nodes
      const isRemoveWorkflowNode = (actionData as any)?.id === 'remove-workflow-action' ||
        (actionData as any)?.id === 'exit-workflow-operation-action';

      if (isRemoveWorkflowNode) {
        // Remove Workflow nodes are terminal - no ghost node needed
        newNode.children = [];
        console.log("✅ Created Remove Workflow node - terminal, no ghost node");
      } else {
        // Regular action nodes get ghost nodes for flow continuation
        const ghostNodeId = `ghost-${timestamp}`;
        const ghostNode: GraphNode = {
          id: ghostNodeId,
          type: "ghost", // Use the dedicated GhostNode component
          position: { x: 0, y: 0 },
          data: {
            label: "Ghost", // Not visible anyway
          },
          parent: id,
          children: [],
        };

        // Action nodes have children (the invisible ghost node)
        newNode.children = [ghostNodeId];
        updatedGraph[ghostNodeId] = ghostNode;

        console.log(
          "✅ Created action node with invisible ghost node for flow continuation"
        );
      }
    }

    // Step 3: Add the new node to the graph
    updatedGraph[id] = newNode;

    // Step 4: Update the condition node's branch array
    // Replace the placeholder ID with the new node ID
    if (conditionNode.branches) {
      const branchArray = conditionNode.branches[branchType];
      const placeholderIndex = branchArray.indexOf(placeholderNodeId);
      if (placeholderIndex !== -1) {
        branchArray[placeholderIndex] = id;
        console.log(
          `✅ Updated ${branchType} branch: replaced placeholder with new node`
        );
      }
    }

    // Step 5: Delete the original placeholder node (same approach as end node deletion)
    delete updatedGraph[placeholderNodeId];
    console.log("✅ Deleted original placeholder node");

    // Debug: Check what's in the branch array after update
    console.log(
      "🔍 Branch array after update:",
      conditionNode.branches[branchType]
    );
    console.log("🔍 Nodes in graph:", Object.keys(updatedGraph));

    set({ nodes: updatedGraph });
  },

  /**
   * 
   * @param connectToNodeId 
   * @returns 
   */

  handleBranchShift: (nodeId: string) => {
    const graph = get().nodes;
    const node = graph[nodeId];

    if (!node || node.type !== 'condition') {
      return;
    }

    const yesBranchNodes = node.branches.yes || [];
    const noBranchNodes = node.branches.no || [];

    yesBranchNodes.forEach((childId) => {
      const child = graph[childId];
      if (child) {
        graph[childId] = {
          ...child,
          branchType: 'yes',
          data: {
            ...child.data,
            branchType: 'yes', // 👈 IMPORTANT: also update inside data
          }
        }
      }
    });

    noBranchNodes.forEach((childId) => {
      const child = graph[childId];
      if (child) {
        graph[childId] = {
          ...child,
          branchType: 'yes',
          data: {
            ...child.data,
            branchType: 'yes', // 👈 IMPORTANT: also update inside data
          }
        }
      }
    });


    // Swap the branches
    node.branches = {
      yes: noBranchNodes,
      no: yesBranchNodes,
    };

    set({ nodes: { ...graph, [nodeId]: node } });
  },

  // Helper function to recreate end node when needed
  recreateEndNode: (connectToNodeId: string) => {
    const { nodes } = get();
    const updatedGraph = { ...nodes };

    // Check if end node already exists
    if (updatedGraph["end-1"]) {
      return;
    }

    console.log("🔍 Recreating end node, connecting to:", connectToNodeId);

    // Create new end node
    const endNode: GraphNode = {
      id: "end-1",
      type: "endNode",
      position: { x: 100, y: 250 },
      data: {
        label: "End",
      },
      children: [],
      parent: connectToNodeId,
    };

    // Add end node to graph
    updatedGraph["end-1"] = endNode;

    // Connect the specified node to end node
    const connectNode = updatedGraph[connectToNodeId];
    if (connectNode) {
      connectNode.children = ["end-1"];
    }

    set({ nodes: updatedGraph });
  },

  reset: () => {

    // Create initial trigger node
    const triggerNode: GraphNode = {
      id: 'trigger-1',
      type: 'trigger',
      position: { x: 0, y: 0 },
      data: {
        label: 'Select Trigger',
        icon: 'Zap',
        color: '#3B82F6',
        isConfigured: false,
      },
      children: ['end-1'],
      parent: null,
    };

    // Create initial end node
    const endNode: GraphNode = {
      id: 'end-1',
      type: 'endNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'End',
        icon: 'Square',
        color: '#6B7280',
      },
      children: [],
      parent: 'trigger-1',
    };

    const initialNodes = {
      'trigger-1': triggerNode,
      'end-1': endNode,
    };

    console.log('✅ Reset complete - initialized with trigger and end nodes');
    set({ nodes: initialNodes });
  },

  /**
   * Ensures conditional branches have placeholders when empty
   * This function should be called after any node deletion or modification
   * that might leave conditional branches empty
   */
  /**
   * Clean up duplicate placeholders in conditional branches
   */
  cleanupDuplicatePlaceholders: () => {
    const graph = get().nodes;
    const updatedGraph = { ...graph };
    let hasChanges = false;

    // Find all condition nodes and check for duplicate placeholders
    Object.values(graph).forEach((node) => {
      if (node.type === "condition" && node.branches) {
        (["yes", "no"] as const).forEach((branchType) => {
          const branchNodes = node.branches![branchType] || [];

          // Find all placeholders in this branch
          const placeholders = branchNodes.filter((nodeId) => {
            const branchNode = graph[nodeId];
            return branchNode && branchNode.type === 'placeholder';
          });

          if (placeholders.length > 1) {
            console.log(`🔍 Found ${placeholders.length} duplicate placeholders in ${branchType} branch of condition ${node.id}`);

            // Keep the first placeholder, remove the rest
            const keepPlaceholder = placeholders[0];
            const removePlaceholders = placeholders.slice(1);

            removePlaceholders.forEach(placeholderId => {
              console.log('🔍 Removing duplicate placeholder:', placeholderId);
              delete updatedGraph[placeholderId];
            });

            // Update branch to contain only non-placeholder nodes plus the kept placeholder
            const nonPlaceholderNodes = branchNodes.filter((nodeId) => {
              const branchNode = graph[nodeId];
              return branchNode && branchNode.type !== 'placeholder';
            });

            node.branches[branchType] = [...nonPlaceholderNodes, keepPlaceholder];
            hasChanges = true;
          }
        });
      }
    });

    if (hasChanges) {
      console.log('✅ Cleaned up duplicate placeholders');
      set({ nodes: updatedGraph });
    }
  },

  ensureConditionalPlaceholders: () => {
    const graph = get().nodes;
    const updatedGraph = { ...graph };
    let hasChanges = false;

    // Find all condition nodes
    Object.values(graph).forEach((node) => {
      if (node.type === "condition" && node.branches) {
        (["yes", "no"] as const).forEach((branchType) => {
          const branchNodes = node.branches![branchType] || [];

          // Check if branch is empty or only contains non-functional nodes
          const functionalNodes = branchNodes.filter((nodeId) => {
            const node = graph[nodeId];
            // Only count action and condition nodes as functional
            return node && (node.type === 'action' || node.type === 'condition');
          });

          // Check if there's already a placeholder in the branch
          const existingPlaceholders = branchNodes.filter((nodeId) => {
            const node = graph[nodeId];
            return node && node.type === 'placeholder';
          });

          if (functionalNodes.length === 0 && existingPlaceholders.length === 0) {
            // Remove any ghost nodes or other non-functional nodes from the branch
            const nonFunctionalNodes = branchNodes.filter((nodeId) => {
              const node = graph[nodeId];
              return node && node.type !== 'action' && node.type !== 'condition' && node.type !== 'placeholder';
            });

            nonFunctionalNodes.forEach(nodeId => {
              const node = graph[nodeId];
              if (node && node.type === 'ghost') {
                console.log('🔍 Removing ghost node from branch during placeholder creation:', nodeId);
                delete updatedGraph[nodeId];
              }
            });

            // Branch is empty and has no placeholder, create one
            const placeholderId = `placeholder-${branchType}-${Date.now()}`;
            const placeholder: GraphNode = {
              id: placeholderId,
              type: "placeholder",
              position: { x: 0, y: 0 },
              data: {
                label: "Add Action",
                branchType: branchType,
                conditionNodeId: node.id,
              },
              parent: node.id,
              children: [],
            };

            // Add placeholder to graph
            updatedGraph[placeholderId] = placeholder;

            // Update branch array to contain only the placeholder
            if (!node.branches) node.branches = { yes: [], no: [] };
            node.branches[branchType] = [placeholderId];

            hasChanges = true;
            console.log(
              `✅ Created placeholder for empty ${branchType} branch of condition ${node.id}`
            );
          } else if (functionalNodes.length === 0 && existingPlaceholders.length > 1) {
            // Multiple placeholders exist, keep only one
            console.log(`🔍 Found ${existingPlaceholders.length} placeholders in ${branchType} branch, keeping only one`);

            const keepPlaceholder = existingPlaceholders[0];
            const removePlaceholders = existingPlaceholders.slice(1);

            // Remove extra placeholders
            removePlaceholders.forEach(placeholderId => {
              console.log('🔍 Removing duplicate placeholder:', placeholderId);
              delete updatedGraph[placeholderId];
            });

            // Update branch to contain only the kept placeholder
            if (!node.branches) node.branches = { yes: [], no: [] };
            node.branches[branchType] = [keepPlaceholder];

            hasChanges = true;
          } else if (existingPlaceholders.length > 0) {
            console.log(`🔍 ${branchType} branch already has placeholder(s), no action needed`);
          }
        });
      }
    });

    if (hasChanges) {
      set({ nodes: updatedGraph });
    }
  },

  /**
   * Paste a complete condition tree structure at once
   * This handles complex nested conditions and actions
   */
  pasteConditionTree: ({ nodesToPaste, parentId, beforeNodeId }) => {
    console.log("🔍 Pasting condition tree:", {
      nodeCount: nodesToPaste.length,
      parentId,
      beforeNodeId,
    });

    const graph = get().nodes;
    const updatedGraph = { ...graph };

    // Create ID mapping for all nodes
    const idMapping: Record<string, string> = {};
    const timestamp = Date.now();

    nodesToPaste.forEach((node: GraphNode, index: number) => {
      const newId = `${node.type}-${timestamp}-${index}`;
      idMapping[node.id] = newId;
    });

    // Find root condition node (the one without a parent in the copied set)
    const rootNode = nodesToPaste.find(
      (node: GraphNode) =>
        node.type === "condition" &&
        (!node.parent || !nodesToPaste.find((n: GraphNode) => n.id === node.parent))
    );

    if (!rootNode) {
      console.error("No root condition node found");
      return;
    }

    // Update parent-child relationships
    const parentNode = updatedGraph[parentId];
    const beforeNode = updatedGraph[beforeNodeId];

    if (!parentNode || !beforeNode) {
      console.error("Parent or before node not found");
      return;
    }

    // Find the appropriate node to connect to downstream flow
    const findDownstreamConnectionNode = (conditionNode: GraphNode): { nodeId: string | null, isFirstNode: boolean } => {
      if (!conditionNode.branches?.yes || conditionNode.branches.yes.length === 0) {
        return { nodeId: null, isFirstNode: false };
      }

      // Get the first node in Yes branch
      const firstNodeId = conditionNode.branches.yes[0];
      const firstNode = nodesToPaste.find(n => n.id === firstNodeId);

      // If first node is a placeholder, connect to the first actual node instead
      if (firstNode?.type === 'placeholder') {
        return { nodeId: firstNodeId, isFirstNode: true };
      }

      // Find the last actual node in the Yes branch (skip placeholders)
      let currentNodeId = firstNodeId;
      const visited = new Set<string>();

      while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const currentNode = nodesToPaste.find(n => n.id === currentNodeId);

        if (!currentNode) break;

        // If this node has children, follow the first child
        if (currentNode.children && currentNode.children.length > 0) {
          const nextNodeId = currentNode.children[0];
          const nextNode = nodesToPaste.find(n => n.id === nextNodeId);

          // If next node is a placeholder, current node is the last actual node
          if (nextNode?.type === 'placeholder') {
            return { nodeId: currentNodeId, isFirstNode: false };
          }

          currentNodeId = nextNodeId;
        } else {
          // This is the last node in the chain
          return { nodeId: currentNodeId, isFirstNode: false };
        }
      }

      return { nodeId: currentNodeId, isFirstNode: false };
    };

    const downstreamConnection = findDownstreamConnectionNode(rootNode);

    // Create all nodes with new IDs and updated relationships
    nodesToPaste.forEach((originalNode: GraphNode) => {
      const newId = idMapping[originalNode.id];

      // Clean node data and ensure required fields
      const cleanData = {
        label: originalNode.data.label || "Copied Node",
        ...Object.fromEntries(
          Object.entries(originalNode.data).filter(
            ([, value]) => typeof value !== "function"
          )
        ),
      };

      const newNode: GraphNode = {
        id: newId,
        type: originalNode.type,
        position: originalNode.position,
        data: cleanData,
        children:
          originalNode.children
            ?.map((childId: string) => idMapping[childId] || childId)
            .filter(Boolean) || [],
        parent: originalNode.parent
          ? idMapping[originalNode.parent]
          : originalNode.id === rootNode.id
            ? parentId
            : undefined,
        ...(originalNode.branches && {
          branches: {
            yes:
              originalNode.branches.yes
                ?.map((nodeId: string) => idMapping[nodeId] || nodeId)
                .filter(Boolean) || [],
            no:
              originalNode.branches.no
                ?.map((nodeId: string) => idMapping[nodeId] || nodeId)
                .filter(Boolean) || [],
          },
        }),
      };

      // Special handling for root node
      if (originalNode.id === rootNode.id) {
        newNode.parent = parentId;
        // Root condition node doesn't directly connect to beforeNodeId
        newNode.children = [];

        // Update parent's children array
        const parentChildren = parentNode.children || [];
        const insertIndex = parentChildren.findIndex(
          (id) => id === beforeNodeId
        );
        if (insertIndex !== -1) {
          parentNode.children = [
            ...parentChildren.slice(0, insertIndex),
            newId,
            ...parentChildren.slice(insertIndex + 1),
          ];
        }

        // Handle special case: if Yes branch only has placeholder, connect directly to downstream
        if (downstreamConnection.isFirstNode && downstreamConnection.nodeId) {
          const placeholderNewId = idMapping[downstreamConnection.nodeId];
          if (placeholderNewId) {
            // Update the condition's Yes branch to point to downstream instead of placeholder
            if (newNode.branches?.yes) {
              newNode.branches.yes = [beforeNodeId];
            }

            // Update beforeNode's parent to point to the condition node
            if (beforeNode) {
              beforeNode.parent = newId;
            }

            // Don't create the placeholder node - remove it from the graph
            delete updatedGraph[placeholderNewId];

            console.log('🔍 Connected condition Yes branch directly to downstream (placeholder scenario)');
          }
        }
      }

      // Special handling for downstream connection node
      if (downstreamConnection.nodeId && originalNode.id === downstreamConnection.nodeId) {
        if (downstreamConnection.isFirstNode && originalNode.type === 'placeholder') {
          // For placeholder nodes that should connect to downstream,
          // we need to modify the condition's Yes branch to point directly to downstream
          console.log('🔍 Placeholder should connect to downstream - will handle in root condition');
        } else {
          // For actual nodes, connect them to the downstream flow
          // First, clean up any ghost nodes that might be connected
          const childrenToKeep = (newNode.children || []).filter(childId => {
            const child = updatedGraph[childId];
            if (child && child.type === 'ghost') {
              console.log('🔍 Removing ghost node during paste:', childId);
              delete updatedGraph[childId];
              return false;
            }
            return true;
          });

          newNode.children = [...childrenToKeep, beforeNodeId];

          // Update beforeNode's parent to point to this node
          if (beforeNode) {
            beforeNode.parent = newId;
          }
        }
      }

      updatedGraph[newId] = newNode;
    });

    set({ nodes: updatedGraph });

    // Clean up any orphaned ghost nodes and placeholders
    get().cleanupOrphanedNodes();
  },

  // Duplicate a single node (creates a copy right after the original)
  duplicateNode: (nodeId: string) => {
    const graph = get().nodes;
    const nodeToClone = graph[nodeId];

    if (!nodeToClone) {
      console.error("Node to duplicate not found:", nodeId);
      return null;
    }

    const timestamp = Date.now();
    const duplicateId = `${nodeToClone.type}-${timestamp}`;

    console.log("🔍 Duplicating node:", nodeId, "->", duplicateId);

    // Create a deep copy of the graph
    const updatedGraph: Record<string, GraphNode> = {};
    Object.entries(graph).forEach(([id, node]) => {
      updatedGraph[id] = {
        ...node,
        data: {
          ...node.data,
          ...Object.fromEntries(
            Object.entries(node.data).filter(([, value]) => typeof value !== 'function')
          ),
        },
      };
    });

    // Handle different node types
    if (nodeToClone.type === 'condition') {
      return get().duplicateConditionNode(nodeId, updatedGraph);
    } else {
      return get().duplicateActionNode(nodeId, updatedGraph);
    }
  },

  // Helper method for duplicating action nodes
  duplicateActionNode: (nodeId: string, updatedGraph: Record<string, GraphNode>) => {
    const nodeToClone = updatedGraph[nodeId];
    const timestamp = Date.now();
    const duplicateId = `${nodeToClone.type}-${timestamp}`;

    // Create duplicate node
    const duplicateNode: GraphNode = {
      id: duplicateId,
      type: nodeToClone.type,
      position: { x: nodeToClone.position.x, y: nodeToClone.position.y + 150 },
      data: {
        ...nodeToClone.data,
        isConfigured: false, // Reset configuration
      },
      parent: nodeToClone.parent,
      children: nodeToClone.children ? [...nodeToClone.children] : [],
    };

    // Insert duplicate after original in parent's children
    if (nodeToClone.parent) {
      const parentNode = updatedGraph[nodeToClone.parent];
      if (parentNode) {
        if (parentNode.children) {
          const insertIndex = parentNode.children.findIndex(id => id === nodeId);
          if (insertIndex !== -1) {
            parentNode.children.splice(insertIndex + 1, 0, duplicateId);
          }
        } else if (parentNode.branches) {
          // Handle insertion in conditional branches
          ['yes', 'no'].forEach(branchType => {
            const branch = parentNode.branches![branchType as 'yes' | 'no'];
            const insertIndex = branch.findIndex(id => id === nodeId);
            if (insertIndex !== -1) {
              branch.splice(insertIndex + 1, 0, duplicateId);
            }
          });
        }
      }
    }

    // Update children's parent reference to point to duplicate
    if (duplicateNode.children) {
      duplicateNode.children.forEach(childId => {
        const childNode = updatedGraph[childId];
        if (childNode) {
          childNode.parent = duplicateId;
        }
      });
    }

    // Update original node's children to point to duplicate
    nodeToClone.children = [duplicateId];

    // Add duplicate to graph
    updatedGraph[duplicateId] = duplicateNode;

    set({ nodes: updatedGraph });
    return duplicateId;
  },


  // Move a single node to a new location
  moveNode: ({ nodeId, targetParentId, targetBeforeNodeId }) => {
    console.log("🔍 Moving node:", { nodeId, targetParentId, targetBeforeNodeId });

    const graph = get().nodes;
    const nodeToMove = graph[nodeId];
    const targetParent = graph[targetParentId];
    const targetBefore = graph[targetBeforeNodeId];

    if (!nodeToMove || !targetParent) {
      console.error("Node or target parent not found");
      return;
    }

    const updatedGraph = { ...graph };

    // Step 1: Store the children of the node being moved
    const nodeChildren = nodeToMove.children ? [...nodeToMove.children] : [];

    // Step 2: Remove node from current location and reconnect the gap
    if (nodeToMove.parent) {
      const currentParent = updatedGraph[nodeToMove.parent];
      if (currentParent) {
        if (currentParent.children) {
          // Remove from parent's children array
          const nodeIndex = currentParent.children.indexOf(nodeId);
          if (nodeIndex !== -1) {
            currentParent.children.splice(nodeIndex, 1);

            // Reconnect: if the moved node had children, connect them to the current parent
            if (nodeChildren.length > 0) {
              currentParent.children.splice(nodeIndex, 0, ...nodeChildren);

              // Update children's parent reference
              nodeChildren.forEach(childId => {
                const childNode = updatedGraph[childId];
                if (childNode) {
                  childNode.parent = nodeToMove.parent;
                }
              });
            }
          }
        } else if (currentParent.branches) {
          // Handle conditional branches
          ['yes', 'no'].forEach(branchType => {
            const branch = currentParent.branches![branchType as 'yes' | 'no'];
            const nodeIndex = branch.indexOf(nodeId);
            if (nodeIndex !== -1) {
              branch.splice(nodeIndex, 1);

              // Filter out ghost nodes - they should be deleted, not reconnected
              const realChildren = nodeChildren.filter(childId => {
                const childNode = updatedGraph[childId];
                return childNode && childNode.type !== 'ghost';
              });

              // Delete any ghost children
              nodeChildren.forEach(childId => {
                const childNode = updatedGraph[childId];
                if (childNode && childNode.type === 'ghost') {
                  console.log('🔍 Deleting ghost node:', childId, 'when moving action from branch');
                  delete updatedGraph[childId];
                }
              });

              // Reconnect only real children in the branch
              if (realChildren.length > 0) {
                branch.splice(nodeIndex, 0, ...realChildren);

                // Update children's parent reference
                realChildren.forEach(childId => {
                  const childNode = updatedGraph[childId];
                  if (childNode) {
                    childNode.parent = nodeToMove.parent;
                  }
                });
              } else {
                // Check if we need to create a ghost node for the previous action
                // This happens when moving a condition node from a branch where the previous node is an action
                if (nodeToMove.type === 'condition' && nodeIndex > 0) {
                  const prevNodeId = branch[nodeIndex - 1];
                  const prevNode = updatedGraph[prevNodeId];

                  if (prevNode && prevNode.type === 'action') {
                    console.log('🔍 Creating ghost node after moving condition from branch with action parent');

                    const timestamp = Date.now();
                    const ghostNodeId = `ghost-${timestamp}`;
                    const newGhostNode: GraphNode = {
                      id: ghostNodeId,
                      type: 'ghost',
                      position: { x: 0, y: 0 },
                      data: { label: 'Ghost' },
                      children: [],
                      parent: prevNodeId,
                    };

                    // Add ghost node to graph
                    updatedGraph[ghostNodeId] = newGhostNode;

                    // Connect previous action to ghost node
                    prevNode.children = [ghostNodeId];

                    console.log(`✅ Created ghost node ${ghostNodeId} for action ${prevNodeId}`);
                  }
                }
              }
            }
          });
        }
      }
    }

    // Step 3: Insert node at new location
    nodeToMove.parent = targetParentId;

    // Handle condition nodes differently - connect downstream to last Yes node
    if (nodeToMove.type === 'condition' && targetBefore) {
      // Find the last node in the Yes branch for downstream connection
      const findLastNodeInYesBranch = (conditionNode: GraphNode): string | null => {
        if (!conditionNode.branches?.yes || conditionNode.branches.yes.length === 0) {
          return null;
        }

        // Start from the first node in Yes branch
        let currentNodeId = conditionNode.branches.yes[0];
        const visited = new Set<string>();

        while (currentNodeId && !visited.has(currentNodeId)) {
          visited.add(currentNodeId);
          const currentNode = updatedGraph[currentNodeId];

          if (!currentNode) break;

          // If this node has children, follow the first child
          if (currentNode.children && currentNode.children.length > 0) {
            currentNodeId = currentNode.children[0];
          } else {
            // This is the last node in the chain
            return currentNodeId;
          }
        }

        return currentNodeId;
      };

      const lastYesNodeId = findLastNodeInYesBranch(nodeToMove);

      if (lastYesNodeId) {
        const lastYesNode = updatedGraph[lastYesNodeId];
        if (lastYesNode && lastYesNode.type !== 'placeholder') {
          // Clean up any ghost nodes first
          const childrenToKeep = (lastYesNode.children || []).filter(childId => {
            const child = updatedGraph[childId];
            if (child && child.type === 'ghost') {
              console.log('🔍 Removing ghost node during move:', childId);
              delete updatedGraph[childId];
              return false;
            }
            return true;
          });

          // Connect last Yes node to downstream
          lastYesNode.children = [...childrenToKeep, targetBeforeNodeId];
          targetBefore.parent = lastYesNodeId;
        } else {
          // If only placeholder in Yes branch, connect condition directly to downstream
          if (nodeToMove.branches?.yes) {
            nodeToMove.branches.yes = [targetBeforeNodeId];
          }
          targetBefore.parent = nodeId;

          // Remove the placeholder from the graph since we're connecting directly
          if (lastYesNode && lastYesNode.type === 'placeholder') {
            console.log('🔍 Removing placeholder during move:', lastYesNodeId);
            delete updatedGraph[lastYesNodeId];
          }
        }
      } else {
        // No Yes branch, connect condition directly
        nodeToMove.children = [targetBeforeNodeId];
        targetBefore.parent = nodeId;
      }
    } else {
      // For non-condition nodes, use normal connection logic
      if (targetBefore) {
        nodeToMove.children = [targetBeforeNodeId];
        targetBefore.parent = nodeId;
      } else {
        // If no target before node, this is the end of the flow
        nodeToMove.children = [];
      }
    }

    // Step 4: Insert into parent's structure
    if (targetParent.children) {
      const insertIndex = targetBefore ?
        targetParent.children.findIndex(id => id === targetBeforeNodeId) :
        targetParent.children.length;

      if (insertIndex !== -1) {
        if (targetBefore) {
          // Replace the targetBefore node with the moved node
          targetParent.children[insertIndex] = nodeId;
        } else {
          // Add to the end
          targetParent.children.push(nodeId);
        }
      }
    } else if (targetParent.branches) {
      // Handle conditional branches - need to determine which branch
      let branchFound = false;
      ['yes', 'no'].forEach(branchType => {
        if (branchFound) return;

        const branch = targetParent.branches![branchType as 'yes' | 'no'];
        const insertIndex = targetBefore ?
          branch.findIndex(id => id === targetBeforeNodeId) :
          branch.length;

        if (insertIndex !== -1 && (targetBefore ? branch.includes(targetBeforeNodeId) : true)) {
          if (targetBefore) {
            // Replace the targetBefore node with the moved node
            branch[insertIndex] = nodeId;
          } else {
            // Add to the end of this branch
            branch.push(nodeId);
          }
          branchFound = true;
        }
      });
    }

    console.log("✅ Node moved successfully:", nodeId);
    set({ nodes: updatedGraph });

    // Clean up any duplicate placeholders first
    get().cleanupDuplicatePlaceholders();

    // Ensure conditional branches have placeholders after move
    get().ensureConditionalPlaceholders();

    // Clean up any orphaned ghost nodes and placeholders
    get().cleanupOrphanedNodes();
  },

  // Move an entire flow to a new location
  moveFlow: ({ startNodeId, targetParentId, targetBeforeNodeId }) => {
    console.log("🔍 Moving flow from:", { startNodeId, targetParentId, targetBeforeNodeId });

    const graph = get().nodes;
    const startNode = graph[startNodeId];
    const targetParent = graph[targetParentId];
    const targetBefore = graph[targetBeforeNodeId];

    if (!startNode || !targetParent) {
      console.error("Start node or target parent not found");
      return;
    }

    // Collect all nodes in the flow using BFS
    const collectFlowNodes = (nodeId: string): string[] => {
      const visited = new Set<string>();
      const queue = [nodeId];
      const flowNodeIds: string[] = [];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;

        visited.add(currentId);
        const currentNode = graph[currentId];
        if (!currentNode) continue;

        // Skip end nodes and ghost nodes
        if (currentNode.type === 'endNode' || currentNode.type === 'ghost') {
          continue;
        }

        flowNodeIds.push(currentId);

        // Add children to queue
        if (currentNode.children) {
          queue.push(...currentNode.children);
        }

        // Add branch nodes to queue
        if (currentNode.branches) {
          queue.push(...currentNode.branches.yes, ...currentNode.branches.no);
        }
      }

      return flowNodeIds;
    };

    const flowNodeIds = collectFlowNodes(startNodeId);
    console.log("🔍 Flow nodes to move:", flowNodeIds);

    if (flowNodeIds.length === 0) {
      console.log("No nodes to move");
      return;
    }

    const updatedGraph = { ...graph };

    // Step 1: Find what comes after the entire flow (for reconnection)
    const lastNodeInFlow = flowNodeIds[flowNodeIds.length - 1];
    const lastNode = updatedGraph[lastNodeInFlow];
    const afterFlowNodes = lastNode?.children || [];

    // Step 2: Remove the entire flow from its current location
    if (startNode.parent) {
      const currentParent = updatedGraph[startNode.parent];
      if (currentParent) {
        if (currentParent.children) {
          const startIndex = currentParent.children.indexOf(startNodeId);
          if (startIndex !== -1) {
            // Remove the start node from parent's children
            currentParent.children.splice(startIndex, 1);

            // Connect what comes after the flow to the current parent
            if (afterFlowNodes.length > 0) {
              currentParent.children.splice(startIndex, 0, ...afterFlowNodes);

              // Update parent references for nodes that come after the flow
              afterFlowNodes.forEach(nodeId => {
                const node = updatedGraph[nodeId];
                if (node) {
                  node.parent = startNode.parent;
                }
              });
            }
          }
        } else if (currentParent.branches) {
          // Handle conditional branches
          ['yes', 'no'].forEach(branchType => {
            const branch = currentParent.branches![branchType as 'yes' | 'no'];
            const startIndex = branch.indexOf(startNodeId);
            if (startIndex !== -1) {
              branch.splice(startIndex, 1);

              // Filter out ghost nodes from afterFlowNodes
              const realAfterFlowNodes = afterFlowNodes.filter(nodeId => {
                const node = updatedGraph[nodeId];
                return node && node.type !== 'ghost';
              });

              // Delete any ghost nodes that came after the flow
              afterFlowNodes.forEach(nodeId => {
                const node = updatedGraph[nodeId];
                if (node && node.type === 'ghost') {
                  console.log('🔍 Deleting ghost node:', nodeId, 'when moving flow from branch');
                  delete updatedGraph[nodeId];
                }
              });

              if (realAfterFlowNodes.length > 0) {
                branch.splice(startIndex, 0, ...realAfterFlowNodes);

                realAfterFlowNodes.forEach(nodeId => {
                  const node = updatedGraph[nodeId];
                  if (node) {
                    node.parent = startNode.parent;
                  }
                });
              } else {
                // Check if we need to create a ghost node for the previous action
                // This happens when moving a flow starting with condition from a branch where the previous node is an action
                if (startNode.type === 'condition' && startIndex > 0) {
                  const prevNodeId = branch[startIndex - 1];
                  const prevNode = updatedGraph[prevNodeId];

                  if (prevNode && prevNode.type === 'action') {
                    console.log('🔍 Creating ghost node after moving condition flow from branch with action parent');

                    const timestamp = Date.now();
                    const ghostNodeId = `ghost-${timestamp}`;
                    const newGhostNode: GraphNode = {
                      id: ghostNodeId,
                      type: 'ghost',
                      position: { x: 0, y: 0 },
                      data: { label: 'Ghost' },
                      children: [],
                      parent: prevNodeId,
                    };

                    // Add ghost node to graph
                    updatedGraph[ghostNodeId] = newGhostNode;

                    // Connect previous action to ghost node
                    prevNode.children = [ghostNodeId];

                    console.log(`✅ Created ghost node ${ghostNodeId} for action ${prevNodeId} after flow move`);
                  }
                }
              }
            }
          });
        }
      }
    }

    // Step 3: Insert the flow at the new location
    startNode.parent = targetParentId;

    // Connect the end of the flow to the target before node
    if (targetBefore) {
      lastNode.children = [targetBeforeNodeId];
      targetBefore.parent = lastNodeInFlow;
    } else {
      // If no target before node, this is the end of the flow
      lastNode.children = [];
    }

    // Step 4: Insert into parent's structure
    if (targetParent.children) {
      const insertIndex = targetBefore ?
        targetParent.children.findIndex(id => id === targetBeforeNodeId) :
        targetParent.children.length;

      if (insertIndex !== -1) {
        if (targetBefore) {
          // Replace the targetBefore node with the start of the moved flow
          targetParent.children[insertIndex] = startNodeId;
        } else {
          // Add to the end
          targetParent.children.push(startNodeId);
        }
      }
    } else if (targetParent.branches) {
      // Handle conditional branches
      let branchFound = false;
      ['yes', 'no'].forEach(branchType => {
        if (branchFound) return;

        const branch = targetParent.branches![branchType as 'yes' | 'no'];
        const insertIndex = targetBefore ?
          branch.findIndex(id => id === targetBeforeNodeId) :
          branch.length;

        if (insertIndex !== -1 && (targetBefore ? branch.includes(targetBeforeNodeId) : true)) {
          if (targetBefore) {
            // Replace the targetBefore node with the start of the moved flow
            branch[insertIndex] = startNodeId;
          } else {
            // Add to the end of this branch
            branch.push(startNodeId);
          }
          branchFound = true;
        }
      });
    }

    console.log("✅ Flow moved successfully from:", startNodeId);
    set({ nodes: updatedGraph });

    // Clean up any duplicate placeholders first
    get().cleanupDuplicatePlaceholders();

    // Ensure conditional branches have placeholders after move
    get().ensureConditionalPlaceholders();

    // Clean up any orphaned ghost nodes and placeholders
    get().cleanupOrphanedNodes();
  },


  // Copy a single node to clipboard
  copyNode: (nodeId: string) => {
    const graph = get().nodes;
    const nodeToCopy = graph[nodeId];

    if (!nodeToCopy) {
      console.error("Node to copy not found:", nodeId);
      return;
    }

    console.log("📋 Copying node to clipboard:", nodeId);

    // Create a clean copy without functions
    const cleanNode: GraphNode = {
      ...nodeToCopy,
      data: {
        ...nodeToCopy.data,
        ...Object.fromEntries(
          Object.entries(nodeToCopy.data).filter(([, value]) => typeof value !== 'function')
        ),
      },
    };

    set({
      clipboard: {
        type: 'action',
        data: cleanNode,
      }
    });

    console.log("✅ Node copied to clipboard");
  },

  // Copy a flow starting from a node to clipboard
  copyFlow: (startNodeId: string) => {
    const graph = get().nodes;
    const startNode = graph[startNodeId];

    if (!startNode) {
      console.error("Start node not found:", startNodeId);
      return;
    }

    console.log("📋 Copying flow to clipboard starting from:", startNodeId);

    // Collect all nodes in the flow using BFS
    const collectFlowNodes = (nodeId: string): GraphNode[] => {
      const visited = new Set<string>();
      const queue = [nodeId];
      const flowNodes: GraphNode[] = [];

      while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;

        const currentNode = graph[currentId];
        if (!currentNode) continue;

        visited.add(currentId);
        flowNodes.push(currentNode);

        // Add children to queue
        if (currentNode.children) {
          queue.push(...currentNode.children.filter(childId => !visited.has(childId)));
        }

        // Add branch children for condition nodes
        if (currentNode.branches) {
          if (currentNode.branches.yes) {
            queue.push(...currentNode.branches.yes.filter(childId => !visited.has(childId)));
          }
          if (currentNode.branches.no) {
            queue.push(...currentNode.branches.no.filter(childId => !visited.has(childId)));
          }
        }
      }

      return flowNodes;
    };

    const flowNodes = collectFlowNodes(startNodeId);

    // Create clean copies without functions
    const cleanNodes: GraphNode[] = flowNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        ...Object.fromEntries(
          Object.entries(node.data).filter(([, value]) => typeof value !== 'function')
        ),
      },
    }));

    set({
      clipboard: {
        type: 'flow',
        data: cleanNodes,
      }
    });

    console.log(`✅ Flow with ${flowNodes.length} nodes copied to clipboard`);
  },

  // Paste node/flow from clipboard
  pasteNode: ({ parentId, beforeNodeId }) => {
    const { clipboard } = get();

    if (!clipboard.data) {
      console.error("Nothing in clipboard to paste");
      return;
    }

    console.log("📋 Pasting from clipboard:", clipboard.type);

    if (clipboard.type === 'action' && clipboard.data) {
      // Paste single action node
      get().pasteSingleNode(clipboard.data as GraphNode, parentId, beforeNodeId);
    } else if (clipboard.type === 'flow' && Array.isArray(clipboard.data)) {
      // Paste flow using unified flow paste logic
      get().pasteFlow(clipboard.data, parentId, beforeNodeId);
    }
  },

  // Helper function to paste a single node
  pasteSingleNode: (nodeToPaste: GraphNode, parentId: string, beforeNodeId: string) => {
    const timestamp = Date.now();
    const newId = `${nodeToPaste.type}-${timestamp}`;

    const graph = get().nodes;
    const updatedGraph = { ...graph };

    // Create new node
    const newNode: GraphNode = {
      ...nodeToPaste,
      id: newId,
      parent: parentId,
      children: [],
      data: {
        ...nodeToPaste.data,
        isConfigured: false, // Reset configuration
      },
    };

    // Handle insertion logic (similar to insertNode)
    const beforeNode = updatedGraph[beforeNodeId];
    if (beforeNode) {
      newNode.children = [beforeNodeId];
      beforeNode.parent = newId;
    }

    // Update parent's children
    const parentNode = updatedGraph[parentId];
    if (parentNode) {
      if (parentNode.children) {
        const insertIndex = parentNode.children.findIndex(id => id === beforeNodeId);
        if (insertIndex !== -1) {
          parentNode.children.splice(insertIndex, 1, newId);
        } else {
          parentNode.children.push(newId);
        }
      } else if (parentNode.branches) {
        // Handle conditional branches
        ['yes', 'no'].forEach(branchType => {
          const branch = parentNode.branches![branchType as 'yes' | 'no'];
          const insertIndex = branch.findIndex(id => id === beforeNodeId);
          if (insertIndex !== -1) {
            branch.splice(insertIndex, 1, newId);
          }
        });
      }
    }

    // Create ghost node for action
    if (newNode.type === 'action') {
      const ghostNodeId = `ghost-${timestamp}`;
      const ghostNode: GraphNode = {
        id: ghostNodeId,
        type: 'ghost',
        position: { x: 0, y: 0 },
        data: { label: 'Ghost' },
        children: [],
        parent: newId,
      };

      newNode.children = [ghostNodeId];
      updatedGraph[ghostNodeId] = ghostNode;
    }

    updatedGraph[newId] = newNode;
    set({ nodes: updatedGraph });

    console.log("✅ Single node pasted successfully:", newId);
  },

  // Unified function to paste a flow (sequence of nodes)
  pasteFlow: (nodesToPaste: GraphNode[], parentId: string, beforeNodeId: string) => {
    console.log("🔍 Pasting flow:", {
      nodeCount: nodesToPaste.length,
      parentId,
      beforeNodeId,
    });

    if (nodesToPaste.length === 0) {
      console.error("No nodes to paste");
      return;
    }

    const graph = get().nodes;
    const updatedGraph = { ...graph };

    // Create ID mapping for all nodes
    const idMapping: Record<string, string> = {};
    const timestamp = Date.now();

    nodesToPaste.forEach((node: GraphNode, index: number) => {
      const newId = `${node.type}-${timestamp}-${index}`;
      idMapping[node.id] = newId;
    });

    // Find the root node (first node in the flow)
    // For action flows, it's the first action node
    // For condition flows, it's the first condition node
    let rootNode = nodesToPaste.find(node =>
      !node.parent || !nodesToPaste.find(n => n.id === node.parent)
    );

    if (!rootNode) {
      // If no clear root, use the first node
      rootNode = nodesToPaste[0];
    }

    console.log("🔍 Root node for flow:", rootNode.id, rootNode.type);

    // Validate parent and before nodes exist
    const parentNode = updatedGraph[parentId];
    const beforeNode = updatedGraph[beforeNodeId];

    if (!parentNode || !beforeNode) {
      console.error("Parent or before node not found");
      return;
    }

    // Create all nodes with new IDs and updated relationships
    nodesToPaste.forEach((originalNode: GraphNode) => {
      const newId = idMapping[originalNode.id];

      // Clean node data and ensure required fields
      const cleanData = {
        label: originalNode.data.label || "Copied Node",
        isConfigured: false, // Reset configuration for pasted nodes
        ...Object.fromEntries(
          Object.entries(originalNode.data).filter(([, value]) => typeof value !== 'function')
        ),
      };

      const newNode: GraphNode = {
        id: newId,
        type: originalNode.type,
        position: { x: 0, y: 0 },
        data: cleanData,
        children: [],
        parent: undefined,
        branches: originalNode.branches ? { yes: [], no: [] } : undefined,
      };

      // Update children references using the ID mapping
      if (originalNode.children) {
        newNode.children = originalNode.children
          .map(childId => idMapping[childId])
          .filter(Boolean);
      }

      // Update parent reference using the ID mapping
      if (originalNode.parent && idMapping[originalNode.parent]) {
        newNode.parent = idMapping[originalNode.parent];
      }

      // Handle conditional branches
      if (originalNode.branches) {
        newNode.branches = {
          yes: originalNode.branches.yes
            .map(nodeId => idMapping[nodeId])
            .filter(Boolean),
          no: originalNode.branches.no
            .map(nodeId => idMapping[nodeId])
            .filter(Boolean),
        };
      }

      updatedGraph[newId] = newNode;
    });

    // Connect the root of the pasted flow to the target location
    const newRootId = idMapping[rootNode.id];
    const newRootNode = updatedGraph[newRootId];

    if (newRootNode) {
      // Set the parent of the root node
      newRootNode.parent = parentId;

      // Find the actual last node in the flow (node with no children or only ghost children)
      const findLastNode = (nodes: GraphNode[]): GraphNode | null => {
        for (const node of nodes) {
          const hasRealChildren = node.children && node.children.some(childId => {
            const originalChild = nodesToPaste.find(n => n.id === childId);
            return originalChild && originalChild.type !== 'ghost';
          });

          if (!hasRealChildren) {
            return node;
          }
        }
        return nodes[nodes.length - 1]; // fallback
      };

      const lastNodeInFlow = findLastNode(nodesToPaste);
      if (lastNodeInFlow) {
        const newLastNodeId = idMapping[lastNodeInFlow.id];
        const newLastNode = updatedGraph[newLastNodeId];

        if (newLastNode) {
          // Remove any ghost children from the last node
          newLastNode.children = newLastNode.children?.filter(childId => {
            const child = updatedGraph[childId];
            return child && child.type !== 'ghost';
          }) || [];

          // Connect to the before node
          newLastNode.children.push(beforeNodeId);
          beforeNode.parent = newLastNodeId;
        }
      }

      // Update parent's children to include the new root
      if (parentNode.children) {
        const insertIndex = parentNode.children.findIndex(id => id === beforeNodeId);
        if (insertIndex !== -1) {
          parentNode.children.splice(insertIndex, 1, newRootId);
        } else {
          parentNode.children.push(newRootId);
        }
      } else if (parentNode.branches) {
        // Handle conditional branches
        ['yes', 'no'].forEach(branchType => {
          const branch = parentNode.branches![branchType as 'yes' | 'no'];
          const insertIndex = branch.findIndex(id => id === beforeNodeId);
          if (insertIndex !== -1) {
            branch.splice(insertIndex, 1, newRootId);
          }
        });
      }
    }

    set({ nodes: updatedGraph });
    console.log(`✅ Flow with ${nodesToPaste.length} nodes pasted successfully`);
  },

  // this function is used to update notes of the workflow flow nodes 
  updateNodeData: (nodeId: string, data: Partial<GraphNode['data']>) => {
    const graph = get().nodes;
    const node = graph[nodeId];
    if (node) {
      const updatedGraph = {
        ...graph,
        [nodeId]: {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        },
      };
      set({ nodes: updatedGraph });
    }
  },

  // Clear clipboard
  clearClipboard: () => {
    set({
      clipboard: {
        type: null,
        data: null,
      }
    });
    console.log("🗑️ Clipboard cleared");
  },

  // Check if clipboard has data
  hasClipboardData: () => {
    const { clipboard } = get();
    return clipboard.type !== null && clipboard.data !== null;
  },


  // Clean up orphaned ghost nodes and placeholders
  cleanupOrphanedNodes: () => {
    const graph = get().nodes;
    const updatedGraph = { ...graph };
    let hasChanges = false;

    // Find all nodes that are referenced as children or in branches
    const referencedNodes = new Set<string>();

    Object.values(updatedGraph).forEach(node => {
      // Add children
      if (node.children) {
        node.children.forEach(childId => referencedNodes.add(childId));
      }

      // Add branch nodes
      if (node.branches) {
        if (node.branches.yes) {
          node.branches.yes.forEach(nodeId => referencedNodes.add(nodeId));
        }
        if (node.branches.no) {
          node.branches.no.forEach(nodeId => referencedNodes.add(nodeId));
        }
      }
    });

    // Remove orphaned ghost nodes and placeholders
    Object.values(updatedGraph).forEach(node => {
      if ((node.type === 'ghost' || node.type === 'placeholder') &&
        !referencedNodes.has(node.id)) {
        console.log('🔍 Removing orphaned node:', node.id, node.type);
        delete updatedGraph[node.id];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      set({ nodes: updatedGraph });
      console.log('✅ Cleaned up orphaned nodes');
    }
  },


// Fixed version of your node deletion functions

handleDeleteConditionNode: (nodeId: string, option: 'yes' | 'no' | 'all') => {
  const currentState = get();
  const graph = { ...currentState.nodes };
  
  const conditionNode = graph[nodeId];
  if (!conditionNode || conditionNode.type !== 'condition') return;

  // const parentId = conditionNode.parent;
  // const parentNode = graph[parentId];
  // const yesBranchNodes = conditionNode.branches?.yes || [];
  // const noBranchNodes = conditionNode.branches?.no || [];

  // if (option === 'yes' || option === 'no') {
  //   const keepBranch = option === 'yes' ? yesBranchNodes : noBranchNodes;
  //   const deleteBranch = option === 'yes' ? noBranchNodes : yesBranchNodes;

  //   // Update parent's children array
  //   if (parentNode && Array.isArray(parentNode.children)) {
  //     const index = parentNode.children.indexOf(nodeId);
  //     if (index !== -1) {
  //       parentNode.children.splice(index, 1, ...keepBranch);
  //     }
  //   }

  //   // Update parent references for kept branch nodes
  //   keepBranch.forEach(childId => {
  //     if (graph[childId]) {
  //       graph[childId] = { ...graph[childId], parent: parentId };
  //     }
  //   });

  //   // Delete the opposite branch using the deleteSubtree function
  //   deleteBranch.forEach(childId => {
  //     currentState.deleteSubtree(childId, graph); // Pass the graph to work with
  //   });

  //   // Delete the condition node itself
  //   delete graph[nodeId];
  // }

  // if (option === 'all') {
  //   // Delete everything under both branches
  //   const allChildren = [...yesBranchNodes, ...noBranchNodes];
    
  //   // Delete all children using the deleteSubtree function
  //   allChildren.forEach(childId => {
  //     currentState.removeNode(childId); // Pass the graph to work with
  //   });

  //   // Remove condition node from parent's children
  //   if (parentNode && Array.isArray(parentNode.children)) {
  //     const index = parentNode.children.indexOf(nodeId);
  //     if (index !== -1) {
  //       parentNode.children.splice(index, 1);
  //     }
  //   }

  //   // Delete the condition node
  //   delete graph[nodeId];
  // }

  // Update state once at the end
  set({ nodes: graph });
},

// Replace condition functionality
setReplacingConditionId: (nodeId: string | null) => {
  set({ replacingConditionId: nodeId });
},

replaceCondition: (newConditionData: any) => {
  const { replacingConditionId } = get();
  if (!replacingConditionId) {
    console.error('No condition ID set for replacement');
    return;
  }

  const graph = { ...get().nodes };
  const existingCondition = graph[replacingConditionId];

  if (!existingCondition || existingCondition.type !== 'condition') {
    console.error('Condition node not found or not a condition:', replacingConditionId);
    return;
  }

  console.log('🔍 Replacing condition:', replacingConditionId, 'with:', newConditionData);

  // Update the condition node data while preserving structure
  const updatedCondition: GraphNode = {
    ...existingCondition,
    data: {
      ...newConditionData,
      // Preserve important condition-specific data
      branchType: existingCondition.data.branchType,
      conditionNodeId: existingCondition.data.conditionNodeId,
      yesPlaceholderId: existingCondition.data.yesPlaceholderId,
      noPlaceholderId: existingCondition.data.noPlaceholderId,
      isConfigured: false, // Set to false so config panel opens
    }
  };

  // Update the node in the graph
  graph[replacingConditionId] = updatedCondition;

  // Update state and clear replacing ID
  set({
    nodes: graph,
    replacingConditionId: null
  });

  console.log('✅ Condition replaced successfully');
},


}));

export type { GraphNode };
