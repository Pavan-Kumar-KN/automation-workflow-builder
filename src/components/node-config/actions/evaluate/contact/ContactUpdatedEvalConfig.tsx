import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

const ContactUpdatedEvalConfig = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conditions, setConditions] = useState([
        { contactField: '', condition: '', value: '' }
    ]);
    const [bulkAction, setBulkAction] = useState('');

    // Sample field options (you can replace with your actual fields)
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

    // Load initial config
    // useEffect(() => {
    //     if (config.conditions && config?.conditions.length > 0) {
    //         setConditions(config.conditions);
    //     }
    //     if (config.bulkAction) {
    //         setBulkAction(config.bulkAction);
    //     }
    // }, [config]);

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
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-2">
                    <button className="p-1 hover:bg-gray-100 rounded">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Contact Updated</h3>
                    <p className="text-sm text-gray-500">
                        Send a cheer message to contact whenever contact is updated in system even with other automation.
                    </p>
                </div>

                {/* Conditions */}
                <div className="space-y-4">
                    {conditions.map((condition, index) => (
                        <div key={index} className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                                {/* Contact Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact's Field
                                    </label>
                                    <select
                                        value={condition.contactField}
                                        onChange={(e) => updateCondition(index, 'contactField', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Choose a list field</option>
                                        {contactFields.map(field => (
                                            <option key={field.value} value={field.value}>
                                                {field.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Condition
                                    </label>
                                    <select
                                        value={condition.condition}
                                        onChange={(e) => updateCondition(index, 'condition', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Choose a list field</option>
                                        {conditionOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Value */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value
                                    </label>
                                    <input
                                        type="text"
                                        value={condition.value}
                                        onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                        placeholder="Enter value"
                                        disabled={['is_empty', 'is_not_empty'].includes(condition.condition)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                                    />
                                </div>
                            </div>

                            {/* Remove button */}
                            {conditions.length > 1 && (
                                <button
                                    onClick={() => removeCondition(index)}
                                    className="text-red-600 hover:text-red-800 text-sm underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Add more button */}
                    <button
                        onClick={addCondition}
                        className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add more
                    </button>
                </div>

                {/* Bulk Actions */}
                <div className="space-y-3">
                    <div className="text-sm text-gray-700">
                        More All Bottom Action (selected in red)
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleBulkAction('yes')}
                            className={`px-4 py-2 rounded text-sm font-medium ${
                                bulkAction === 'yes' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Move all action to Yes node
                        </button>
                        <button
                            onClick={() => handleBulkAction('no')}
                            className={`px-4 py-2 rounded text-sm font-medium ${
                                bulkAction === 'no' 
                                    ? 'bg-gray-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            Move all action to No node
                        </button>
                    </div>
                </div>

                {/* Confirm Button */}
                <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Confirm'}
                </Button>
            </div>
        </div>
    );
};

export default ContactUpdatedEvalConfig;