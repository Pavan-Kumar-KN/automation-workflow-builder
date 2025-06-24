# Workflow Builder - Complete Documentation

## Project Overview

This is a **React-based Workflow Builder** application that allows users to create, manage, and execute automated workflows using a visual drag-and-drop interface. The application is built with modern technologies including React, TypeScript, Vite, and React Flow for the visual workflow canvas.

### Key Technologies
- **React 18** with TypeScript
- **Vite** for build tooling
- **React Flow (@xyflow/react)** for the visual workflow canvas
- **Tailwind CSS** with Radix UI components for styling
- **React Hook Form** for form management
- **Zustand** for state management
- **React Query** for data fetching
- **Sonner** for toast notifications

## Architecture Overview

The application follows a modular architecture with clear separation of concerns:

```
src/
├── components/          # React components
│   ├── nodes/          # Workflow node components
│   ├── workflow/       # Canvas and controls
│   ├── sidebar/        # Sidebar components
│   ├── node-config/    # Node configuration panels
│   └── ui/            # Reusable UI components
├── data/              # Node definitions and types
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
└── pages/             # Page components
```

## Core Components Flow

### 1. Application Entry Point
**File: `src/App.tsx`**
- Sets up the main application providers (QueryClient, TooltipProvider)
- Configures routing with React Router
- Provides global toast notifications

### 2. Main Workflow Interface
**File: `src/pages/Index.tsx`**
- Simple wrapper that renders the main WorkflowBuilder component

### 3. Workflow Builder (Main Component)
**File: `src/components/WorkflowBuilder.tsx`**

This is the core component that orchestrates the entire workflow building experience:

```typescript
// Key responsibilities:
- Manages overall application state
- Handles drag & drop operations
- Coordinates between sidebar, canvas, and configuration panels
- Manages node connections and interactions
```

**Key Features:**
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Layout Modes**: Supports horizontal, vertical, and freeform layouts
- **Drag & Drop**: Enables dragging nodes from sidebar to canvas
- **Node Management**: Handles node creation, selection, and updates
- **Connection Management**: Manages edges between nodes

## Data Structure & Node Types

### Node Data Structure
**File: `src/data/types.ts`**

```typescript
interface NodeData {
  id: string;           // Unique identifier
  label: string;        // Display name
  icon: any;           // Lucide React icon component
  description: string;  // Node description
  color: string;       // CSS classes for styling
}
```

### Node Categories

#### 1. Trigger Nodes (`src/data/triggerNodes.ts`)
**Purpose**: Start workflow execution based on events
**Examples**:
- Form submissions (Contact forms, Product enquiry, Facebook leads)
- Contact events (Updated, Tagged, Birthday)
- CRM events (Pipeline changes, Stage updates, Follow-ups)
- Calendar events (Appointments booked/cancelled/rescheduled)
- Payment events (Subscriptions, Invoices, Failed payments)
- Learning events (Lesson/Course completion)
- Scheduled events (Specific dates, Recurring schedules)

#### 2. Action Nodes (`src/data/actionNodes.ts`)
**Purpose**: Perform operations in response to triggers
**Categories**:
- **Communication**: Send emails, WhatsApp, SMS
- **Contact Management**: Update contacts, add/remove tags, convert leads
- **CRM Operations**: Add to CRM, change lead quality, assign staff
- **Calendar**: Book/cancel/reschedule appointments
- **Course Management**: Grant/revoke course access
- **Automation**: Execute other workflows, send webhooks

#### 3. Condition Nodes (`src/data/conditionNodes.ts`)
**Purpose**: Add conditional logic to workflows
**Examples**:
- Contact attribute checks
- Date/time conditions
- Custom field validations
- Split conditions for branching logic

#### 4. External App Nodes (`src/data/externalAppNodes.ts`)
**Purpose**: Integrate with third-party services
**Examples**: Slack, Discord, Google Sheets, Zapier, etc.

## State Management (Zustand Implementation)

### 1. Zustand Workflow Store
**File: `src/hooks/useWorkflowState.ts`**

The application now uses **Zustand** for centralized state management with the following benefits:
- **Global state** accessible from any component
- **Automatic persistence** of workflow data
- **DevTools integration** for debugging
- **Better performance** with selective subscriptions
- **Type-safe** state management

