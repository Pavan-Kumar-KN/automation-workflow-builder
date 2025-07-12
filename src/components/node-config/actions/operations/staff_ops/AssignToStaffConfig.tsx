import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';
import { CheckboxItem } from '@radix-ui/react-dropdown-menu';

const AssignToStaffConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [selectedStaff, setSelectedStaff] = useState('');
    const [onlyUnassigned, setOnlyUnassigned] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedStaff.trim()) {
            alert('Please select a staff member');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedStaff: selectedStaff.trim(),
                onlyUnassigned,
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
                <h3 className="font-semibold text-gray-900">Assign To Staff</h3>
            </div>

            {/* Note */}
            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                    Assign To Staff
                </p>
            </div>

            {/* Staff Selection */}
            <div className="space-y-2">
                <Label htmlFor="staff-select" className="text-sm font-medium text-gray-700">
                    Select Staff <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="staff-select"
                    type="text"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    placeholder="Select staff to assign on contact"
                    className="w-full"
                />
            </div>

            {/* Checkbox Option */}
            <div className="flex items-center space-x-2">
                <CheckboxItem
                    id="only-unassigned"
                    checked={onlyUnassigned}
                    onCheckedChange={setOnlyUnassigned}
                />
                <Label
                    htmlFor="only-unassigned"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                    Only apply to unassigned contacts.
                </Label>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedStaff.trim()}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default AssignToStaffConfig;