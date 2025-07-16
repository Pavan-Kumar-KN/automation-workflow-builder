import React, { useState } from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { Plus, Copy, Scissors, X } from 'lucide-react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useCopyPaste } from '@/hooks/useCopyPaste';
import { useCutPaste } from '@/hooks/useCutPaste';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Define the props type explicitly
interface FlowEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: string;
  targetPosition?: string;
  style?: React.CSSProperties;
  data?: {
    onOpenActionModal?: (index: number) => void;
    onPasteFlow?: (index: number) => void;
    index?: number;
    isBranch?: boolean;
  };
}

const FlowEdge: React.FC<FlowEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  id,
}) => {
  const { layoutDirection, isCopy, isCut } = useWorkflowStore();
  const { handleDropdownSelection: handleCopyDropdown } = useCopyPaste();
  const { handleDropdownSelection: handleCutDropdown } = useCutPaste();
  const isHorizontal = layoutDirection === 'LR';
  const [showStickyPanel, setShowStickyPanel] = useState(false);

  // Calculate edge path and center point based on layout direction
  let edgePath: string;
  let centerX: number;
  let centerY: number;
  let arrowPath: string;

  if (isHorizontal) {
    // Horizontal layout (LR)
    // Create a straight line from source to target
    edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

    // Center point for the plus button
    centerX = (sourceX + targetX) / 2;
    centerY = (sourceY + targetY) / 2;

    // Horizontal arrow pointing right
    const arrowSize = 6;
    arrowPath = `M ${targetX - arrowSize},${targetY - arrowSize} L ${targetX},${targetY} L ${targetX - arrowSize},${targetY + arrowSize}`;
  } else {
    // Vertical layout (TB) - original implementation
    edgePath = `M ${sourceX},${sourceY} L ${sourceX},${targetY}`;
    centerX = sourceX;
    centerY = (sourceY + targetY) / 2;

    // Vertical arrow pointing down
    const arrowSize = 6;
    arrowPath = `M ${sourceX - arrowSize},${targetY - arrowSize} L ${sourceX},${targetY} L ${sourceX + arrowSize},${targetY - arrowSize}`;
  }

  return (
    <>
      {/* Main vertical edge */}
      <path
        id={id}
        d={edgePath}
        stroke="#9CA3AF" // lighter gray
        strokeWidth={1.5}
        fill="none"
        style={style}
      />

      {/* Arrowhead */}
      <path
        d={arrowPath}
        stroke="#9CA3AF" // lighter gray
        strokeWidth={1.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Plus Button */}
      {data?.onOpenActionModal && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-auto absolute"
            style={{
              transform: `translate(-50%, -50%) translate(${centerX}px, ${centerY}px)`,
            }}
          >
            {(isCopy || isCut) ? (
              // Show dropdown when in copy or cut mode
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`w-6 h-5 border border-gray-500 rounded-md flex items-center justify-center transition-colors shadow-sm ${
                    isCut ? 'bg-orange-400' : 'bg-gray-400'
                  }`}>
                    <Plus className="w-4 h-4 text-white stroke-[2.5]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="right"
                  sideOffset={15}
                  className="w-56 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-[9999]"
                >
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isCopy) {
                        handleCopyDropdown('addNode', id, data.onOpenActionModal!);
                      } else {
                        handleCutDropdown('addNode', id, data.onOpenActionModal!);
                      }
                    }}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-3" />
                    <span className="font-medium">Add Node Here</span>
                  </DropdownMenuItem>
                  {isCopy && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyDropdown('pasteFlow', id, data.onOpenActionModal!);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      <span className="font-medium">Paste Flow Here</span>
                    </DropdownMenuItem>
                  )}
                  {isCut && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCutDropdown('pasteCutFlow', id, data.onOpenActionModal!);
                      }}
                      className="flex items-center px-3 py-2 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-md cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      <span className="font-medium">Move Flow Here</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Normal mode - direct button click
              <button
                onClick={() => data.onOpenActionModal?.(data.index!)}
                className="w-6 h-5 bg-gray-400 border border-gray-500 rounded-md flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default FlowEdge;