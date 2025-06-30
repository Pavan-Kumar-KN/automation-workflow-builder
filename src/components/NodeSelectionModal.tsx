import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Node } from '@xyflow/react';
import { triggerNodes, actionNodes, conditionNodes, NodeData } from '@/data/nodeData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NodeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  validNodeTypes: string[];
  sourceNode: Node;
}

export const NodeSelectionModal: React.FC<NodeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectNode,
  validNodeTypes,
  sourceNode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Don't render if not open
  if (!isOpen) return null;

  if (!isOpen) return null;

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

    // Filter by search term
    if (searchTerm) {
      availableNodes = availableNodes.filter(node =>
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return availableNodes;
  };

  const getNodeTypeFromId = (nodeId: string): string => {
    if (actionNodes.find(n => n.id === nodeId)) return 'action';
    if (conditionNodes.find(n => n.id === nodeId)) return 'condition';
    if (triggerNodes.find(n => n.id === nodeId)) return 'trigger';
    return 'action'; // default
  };

  const getConnectionMessage = (): string => {
    switch (sourceNode.type) {
      case 'trigger':
        return `Select an action to connect to "${sourceNode.data.label}"`;
      case 'action':
        return `Select what comes after "${sourceNode.data.label}"`;
      case 'condition':
        return `Select an action for the condition result`;
      default:
        return 'Select a node to add';
    }
  };

  const availableNodes = getAvailableNodes();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[70vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Add Node</h3>
              <p className="text-sm text-gray-600 mt-1">{getConnectionMessage()}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-80 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Node Grid */}
          <div className="max-h-80 overflow-y-auto">
            {availableNodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm font-medium">No nodes found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {availableNodes.map((node) => {
                  const IconComponent = node.icon;
                  const nodeType = getNodeTypeFromId(node.id);

                  return (
                    <button
                      key={node.id}
                      onClick={() => onSelectNode(nodeType, node)}
                      className="group p-4 text-left border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 hover:scale-[1.02] bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
                    >
                      <div className="flex flex-col items-center text-center space-y-3">
                        {/* Icon */}
                        <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-200">
                          <IconComponent className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-900 transition-colors">
                            {node.label}
                          </h4>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                            {node.description}
                          </p>

                          {/* Type Badge */}
                          <div className="flex justify-center">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                              nodeType === 'action'
                                ? 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                                : nodeType === 'condition'
                                ? 'bg-orange-100 text-orange-700 group-hover:bg-orange-200'
                                : 'bg-red-100 text-red-700 group-hover:bg-red-200'
                            } transition-colors`}>
                              {nodeType.charAt(0).toUpperCase() + nodeType.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium">{availableNodes.length} nodes available</span>
              <span className="flex items-center space-x-1">
                <span>Click to add and connect</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
