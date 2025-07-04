
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutModeSelector, LayoutMode } from '../LayoutModeSelector';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Node } from '@xyflow/react';

interface WorkflowControlsProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  autoArrangeNodes: () => void;
  nodes: Node[];
  isConfigPanelOpen?: boolean;
}

export const WorkflowControls: React.FC<WorkflowControlsProps> = ({
  layoutMode,
  onLayoutModeChange,
  autoArrangeNodes,
  nodes,
  isConfigPanelOpen = false,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={`absolute z-10 flex items-center gap-2 ${
      isMobile
        ? 'top-16 right-4 flex-col'
        : isConfigPanelOpen
          ? 'top-4 right-[25rem] flex-row gap-3' // Move left when config panel is open
          : 'top-4 right-4 flex-row gap-3'
    }`}>
      <LayoutModeSelector
        layoutMode={layoutMode}
        onLayoutModeChange={onLayoutModeChange}
      />
      <Button
        onClick={autoArrangeNodes}
        className={`bg-blue-900 hover:bg-blue-900 text-white shadow-lg transition-colors flex items-center gap-2 ${
          isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'
        }`}
        disabled={nodes.length === 0 || layoutMode === 'freeform'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        {!isMobile && 'Auto Arrange'}
      </Button>
    </div>
  );
};
