import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const WebhookEvalConfig = ({ config, setConfig }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [actionName, setActionName] = useState('Webhook');
    const [httpMethod, setHttpMethod] = useState('POST');
    const [endpoint, setEndpoint] = useState('https://example.com/webhook/to/fire');
    const [customData, setCustomData] = useState([]);
    const [headers, setHeaders] = useState([]);

    // HTTP Method options
    const httpMethodOptions = [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' }
    ];

    // Add custom data item
    const addCustomDataItem = () => {
        setCustomData([...customData, { key: '', value: '', id: Date.now() }]);
    };

    // Remove custom data item
    const removeCustomDataItem = (id) => {
        setCustomData(customData.filter(item => item.id !== id));
    };

    // Update custom data item
    const updateCustomDataItem = (id, field, value) => {
        setCustomData(customData.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Add header item
    const addHeaderItem = () => {
        setHeaders([...headers, { key: '', value: '', id: Date.now() }]);
    };

    // Remove header item
    const removeHeaderItem = (id) => {
        setHeaders(headers.filter(item => item.id !== id));
    };

    // Update header item
    const updateHeaderItem = (id, field, value) => {
        setHeaders(headers.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    // Handle form submission
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Validate required fields
            if (!actionName.trim()) {
                alert('Please enter an action name');
                return;
            }

            if (!endpoint.trim()) {
                alert('Please enter an endpoint URL');
                return;
            }

            // Validate URL format
            try {
                new URL(endpoint);
            } catch (e) {
                alert('Please enter a valid URL');
                return;
            }

            // Simulate API submission
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update config with final values
            const newConfig = {
                ...config,
                actionName: actionName.trim(),
                httpMethod: httpMethod,
                endpoint: endpoint.trim(),
                customData: customData.filter(item => item.key.trim() && item.value.trim()),
                headers: headers.filter(item => item.key.trim() && item.value.trim())
            };
            
            setConfig(newConfig);
            alert('Webhook configuration saved successfully!');
        } catch (error) {
            alert('Failed to save webhook configuration');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Webhook</h3>
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
                    placeholder="Enter action name"
                    className="w-full"
                />
            </div>

            {/* HTTP Method */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    HTTP Method
                </Label>
                <Select
                    value={httpMethod}
                    onValueChange={setHttpMethod}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {httpMethodOptions.map(method => (
                            <SelectItem key={method.value} value={method.value}>
                                {method.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Endpoint */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    Endpoint
                </Label>
                <Input
                    type="url"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    placeholder="https://example.com/webhook/to/fire"
                    className="w-full"
                />
            </div>

            {/* Custom Data */}
            <div className="space-y-3">
                <div>
                    <Label className="text-sm font-medium text-gray-700">
                        Custom Data
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                        (These custom key-value pairs will be included along with the contact's data under extra value)
                    </p>
                </div>
                
                {customData.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center">
                        <Input
                            type="text"
                            placeholder="Key"
                            value={item.key}
                            onChange={(e) => updateCustomDataItem(item.id, 'key', e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            type="text"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => updateCustomDataItem(item.id, 'value', e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomDataItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                
                <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomDataItem}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600"
                >
                    Add Item
                </Button>
            </div>

            {/* Headers */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Headers
                </Label>
                
                {headers.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center">
                        <Input
                            type="text"
                            placeholder="Header Key"
                            value={item.key}
                            onChange={(e) => updateHeaderItem(item.id, 'key', e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            type="text"
                            placeholder="Header Value"
                            value={item.value}
                            onChange={(e) => updateHeaderItem(item.id, 'value', e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeHeaderItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                
                <Button
                    type="button"
                    variant="outline"
                    onClick={addHeaderItem}
                    className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 text-gray-600"
                >
                    Add Item
                </Button>
            </div>

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default WebhookEvalConfig;