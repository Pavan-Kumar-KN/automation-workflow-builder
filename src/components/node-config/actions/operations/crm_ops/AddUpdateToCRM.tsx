
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ConfigComponentProps } from '@/components/node-config/types';

const AddUpdateToCRM: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [pipelines, setPipelines] = useState([]);
    const [stages, setStages] = useState([]);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [skipLeadValueChange, setSkipLeadValueChange] = useState(false);
    const [leadValue, setLeadValue] = useState('0');
    const [isLoadingPipelines, setIsLoadingPipelines] = useState(false);
    const [isLoadingStages, setIsLoadingStages] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Fetch pipelines from API
    const fetchPipelines = async () => {
        setIsLoadingPipelines(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 1000));
            setPipelines([
                { id: 'vsl_funnel', name: 'VSL Funnel' },
                { id: 'sales_pipeline', name: 'Sales Pipeline' },
                { id: 'lead_nurturing', name: 'Lead Nurturing' },
                { id: 'customer_onboarding', name: 'Customer Onboarding' },
                { id: 'support_pipeline', name: 'Support Pipeline' }
            ]);
        } catch (error) {
            alert('Failed to fetch pipelines');
        } finally {
            setIsLoadingPipelines(false);
        }
    };

    // Fetch stages based on selected pipeline
    const fetchStages = async (pipelineId: string) => {
        if (!pipelineId) return;
        
        setIsLoadingStages(true);
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Different stages based on pipeline
            const stagesByPipeline = {
                'vsl_funnel': [
                    { id: 'awareness', name: 'Awareness' },
                    { id: 'interest', name: 'Interest' },
                    { id: 'consideration', name: 'Consideration' },
                    { id: 'purchase', name: 'Purchase' }
                ],
                'sales_pipeline': [
                    { id: 'prospect', name: 'Prospect' },
                    { id: 'qualified', name: 'Qualified' },
                    { id: 'proposal', name: 'Proposal' },
                    { id: 'negotiation', name: 'Negotiation' },
                    { id: 'closed_won', name: 'Closed Won' }
                ],
                'lead_nurturing': [
                    { id: 'new_lead', name: 'New Lead' },
                    { id: 'engaged', name: 'Engaged' },
                    { id: 'marketing_qualified', name: 'Marketing Qualified' },
                    { id: 'sales_ready', name: 'Sales Ready' }
                ]
            };
            
            setStages(stagesByPipeline[pipelineId] || []);
        } catch (error) {
            alert('Failed to fetch stages');
        } finally {
            setIsLoadingStages(false);
        }
    };

    // Handle pipeline selection
    const handlePipelineChange = (value: string) => {
        setSelectedPipeline(value);
        setSelectedStage(''); // Reset stage when pipeline changes
        fetchStages(value);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedPipeline) {
            alert('Please select a pipeline');
            return;
        }

        if (!selectedStage) {
            alert('Please select a pipeline stage');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedPipeline,
                pipelineName: pipelines.find(p => p.id === selectedPipeline)?.name,
                selectedStage,
                stageName: stages.find(s => s.id === selectedStage)?.name,
                skipLeadValueChange,
                leadValue: parseFloat(leadValue) || 0,
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
        fetchPipelines();
    }, []);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Add/Update to CRM</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Add/Update Contact to CRM
                </p>
            </div>

            {/* Pipeline Selection */}
            <div className="space-y-2">
                <Label htmlFor="pipeline-select" className="text-sm font-medium text-gray-700">
                    Select Pipeline
                </Label>
                <Select
                    value={selectedPipeline}
                    onValueChange={handlePipelineChange}
                    disabled={isLoadingPipelines}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingPipelines ? "Loading pipelines..." : "VSL Funnel"} />
                    </SelectTrigger>
                    <SelectContent>
                        {pipelines.map((pipeline) => (
                            <SelectItem key={pipeline.id} value={pipeline.id}>
                                {pipeline.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoadingPipelines && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available pipelines...</p>
                )}
            </div>

            {/* Stage Selection */}
            <div className="space-y-2">
                <Label htmlFor="stage-select" className="text-sm font-medium text-gray-700">
                    Select Pipeline Stage
                </Label>
                <Select
                    value={selectedStage}
                    onValueChange={setSelectedStage}
                    disabled={isLoadingStages || !selectedPipeline}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingStages ? "Loading stages..." : "Select a Stage"} />
                    </SelectTrigger>
                    <SelectContent>
                        {stages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.id}>
                                {stage.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoadingStages && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading available stages...</p>
                )}
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center justify-between">
                <Label htmlFor="skip-lead-value" className="text-sm font-medium text-gray-700">
                    Skip Lead Value Change
                </Label>
                <Switch
                    id="skip-lead-value"
                    checked={skipLeadValueChange}
                    onCheckedChange={setSkipLeadValueChange}
                />
            </div>

            {/* Lead Value Input */}
            <div className="space-y-2">
                <Label htmlFor="lead-value" className="text-sm font-medium text-gray-700">
                    Lead Value
                </Label>
                <Input
                    id="lead-value"
                    type="number"
                    value={leadValue}
                    onChange={(e) => setLeadValue(e.target.value)}
                    placeholder="0"
                    className="w-full"
                    min="0"
                    step="0.01"
                />
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedPipeline || !selectedStage}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default AddUpdateToCRM;