```typescript
interface WorkflowState {
  // Core workflow state
  selectedNode: Node | null;
  workflowName: string;
  isActive: boolean;
  layoutMode: LayoutMode;
  sidebarOpen: boolean;
  reactFlowInstance: ReactFlowInstance | null;

  // Nodes and edges
  nodes: Node[];
  edges: Edge[];

  // UI state
  searchTerm: string;
  triggersOpen: boolean;
  actionsOpen: boolean;
  conditionsOpen: boolean;
  externalAppsOpen: boolean;

  // Actions for state management
  setSelectedNode: (node: Node | null) => void;
  setWorkflowName: (name: string) => void;
  setIsActive: (active: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSidebarOpen: (open: boolean) => void;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;

  // Node and edge operations
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: Record<string, unknown>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;

  // UI state actions
  setSearchTerm: (term: string) => void;
  setTriggersOpen: (open: boolean) => void;
  setActionsOpen: (open: boolean) => void;
  setConditionsOpen: (open: boolean) => void;
  setExternalAppsOpen: (open: boolean) => void;

  // Utility actions
  clearWorkflow: () => void;
  resetUI: () => void;
}

// Store creation with middleware
export const useWorkflowStore = create<WorkflowState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state and actions implementation
      }),
      {
        name: 'workflow-storage',
        partialize: (state) => ({
          workflowName: state.workflowName,
          isActive: state.isActive,
          layoutMode: state.layoutMode,
          nodes: state.nodes,
          edges: state.edges,
        }),
      }
    ),
    { name: 'workflow-store' }
  )
);

type LayoutMode = 'horizontal' | 'vertical' | 'freeform';
```

### Key Zustand Features Implemented:

1. **Persistence**: Workflow data is automatically saved to localStorage
2. **DevTools**: Integration with Redux DevTools for debugging
3. **Selective Updates**: Components only re-render when their used state changes
4. **Type Safety**: Full TypeScript support with proper typing

### 2. Node Operations Hook (Zustand Integration)
**File: `src/hooks/useNodeOperations.ts`**

Now integrated with Zustand store for seamless state management:

```typescript
export const useNodeOperations = () => {
  const {
    nodes,
    edges,
    layoutMode,
    setNodes,
    setEdges,
  } = useWorkflowStore();

  // Handle React Flow node changes
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  }, [setNodes]);

  // Handle React Flow edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, [setEdges]);

  // Smart positioning based on layout mode and existing nodes
  const getSmartPosition = useCallback((type: string, existingNodes?: Node[]) => {
    const nodesToCheck = existingNodes || nodes;
    // Implementation for intelligent node positioning
  }, [layoutMode, nodes]);

  // Update node data with type safety
  const updateNodeData = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  }, [setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    getSmartPosition,
    updateNodeData,
    autoArrangeNodes,
  };
};
```

**Smart Positioning Logic**:
- **Horizontal Layout**: Triggers → Conditions → Actions (left to right)
- **Vertical Layout**: Triggers → Conditions → Actions (top to bottom)
- **Freeform**: Manual positioning with offset-based placement

### 3. Workflow Actions Hook (Zustand Integration)
**File: `src/hooks/useWorkflowActions.ts`**

Simplified with direct access to Zustand store:

```typescript
export const useWorkflowActions = () => {
  const {
    workflowName,
    nodes,
    edges,
    isActive,
    layoutMode,
  } = useWorkflowStore();

  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first!');
      return;
    }

    // Find trigger nodes and simulate execution
    const triggerNodes = nodes.filter(node => node.type === 'trigger');

    if (triggerNodes.length === 0) {
      toast.error('Workflow needs at least one trigger to execute!');
      return;
    }

    toast.success('Workflow execution started!');
    // Execution simulation logic...
  }, [nodes, edges]);

  const saveWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
      isActive,
      layoutMode,
      updatedAt: new Date().toISOString(),
    };

    // Zustand persistence handles automatic saving
    toast.success('Workflow saved successfully!');
  }, [workflowName, nodes, edges, isActive, layoutMode]);

  return {
    executeWorkflow,
    saveWorkflow,
  };
};
```

## Visual Components

### 1. Workflow Canvas
**File: `src/components/workflow/WorkflowCanvas.tsx`**

The main visual workspace built on React Flow:

```typescript
// Key features:
- Drag & drop support
- Multiple node types
- Connection handling
- Responsive design
- Mini-map and controls
- Background grid
- Zoom and pan controls
```

### 2. Node Components

#### Trigger Node (`src/components/nodes/TriggerNode.tsx`)
```typescript
// Visual characteristics:
- Red color scheme (bg-red-50, border-red-200)
- "TRIGGER" label badge
- Dynamic icon based on node type
- Output handles (right/bottom based on layout)
- Hover effects and animations
```

#### Action Node (`src/components/nodes/ActionNode.tsx`)
```typescript
// Visual characteristics:
- Blue color scheme (bg-blue-50, border-blue-200)
- "ACTION" label badge
- Input and output handles
- Category-based styling
```

