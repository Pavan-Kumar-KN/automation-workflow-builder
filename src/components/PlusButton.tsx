import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Replace, Copy, Files, SkipForward, Trash2 } from 'lucide-react';
import { triggerNodes, actionNodes, conditionNodes, NodeData } from '@/data/nodeData';

interface PlusButtonProps {
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  validNodeTypes: string[];
  position?: 'center' | 'between';
  onReplace?: () => void;
  onCopy?: () => void;
  onDuplicate?: () => void;
  onSkip?: () => void;
  onPasteAfter?: () => void;
  onDelete?: () => void;
  directAction?: boolean; // If true, clicking plus opens action modal directly
}

export const PlusButton: React.FC<PlusButtonProps> = ({
  onSelectNode,
  validNodeTypes,
  position = 'between',
  onReplace,
  onCopy,
  onDuplicate,
  onSkip,
  onPasteAfter,
  onDelete,
  directAction = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getAvailableNodes = (): NodeData[] => {
    let availableNodes: NodeData[] = [];

    if (validNodeTypes.includes('action')) {
      availableNodes = [...availableNodes, ...actionNodes];
    }
    if (validNodeTypes.includes('condition')) {
      availableNodes = [...availableNodes, ...conditionNodes];
    }
    if (validNodeTypes.includes('trigger')) {
      availableNodes = [...availableNodes, ...triggerNodes];
    }

    return availableNodes.slice(0, 5); // Show only first 5 options
  };

  const getNodeTypeFromId = (nodeId: string): string => {
    if (actionNodes.find(n => n.id === nodeId)) return 'action';
    if (conditionNodes.find(n => n.id === nodeId)) return 'condition';
    if (triggerNodes.find(n => n.id === nodeId)) return 'trigger';
    return 'action'; // default
  };

  const handleNodeSelect = (node: NodeData) => {
    const nodeType = getNodeTypeFromId(node.id);
    onSelectNode(nodeType, node);
    setIsOpen(false);
  };

  const availableNodes = getAvailableNodes();

  const buttonSize = position === 'center' ? 'w-12 h-12' : 'w-8 h-8';
  const iconSize = position === 'center' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div className="relative flex justify-center" ref={dropdownRef}>
      {/* Plus Button */}
      <button
        onClick={() => {
          if (directAction && onPasteAfter) {
            onPasteAfter();
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className={`${buttonSize} rounded-lg bg-white border-2 border-gray-300 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex items-center justify-center group z-10`}
        title="Add step"
      >
        {isOpen ? (
          <X className={`${iconSize} text-gray-600`} />
        ) : (
          <Plus className={`${iconSize} text-gray-600 group-hover:text-blue-600`} />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white rounded-lg border border-gray-200 shadow-lg z-50 min-w-[240px]">
          <div className="p-2">
            {/* Replace Option */}
            {onReplace && (
              <button
                onClick={() => {
                  onReplace();
                  setIsOpen(false);
                }}
                className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <Replace className="w-4 h-4 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Replace</div>
                </div>
              </button>
            )}

            {/* Copy Option */}
            {onCopy && (
              <button
                onClick={() => {
                  onCopy();
                  setIsOpen(false);
                }}
                className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <Copy className="w-4 h-4 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Copy</div>
                </div>
                <div className="text-xs text-gray-500">Ctrl + C</div>
              </button>
            )}

            {/* Duplicate Option */}
            {onDuplicate && (
              <button
                onClick={() => {
                  onDuplicate();
                  setIsOpen(false);
                }}
                className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <Files className="w-4 h-4 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Duplicate</div>
                </div>
              </button>
            )}

            {/* Skip Option */}
            {onSkip && (
              <button
                onClick={() => {
                  onSkip();
                  setIsOpen(false);
                }}
                className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <SkipForward className="w-4 h-4 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Skip</div>
                </div>
                <div className="text-xs text-gray-500">Ctrl + E</div>
              </button>
            )}

            {/* Paste After Option */}
            {onPasteAfter && (
              <button
                onClick={() => {
                  onPasteAfter();
                  setIsOpen(false);
                }}
                className="w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
              >
                <Plus className="w-4 h-4 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">Paste After</div>
                </div>
              </button>
            )}

            {/* Delete Option */}
            {onDelete && (
              <>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => {
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="w-full p-2 text-left hover:bg-red-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-red-600">Delete</div>
                  </div>
                  <div className="text-xs text-gray-500">Shift + Delete</div>
                </button>
              </>
            )}

            {/* If no specific actions, show available nodes */}
            {!onReplace && !onPasteAfter && availableNodes.map((node) => {
              const IconComponent = node.icon;
              const nodeType = getNodeTypeFromId(node.id);

              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeSelect(node)}
                  className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    nodeType === 'action'
                      ? 'bg-blue-100'
                      : nodeType === 'condition'
                      ? 'bg-orange-100'
                      : 'bg-red-100'
                  }`}>
                    <IconComponent className={`w-4 h-4 ${
                      nodeType === 'action'
                        ? 'text-blue-600'
                        : nodeType === 'condition'
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {node.label}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {node.description}
                    </div>
                  </div>
                </button>
              );
            })}

            {!onReplace && !onPasteAfter && availableNodes.length === 0 && (
              <div className="p-3 text-center text-gray-500 text-sm">
                No available steps
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
