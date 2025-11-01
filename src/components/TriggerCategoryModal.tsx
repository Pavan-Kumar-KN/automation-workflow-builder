import React, { useState } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { categorizedTriggers } from '@/data/categorizedTriggers';

interface TriggerCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrigger: (trigger: any) => void;
}

// Use the categorized triggers data directly
const categories = categorizedTriggers;

export const TriggerCategoryModal: React.FC<TriggerCategoryModalProps> = ({
  isOpen,
  onClose,
  onSelectTrigger,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCategories = categories.filter(category => {
    const searchLower = searchTerm.toLowerCase();

    // Search in category name and description
    const categoryMatch = category.name.toLowerCase().includes(searchLower) ||
                         category.description.toLowerCase().includes(searchLower);

    // Search in individual trigger options within the category
    const triggerMatch = category.triggers.some(trigger =>
      trigger.label.toLowerCase().includes(searchLower) ||
      trigger.description.toLowerCase().includes(searchLower)
    );

    return categoryMatch || triggerMatch;
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);

  // Filter triggers within selected category based on search term
  const filteredTriggers = selectedCategoryData?.triggers.filter(trigger => {
    const searchLower = searchTerm.toLowerCase();
    return trigger.label.toLowerCase().includes(searchLower) ||
           trigger.description.toLowerCase().includes(searchLower);
  }) || [];

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleTriggerSelect = (trigger: any) => {
    // Ensure the trigger has the correct icon format
    const processedTrigger = {
      ...trigger,
      icon: typeof trigger.icon === 'string' ? trigger.icon : trigger.icon?.name || 'Zap'
    };
    onSelectTrigger(processedTrigger);
    onClose();
    setSelectedCategory(null);
    setSearchTerm('');
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {selectedCategory && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <LucideIcons.ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {selectedCategory ? selectedCategoryData?.name : 'Select Trigger'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {!selectedCategory ? (
            // Category List
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                      <IconComponent className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {category.description}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                );
              })}
            </div>
          ) : (
            // Trigger List
            <div className="space-y-2">
              {filteredTriggers.map((trigger) => {
                const IconComponent = trigger.icon;
                return (
                  <button
                    key={trigger.id}
                    onClick={() => handleTriggerSelect(trigger)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {trigger.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {trigger.description}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredTriggers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No triggers found matching your search' : 'No triggers available in this category'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