#### Condition Node (`src/components/nodes/ConditionNode.tsx`)
```typescript
// Visual characteristics:
- Orange/yellow color scheme
- "CONDITION" label badge
- Multiple output handles for branching
- Diamond-like appearance
```

### 3. Sidebar Component
**File: `src/components/Sidebar.tsx`**

```typescript
// Features:
- Collapsible node categories
- Search functionality
- Drag & drop initiation
- Responsive design
- Node filtering
```

## JSON Format for Backend Integration

### Workflow Data Structure

When sending workflow data to the backend, use this JSON format:

```json
{
  "workflowId": "unique-workflow-id",
  "name": "My Workflow",
  "description": "Workflow description",
  "isActive": true,
  "layoutMode": "horizontal",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "nodes": [
    {
      "id": "trigger-1234567890",
      "type": "trigger",
      "position": {
        "x": 30,
        "y": 50
      },
      "data": {
        "id": "form-trigger",
        "label": "Form Submitted",
        "description": "When any form is submitted",
        "icon": "FileText",
        "color": "bg-red-50 border-red-200",
        "layoutMode": "horizontal",
        "configuration": {
          "formId": "contact-form-1",
          "conditions": []
        }
      }
    },
    {
      "id": "action-1234567891",
      "type": "action", 
      "position": {
        "x": 700,
        "y": 50
      },
      "data": {
        "id": "send-email-action",
        "label": "Send Email",
        "description": "Send automated email",
        "icon": "Mail",
        "color": "bg-blue-50 border-blue-200",
        "layoutMode": "horizontal",
        "configuration": {
          "emailTemplate": "welcome-email",
          "recipient": "{{contact.email}}",
          "subject": "Welcome!",
          "delay": 0
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-trigger-1234567890-action-1234567891",
      "source": "trigger-1234567890",
      "target": "action-1234567891",
      "type": "smoothstep",
      "animated": true,
      "data": {
        "condition": null,
        "label": ""
      }
    }
  ],
  "metadata": {
    "version": "1.0",
    "totalNodes": 2,
    "totalEdges": 1,
    "executionCount": 0,
    "lastExecuted": null
  }
}
```

### Node Position Storage

For optimal backend storage and retrieval:

```json
{
  "nodePositions": {
    "layoutMode": "horizontal",
    "positions": {
      "trigger-1234567890": { "x": 30, "y": 50 },
      "action-1234567891": { "x": 700, "y": 50 },
      "condition-1234567892": { "x": 350, "y": 50 }
    },
    "viewport": {
      "x": 0,
      "y": 0,
      "zoom": 1
    }
  }
}
```

## Development Workflow

### 1. Adding New Node Types

1. **Define Node Data** in appropriate data file:
```typescript
// src/data/newNodeType.ts
export const newNodes: NodeData[] = [
  {
    id: 'new-node-type',
    label: 'New Node',
    icon: SomeIcon,
    description: 'Description',
    color: 'bg-color-scheme'
  }
];
```

2. **Create Node Component**:
```typescript
// src/components/nodes/NewNode.tsx
export const NewNode: React.FC<NodeProps> = ({ data }) => {
  // Component implementation
};
```

3. **Register in Canvas**:
```typescript
// src/components/workflow/WorkflowCanvas.tsx
const nodeTypes = {
  // existing types...
  'new-node': NewNode,
};
```

### 2. Extending Node Configuration

Node configuration panels are in `src/components/node-config/`. Each node type can have custom configuration forms.

### 3. Layout Mode Customization

Layout modes are handled in `useNodeOperations.ts`. The `getSmartPosition` function determines node placement based on the current layout mode.

## Testing & Deployment

### Running the Application
```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Testing Areas
1. **Drag & Drop Functionality**
2. **Node Connections**
3. **Layout Mode Switching**
4. **Responsive Design**
5. **Workflow Execution Simulation**
6. **Data Persistence**

## Major Improvements

### Zustand State Management Implementation

**Migration from useState to Zustand**: The entire application has been refactored to use Zustand for state management.

**Benefits Achieved**:
- ✅ **Centralized State**: All workflow state is now managed in a single store
- ✅ **Automatic Persistence**: Workflow data persists across browser sessions
- ✅ **Better Performance**: Components only re-render when their specific state changes
- ✅ **DevTools Integration**: Full debugging support with Redux DevTools
- ✅ **Type Safety**: Complete TypeScript integration with proper typing
- ✅ **Simplified Components**: Removed prop drilling and complex state passing
- ✅ **Scalability**: Easy to add new state and actions as the app grows

**Key Changes Made**:
1. **Created Zustand Store** (`useWorkflowStore`) with all workflow state
2. **Refactored All Hooks** to use the centralized store
3. **Updated Components** to consume state directly from store
4. **Added Persistence** with automatic localStorage sync
5. **Implemented DevTools** for better debugging experience

**Usage Example**:
```typescript
// Before (useState approach)
const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  // ... many more useState calls

  // Pass props down to children
  return <ChildComponent nodes={nodes} setNodes={setNodes} />;
};

