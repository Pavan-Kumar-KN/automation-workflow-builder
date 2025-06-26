import React, { useState } from 'react';
import { Mail, AtSign, User } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NodeConfig } from '../types';

interface SendEmailConfigProps {
  config: NodeConfig;
  setConfig: (config: NodeConfig) => void;
}

export const SendEmailConfig: React.FC<SendEmailConfigProps> = ({ config, setConfig }) => {
  const [fromEmail, setFromEmail] = useState(config.fromEmail || '');
  const [subject, setSubject] = useState(config.subject || '');
  const [emailTo, setEmailTo] = useState(config.emailTo || '');
  const [customContent, setCustomContent] = useState(config.customContent || '');

  const updateConfig = (field: string, value: string) => {
    setConfig({
      ...config,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Send Email Action</h3>
          <p className="text-sm text-gray-500">Configure email template and recipients</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="from-email" className="text-sm font-medium text-gray-700">
          From Email
        </Label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="from-email"
            type="email"
            value={fromEmail}
            onChange={(e) => {
              setFromEmail(e.target.value);
              updateConfig('fromEmail', e.target.value);
            }}
            placeholder="noreply@company.com"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-to" className="text-sm font-medium text-gray-700">
          Send To
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            id="email-to"
            value={emailTo}
            onChange={(e) => {
              setEmailTo(e.target.value);
              updateConfig('emailTo', e.target.value);
            }}
            placeholder="Enter email address"
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
          Subject Line
        </Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            updateConfig('subject', e.target.value);
          }}
          placeholder="Enter email subject..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-content" className="text-sm font-medium text-gray-700">
          Email Content
        </Label>
        <Textarea
          id="custom-content"
          value={customContent}
          onChange={(e) => {
            setCustomContent(e.target.value);
            updateConfig('customContent', e.target.value);
          }}
          placeholder="Enter your email content here..."
          className="min-h-[120px]"
        />
      </div>

      {fromEmail && emailTo && subject && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Mail className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Email Configuration Ready</h4>
              <div className="mt-2 text-xs text-green-700 space-y-1">
                <p><strong>From:</strong> {fromEmail}</p>
                <p><strong>To:</strong> {emailTo}</p>
                <p><strong>Subject:</strong> {subject}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
