import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ConfigComponentProps } from '@/components/node-config/types';

const CommunityAccess: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Update config with final values

            alert('Configuration saved successfully!');
        } catch (error) {
            alert('Failed to save configuration');
        } finally {
            setIsSubmitting(false); 
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="font-semibold text-gray-900">Community Revoke</h3>
                <p className="text-sm text-gray-500">Revoke community access from contact</p>
            </div>


            <Button
                onClick={handleSubmit}
                className="w-full"
            >
                Save
            </Button>
        </div>
    );
};

export default CommunityAccess;