// After (Zustand approach)
const WorkflowBuilder = () => {
  const {
    nodes,
    edges,
    selectedNode,
    setSelectedNode,
    // ... all state and actions from store
  } = useWorkflowStore();

  // No prop drilling needed
  return <ChildComponent />;
};

// Child components access store directly
const ChildComponent = () => {
  const { nodes, setNodes } = useWorkflowStore();
  // Direct access to state and actions
};
```

### Connection Constraints Implementation
**New Feature**: Implemented workflow-specific connection rules for better workflow logic.

**Connection Rules**:
1. **One Trigger → One Action**: Each trigger can only connect to ONE action
2. **Multiple Triggers → Same Action**: Multiple triggers can connect to the same action (many-to-one)
3. **No Trigger → Trigger**: Triggers cannot connect directly to other triggers
4. **No Action → Trigger**: Actions cannot connect back to triggers

**Solution**: Enhanced connection validation logic:
- **TriggerNode**: `primary-output`, `secondary-output` + visual indicator "→ One Action Only"
- **ActionNode**: Multiple input handles + visual indicator "← Multiple Triggers OK"
- **ConditionNode**: `input`, `true`, `false`
- **SplitNode**: `input`, dynamic path IDs (`a`, `b`, etc.)

**Enhanced Connection Logic with Constraints**:
```typescript
const onConnect = useCallback((params: Connection) => {
  // Validate connection parameters
  if (!params.source || !params.target) {
    toast.error('Invalid connection parameters');
    return;
  }

  // Get source and target nodes to check their types
  const sourceNode = nodes.find(node => node.id === params.source);
  const targetNode = nodes.find(node => node.id === params.target);

  if (!sourceNode || !targetNode) {
    toast.error('Source or target node not found');
    return;
  }

  // Check for duplicate connections
  const existingConnection = edges.find(
    (edge) =>
      edge.source === params.source &&
      edge.target === params.target &&
      edge.sourceHandle === params.sourceHandle &&
      edge.targetHandle === params.targetHandle
  );

  if (existingConnection) {
    toast.warning('Connection already exists between these handles');
    return;
  }

  // CONSTRAINT: One trigger can only connect to ONE action
  if (sourceNode.type === 'trigger' && targetNode.type === 'action') {
    const triggerHasAction = edges.find(
      (edge) =>
        edge.source === params.source &&
        nodes.find(node => node.id === edge.target)?.type === 'action'
    );

    if (triggerHasAction) {
      const connectedAction = nodes.find(node => node.id === triggerHasAction.target);
      toast.error(
        `This trigger is already connected to "${connectedAction?.data.label}". ` +
        'Each trigger can only connect to ONE action.',
        { duration: 5000 }
      );
      return;
    }
  }

  // CONSTRAINT: Prevent trigger-to-trigger connections
  if (sourceNode.type === 'trigger' && targetNode.type === 'trigger') {
    toast.error('Triggers cannot connect directly to other triggers');
    return;
  }

  // CONSTRAINT: Prevent action-to-trigger connections
  if (sourceNode.type === 'action' && targetNode.type === 'trigger') {
    toast.error('Actions cannot connect back to triggers');
    return;
  }

  // Create connection with unique ID
  const edgeId = `edge-${params.source}-${params.sourceHandle || 'default'}-${params.target}-${params.targetHandle || 'default'}`;

  const edge = {
    ...params,
    id: edgeId,
    type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
    animated: true,
    source: params.source!,
    target: params.target!,
    sourceHandle: params.sourceHandle || null,
    targetHandle: params.targetHandle || null,
  };

  setEdges((eds) => [...eds, edge]);

  // Success message based on connection type
  if (sourceNode.type === 'trigger' && targetNode.type === 'action') {
    toast.success(`Trigger "${sourceNode.data.label}" connected to action "${targetNode.data.label}"`);
  } else {
    toast.success('Nodes connected successfully!');
  }
}, [setEdges, layoutMode, edges, nodes]);
```

**Benefits**:
- ✅ **Enforced Workflow Logic**: Prevents invalid workflow patterns
- ✅ **One Trigger → One Action**: Maintains clean workflow structure
- ✅ **Multiple Triggers → Same Action**: Allows event consolidation
- ✅ **Visual Indicators**: Clear UI hints about connection rules
- ✅ **Better User Experience**: Helpful error messages and guidance
- ✅ **Connection Rules Help**: Built-in help component explaining rules
- ✅ **Prevents Circular Dependencies**: No action-to-trigger connections

**Visual Enhancements**:
- **TriggerNode**: Shows "→ One Action Only" indicator + single output handle
- **ActionNode**: Shows "← Multiple Triggers OK" indicator + multiple input handles
- **ConnectionRulesHelp**: Floating help component with visual examples
- **Plus Button System**: Beautiful "+" buttons after each node for easy node addition

### Plus Button Node Addition System
**New Feature**: Replaced sidebar-based node addition with intuitive plus buttons.

**Implementation**:
```typescript
// PlusButtonOverlay.tsx - Manages plus buttons for all nodes
export const PlusButtonOverlay: React.FC<PlusButtonOverlayProps> = ({ nodes }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSourceNode, setSelectedSourceNode] = useState<Node | null>(null);

  // Smart positioning based on layout mode
  const getPlusButtonPosition = (node: Node) => {
    const isVertical = layoutMode === 'vertical';
    const nodeWidth = 200;
    const nodeHeight = 120;

    return {
      left: isVertical ? node.position.x + nodeWidth / 2 - 12 : node.position.x + nodeWidth + 8,
      top: isVertical ? node.position.y + nodeHeight + 8 : node.position.y + nodeHeight / 2 - 12,
    };
  };

  // Auto-connect new nodes based on connection rules
  const handleAddNode = (nodeType: string, nodeData: any) => {
    // Create and position new node
    // Auto-connect if valid connection
    // Show success message
  };
};
```

**Features**:
- ✅ **Smart Positioning**: Plus buttons appear in the right position based on layout mode
- ✅ **Context-Aware**: Only shows valid node types based on source node
- ✅ **Auto-Connection**: Automatically connects new nodes following connection rules
- ✅ **Beautiful Design**: Animated plus buttons with hover effects and tooltips
- ✅ **Mini Modal**: Clean node selection modal instead of sidebar navigation
- ✅ **Search Functionality**: Search through available nodes in the modal
- ✅ **Visual Feedback**: Clear success messages and connection confirmations

**Node Selection Modal Features**:
```typescript
// NodeSelectionModal.tsx - Mini modal for node selection
- Search functionality with real-time filtering
- Categorized node display with icons and descriptions
- Context-aware messaging based on source node
- Node type badges (Action, Condition, Trigger)
- Responsive design with scroll support
```

**Benefits Over Sidebar Approach**:
- ✅ **Better UX**: No need to navigate to sidebar
- ✅ **Contextual**: Shows only relevant nodes for each connection
- ✅ **Faster Workflow**: One-click node addition with auto-connection
- ✅ **Visual Clarity**: Clear indication of where new nodes will be added
- ✅ **Mobile Friendly**: Works better on smaller screens

### Design Improvements (Make.com Inspired)

**Enhanced Plus Button Design**:
```typescript
// Fixed positioning that follows nodes during zoom/pan
const getPlusButtonPosition = (node: Node) => {
  const flowX = isVertical ? node.position.x + nodeWidth / 2 - 16 : node.position.x + nodeWidth + 16;
  const flowY = isVertical ? node.position.y + nodeHeight + 16 : node.position.y + nodeHeight / 2 - 16;

  // Convert flow coordinates to screen coordinates
  const screenPosition = project({ x: flowX, y: flowY });

  return {
    left: screenPosition.x,
    top: screenPosition.y,
  };
};

