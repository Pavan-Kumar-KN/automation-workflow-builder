import type { Node } from "@xyflow/react";
import { create } from "zustand";

export type NodeType =
  | "trigger"
  | "endNode"
  | "condition"
  | "action"
  | "placeholder"
  | "ghost";

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
    [key: string]: unknown; // Allow additional properties
  };
  parent?: string;
  children?: string[]; // for linear flow
  branchType?: "yes" | "no"; // <- added
  branches?: {
    yes: string[]; // <- new
    no: string[];
  };
};

interface GraphState {
  nodes: Record<string, GraphNode>;
  // ? this function is adding initial nodes
  addNode: (node: GraphNode) => void;

  removeNode: (id: string) => void;

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

  reset: () => void;

  ensureConditionalPlaceholders: () => void;

  pasteConditionTree: (params: {
    nodesToPaste: any[];
    parentId: string;
    beforeNodeId: string;
  }) => void;
}


export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: {},

  addNode: (node) =>
    set((state) => ({ nodes: { ...state.nodes, [node.id]: node } })),

  insertNode: ({ type, parentId, beforeNodeId, actionData }) => {
    const id = `${type}-${Date.now()}`;
    const graph = get().nodes;

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

  removeNode: (id) => {
    const graph = structuredClone(get().nodes);

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
          console.log('🔍 Reconnecting parent:', parent, 'to children:', children);

          // For condition nodes being deleted, handle termination based on context
          const isInBranch = nodeToRemove.data?.branchType ||
                           (parentNode && parentNode.type === 'action');

          if (isInBranch && parentNode.type === 'action') {
            // Condition is in a branch and parent is action -> create ghost node
            console.log('🔍 Creating ghost node after condition deletion in branch');

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
              console.log('🔍 Connecting parent to existing end node after condition deletion');
              parentNode.children = [endNode.id];
              endNode.parent = parent;
            }
          }
        }
      }

      // Delete the condition node itself
      delete graph[id];
      set({ nodes: graph });
      return;
    }

    // PRIORITY 2: Check if this node is in a condition branch (has branchType in data)
    const isInBranch = nodeToRemove.data?.branchType && nodeToRemove.data?.conditionNodeId;

    if (isInBranch) {
      console.log('🔍 Node is in a condition branch, handling branch reconnection');

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
          console.log(`🔍 ${branchType} branch is empty, recreating placeholder`);

          // Create new placeholder
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

    console.log('✅ Node removal complete');
    set({ nodes: graph });

    // Ensure conditional branches have placeholders after deletion
    get().ensureConditionalPlaceholders();
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
      // Ghost nodes are invisible but maintain flow structure
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

  reset: () => set({ nodes: {} }),

  /**
   * Ensures conditional branches have placeholders when empty
   * This function should be called after any node deletion or modification
   * that might leave conditional branches empty
   */
  ensureConditionalPlaceholders: () => {
    const graph = get().nodes;
    const updatedGraph = { ...graph };
    let hasChanges = false;

    // Find all condition nodes
    Object.values(graph).forEach((node) => {
      if (node.type === "condition" && node.branches) {
        (["yes", "no"] as const).forEach((branchType) => {
          const branchNodes = node.branches![branchType] || [];

          // Check if branch is empty or only contains deleted nodes
          const validNodes = branchNodes.filter((nodeId) => graph[nodeId]);

          if (validNodes.length === 0) {
            // Branch is empty, create a placeholder
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

            // Update branch array to contain the placeholder
            if (!node.branches) node.branches = { yes: [], no: [] };
            node.branches[branchType] = [placeholderId];

            hasChanges = true;
            console.log(
              `✅ Created placeholder for empty ${branchType} branch of condition ${node.id}`
            );
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

    nodesToPaste.forEach((node: any, index: number) => {
      const newId = `${node.type}-${timestamp}-${index}`;
      idMapping[node.id] = newId;
    });

    // Find root condition node (the one without a parent in the copied set)
    const rootNode = nodesToPaste.find(
      (node: any) =>
        node.type === "condition" &&
        (!node.parent || !nodesToPaste.find((n: any) => n.id === node.parent))
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

    // Create all nodes with new IDs and updated relationships
    nodesToPaste.forEach((originalNode: any) => {
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
        newNode.children = [beforeNodeId];

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

        // Update beforeNode's parent
        if (beforeNode.parent) {
          beforeNode.parent = newId;
        }
      }

      updatedGraph[newId] = newNode;
    });

    set({ nodes: updatedGraph });
  },
}));

export type { GraphNode };
