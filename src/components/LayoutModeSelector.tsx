
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowRight, ArrowDown } from 'lucide-react';

export type LayoutMode = 'horizontal' | 'vertical';

interface LayoutModeSelectorProps {
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
}

export const LayoutModeSelector: React.FC<LayoutModeSelectorProps> = ({
  layoutMode,
  onLayoutModeChange,
}) => {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
      <span className="text-xs text-gray-600 px-2">Layout:</span>
      <ToggleGroup 
        type="single" 
        value={layoutMode} 
        onValueChange={(value: LayoutMode) => value && onLayoutModeChange(value)}
        className="gap-1"
      >
        <ToggleGroupItem 
          value="horizontal" 
          size="sm"
          className="flex items-center gap-1 text-xs px-2 py-1"
        >
          <ArrowRight className="w-3 h-3" />
          Horizontal
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="vertical" 
          size="sm"
          className="flex items-center gap-1 text-xs px-2 py-1"
        >
          <ArrowDown className="w-3 h-3" />
          Vertical
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