// Plus button with proper scaling and positioning
<div
  className="fixed z-50 pointer-events-auto"
  style={{
    left: position.left - 16,
    top: position.top - 16,
    transform: `scale(${Math.max(0.5, Math.min(1, zoom))})`, // Scale with zoom
  }}
>
  <button className="w-8 h-8 bg-white border border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600 rounded-full shadow-md hover:shadow-lg transition-all duration-200">
    <Plus className="w-4 h-4 stroke-2" />
  </button>
</div>
```

**Improved Modal Design (Make.com Style)**:
- ✅ **Grid Layout**: 2-column grid for better space utilization
- ✅ **Card-based Design**: Each node as a beautiful card with icon, title, description
- ✅ **Gradient Headers**: Subtle blue gradient header
- ✅ **Better Typography**: Improved font weights and spacing
- ✅ **Hover Effects**: Smooth transitions and scaling effects
- ✅ **Type Badges**: Color-coded badges for node types
- ✅ **Backdrop Blur**: Modern backdrop blur effect

**Zoom & Pan Improvements**:
```typescript
// Reduced zoom sensitivity
minZoom={0.3}
maxZoom={1.5}
zoomActivationKeyCode={null}
panActivationKeyCode={null}

// Custom CSS for smoother zoom
.react-flow__renderer {
  --rf-zoom-speed: 0.3 !important;
}

