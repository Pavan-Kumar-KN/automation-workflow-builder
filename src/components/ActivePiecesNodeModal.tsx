import React, { useState } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import { Node } from '@xyflow/react';
import { triggerNodes, actionNodes, conditionNodes, NodeData } from '@/data/nodeData';

interface ActivePiecesNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  validNodeTypes: string[];
  sourceNode: Node;
}

export const ActivePiecesNodeModal: React.FC<ActivePiecesNodeModalProps> = ({
  isOpen,
  onClose,
  onSelectNode,
  validNodeTypes,
  sourceNode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Don't render if not open
  if (!isOpen) return null;
  const getAvailableNodes = (): NodeData[] => {

    let availableNodes: NodeData[] = [];

    if (validNodeTypes.includes('action')) {
      availableNodes = [...availableNodes, ...actionNodes];
    }
    // Conditional nodes are hidden from action selection modal
    // if (validNodeTypes.includes('condition')) {
    //   availableNodes = [...availableNodes, ...conditionNodes];
    // }
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

  // Removed completion message as requested

  const availableNodes = getAvailableNodes();

  // Categories for ActivePieces-style organization
  const categories = [
    {
      id: 'ai-agents',
      name: 'AI and Agents',
      description: 'Use AI to help on your default',
      icon: '🤖',
      items: ['Agent', 'Image AI', 'text AI', 'Utility AI']
    },
    {
      id: 'apps',
      name: 'Apps',
      description: 'Find your favorite using popular apps',
      icon: '📱',
      items: []
    },
    {
      id: 'core',
      name: 'Core',
      description: 'Core building blocks of your workflows',
      icon: '⚙️',
      items: []
    },
    {
      id: 'tables',
      name: 'Tables',
      description: 'Automate organizing and storing your data',
      icon: '📊',
      items: []
    },
    {
      id: 'human-loop',
      name: 'Human in The Loop',
      description: 'Ask for human input to review and approve before processing',
      icon: '👤',
      items: []
    }
  ];

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const renderCategoryView = () => (
    <div className="p-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      {/* Categories */}
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white hover:bg-gray-50 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                  {category.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-900">
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.description}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderNodeSelectionView = () => (
    <div className="p-6 space-y-4">
      {/* Back button and search */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleBackToCategories}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-500 rotate-180" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Please select a piece first"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
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
          <div className="grid grid-cols-1 gap-3">
            {availableNodes.map((node) => {
              const IconComponent = node.icon;
              const nodeType = getNodeTypeFromId(node.id);

              return (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(nodeType, node)}
                  className="group p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200 bg-white hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {/* Icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <IconComponent className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                        {node.label}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {node.description}
                      </p>
                    </div>

                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mt-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm">1.</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCategory ? 'Select Action' : 'New File'}
                </h3>
                {!selectedCategory && (
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <span>FTP/SFTP</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {selectedCategory ? renderNodeSelectionView() : renderCategoryView()}
      </div>
    </div>
  );
};
