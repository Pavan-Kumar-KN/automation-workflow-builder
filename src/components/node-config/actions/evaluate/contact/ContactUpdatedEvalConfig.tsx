import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const ContactUpdatedEvalConfig = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conditions, setConditions] = useState([
        { contactField: '', condition: '', value: '' }
    ]);
    const [bulkAction, setBulkAction] = useState('');

    // Sample field options
    const contactFields = [
        { value: 'name', label: 'Name' },
        { value: 'email', label: 'Email' },
        { value: 'phone', label: 'Phone' },
        { value: 'company', label: 'Company' },
        { value: 'status', label: 'Status' },
        { value: 'tags', label: 'Tags' },
        { value: 'created_date', label: 'Created Date' },
        { value: 'last_updated', label: 'Last Updated' }
    ];

    const conditionOptions = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' },
        { value: 'starts_with', label: 'Starts With' },
        { value: 'ends_with', label: 'Ends With' },
        { value: 'is_empty', label: 'Is Empty' },
        { value: 'is_not_empty', label: 'Is Not Empty' }
    ];

    // Add new condition
    const addCondition = () => {
        setConditions([...conditions, { contactField: '', condition: '', value: '' }]);
    };

    // Remove condition
    const removeCondition = (index) => {
        if (conditions.length > 1) {
            const newConditions = conditions.filter((_, i) => i !== index);
            setConditions(newConditions);
        }
    };

    // Update condition
    const updateCondition = (index, field, value) => {
        const newConditions = [...conditions];
        newConditions[index][field] = value;
        setConditions(newConditions);
    };

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
        const newConditions = conditions.map(condition => ({
            ...condition,
            condition: action === 'yes' ? 'is_not_empty' : 'is_empty'
        }));
        setConditions(newConditions);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate conditions
            const validConditions = conditions.filter(
                c => c.contactField && c.condition && (c.value || ['is_empty', 'is_not_empty'].includes(c.condition))
            );

            if (validConditions.length === 0) {
                alert('Please configure at least one valid condition');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            const newConfig = {
                ...config,
                conditions: validConditions,
                bulkAction: bulkAction
            };
            
            setConfig(newConfig);
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
                <h3 className="font-semibold text-gray-900">Contact Updated</h3>
                <p className="text-sm text-gray-500">
                    Send a cheer message to contact whenever contact is updated in system even with other automation.
                </p>
            </div>

            {/* Conditions Section */}
            <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">
                    Conditions <span className="text-red-500">*</span>
                </Label>
                
                {conditions.map((condition, index) => (
                    <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                                Condition {index + 1}
                            </span>
                            {conditions.length > 1 && (
                                <button
                                    onClick={() => removeCondition(index)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Contact Field */}
                            <div className="space-y-2">
                                <Label htmlFor={`field-${index}`} className="text-sm font-medium text-gray-700">
                                    Contact's Field
                                </Label>
                                <Select
                                    value={condition.contactField}
                                    onValueChange={(value) => updateCondition(index, 'contactField', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contactFields.map(field => (
                                            <SelectItem key={field.value} value={field.value}>
                                                {field.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Condition */}
                            <div className="space-y-2">
                                <Label htmlFor={`condition-${index}`} className="text-sm font-medium text-gray-700">
                                    Condition
                                </Label>
                                <Select
                                    value={condition.condition}
                                    onValueChange={(value) => updateCondition(index, 'condition', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose condition" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conditionOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Value */}
                            <div className="space-y-2">
                                <Label htmlFor={`value-${index}`} className="text-sm font-medium text-gray-700">
                                    Value
                                </Label>
                                <Input
                                    id={`value-${index}`}
                                    type="text"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                    placeholder="Enter value"
                                    disabled={['is_empty', 'is_not_empty'].includes(condition.condition)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Condition Button */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={addCondition}
                    className="w-full"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Condition
                </Button>
            </div>

            {/* Bulk Actions */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Bulk Actions
                </Label>
                <p className="text-sm text-gray-500">
                    Apply action to all conditions (selected option will be highlighted)
                </p>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant={bulkAction === 'yes' ? 'default' : 'outline'}
                        onClick={() => handleBulkAction('yes')}
                        className={bulkAction === 'yes' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        Move all to Yes node
                    </Button>
                    <Button
                        type="button"
                        variant={bulkAction === 'no' ? 'default' : 'outline'}
                        onClick={() => handleBulkAction('no')}
                        className={bulkAction === 'no' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                    >
                        Move all to No node
                    </Button>
                </div>
            </div>

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

export default ContactUpdatedEvalConfig;