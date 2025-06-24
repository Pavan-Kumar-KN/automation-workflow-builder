import React from 'react';
import { Node } from '@xyflow/react';
import { toast } from 'sonner';
import { LayoutModeSelector, LayoutMode } from './LayoutModeSelector';

interface WorkflowControlsProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  reactFlowInstance: any;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  layoutMode,
  onLayoutModeChange,
  nodes,
  setNodes,
  reactFlowInstance,
}) => {
  const autoArrangeNodes = () => {
    if (nodes.length === 0) return;

    const triggers = nodes.filter(n => n.type === 'trigger' || n.type === 'add-trigger');
    const actions = nodes.filter(n => n.type === 'action');
    const conditions = nodes.filter(n => n.type === 'condition' || n.type === 'split-condition');

    const arrangedNodes = nodes.map((node) => {
      let newPosition = { ...node.position };

      if (layoutMode === 'horizontal') {
        // Horizontal arrangement: left to right flow
        if (triggers.includes(node)) {
          const triggerIndex = triggers.indexOf(node);
          newPosition = { x: 50, y: 100 + triggerIndex * 200 };
        } else if (conditions.includes(node)) {
          const conditionIndex = conditions.indexOf(node);
          newPosition = { x: 400, y: 100 + conditionIndex * 220 };
        } else if (actions.includes(node)) {
          const actionIndex = actions.indexOf(node);
          newPosition = { x: 750, y: 100 + actionIndex * 200 };
        }
      } else if (layoutMode === 'vertical') {
        // Vertical arrangement: top to bottom flow
        if (triggers.includes(node)) {
          const triggerIndex = triggers.indexOf(node);
          newPosition = { x: 200 + triggerIndex * 280, y: 50 };
        } else if (conditions.includes(node)) {
          const conditionIndex = conditions.indexOf(node);
          newPosition = { x: 200 + conditionIndex * 280, y: 350 };
        } else if (actions.includes(node)) {
          const actionIndex = actions.indexOf(node);
          newPosition = { x: 200 + actionIndex * 280, y: 650 };
        }
      }

      return { 
        ...node, 
        position: newPosition,
        data: { ...node.data, layoutMode: layoutMode },
      };
    });

    setNodes(arrangedNodes);
    
    // Fit view after arrangement for better user experience
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 50, duration: 800 });
      }
    }, 100);
    
    toast.success(`Nodes auto-arranged in ${layoutMode} layout!`);
  };

  return (
    <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
      <LayoutModeSelector
        layoutMode={layoutMode}
        onLayoutModeChange={onLayoutModeChange}
      />
      <button
        onClick={autoArrangeNodes}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors flex items-center gap-2"
        disabled={nodes.length === 0}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        Auto Arrange
      </button>
    </div>
  );
};
