import React from 'react';
import { EdgeLabelRenderer } from '@xyflow/react';
import { Plus } from 'lucide-react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

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
    index?: number;
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
  const { layoutDirection } = useWorkflowStore();
  const isHorizontal = layoutDirection === 'LR';

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
            <button
              onClick={() => data.onOpenActionModal?.(data.index!)}
              className="w-6 h-5 bg-gray-400 border border-gray-500 rounded-md flex items-center justify-center transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default FlowEdge;