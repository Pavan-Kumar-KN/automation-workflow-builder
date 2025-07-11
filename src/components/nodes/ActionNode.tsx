// import React from 'react';
// import * as LucideIcons from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Handle, Position } from '@xyflow/react';

// interface ActionNodeProps {
//   data: {
//     label: string;
//     id: string;
//     icon?: keyof typeof LucideIcons;
//     description?: string;
//     color?: string;
//     type?: string;
//     openNodeModal?: (node: any) => void;
//     onDelete?: () => void;
//     onInsertAbove?: (nodeId: string) => void;
//   };
//   isSelected?: boolean;
//   onDelete?: () => void;
// }

// export const ActionNode: React.FC<ActionNodeProps> = ({ data, isSelected = false, onDelete }) => {
//   // In React Flow, onDelete might be passed in data object
//   const deleteHandler = onDelete || data.onDelete;
//   // Handle both string icon names and direct icon components
//   const IconComponent = React.useMemo(() => {
//     if (!data.icon) {
//       return LucideIcons.Phone as React.ComponentType<any>;
//     }

//     if (typeof data.icon === 'string') {
//       return (LucideIcons[data.icon as keyof typeof LucideIcons] || LucideIcons.Phone) as React.ComponentType<any>;
//     }

//     if (typeof data.icon === 'function') {
//       return data.icon as React.ComponentType<any>;
//     }

//     if (React.isValidElement(data.icon)) {
//       // If it's already a React element, wrap it in a component
//       return () => data.icon;
//     }

//     // If it's an object with displayName or name (Lucide icon component)
//     if (data.icon && typeof data.icon === 'object' && ((data.icon as any).displayName || (data.icon as any).name)) {
//       return data.icon as React.ComponentType<any>;
//     }

//     return LucideIcons.Phone as React.ComponentType<any>;
//   }, [data.icon]);

//   return (
//     <div className="relative">
//       {/* Top Handle */}
//       <Handle
//         type="target"
//         position={Position.Top}
//         id="in"
//         style={{ background: '#4CAF50', border: '2px solid #fff' }}
//       />
//       <div className="relative">
//         {/* Top "+" */}
//         <div
//           className="absolute -top-4 left-1/2 transform -translate-x-1/2 cursor-pointer z-10"
//           onClick={() => data.onInsertAbove?.(data.id)}
//         >
//           <LucideIcons.PlusCircle className="text-blue-500 hover:text-blue-700" size={20} />
//         </div>
//         <div>

//         {/* Main Node Container */}
//         <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${isSelected
//           ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
//           : 'border-gray-200 hover:border-gray-300'
//           }`}>

//           {/* Node Content */}
//           <div className="flex items-center gap-3">
//             {/* Icon */}
//             <div className="flex-shrink-0">
//               <IconComponent className={`w-6 h-6 ${data.color || 'text-gray-600'}`} />
//             </div>

//             {/* Content */}
//             <div className="flex-1 min-w-0">
//               <div className="text-base font-semibold text-gray-900">
//                 {data.label}
//               </div>
//             </div>

//             {/* 3-Dot Menu */}
//             <div className="flex-shrink-0 ml-auto">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <button
//                     className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
//                     onClick={(e) => e.stopPropagation()} // Prevent node selection when clicking menu
//                     title="More options"
//                   >
//                     <LucideIcons.MoreVertical className="w-4 h-4" />
//                   </button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuItem
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       try {
//                         if (deleteHandler) {
//                           deleteHandler();
//                           console.log('✅ Delete function called successfully');
//                         }
//                       } catch (error) {
//                         console.error('❌ Error calling deleteHandler:', error);
//                       }
//                     }}
//                     className="text-red-600 hover:text-red-700 hover:bg-red-50"
//                   >
//                     <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
//                     Delete Action
//                   </DropdownMenuItem>

//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Handle */}
//         <Handle
//           type="source"
//           position={Position.Bottom}
//           id="out"
//           style={{ background: '#4CAF50', border: '2px solid #fff' }}
//         />
//       </div>
//       );
// };


import React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Handle, Position } from '@xyflow/react';

interface ActionNodeProps {
  id: string; // Add this - React Flow passes the actual node ID
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    color?: string;
    openNodeModal?: (node: any) => void;
    onDelete?: () => void;
    onInsertAbove?: (nodeId: string) => void;
    onInsertBelow?: (nodeId: string) => void;
    // New props for edge functionality
    showTopPlus?: boolean;
    showBottomPlus?: boolean;
    hasOutgoingEdge?: boolean;
    isLastNode?: boolean;
  };
  isSelected?: boolean;
  onDelete?: (id : string) => void;
}

export const ActionNode: React.FC<ActionNodeProps> = ({ 
  id, // Use the actual React Flow node ID
  data, 
  isSelected = false, 
  onDelete 
}) => {
  const deleteHandler = onDelete || data.onDelete;
  
  // Handle both string icon names and direct icon components
  const IconComponent = React.useMemo(() => {
    if (!data.icon) {
      return LucideIcons.Phone as React.ComponentType<any>;
    }

    if (typeof data.icon === 'string') {
      return (LucideIcons[data.icon as keyof typeof LucideIcons] || LucideIcons.Phone) as React.ComponentType<any>;
    }

    if (typeof data.icon === 'function') {
      return data.icon as React.ComponentType<any>;
    }

    if (React.isValidElement(data.icon)) {
      return () => data.icon;
    }

    if (data.icon && typeof data.icon === 'object' && ((data.icon as any).displayName || (data.icon as any).name)) {
      return data.icon as React.ComponentType<any>;
    }

    return LucideIcons.Phone as React.ComponentType<any>;
  }, [data.icon]);


  console.log("the action node while insertion : " , id);

  return (
    <div className="relative flex flex-col items-center">
      {/* Top Plus Button */}
      {data.showTopPlus && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onInsertAbove?.(id); // Use the actual node ID
            }}
            className="w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10 shadow-sm"
            title="Add action above"
          >
            <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
          </button>
        </div>
      )}

      {/* Connection line to node */}
      {data.showTopPlus && (
        <div className="w-0.5 h-6 bg-gray-400"></div>
      )}

      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Main Node Container */}
      <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        {/* Node Content */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${data.color || 'text-gray-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.label}
            </div>
          </div>

          {/* 3-Dot Menu */}
          <div className="flex-shrink-0 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="More options"
                >
                  <LucideIcons.MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      if (deleteHandler) {
                        // Pass the actual React Flow node ID, not data.id
                        deleteHandler(id);
                        console.log('✅ Delete function called successfully with ID:', id);
                      }
                    } catch (error) {
                      console.error('❌ Error calling deleteHandler:', error);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
                  Delete Action
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Bottom Connection Line and Plus Button */}
      {(data.showBottomPlus || data.hasOutgoingEdge) && (
        <div className="flex flex-col items-center">
          {/* Connection line from node */}
          {(data.showBottomPlus || data.hasOutgoingEdge) && (
            <div className="w-0.5 h-6 bg-gray-400"></div>
          )}
          
          {/* Bottom Plus Button */}
          {data.showBottomPlus && !data.isLastNode && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  data.onInsertBelow?.(id); // Use the actual node ID
                }}
                className="w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10 shadow-sm"
                title="Add action below"
              >
                <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
              </button>
            </div>
          )}
          
          {/* Outgoing connection line */}
          {data.hasOutgoingEdge && (
            <div className="w-0.5 h-6 bg-gray-400"></div>
          )}
        </div>
      )}
    </div>
  );
};