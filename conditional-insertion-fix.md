# Fixed: Conditional Node Insertion Before Existing Nodes

## Problem
When inserting a conditional node before an existing node (using the plus button above a node), the positioning and connections were incorrect. The Yes/No branches were not properly structured.

## Root Cause
The original logic was:
1. Moving the next node directly to the "Yes" branch target
2. Not creating proper Yes/No placeholders
3. Creating inconsistent edge connections
4. Poor positioning of branch elements

## Solution

### 1. **Consistent Placeholder Creation**
Now always creates both Yes and No placeholders regardless of whether there's a next node:

```typescript
// ✅ Always create both Yes and No placeholders for consistent structure
const yesPlaceholder: Node = {
  id: yesId,
  type: 'placeholder',
  data: {
    label: 'Add Action',
    branchType: 'yes',
    conditionNodeId: nodeId,
    handleAddNodeToBranch,
  },
};

const noPlaceholder: Node = {
  id: noId,
  type: 'placeholder', 
  data: {
    label: 'Add Action',
    branchType: 'no',
    conditionNodeId: nodeId,
    handleAddNodeToBranch,
  },
};
```

### 2. **Proper Edge Structure**
Fixed the edge connections to follow the correct flow:

**Before (Broken):**
```
Previous -> Condition -> NextNode (directly)
                    \-> NoPlaceholder
```

**After (Fixed):**
```
Previous -> Condition -> (Yes) -> NextNode
                    \-> (No) -> NoPlaceholder
```

**Key Change:** Yes branch connects DIRECTLY to existing nodes, No branch connects to placeholder for new nodes.

### 3. **Smart Edge Creation Logic**
```typescript
if (nextNode && nextNode.id !== 'virtual-end') {
  // ✅ CASE 1: Existing downstream nodes
  // Yes connects directly to existing node, No gets placeholder
  newNode.data.yesPlaceholderId = nextNode.id; // Direct connection
  newNode.data.noPlaceholderId = noId; // Placeholder for new nodes

  // Create only No placeholder
  const noPlaceholder = { id: noId, type: 'placeholder', ... };

} else {
  // ✅ CASE 2: No downstream nodes
  // Both Yes and No get placeholders
  newNode.data.yesPlaceholderId = yesId;
  newNode.data.noPlaceholderId = noId;

  // Create both placeholders
  const yesPlaceholder = { id: yesId, type: 'placeholder', ... };
  const noPlaceholder = { id: noId, type: 'placeholder', ... };
}

// ✅ Condition edges connect to appropriate targets
newEdges.push({
  id: `edge-${nodeId}-yes`,
  source: nodeId,
  sourceHandle: 'yes',
  target: yesTargetId, // Either existing node or placeholder
  type: 'condition',
  label: 'Yes',
});
```

### 4. **Branch Context Preservation**
Moved nodes now get proper branch context:

```typescript
const updatedNextNode = {
  ...nextNode,
  data: {
    ...nextNode.data,
    branchType: 'yes',
    conditionNodeId: nodeId,
    onDelete: nextNode.type === 'condition' 
      ? () => handleConditionNodeDeletion(nextNode.id)
      : () => handleConditionBranchNodeDeletion(nextNode.id, nodeId, 'yes'),
  }
};
```

## Result

✅ **Proper Structure**: Conditional nodes now create consistent Yes/No placeholder structure
✅ **Correct Connections**: Edges flow properly through placeholders to moved nodes  
✅ **Branch Context**: Moved nodes maintain proper branch information
✅ **Ghost Nodes**: Action nodes in branches get ghost nodes for further insertion
✅ **Positioning**: Layout engine can properly position all elements

## **Result**
Now when you insert a conditional node before an existing node:

1. ✅ **Smart structure creation**: Only creates placeholders where needed
2. ✅ **Direct Yes connections**: Yes branch connects directly to existing downstream nodes
3. ✅ **No branch placeholder**: No branch gets placeholder for adding new nodes
4. ✅ **Proper branch context**: Moved nodes get correct branch information
5. ✅ **Ghost node support**: Action nodes get ghost nodes for further insertion
6. ✅ **Layout positioning**: Dagre can properly position the optimized structure

## **How It Works Now**

**Inserting before existing nodes:**
```
node1 -> node2 -> node3
```
**Becomes:**
```
node1 -> conditional -> (Yes) -> node2 -> node3
                   \-> (No) -> [Add Action placeholder]
```

**Inserting at end of flow:**
```
node1 -> node2
```
**Becomes:**
```
node1 -> node2 -> conditional -> (Yes) -> [Add Action placeholder]
                            \-> (No) -> [Add Action placeholder]
```

The conditional node insertion now creates the most logical and efficient structure based on the context!