.react-flow__viewport {
  transition: transform 0.1s ease-out;
}
```

**Key Fixes Applied**:
- ✅ **Fixed Plus Button Positioning**: Now follows nodes during zoom/pan using manual viewport transformation
- ✅ **Enforced Connection Constraints**: Plus buttons now respect "one trigger → one action" rule
- ✅ **Improved Performance**: Memoized calculations and optimized rendering
- ✅ **Smart Plus Button Visibility**: Hides plus buttons for triggers that already have action connections
- ✅ **Reduced Zoom Sensitivity**: Slower, more controlled zooming experience
- ✅ **Improved Visual Design**: Make.com inspired clean, modern interface
- ✅ **Better Scaling**: Plus buttons scale appropriately with zoom level (0.7x to 1x)
- ✅ **Enhanced Modal**: Grid layout with beautiful node cards
- ✅ **Smooth Transitions**: Better animations and hover effects

### Latest Bug Fixes

**Issue 1: Trigger Connecting to Multiple Actions**
- **Problem**: Plus button was bypassing connection validation
- **Solution**: Added same validation logic to plus button workflow
```typescript
// Check if trigger already has an action connection before creating new one
if (selectedSourceNode.type === 'trigger' && nodeType === 'action') {
  const triggerHasAction = edges.find(
    (edge) =>
      edge.source === selectedSourceNode.id &&
      nodes.find(node => node.id === edge.target)?.type === 'action'
  );

  if (triggerHasAction) {
    toast.error('This trigger is already connected to an action...');
    return; // Don't create the connection
  }
}
```

**Issue 2: Plus Button Alignment Problems**
- **Problem**: Incorrect viewport transformation causing misalignment
- **Solution**: Improved positioning calculation
```typescript
const getPlusButtonPosition = (node: Node) => {
  const offsetX = isVertical ? nodeWidth / 2 : nodeWidth + 20;
  const offsetY = isVertical ? nodeHeight + 20 : nodeHeight / 2;

  // Correct transformation: (position + offset) * zoom + viewport offset
  const screenX = (node.position.x + offsetX) * zoom + x;
  const screenY = (node.position.y + offsetY) * zoom + y;

  return { left: screenX, top: screenY };
};
```

**Issue 3: Slow Plus Button Performance**
- **Problem**: Recalculating valid nodes on every render
- **Solution**: Memoized calculations and smart filtering
```typescript
// Memoize nodes that should have plus buttons
const nodesWithPlusButtons = useMemo(() => {
  return nodes.filter(node => {
    const validTypes = getValidNodeTypes(node);
    if (validTypes.length === 0) return false;

    // Hide plus button for triggers that already have action connections
    if (node.type === 'trigger') {
      const triggerHasAction = edges.find(
        (edge) => edge.source === node.id &&
        nodes.find(n => n.id === edge.target)?.type === 'action'
      );
      if (triggerHasAction) return false;
    }

    return true;
  });
}, [nodes, edges, getValidNodeTypes]);
```

## Future Enhancements

1. **Real Backend Integration**
2. **Workflow Templates**
3. **Advanced Condition Logic**
4. **Workflow Analytics**
5. **Collaborative Editing**
6. **Version Control**
7. **Import/Export Functionality**
8. **Custom Node Creation**

## Detailed Code Examples

### 1. Creating a Custom Node Component

```typescript
// src/components/nodes/CustomNode.tsx
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';

interface CustomNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    layoutMode?: string;
    configuration?: any;
  };
}

export const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const IconComponent = data.icon ? LucideIcons[data.icon] : LucideIcons.Zap;
  const isVertical = data.layoutMode === 'vertical';

  return (
    <div className="bg-white border-2 border-purple-200 rounded-lg shadow-lg min-w-[200px]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <IconComponent className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-bold text-purple-800">CUSTOM</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm">{data.label}</h3>
        <p className="text-xs text-gray-500">{data.description}</p>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={isVertical ? Position.Top : Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
};
```

### 2. Drag & Drop Implementation

```typescript
// In Sidebar.tsx - Initiating drag
const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: NodeData) => {
  event.dataTransfer.setData('application/reactflow', nodeType);
  event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
  event.dataTransfer.effectAllowed = 'move';
};

