import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const InternalNotificationConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [actionName, setActionName] = useState('Internal Notification');
    const [notificationType, setNotificationType] = useState('');
    const [sentTo, setSentTo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // Notification type options
    const notificationTypeOptions = [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'push', label: 'Push Notification' },
        { value: 'slack', label: 'Slack' },
        { value: 'teams', label: 'Microsoft Teams' },
        { value: 'webhook', label: 'Webhook' }
    ];

    // Sent to options
    const sentToOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'team_lead', label: 'Team Lead' },
        { value: 'sales_team', label: 'Sales Team' },
        { value: 'support_team', label: 'Support Team' },
        { value: 'marketing_team', label: 'Marketing Team' },
        { value: 'all_users', label: 'All Users' },
        { value: 'custom_user', label: 'Custom User' },
        { value: 'assigned_user', label: 'Assigned User' }
    ];

    // Handle form submission
    const handleSubmit = async () => {
        if (!actionName.trim() || !notificationType || !sentTo) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values
            setConfig({
                ...config,
                actionName: actionName.trim(),
                notificationType,
                sentTo,
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
                <h3 className="font-semibold text-gray-900">Internal Notification</h3>
                <p className="text-sm text-gray-600 mt-1">
                    Send an notification to your team member individual who reach this point of the automation workflow.
                </p>
            </div>

            {/* Action Name */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    Action Name
                </Label>
                <Input
                    type="text"
                    value={actionName}
                    onChange={(e) => setActionName(e.target.value)}
                    placeholder="Internal Notification"
                    className="w-full"
                />
            </div>

            {/* Type of Notification */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    Type of Notification
                </Label>
                <Select
                    value={notificationType}
                    onValueChange={setNotificationType}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                        {notificationTypeOptions.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Sent To */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    Sent To
                </Label>
                <Select
                    value={sentTo}
                    onValueChange={setSentTo}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select whom you want to sent" />
                    </SelectTrigger>
                    <SelectContent>
                        {sentToOptions.map((recipient) => (
                            <SelectItem key={recipient.value} value={recipient.value}>
                                {recipient.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Confirm Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default InternalNotificationConfig;