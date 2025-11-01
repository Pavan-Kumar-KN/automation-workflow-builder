import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import BranchShift from '@/components/node-config/config-components/BranchShift';

const ContactTypeEvalConfig = ({ config, setConfig }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [bulkAction, setBulkAction] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Sample tags (you can replace with your actual tags from API)
    const availableTags = [
        'customer', 'lead', 'prospect', 'vip', 'new', 'returning', 
        'premium', 'basic', 'trial', 'churned', 'active', 'inactive'
    ];

    // Handle tag selection
    const handleTagSelect = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag]);
        }
        setTagInput('');
        setShowDropdown(false);
    };

    // Handle tag removal
    const handleTagRemove = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
    };

    // Handle custom tag input
    const handleTagInputKeyPress = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            handleTagSelect(tagInput.trim());
        }
    };

    // Handle input change
    const handleInputChange = (e) => {
        setTagInput(e.target.value);
        setShowDropdown(e.target.value.length > 0);
    };

    // Handle input focus
    const handleInputFocus = () => {
        setShowDropdown(tagInput.length > 0);
    };

    // Handle input blur
    const handleInputBlur = () => {
        // Delay hiding dropdown to allow click events
        setTimeout(() => setShowDropdown(false), 200);
    };

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (selectedTags.length === 0) {
                alert('Please select at least one tag');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            const newConfig = {
                ...config,
                selectedTags,
                bulkAction,
                submitted: true,
                submittedAt: new Date().toISOString()
            };
            
            setConfig(newConfig);
            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter available tags based on input
    const filteredTags = availableTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !selectedTags.includes(tag)
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Contact Tagged</h3>
                <p className="text-sm text-gray-500">
                    Send a cheer message to contact whenever contact is tagged in system even with other automation.
                </p>
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                    Tags <span className="text-red-500">*</span>
                </Label>
                
                {/* Tag Input */}
                <div className="relative">
                    <Input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={handleInputChange}
                        onKeyPress={handleTagInputKeyPress}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                        placeholder="Type to search or add tags"
                        className="w-full"
                    />
                    
                    {/* Dropdown with available tags */}
                    {showDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                            {filteredTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleTagSelect(tag)}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                >
                                    {tag}
                                </button>
                            ))}
                            {tagInput.trim() && 
                             !availableTags.includes(tagInput.trim()) && 
                             !selectedTags.includes(tagInput.trim()) && (
                                <button
                                    onClick={() => handleTagSelect(tagInput.trim())}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-t border-gray-200"
                                >
                                    Add "{tagInput.trim()}"
                                </button>
                            )}
                            {filteredTags.length === 0 && tagInput.trim() && availableTags.includes(tagInput.trim()) && (
                                <div className="px-3 py-2 text-gray-500 text-sm">
                                    Tag already selected
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Selected Tags Display */}
                {selectedTags.length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <Label className="text-sm font-medium text-gray-700 block mb-2">
                            Selected Tags ({selectedTags.length})
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {selectedTags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleTagRemove(tag)}
                                        className="ml-2 hover:text-blue-600 focus:outline-none"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

         <BranchShift nodeid={config.graphNodeId}/>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default ContactTypeEvalConfig;