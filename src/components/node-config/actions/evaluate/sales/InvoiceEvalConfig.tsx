import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const InvoiceEvalConfig = ({ config, setConfig }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCondition, setSelectedCondition] = useState('');
    const [value, setValue] = useState('');

    // Condition options
    const conditionOptions = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
        { value: 'greater_equal', label: 'Greater Than or Equal' },
        { value: 'less_equal', label: 'Less Than or Equal' },
        { value: 'contains', label: 'Contains' },
        { value: 'not_contains', label: 'Does Not Contain' },
        { value: 'starts_with', label: 'Starts With' },
        { value: 'ends_with', label: 'Ends With' }
    ];

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate selections
            if (!selectedCondition) {
                alert('Please select a condition');
                return;
            }

            if (!value.trim()) {
                alert('Please enter a value');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update config with final values
            const newConfig = {
                ...config,
                condition: selectedCondition,
                value: value.trim()
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
                <h3 className="font-semibold text-gray-900">Invoice Evaluation</h3>
                <p className="text-sm text-gray-500">
                    Configure the condition and value for invoice evaluation.
                </p>
            </div>

            {/* Condition Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Condition <span className="text-red-500">*</span>
                </Label>
                
                <Select
                    value={selectedCondition}
                    onValueChange={setSelectedCondition}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Choose a list field" />
                    </SelectTrigger>
                    <SelectContent>
                        {conditionOptions.map(condition => (
                            <SelectItem key={condition.value} value={condition.value}>
                                {condition.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Value Input */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Value <span className="text-red-500">*</span>
                </Label>
                
                <Input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full"
                />
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default InvoiceEvalConfig;