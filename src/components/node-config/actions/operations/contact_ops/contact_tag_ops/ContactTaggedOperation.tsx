import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ConfigComponentProps } from '@/components/node-config/types';

const ContactTaggedOperation: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [applyWorkflow, setApplyWorkflow] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Handle adding tags on Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (!tags.includes(currentTag.trim())) {
                setTags([...tags, currentTag.trim()]);
            }
            setCurrentTag('');
        }
    };

    // Handle removing tags
    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (tags.length === 0) {
            alert('Please add at least one tag');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                tags,
                applyWorkflow,
                submitted: true,
                submittedAt: new Date().toISOString()
            });

            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Tag Contact</h3>
                <p className="text-sm text-gray-600 mt-1">
                    You are about to tag. Type your tags in the box below, press ENTER to confirm each
                </p>
            </div>

            {/* Tags Input */}
            <div className="space-y-2">
                <div className="relative">
                    <Input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Choose one or many tags"
                        className="w-full pr-4"
                    />
                    
                    {/* Display added tags */}
                    {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
                <Label htmlFor="apply-workflow" className="text-sm font-medium text-gray-700">
                    Apply workflow to contacts with matching tags
                </Label>
                <Switch
                    id="apply-workflow"
                    checked={applyWorkflow}
                    onCheckedChange={setApplyWorkflow}
                />
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || tags.length === 0}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default ContactTaggedOperation;