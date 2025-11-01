import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import BranchShift from '@/components/node-config/config-components/BranchShift';

const AssignedStaffEvalConfig = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [bulkAction, setBulkAction] = useState('');
    const [staffOptions, setStaffOptions] = useState([]);

    // Fetch staff data
    const fetchStaff = async () => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Sample staff data
            const staffData = [
                { value: 'john_doe', label: 'John Doe' },
                { value: 'jane_smith', label: 'Jane Smith' },
                { value: 'mike_johnson', label: 'Mike Johnson' },
                { value: 'sarah_wilson', label: 'Sarah Wilson' },
                { value: 'david_brown', label: 'David Brown' },
                { value: 'emily_davis', label: 'Emily Davis' },
                { value: 'robert_miller', label: 'Robert Miller' },
                { value: 'lisa_garcia', label: 'Lisa Garcia' }
            ];
            
            setStaffOptions(staffData);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
            alert('Failed to load staff data');
        } finally {
            setIsLoading(false);
        }
    };

    // Load staff data on component mount
    useEffect(() => {
        fetchStaff();
    }, []);

    // Handle bulk action
    const handleBulkAction = (action) => {
        setBulkAction(action);
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate selection
            if (!selectedStaff) {
                alert('Please select a staff member');
                return;
            }

            if (!bulkAction) {
                alert('Please select a bulk action');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            const newConfig = {
                ...config,
                selectedStaff: selectedStaff,
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
                <h3 className="font-semibold text-gray-900">Assigned Staff</h3>
                <p className="text-sm text-gray-500">
                    Configure staff assignment and bulk action settings for contact management.
                </p>
            </div>

            {/* Staff Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Staff <span className="text-red-500">*</span>
                </Label>
                
                <Select
                    value={selectedStaff}
                    onValueChange={setSelectedStaff}
                    disabled={isLoading}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={isLoading ? "Loading staff..." : "Select Staff"} />
                    </SelectTrigger>
                    <SelectContent>
                        {staffOptions.map(staff => (
                            <SelectItem key={staff.value} value={staff.value}>
                                {staff.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                
                {selectedStaff && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">
                            Selected: {staffOptions.find(s => s.value === selectedStaff)?.label}
                        </span>
                        <button
                            onClick={() => setSelectedStaff('')}
                            className="text-red-600 hover:text-red-800 p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

         <BranchShift nodeid={config.graphNodeId}/>
          

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || isLoading}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default AssignedStaffEvalConfig;