import React, { useState } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { categorizedActions } from '@/data/categorizedActions';

interface ActionCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: any) => void;
}

export const ActionCategoryModal: React.FC<ActionCategoryModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchTerm('');
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
    setSearchTerm('');
  };

  const handleActionSelect = (action: any) => {
    // Ensure the action has the correct icon format
    const processedAction = {
      ...action,
      icon: typeof action.icon === 'string'
        ? action.icon
        : (action.icon?.displayName || action.icon?.name || 'Phone')
    };

    try {
      onSelectAction(processedAction);
    } catch (error) {
      console.error('Error selecting action:', error);
    } finally {
      // Always close the modal, even if there's an error
      onClose();
      // Reset modal state
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSearchTerm('');
    }
  };

  const filteredCategories = categorizedActions.filter(category => {
    const searchLower = searchTerm.toLowerCase();

    // Search in category name and description
    const categoryMatch = category.name.toLowerCase().includes(searchLower) ||
      category.description.toLowerCase().includes(searchLower);

    // Search in individual action options within the category
    let actionMatch = false;

    if (category.actions) {
      // Category has direct actions
      actionMatch = category.actions.some(action =>
        action.label.toLowerCase().includes(searchLower) ||
        action.description.toLowerCase().includes(searchLower)
      );
    } else if (category.subcategories) {
      // Category has subcategories, search within them
      actionMatch = category.subcategories.some(subcategory =>
        subcategory.name.toLowerCase().includes(searchLower) ||
        subcategory.description.toLowerCase().includes(searchLower) ||
        subcategory.actions.some(action =>
          action.label.toLowerCase().includes(searchLower) ||
          action.description.toLowerCase().includes(searchLower)
        )
      );
    }

    return categoryMatch || actionMatch;
  });

  const selectedCategoryData = categorizedActions.find(c => c.id === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories?.find(s => s.id === selectedSubcategory);

  // Get actions based on current selection level
  const getActionsToShow = () => {
    if (selectedSubcategory && selectedSubcategoryData) {
      return selectedSubcategoryData.actions;
    }
    if (selectedCategory && selectedCategoryData) {
      return selectedCategoryData.actions || [];
    }
    return [];
  };

  // Filter actions based on search term
  const filteredActions = getActionsToShow().filter(action => {
    const searchLower = searchTerm.toLowerCase();
    return action.label.toLowerCase().includes(searchLower) ||
      action.description.toLowerCase().includes(searchLower);
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {(selectedCategory || selectedSubcategory) && (
              <button
                onClick={selectedSubcategory ? handleBackToSubcategories : handleBackToCategories}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <LucideIcons.ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-lg font-semibold">
              {selectedSubcategory ? selectedSubcategoryData?.name : selectedCategory ? selectedCategoryData?.name : 'Select Action'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Search Bar - Always visible */}
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
            // Categories View
            <div className="space-y-2">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
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
          ) : selectedCategory && !selectedSubcategory && selectedCategoryData?.subcategories ? (
            // Subcategories View
            <div className="space-y-2">
              {selectedCategoryData.subcategories.map((subcategory) => {
                // Use an icon from the first action in the subcategory, or a default icon
                const SubIconComponent = subcategory.icon ||
                  (subcategory.actions && subcategory.actions[0]?.icon) ||
                  selectedCategoryData.icon;

                return (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3 group"
                  >
                    <div className={`w-8 h-8 rounded-lg ${selectedCategoryData.color} flex items-center justify-center`}>
                      <SubIconComponent className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {subcategory.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {subcategory.description}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                );
              })}
            </div>
          ) : (
            // Actions View
            <div className="space-y-2">
              {filteredActions.map((action) => {
                const IconComponent = action.icon;

                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action)}
                    className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <IconComponent className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {action.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {action.description}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredActions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No actions found matching your search' : 'No actions available in this category'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
