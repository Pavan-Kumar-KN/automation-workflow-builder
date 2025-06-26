import React, { useState } from 'react';
import { MessageSquare, Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NodeConfig } from '../types';

interface SendSMSConfigProps {
  config: NodeConfig;
  setConfig: (config: NodeConfig) => void;
}

export const SendSMSConfig: React.FC<SendSMSConfigProps> = ({ config, setConfig }) => {
  const [phoneNumber, setPhoneNumber] = useState(config.phoneNumber || '');
  const [smsTemplate, setSmsTemplate] = useState(config.smsTemplate || '');

  const updateConfig = (field: string, value: string) => {
    setConfig({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <MessageSquare className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Send SMS Action</h3>
          <p className="text-sm text-gray-500">Configure SMS template and recipient</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone-number" className="text-sm font-medium text-gray-700">
          Send To (Phone Number)
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              updateConfig('phoneNumber', e.target.value);
            }}
            placeholder="Enter phone number"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sms-content" className="text-sm font-medium text-gray-700">
          SMS Content
        </Label>
        <Textarea
          id="sms-content"
          value={smsTemplate}
          onChange={(e) => {
            setSmsTemplate(e.target.value);
            updateConfig('smsTemplate', e.target.value);
          }}
          placeholder="Enter your SMS message here..."
          className="min-h-[100px]"
        />
      </div>

      {phoneNumber && smsTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">SMS Configuration Ready</h4>
              <div className="mt-2 text-xs text-blue-700 space-y-1">
                <p><strong>To:</strong> {phoneNumber}</p>
                <p><strong>Length:</strong> {smsTemplate.length} characters</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
