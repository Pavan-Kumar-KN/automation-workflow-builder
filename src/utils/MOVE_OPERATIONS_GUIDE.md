# Move Operations Implementation Guide

## 🎯 What Was Fixed

The move operations were failing because they were using the old React Flow based cut-paste system, but the workflow builder now uses a graph-based architecture. I've implemented a new graph-based move system that integrates properly with the existing architecture.

## ✅ New Implementation

### **Graph-Based Move Operations**
- **`cutNode(nodeId)`** - Marks a node for moving (similar to copy but for moving)
- **`cutFlow(nodeId)`** - Marks an entire flow for moving
- **`pasteCut(targetParentId, targetBeforeNodeId)`** - Moves the marked node/flow to target location
- **`cancelMove()`** - Cancels the move operation

### **Integration Points**
1. **ActionNode & ConditionNode** - Right-click menus now use graph-based move operations
2. **FlowEdge** - Plus buttons detect move mode and show "Move Here" option
3. **useDuplicateMove Hook** - Centralized move state management

## 🚀 How to Use

### **For Users:**
1. **Right-click any action or condition node**
2. **Click "Move Action" or "Move Condition"** - This marks the node for moving
3. **Click the plus button (+) on any edge** - You'll see a dropdown with "Move Here" option
4. **Click "Move Here"** - The node will be moved to that location

### **For Flow Moving:**
1. **Right-click any action or condition node**
2. **Click "Move From Here"** - This marks the entire flow starting from that node
3. **Click the plus button (+) on any edge** - You'll see "Move Here" option
4. **Click "Move Here"** - The entire flow will be moved

## 🔧 Technical Details

### **Move State Management**
```typescript
const { 
  cutNode,           // Mark single node for moving
  cutFlow,           // Mark flow for moving  
  pasteCut,          // Execute the move
  isMoveMode,        // Check if in move mode
  nodeToMove,        // ID of node being moved
  flowToMove,        // ID of flow being moved
  cancelMove         // Cancel move operation
} = useDuplicateMove();
```

### **Edge Integration**
- FlowEdge component now detects `isMoveMode` 
- Plus buttons show dropdown when there's content to move
- "Move Here" option executes `pasteCut()` with correct target location

### **Safety Features**
- Prevents moving trigger and end nodes
- Validates target locations to prevent circular dependencies
- Provides user feedback through toast notifications
- Automatically clears move state after successful operation

## 🧪 Testing the Fix

### **Test Single Node Move:**
1. Create a workflow: Trigger → Action A → Action B → End
2. Right-click Action B → "Move Action"
3. Click the plus (+) between Trigger and Action A
4. Click "Move Here"
5. Result: Trigger → Action B → Action A → End

### **Test Flow Move:**
1. Create a workflow: Trigger → Action A → Action B → Action C → End
2. Right-click Action B → "Move From Here"
3. Click the plus (+) between Trigger and Action A
4. Click "Move Here"
5. Result: Trigger → Action B → Action C → Action A → End

### **Test Condition Move:**
1. Create a workflow with a condition node
2. Right-click the condition → "Move Condition"
3. Click any plus (+) button in the workflow
4. Click "Move Here"
5. Condition and its branches should move to new location

## 🐛 Troubleshooting

### **If move operations don't work:**
1. Check browser console for errors
2. Verify the node is not a trigger or end node (these cannot be moved)
3. Make sure you're clicking the plus (+) button on edges, not nodes
4. Try refreshing the page if state gets stuck

### **If dropdown doesn't appear:**
1. Make sure you've marked a node for moving first
2. Check that `isMoveMode` is true in the browser console
3. Verify the FlowEdge component is receiving the move state

## 📝 Code Changes Summary

1. **Enhanced useDuplicateMove hook** with move state management
2. **Updated ActionNode & ConditionNode** to use graph-based move operations
3. **Modified FlowEdge** to detect and handle move mode
4. **Removed dependency** on old cut-paste system for move operations
5. **Added proper validation** and error handling

The move operations should now work seamlessly with your graph-based workflow builder architecture!
