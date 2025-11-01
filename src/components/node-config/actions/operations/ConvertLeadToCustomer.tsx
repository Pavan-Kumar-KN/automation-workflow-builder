import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfigComponentProps } from '@/components/node-config/types';

const ConvertLeadToCustomer: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Fetch fields from API
    const fetchFields = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setFields([
                { id: 'lead', name: 'Lead' },
                { id: 'customer', name: 'Customer' }
            ]);
        } catch (error) {
            alert('Failed to fetch fields');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedField) {
            alert('Please select a field');
            return;
        }

        if (!inputValue.trim()) {
            alert('Please enter a value');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedField,
                fieldName: fields.find(f => f.id === selectedField)?.name,
                inputValue: inputValue.trim(),
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

    useEffect(() => {
        fetchFields();
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Convert Lead to Customer</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Convert from lead to customer or vice versa
                </p>
            </div>

            {/* Field Selection */}
            <div className="space-y-2">
                <Label htmlFor="field-select" className="text-sm font-medium text-gray-700">
                    Select Contact Type which you want to convert
                </Label>
                <Select
                    value={selectedField}
                    onValueChange={setSelectedField}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading fields..." : "Choose a list field"} />
                    </SelectTrigger>
                    <SelectContent>
                        {fields.map((field) => (
                            <SelectItem key={field.id} value={field.id}>
                                {field.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available fields...</p>
                )}
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedField || !inputValue.trim()}
                className="w-full "
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default ConvertLeadToCustomer;