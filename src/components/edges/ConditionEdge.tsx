// import React from 'react';
// import * as LucideIcons from 'lucide-react';

// interface ConditionEdgeProps {
//   id: string;
//   sourceX: number;
//   sourceY: number;
//   targetX: number;
//   targetY: number;
//   markerEnd?: string;
//   label?: string;
//   data?: {
//     branchType?: 'yes' | 'no';
//     onAddNode?: (branchType: string) => void;
//     connectsToPlaceholder?: boolean; // New prop to indicate if this connects to embedded placeholder
//   };
// }

// // Custom Edge Component
// const ConditionEdge: React.FC<ConditionEdgeProps> = ({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   markerEnd,
//   label,
//   data
// }) => {
//   // If this connects to an embedded placeholder, draw a shorter path
//   if (data?.connectsToPlaceholder) {
//     // Draw a short path from the condition node handle to the embedded placeholder
//     const shortPath = `M ${sourceX},${sourceY} L ${sourceX},${sourceY + 60}`;

//     return (
//       <>
//         <path
//           id={id}
//           d={shortPath}
//           stroke="#9ca3af"
//           strokeWidth={2}
//           fill="none"
//           markerEnd={markerEnd}
//         />

//         {/* Branch label positioned closer to the condition node */}
//         {label && (
//           <text
//             x={sourceX}
//             y={sourceY + 30}
//             textAnchor="middle"
//             fill="#4b5563"
//             fontSize="12"
//             className="font-medium"
//           >
//             {label}
//           </text>
//         )}
//       </>
//     );
//   }

//   // Original logic for connecting to separate nodes
//   // Calculate a mid-point on Y axis for the horizontal segment (40px below sourceY)
//   const midY: number = sourceY + 40;

//   // Construct path with vertical, horizontal, then vertical segments (orthogonal style)
//   const path: string = `
//     M ${sourceX},${sourceY}
//     L ${sourceX},${midY}
//     L ${targetX},${midY}
//     L ${targetX},${targetY}
//   `;

//   // Calculate position for plus button (middle of the edge)
//   const buttonX = (sourceX + targetX) / 2;
//   const buttonY = midY;

//   return (
//     <>
//       <path
//         id={id}
//         d={path}
//         stroke="#9ca3af"
//         strokeWidth={2}
//         fill="none"
//         markerEnd={markerEnd}
//       />

//       {/* Branch label */}
//       {label && (
//         <text
//           x={buttonX}
//           y={buttonY - 20}
//           textAnchor="middle"
//           fill="#4b5563"
//           fontSize="12"
//           className="font-medium"
//         >
//           {label}
//         </text>
//       )}
//     </>
//   );
// };

// export default ConditionEdge;


// Horizontal Condition Edge for branching
const ConditionEdge = ({ id, sourceX, sourceY, targetX, targetY, markerEnd, label }) => {
  // Create a path that branches horizontally
  const dropDistance = 40; // How far down before branching
  const branchY = sourceY + dropDistance;

  const path = `
    M ${sourceX},${sourceY}
    L ${sourceX},${branchY}
    L ${targetX},${branchY}
    L ${targetX},${targetY}
  `;

  // Position label at the horizontal part of the branch
  const labelX = (sourceX + targetX) / 2;
  const labelY = branchY - 10;

  return (
    <>
      <path
        id={id}
        d={path}
        stroke="#9ca3af"
        strokeWidth={2}
        fill="none"
        markerEnd={markerEnd}
      />
      {label && (
        <text
          x={labelX}
          y={labelY}
          textAnchor="middle"
          fill="#4b5563"
          fontSize="12"
          className="font-medium"
        >
          {label}
        </text>
      )}
    </>
  );
};

export default ConditionEdge;
