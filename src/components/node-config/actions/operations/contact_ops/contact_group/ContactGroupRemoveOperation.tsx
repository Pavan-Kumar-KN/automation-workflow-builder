import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const ContactGroupRemoveOperation: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Fetch lists from API
    const fetchLists = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setLists([
                { id: 'list_1', name: 'VIP Customers' },
                { id: 'list_2', name: 'Newsletter Subscribers' },
                { id: 'list_3', name: 'Product Leads' },
                { id: 'list_4', name: 'Event Attendees' },
                { id: 'list_5', name: 'Support Contacts' },
                { id: 'list_6', name: 'Trial Users' },
                { id: 'list_7', name: 'Premium Members' },
                { id: 'list_8', name: 'Follow-up List' }
            ]);
        } catch (error) {
            alert('Failed to fetch lists');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedList) {
            alert('Please select a list');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedList,
                listName: lists.find(l => l.id === selectedList)?.name,
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
        fetchLists();
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Remove contact</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Remove contact to selected list
                </p>
            </div>

            {/* List Selection */}
            <div className="space-y-2">
                <Label htmlFor="list-select" className="text-sm font-medium text-gray-700">
                    Target list <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedList}
                    onValueChange={setSelectedList}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading lists..." : "Choose a list"} />
                    </SelectTrigger>
                    <SelectContent>
                        {lists.map((list) => (
                            <SelectItem key={list.id} value={list.id}>
                                {list.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available lists...</p>
                )}
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedList}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default ContactGroupRemoveOperation;