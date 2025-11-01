import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ConfigComponentProps } from '@/components/node-config/types';

const WebhookAdvanceEvalConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
    const [actionName, setActionName] = useState('Webhook Advance');
    const [httpMethod, setHttpMethod] = useState('POST');
    const [endpoint, setEndpoint] = useState('https://example.com/webhook/to/fire');
    const [requestType, setRequestType] = useState('Form');
    const [bodyItems, setBodyItems] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    console.log("config", config);

    // HTTP Method options
    const httpMethodOptions = [
        { value: 'GET', label: 'GET' },
        { value: 'POST', label: 'POST' },
        { value: 'PUT', label: 'PUT' },
        { value: 'PATCH', label: 'PATCH' },
        { value: 'DELETE', label: 'DELETE' }
    ];

    // Request Type options
    const requestTypeOptions = [
        { value: 'Form', label: 'Form' },
        { value: 'JSON', label: 'JSON' },
        { value: 'XML', label: 'XML' },
        { value: 'Raw', label: 'Raw' }
    ];

    // Add body item
    const addBodyItem = () => {
        setBodyItems([...bodyItems, { key: '', value: '', id: Date.now() }]);
    };

    // Remove body item
    const removeBodyItem = (id) => {
        setBodyItems(bodyItems.filter(item => item.id !== id));
    };

    // Update body item
    const updateBodyItem = (id, field, value) => {
        setBodyItems(bodyItems.map(item => 
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
        if (!actionName.trim() || !endpoint.trim()) {
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
                httpMethod: httpMethod,
                endpoint: endpoint.trim(),
                requestType: requestType,
                bodyItems: bodyItems.filter(item => item.key.trim() && item.value.trim()),
                headers: headers.filter(item => item.key.trim() && item.value.trim()),
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
                <h3 className="font-semibold text-gray-900">Webhook</h3>
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
                    <SelectTrigger className="w-full">
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

            {/* Request Type */}
            <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                    Request Type
                </Label>
                <Select
                    value={requestType}
                    onValueChange={setRequestType}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {requestTypeOptions.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                                {type.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Body */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                    Body
                </Label>
                
                {bodyItems.map((item) => (
                    <div key={item.id} className="flex gap-2 items-center">
                        <Input
                            type="text"
                            placeholder="Key"
                            value={item.key}
                            onChange={(e) => updateBodyItem(item.id, 'key', e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            type="text"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => updateBodyItem(item.id, 'value', e.target.value)}
                            className="flex-1"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeBodyItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                
                <Button
                    type="button"
                    variant="outline"
                    onClick={addBodyItem}
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
                className="w-full"
            >
                {isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
        </div>
    );
};

export default WebhookAdvanceEvalConfig;