// In WorkflowBuilder.tsx - Handling drop
const onDrop = useCallback((event: React.DragEvent) => {
  event.preventDefault();

  if (!reactFlowInstance) return;

  const type = event.dataTransfer.getData('application/reactflow');
  const nodeData = JSON.parse(event.dataTransfer.getData('application/nodedata'));

  // Convert screen coordinates to flow coordinates
  const position = reactFlowInstance.screenToFlowPosition({
    x: event.clientX,
    y: event.clientY,
  });

  // Create new node
  const newNode: Node = {
    id: `${type}-${Date.now()}`,
    type,
    position: getSmartPosition(type, nodes),
    data: {
      ...nodeData,
      layoutMode,
    },
  };

  setNodes((nds) => nds.concat(newNode));
}, [reactFlowInstance, setNodes, nodes, layoutMode, getSmartPosition]);
```

### 3. Node Connection Logic

```typescript
// In WorkflowBuilder.tsx
const onConnect = useCallback((params: Connection) => {
  const edge = {
    ...params,
    id: `edge-${params.source}-${params.target}`,
    type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
    animated: true,
    source: params.source!,
    target: params.target!,
  };

  setEdges((eds) => addEdge(edge, eds));
  toast.success('Nodes connected successfully!');
}, [setEdges, layoutMode]);
```

### 4. Smart Positioning Algorithm

```typescript
// In useNodeOperations.ts
const getSmartPosition = useCallback((type: string, existingNodes: Node[]) => {
  if (existingNodes.length === 0) {
    return isMobile ? { x: 50, y: 50 } : { x: 250, y: 100 };
  }

  const triggers = existingNodes.filter(n => n.type === 'trigger');
  const actions = existingNodes.filter(n => n.type === 'action');
  const conditions = existingNodes.filter(n => n.type === 'condition');

  const horizontalSpacing = isMobile ? 200 : 350;
  const verticalSpacing = isMobile ? 150 : 200;

  if (layoutMode === 'horizontal') {
    if (type === 'trigger') {
      return { x: 30, y: 50 + triggers.length * verticalSpacing };
    } else if (type === 'condition') {
      return { x: horizontalSpacing, y: 50 + conditions.length * verticalSpacing };
    } else {
      return { x: horizontalSpacing * 2, y: 50 + actions.length * verticalSpacing };
    }
  }
  // Vertical layout logic...
}, [layoutMode, isMobile]);
```

### 5. Workflow Execution Simulation

```typescript
// In useWorkflowActions.ts
const executeWorkflow = useCallback(() => {
  if (nodes.length === 0) {
    toast.error('Add nodes to your workflow first!');
    return;
  }

  // Find trigger nodes (workflow entry points)
  const triggerNodes = nodes.filter(node => node.type === 'trigger');

  if (triggerNodes.length === 0) {
    toast.error('Workflow needs at least one trigger to execute!');
    return;
  }

  toast.success('Workflow execution started!');

  // Simulate execution flow
  const executeNode = (nodeId: string, depth = 0) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    console.log(`Executing ${node.type}: ${node.data.label}`);

    // Find connected nodes
    const connectedEdges = edges.filter(edge => edge.source === nodeId);

    // Execute connected nodes after delay
    setTimeout(() => {
      connectedEdges.forEach(edge => {
        executeNode(edge.target, depth + 1);
      });
    }, 500 * (depth + 1));
  };

  // Start execution from all triggers
  triggerNodes.forEach(trigger => executeNode(trigger.id));

  setTimeout(() => {
    toast.success('Workflow completed successfully! ✨');
  }, 2000);
}, [nodes, edges]);
```

### 6. Node Configuration Panel

```typescript
// src/components/node-config/NodeConfigPanel.tsx
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const [label, setLabel] = useState(node.data.label || '');
  const [description, setDescription] = useState(node.data.description || '');

  const handleSave = () => {
    onUpdate(node.id, {
      label,
      description,
    });
    onClose();
  };

  return (
    <div className="bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configure Node</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter node label"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter node description"
            rows={3}
          />
        </div>

        {/* Node-specific configuration fields */}
        {node.type === 'trigger' && (
          <div>
            <Label>Trigger Configuration</Label>
            {/* Add trigger-specific fields */}
          </div>
        )}

        {node.type === 'action' && (
          <div>
            <Label>Action Configuration</Label>
            {/* Add action-specific fields */}
          </div>
        )}

        <div className="flex space-x-2">
          <Button onClick={handleSave}>Save Changes</Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  );
};
```

## API Integration Examples

### 1. Saving Workflow to Backend

```typescript
// src/services/workflowService.ts
export interface WorkflowPayload {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  layoutMode: LayoutMode;
  nodes: Node[];
  edges: Edge[];
}

