import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const LeadQualityEvalConfig = ({ config, setConfig }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPipeline, setSelectedPipeline] = useState('');
    const [selectedLeadQuality, setSelectedLeadQuality] = useState('');
    const [bulkAction, setBulkAction] = useState('');

    // Sample pipeline options (replace with your actual pipelines)
    const pipelineOptions = [
        { value: 'ysl_funnel', label: 'YSL Funnel' },
        { value: 'sales_pipeline', label: 'Sales Pipeline' },
        { value: 'marketing_funnel', label: 'Marketing Funnel' },
        { value: 'lead_nurturing', label: 'Lead Nurturing' },
        { value: 'conversion_pipeline', label: 'Conversion Pipeline' }
    ];

    // Sample lead quality options (replace with your actual options)
    const leadQualityOptions = [
        { value: 'cold_lead', label: 'Is Cold Lead' },
        { value: 'warm_lead', label: 'Is Warm Lead' },
        { value: 'hot_lead', label: 'Is Hot Lead' },
        { value: 'qualified_lead', label: 'Is Qualified Lead' },
        { value: 'unqualified_lead', label: 'Is Unqualified Lead' },
        { value: 'mql', label: 'Is Marketing Qualified Lead' },
        { value: 'sql', label: 'Is Sales Qualified Lead' }
    ];

    // Load initial config
    useEffect(() => {
        if (config.selectedPipeline) {
            setSelectedPipeline(config.selectedPipeline);
        }
        if (config.selectedLeadQuality) {
            setSelectedLeadQuality(config.selectedLeadQuality);
        }
        if (config.bulkAction) {
            setBulkAction(config.bulkAction);
        }
    }, [config]);

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate required fields
            if (!selectedPipeline) {
                alert('Please select a pipeline');
                return;
            }
            if (!selectedLeadQuality) {
                alert('Please select a lead quality');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            const newConfig = {
                ...config,
                selectedPipeline,
                selectedLeadQuality,
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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h3 className="font-semibold text-gray-900">Lead Quality Evaluation</h3>
                <p className="text-sm text-gray-500">
                    Evaluate lead quality based on pipeline and current workflow conditions.
                </p>
            </div>

            {/* Pipeline Selection */}
            <div className="space-y-2">
                <Label htmlFor="pipeline" className="text-sm font-medium text-gray-700">
                    Select Pipeline <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedPipeline}
                    onValueChange={setSelectedPipeline}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="YSL Funnel" />
                    </SelectTrigger>
                    <SelectContent>
                        {pipelineOptions.map((pipeline) => (
                            <SelectItem key={pipeline.value} value={pipeline.value}>
                                {pipeline.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Lead Quality Selection */}
            <div className="space-y-2">
                <Label htmlFor="lead-quality" className="text-sm font-medium text-gray-700">
                    Select Lead Quality which you want to check with current workflow <span className="text-red-500">*</span>
                </Label>
                <Select
                    value={selectedLeadQuality}
                    onValueChange={setSelectedLeadQuality}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Is Cold Lead" />
                    </SelectTrigger>
                    <SelectContent>
                        {leadQualityOptions.map((quality) => (
                            <SelectItem key={quality.value} value={quality.value}>
                                {quality.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Selected Configuration Display */}
            {(selectedPipeline || selectedLeadQuality) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <Label className="text-sm font-medium text-gray-700 block mb-2">
                        Current Configuration
                    </Label>
                    <div className="space-y-1 text-sm text-gray-600">
                        {selectedPipeline && (
                            <div>
                                <span className="font-medium">Pipeline:</span> {pipelineOptions.find(p => p.value === selectedPipeline)?.label}
                            </div>
                        )}
                        {selectedLeadQuality && (
                            <div>
                                <span className="font-medium">Lead Quality:</span> {leadQualityOptions.find(q => q.value === selectedLeadQuality)?.label}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Bulk Actions */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Move All Bottom Action (selected in red)
                </Label>
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant={bulkAction === 'yes' ? 'default' : 'outline'}
                        onClick={() => handleBulkAction('yes')}
                        className={bulkAction === 'yes' ? 'bg-red-500 hover:bg-red-600' : ''}
                    >
                        Move all action to Yes node
                    </Button>
                    <Button
                        type="button"
                        variant={bulkAction === 'no' ? 'default' : 'outline'}
                        onClick={() => handleBulkAction('no')}
                        className={bulkAction === 'no' ? 'bg-gray-600 hover:bg-gray-700' : ''}
                    >
                        Move all action to No node
                    </Button>
                </div>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedPipeline || !selectedLeadQuality}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default LeadQualityEvalConfig;