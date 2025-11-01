import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const EventStartOperation: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Handle form submission
    const handleSubmit = async () => {
        if (!eventDate) {
            alert('Please select a date');
            return;
        }

        if (!eventTime) {
            alert('Please enter a time');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                eventDate,
                eventTime,
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
                <h3 className="font-semibold text-gray-900">Event Start Time</h3>
            </div>

            {/* Note */}
            <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                    Event/Webinar time when it start
                </p>
            </div>

            {/* Date Field */}
            <div className="space-y-2">
                <Label htmlFor="event-date" className="text-sm font-medium text-gray-700">
                    Date
                </Label>
                <Input
                    id="event-date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Time Field */}
            <div className="space-y-2">
                <Label htmlFor="event-time" className="text-sm font-medium text-gray-700">
                    At
                </Label>
                <Input
                    id="event-time"
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !eventDate || !eventTime}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </div>
    );
};

export default EventStartOperation;