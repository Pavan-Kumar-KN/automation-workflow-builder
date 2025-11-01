import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const RemoveWorkFlow: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [workflows, setWorkflows] = useState([]);
    const [selectedWorkflow, setSelectedWorkflow] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Fetch workflows from API
    const fetchWorkflows = async () => {
        setIsLoading(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setWorkflows([
                { id: 'workflow_1', name: 'Lead Generation Workflow' },
                { id: 'workflow_2', name: 'Customer Onboarding' },
                { id: 'workflow_3', name: 'Follow-up Campaign' },
                { id: 'workflow_4', name: 'Product Demo Request' },
                { id: 'workflow_5', name: 'Support Ticket Creation' },
                { id: 'workflow_6', name: 'Newsletter Subscription' },
                { id: 'workflow_7', name: 'Event Registration' },
                { id: 'workflow_8', name: 'Feedback Collection' }
            ]);
        } catch (error) {
            alert('Failed to fetch workflows');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedWorkflow) {
            alert('Please select a workflow');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedWorkflow,
                workflowName: workflows.find(w => w.id === selectedWorkflow)?.name,
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
        fetchWorkflows();
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Choose workflow</h3>
            </div>

            {/* Workflow Selection */}
            <div className="space-y-2">
                <Select
                    value={selectedWorkflow}
                    onValueChange={setSelectedWorkflow}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading workflows..." : "Choose workflow"} />
                    </SelectTrigger>
                    <SelectContent>
                        {workflows.map((workflow) => (
                            <SelectItem key={workflow.id} value={workflow.id}>
                                {workflow.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available workflows...</p>
                )}
            </div>

            {/* Selected Workflows Display */}
            <div>
                <h4 className="font-semibold text-gray-900 mb-2">Selected Workflows:</h4>
                {selectedWorkflow ? (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                            {workflows.find(w => w.id === selectedWorkflow)?.name}
                        </p>
                    </div>
                ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">No workflow selected</p>
                    </div>
                )}
            </div>

            {/* Confirm Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedWorkflow}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default RemoveWorkFlow;