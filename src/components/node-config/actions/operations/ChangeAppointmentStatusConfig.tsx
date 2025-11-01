import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const ChangeAppointmentStatusConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Appointment status options
    const statusOptions = [
        { id: 'cancelled', name: 'Cancelled' },
        { id: 'confirmed', name: 'Confirmed' },
        { id: 'pending', name: 'Pending' },
        { id: 'completed', name: 'Completed' },
        { id: 'no_show', name: 'No Show' },
        { id: 'rescheduled', name: 'Rescheduled' }
    ];

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedStatus) {
            alert('Please select a status');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedStatus,
                statusName: statusOptions.find(s => s.id === selectedStatus)?.name,
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
                <h3 className="font-semibold text-gray-900">Change Appointment Status</h3>
            </div>

            {/* Note */}
            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                    <span className="font-medium">Note:</span> This operation only works with the Appointment Automations
                </p>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
                <Label htmlFor="status-select" className="text-sm font-medium text-gray-700">
                    Select Status
                </Label>
                <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                                {status.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedStatus}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default ChangeAppointmentStatusConfig;