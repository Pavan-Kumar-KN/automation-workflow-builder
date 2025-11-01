import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '../../types';

const SpecificDateConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [contactGroups, setContactGroups] = useState([]);
    const [selectedForm, setSelectedForm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedContactGroup, setSelectedContactGroup] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Fetch contact groups from API
    const fetchContactGroups = async () => {
        try {
            // Simulating API call for demo purposes
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            setContactGroups([
                'All Clients (0 Contacts)',
                'VIP Customers (25 Contacts)',
                'New Leads (102 Contacts)',
                'Premium Members (45 Contacts)',
                'Trial Users (78 Contacts)'
            ]);
        } catch (error) {
            alert('Failed to fetch contact groups');
        }
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime || !selectedContactGroup) {
            alert('Please fill in all required fields (Date, Time, and Contact Group)');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                selectedForm,
                selectedDate,
                selectedTime,
                selectedContactGroup,
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
        fetchContactGroups();
    }, []);

    return (
        <div className="space-y-6 bg-white rounded-lg">
            <div>
                <h3 className="font-semibold text-gray-900 text-lg">{config.label}</h3>
                <p className="text-sm text-gray-600 mt-1">
                    {config.description}
                </p>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
                <Label htmlFor="campaign-date" className="text-sm font-medium text-gray-700">
                    Date <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="campaign-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full"
                    placeholder="Select date"
                />
            </div>

            {/* Time Field */}
            <div className="space-y-2">
                <Label htmlFor="campaign-time" className="text-sm font-medium text-gray-700">
                    At <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="campaign-time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full"
                    placeholder="Select time"
                />
            </div>

            {/* Contact Group Field */}
            <div className="space-y-2">
                <Label htmlFor="contact-group" className="text-sm font-medium text-gray-700">
                    Contact Group
                </Label>
                <Select
                    value={selectedContactGroup}
                    onValueChange={setSelectedContactGroup}
                    disabled={isLoading}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoading ? "Loading contact groups..." : "Select Contact Group"} />
                    </SelectTrigger>
                    <SelectContent>
                        {contactGroups.map((group, index) => (
                            <SelectItem key={index} value={group}>
                                {group}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isLoading && (
                    <p className="text-xs text-blue-600 animate-pulse">Loading contact groups...</p>
                )}
            </div>



            <Button
                onClick={handleSubmit}
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default SpecificDateConfig;