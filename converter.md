# Workflow JSON Converter Documentation

## Overview

The Workflow JSON Converter is a simple, scalable system that converts React Flow nodes and edges into backend-compatible JSON format. It uses **frontend-generated node IDs** as child references instead of backend-generated IDs.

## 🎯 Key Features

- ✅ **Simple Architecture**: Easy to understand and maintain
- ✅ **Frontend ID Management**: Uses React Flow node IDs as child references
- ✅ **Conditional Flow Support**: Handles true/false paths for conditions
- ✅ **Real-time Updates**: Automatically generates JSON on node/edge changes
- ✅ **Scalable Design**: Easy to extend for new node types

## 📁 File Structure

```
src/
├── utils/
│   └── workflowConverter.ts    # Main converter logic
├── hooks/
│   └── useWorkflowJSON.ts      # React hook for JSON generation
└── converter.md               # This documentation
```

## 🔄 How It Works

### 1. **Node ID as Child Reference**

Instead of backend-generated IDs, we use frontend node IDs:

```typescript
// ✅ Frontend approach (simple)
{
  "id": "trigger-123",
  "child": "action-456",  // Direct node ID reference
  "type": "ElementTrigger"
}

// ❌ Old backend approach (complex)
{
  "id": 2543931749,       // Backend generated
  "child": 858650965,     // Backend generated
  "type": "ElementTrigger"
}
```

### 2. **Edge-Based Linking**

The converter uses React Flow edges to determine child relationships:

```typescript
// Edge: trigger-123 → action-456
const nextNodeId = edges.find(edge => edge.source === 'trigger-123')?.target;
// Result: "action-456"
```

### 3. **Conditional Flow Handling**

For condition nodes, we support true/false paths:

```typescript
// Condition with two paths
{
  "type": "ElementCondition",
  "config": {
    "child": "action-true-path",      // True path
    "options": {
      "false_path": "action-false-path" // False path
    }
  }
}
```

## 🏗️ Architecture

### WorkflowConverter Class

```typescript
class WorkflowConverter {
  // Main conversion method
  static convertToBackendJSON(nodes, edges, workflowName, userId)
  
  // Helper methods
  private static createTrigger(node, edges)
  private static createAction(node, edges)
  private static createCondition(node, edges)
  private static getNextNodeId(nodeId, edges)
  private static mapNodeToBackendType(node)
  private static extractNodeOptions(node)
}
```

### useWorkflowJSON Hook

```typescript
const {
  generateJSON,      // Generate backend JSON
  getCurrentJSON,    // Get current JSON immediately
  saveJSON,          // Save to file
  submitToBackend,   // Submit to API
  debugWorkflow      // Debug current workflow
} = useWorkflowJSON();
```

## 📊 JSON Structure

### Input (React Flow)
```typescript
// Nodes
[
  { id: "trigger-123", type: "trigger", data: { id: "form-filled" } },
  { id: "action-456", type: "action", data: { id: "send-email" } }
]

// Edges
[
  { source: "trigger-123", target: "action-456" }
]
```

### Output (Backend JSON)
```json
{
  "name": "My workflow",
  "user_id": 54,
  "triggers": [
    {
      "type": "ElementFormTrigger",
      "config": {
        "child": "action-456",
        "options": {
          "key": "form-filled",
          "init": true
        },
        "last_executed": null,
        "evaluationResult": null
      }
    }
  ],
  "actions": [
    {
      "type": "ElementSendEmail",
      "config": {
        "child": null,
        "options": {
          "key": "send-email",
          "init": true
        },
        "last_executed": null,
        "evaluationResult": null
      }
    }
  ]
}
```

## 🎛️ Node Type Mapping

| Frontend Node ID | Backend Type |
|------------------|--------------|
| `form-*` | `ElementFormTrigger` |
| `product-*` | `ElementProductTrigger` |
| `contact-*` | `ElementContactTrigger` |
| `email-*` | `ElementSendEmail` |
| `sms-*` | `ElementSendSMS` |
| `whatsapp-*` | `ElementSendWhatsApp` |
| `delay-*` | `ElementDelay` |
| `tag-*` | `ElementAddTag` |
| `condition-*` | `ElementCondition` |

## 🔀 Conditional Flow Example

```typescript
// React Flow Setup
const nodes = [
  { id: "trigger-1", type: "trigger" },
  { id: "condition-1", type: "condition" },
  { id: "action-true", type: "action" },
  { id: "action-false", type: "action" }
];

const edges = [
  { source: "trigger-1", target: "condition-1" },
  { source: "condition-1", target: "action-true", sourceHandle: "true" },
  { source: "condition-1", target: "action-false", sourceHandle: "false" }
];

// Generated JSON
{
  "actions": [
    {
      "type": "ElementCondition",
      "config": {
        "child": "action-true",        // True path
        "options": {
          "false_path": "action-false" // False path
        }
      }
    }
  ]
}
```

## 🚀 Usage Examples

### Basic Usage
```typescript
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';

function WorkflowBuilder() {
  const { generateJSON, submitToBackend } = useWorkflowJSON();
  
  const handleSave = async () => {
    const json = generateJSON();
    console.log('Generated JSON:', json);
    
    // Submit to backend
    await submitToBackend();
  };
}
```

### Real-time Updates
```typescript
// The hook automatically logs JSON on changes
useEffect(() => {
  if (nodes.length > 0) {
    const json = generateJSON();
    console.log('🔄 Workflow JSON Updated:', json);
  }
}, [nodes, edges]);
```

### Manual Conversion
```typescript
import { WorkflowConverter } from '@/utils/workflowConverter';

const json = WorkflowConverter.convertToBackendJSON(
  nodes, 
  edges, 
  'My Workflow', 
  54
);
```

## 🔧 Configuration Options

### Node Data Options
```typescript
// Node data can include configuration
{
  id: "send-email-1",
  type: "action",
  data: {
    id: "send-email",
    templateId: "welcome-email",
    emailTo: "user@example.com",
    subject: "Welcome!",
    fromEmail: "noreply@company.com"
  }
}

// Extracted to options
{
  "options": {
    "key": "send-email",
    "template_id": "welcome-email",
    "email_to": "user@example.com",
    "subject": "Welcome!",
    "from_email": "noreply@company.com",
    "init": true
  }
}
```

## 🐛 Debugging

### Enable Debug Mode
```typescript
const { debugWorkflow } = useWorkflowJSON();

// Log detailed conversion info
debugWorkflow();
```

### Debug Output
```
🔄 Workflow Conversion Debug
📋 Nodes: [...]
🔗 Edges: [...]
🚀 Backend JSON: {...}
```

## ✅ Benefits

1. **Simple**: No complex ID management
2. **Predictable**: Frontend controls all IDs
3. **Debuggable**: Easy to trace node relationships
4. **Scalable**: Easy to add new node types
5. **Maintainable**: Clear separation of concerns

## 🔮 Future Enhancements

- **Validation**: Add JSON schema validation
- **Versioning**: Support multiple JSON formats
- **Optimization**: Batch updates for performance
- **Testing**: Add comprehensive test suite

## 📝 Notes

- Node IDs should be unique across the workflow
- Edge sourceHandle determines conditional paths ('true'/'false')
- All nodes get `init: true` by default
- Missing child references result in `null`
- Configuration data is extracted from node.data

This approach keeps the JSON conversion simple, predictable, and easy to maintain! 🎯