export const saveWorkflow = async (workflow: WorkflowPayload): Promise<any> => {
  const response = await fetch('/api/workflows', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      ...workflow,
      nodes: workflow.nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          // Include configuration data
          configuration: node.data.configuration || {},
        },
      })),
      edges: workflow.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        animated: edge.animated,
        data: edge.data || {},
      })),
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to save workflow');
  }

  return response.json();
};
```

### 2. Loading Workflow from Backend

```typescript
export const loadWorkflow = async (workflowId: string): Promise<WorkflowPayload> => {
  const response = await fetch(`/api/workflows/${workflowId}`, {
    headers: {
      'Authorization': `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load workflow');
  }

  const data = await response.json();

  return {
    ...data,
    nodes: data.nodes.map((node: any) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node.data,
        layoutMode: data.layoutMode, // Ensure layout mode is set
      },
    })),
    edges: data.edges,
  };
};
```

### 3. Executing Workflow via API

```typescript
export const executeWorkflow = async (workflowId: string, triggerData?: any): Promise<any> => {
  const response = await fetch(`/api/workflows/${workflowId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      triggerData: triggerData || {},
      executionMode: 'async', // or 'sync'
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to execute workflow');
  }

  return response.json();
};
```

## Performance Optimization Tips

### 1. React Flow Optimization

```typescript
// Memoize node components to prevent unnecessary re-renders
export const TriggerNode = React.memo<TriggerNodeProps>(({ data }) => {
  // Component implementation
});

// Use useCallback for event handlers
const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
  setSelectedNode(node);
}, [setSelectedNode]);

// Optimize edge rendering
const defaultEdgeOptions = useMemo(() => ({
  style: { strokeWidth: 2, stroke: '#6366f1' },
  type: layoutMode === 'vertical' ? 'straight' : 'smoothstep',
}), [layoutMode]);
```

### 2. State Management Optimization

```typescript
// Use React.memo for expensive components
const NodeConfigPanel = React.memo<NodeConfigPanelProps>(({ node, onClose, onUpdate }) => {
  // Only re-render when node changes
});

// Debounce search input
const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
const filteredNodes = useMemo(() =>
  nodes.filter(node =>
    node.data.label.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  ), [nodes, debouncedSearchTerm]
);
```

This documentation provides a comprehensive overview of the Workflow Builder application. The modular architecture makes it easy to extend and customize for specific business requirements.

## Critical Bug Fix: Drag & Drop Functionality

### Issue: Can't Add Nodes to Builder

**Problem**: Conditional rendering prevented drag & drop when workflow was empty
**Root Cause**: WorkflowCanvas (which handles drops) wasn't rendered when `nodes.length === 0`
**Solution**: Always render WorkflowCanvas, overlay EmptyWorkflowState when needed

**Before (Broken)**:
```typescript
// Conditional rendering broke drag & drop
{nodes.length === 0 ? (
  <EmptyWorkflowState />  // No drop zone available!
) : (
  <WorkflowCanvas />      // Drop zone only when nodes exist
)}
```

**After (Fixed)**:
```typescript
// Always render WorkflowCanvas for drop functionality
<WorkflowCanvas
  onDrop={onDrop}
  onDragOver={onDragOver}
  // ... other props
/>

{/* Overlay EmptyWorkflowState when no nodes */}
{nodes.length === 0 && (
  <div className="absolute inset-0 z-10 pointer-events-none">
    <div className="pointer-events-auto">
      <EmptyWorkflowState />
    </div>
  </div>
)}
```

**Key Technical Details**:
- ✅ **WorkflowCanvas Always Rendered**: Ensures drop zone is always available
- ✅ **Overlay Approach**: EmptyWorkflowState overlays on top when needed
- ✅ **Pointer Events**: Carefully managed to allow drops through overlay
- ✅ **Z-Index Management**: Proper layering for visual hierarchy

**User Experience Flow**:
1. **Empty State**: User sees beautiful onboarding with big + button
2. **Drag from Sidebar**: Can drag nodes even when workflow is empty
3. **Drop Zone Active**: WorkflowCanvas receives drop events properly
4. **First Node Added**: EmptyWorkflowState automatically disappears
5. **Continued Building**: Normal workflow building experience

**Why This Fix Was Critical**:
- **Drag & Drop Core Feature**: Essential for workflow building
- **First User Experience**: New users couldn't start building
- **Hidden Complexity**: Issue only appeared with empty workflows
- **React Flow Requirement**: Drop handlers must be on rendered ReactFlow component

**Testing Verification**:
- ✅ **Empty Workflow**: Can drag nodes from sidebar to canvas
- ✅ **First Node**: Successfully adds and EmptyWorkflowState disappears
- ✅ **Subsequent Nodes**: Normal drag & drop continues working
- ✅ **Plus Buttons**: Work correctly after first node is added
- ✅ **All Node Types**: Triggers, actions, conditions all work
