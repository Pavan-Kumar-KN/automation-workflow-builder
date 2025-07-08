# Workflow Node Insertion Fix

## Problem Description

When clicking the plus (+) buttons in the workflow builder to add nodes between or after existing nodes, the nodes were being **replaced** instead of **inserted**. This was particularly problematic in conditional (if/then) branches where users expected to add nodes to a sequence, but instead the existing nodes were being overwritten.

## Root Cause

The issue was in the `handleAddNodeToBranch` function in `src/components/WorkflowBuilder.tsx`. The logic incorrectly determined when to insert vs replace nodes:

### Before (Broken Logic):
```typescript
if (insertIndex !== undefined && insertIndex >= 0) {
  // WRONG: This treated any insertIndex < branch.length as replacement
  if (insertIndex < targetBranch.length) {
    console.log(`Replacing node at index ${insertIndex}`);
    newBranch[insertIndex] = newBranchNode; // Replace existing node
  } else {
    console.log(`Inserting at index ${insertIndex}`);
    newBranch.splice(insertIndex, 0, newBranchNode); // Insert new node
  }
}
```

This logic was wrong because:
- When clicking a plus button to insert at index 0 (beginning), it would replace the first node
- When clicking a plus button to insert at index 1 (between first and second), it would replace the second node
- Only when inserting beyond the array length would it actually insert

## Solution

Added an `isReplacement` flag to distinguish between insertion (plus button clicks) and actual replacement operations:

### After (Fixed Logic):
```typescript
// Updated branchContext type
const [branchContext, setBranchContext] = useState<{
  conditionNodeIndex: number;
  branchType: 'branch1' | 'otherwise';
  insertIndex?: number;
  isReplacement?: boolean; // New flag
} | null>(null);

// Updated handleAddNodeToBranch function
const handleAddNodeToBranch = useCallback((
  conditionNodeIndex: number, 
  branchType: 'branch1' | 'otherwise', 
  action: NodeData, 
  insertIndex?: number, 
  isReplacement?: boolean // New parameter
) => {
  // Fixed logic
  if (insertIndex !== undefined && insertIndex >= 0) {
    if (isReplacement) {
      // Only replace when explicitly requested
      console.log(`Replacing node at index ${insertIndex}`);
      newBranch[insertIndex] = newBranchNode;
    } else {
      // Always insert for plus button clicks
      console.log(`Inserting at index ${insertIndex}`);
      newBranch.splice(insertIndex, 0, newBranchNode);
    }
  } else {
    console.log(`Pushing to end`);
    newBranch.push(newBranchNode);
  }
});
```

### Key Changes:

1. **Added `isReplacement` flag** to `branchContext` type
2. **Updated `handleAddNodeToBranch`** to accept `isReplacement` parameter
3. **Fixed insertion logic** to always insert when `isReplacement` is false/undefined
4. **Updated `handleReplaceBranchNode`** to set `isReplacement: true`
5. **Left `handleAddBranchNode`** unchanged (plus button clicks) so `isReplacement` defaults to false

## Behavior Changes

### Before Fix:
- ❌ Plus button at beginning of branch → **Replaced** first node
- ❌ Plus button between nodes → **Replaced** next node  
- ✅ Plus button at end → Correctly inserted (only case that worked)

### After Fix:
- ✅ Plus button at beginning of branch → **Inserts** at beginning
- ✅ Plus button between nodes → **Inserts** between nodes
- ✅ Plus button at end → **Inserts** at end
- ✅ Explicit replacement operations → Still **replace** correctly

## Testing

To test the fix:

1. Create a workflow with a conditional node
2. Add a few actions to one of the branches
3. Click the plus buttons:
   - At the beginning of the branch
   - Between existing nodes
   - At the end of the branch
4. Verify that new nodes are inserted, not replaced

The fix ensures that plus buttons always insert new nodes while preserving the ability to explicitly replace nodes when needed.
